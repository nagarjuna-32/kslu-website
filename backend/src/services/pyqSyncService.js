const { prisma } = require('../config/database');
const googleDriveService = require('./googleDriveService');
const {
  parseCourseFolder,
  parseSemesterFolder,
  parseSubjectFolder,
  parseSchemeFolder,
  parsePdfFileName
} = require('../utils/pyqParser');
const logger = require('../utils/logger');

// In-memory mutex to prevent concurrent overlapping executions
let isSyncInProgress = false;

/**
 * Checks if a synchronization job is currently in progress
 */
async function isRunning() {
  if (isSyncInProgress) return true;

  // Check DB for any sync stuck in 'running' within the last 30 minutes
  const activeLog = await prisma.pyqSyncLog.findFirst({
    where: {
      status: 'running',
      startedAt: {
        gte: new Date(Date.now() - 30 * 60 * 1000)
      }
    },
    orderBy: { startedAt: 'desc' }
  });

  return Boolean(activeLog);
}

/**
 * Gets the current status of the synchronization process and the latest log
 */
async function getSyncStatus() {
  const active = await isRunning();
  const latestLog = await prisma.pyqSyncLog.findFirst({
    orderBy: { startedAt: 'desc' },
    include: {
      triggeredBy: {
        select: { id: true, name: true, email: true, role: true }
      }
    }
  });

  const totalPYQs = await prisma.pYQ.count({ where: { isAvailable: true } });
  const totalCourses = await prisma.course.count();
  const totalSubjects = await prisma.subject.count();

  return {
    isRunning: active,
    latestLog,
    stats: {
      availablePYQs: totalPYQs,
      totalCourses,
      totalSubjects
    }
  };
}

/**
 * Performs a complete recursive scan of the Google Drive folder structure.
 * Only processes PDF files directly inside Scheme folders.
 * Safe against overlapping executions and never deletes records on failure.
 *
 * @param {string|null} userId Admin user ID who initiated sync
 * @returns {Promise<Object>} Completed sync log record
 */
async function runFullSync(userId = null) {
  if (await isRunning()) {
    const error = new Error('A synchronization job is already running.');
    error.statusCode = 409;
    throw error;
  }

  const rootFolderId = googleDriveService.getRootFolderId();
  if (!rootFolderId) {
    const error = new Error('Google Drive root folder ID is not configured (GOOGLE_DRIVE_PYQ_ROOT_FOLDER_ID).');
    error.statusCode = 400;
    throw error;
  }

  if (!googleDriveService.isConfigured()) {
    const error = new Error('Google Drive credentials are not configured.');
    error.statusCode = 500;
    throw error;
  }

  isSyncInProgress = true;

  // Create audit log
  const syncLog = await prisma.pyqSyncLog.create({
    data: {
      syncType: 'full',
      status: 'running',
      startedAt: new Date(),
      triggeredById: userId
    }
  });

  logger.info(`[PYQ Sync] Started full sync (Log ID: ${syncLog.id}) on root folder: ${rootFolderId}`);

  let filesFound = 0;
  let filesImported = 0;
  let filesUpdated = 0;
  let filesUnavailable = 0;
  let errorsCount = 0;
  const errorMessages = [];
  const scannedDriveFileIds = new Set();

  try {
    // 1. Level 1: Course Folders directly inside Root
    const courseFolders = await googleDriveService.listFolderContents(rootFolderId, { onlyFolders: true });
    logger.info(`[PYQ Sync] Found ${courseFolders.length} folders in root folder`);

    for (const cFolder of courseFolders) {
      const parsedCourse = parseCourseFolder(cFolder.name);
      if (!parsedCourse) {
        logger.debug(`[PYQ Sync] Skipping unrecognized folder at course level: ${cFolder.name}`);
        continue;
      }

      // Upsert Course in database
      const course = await prisma.course.upsert({
        where: { code: parsedCourse.code },
        update: {
          name: parsedCourse.name,
          totalSemesters: parsedCourse.totalSemesters,
          driveFolderId: cFolder.id,
          isActive: true
        },
        create: {
          code: parsedCourse.code,
          name: parsedCourse.name,
          totalSemesters: parsedCourse.totalSemesters,
          driveFolderId: cFolder.id,
          isActive: true
        }
      });

      // 2. Level 2: Semester Folders inside Course
      const semesterFolders = await googleDriveService.listFolderContents(cFolder.id, { onlyFolders: true });
      for (const semFolder of semesterFolders) {
        const parsedSemester = parseSemesterFolder(semFolder.name, course.totalSemesters);
        if (!parsedSemester) {
          logger.debug(`[PYQ Sync] Skipping unrecognized folder at semester level: ${semFolder.name} in ${course.name}`);
          continue;
        }

        // Upsert Semester in database
        const semester = await prisma.semester.upsert({
          where: {
            courseId_semesterNumber: {
              courseId: course.id,
              semesterNumber: parsedSemester.semesterNumber
            }
          },
          update: {
            name: parsedSemester.name,
            driveFolderId: semFolder.id
          },
          create: {
            name: parsedSemester.name,
            semesterNumber: parsedSemester.semesterNumber,
            driveFolderId: semFolder.id,
            courseId: course.id
          }
        });

        // 3. Level 3: Subject Folders inside Semester
        const subjectFolders = await googleDriveService.listFolderContents(semFolder.id, { onlyFolders: true });
        for (const subFolder of subjectFolders) {
          const parsedSubject = parseSubjectFolder(subFolder.name);
          if (!parsedSubject) continue;

          // Upsert Subject in database
          const subject = await prisma.subject.upsert({
            where: {
              semesterId_name: {
                semesterId: semester.id,
                name: parsedSubject.name
              }
            },
            update: {
              code: parsedSubject.code,
              driveFolderId: subFolder.id
            },
            create: {
              name: parsedSubject.name,
              code: parsedSubject.code,
              driveFolderId: subFolder.id,
              semesterId: semester.id
            }
          });

          // 4. Level 4: Scheme Folders inside Subject (Scheme 80 Marks / Scheme 100 Marks)
          const schemeFolders = await googleDriveService.listFolderContents(subFolder.id, { onlyFolders: true });
          for (const schFolder of schemeFolders) {
            const parsedScheme = parseSchemeFolder(schFolder.name);
            if (!parsedScheme) {
              logger.debug(`[PYQ Sync] Skipping non-scheme folder: ${schFolder.name} in subject ${subject.name}`);
              continue;
            }

            // Upsert SubjectScheme in database
            const scheme = await prisma.subjectScheme.upsert({
              where: {
                subjectId_marks: {
                  subjectId: subject.id,
                  marks: parsedScheme.marks
                }
              },
              update: {
                name: parsedScheme.name,
                driveFolderId: schFolder.id
              },
              create: {
                name: parsedScheme.name,
                marks: parsedScheme.marks,
                driveFolderId: schFolder.id,
                subjectId: subject.id
              }
            });

            // 5. Level 5: PDF files directly inside Scheme folder
            const pdfFiles = await googleDriveService.listFolderContents(schFolder.id, { onlyPdfs: true });
            filesFound += pdfFiles.length;

            for (const file of pdfFiles) {
              try {
                // Ensure file is a PDF (by MIME type or .pdf file extension)
                const isPdf = file.mimeType === 'application/pdf' || 
                              (file.name && file.name.toLowerCase().endsWith('.pdf'));
                if (!isPdf) {
                  logger.debug(`[PYQ Sync] Skipping non-PDF file: ${file.name}`);
                  continue;
                }

                scannedDriveFileIds.add(file.id);

                const { title, examYear, examSession } = parsePdfFileName(file.name, subject.name);
                const fileSizeInt = file.size ? parseInt(file.size, 10) : null;
                const modifiedDate = file.modifiedTime ? new Date(file.modifiedTime) : null;

                // Check existing
                const existing = await prisma.pYQ.findUnique({
                  where: { driveFileId: file.id }
                });

                if (existing) {
                  await prisma.pYQ.update({
                    where: { id: existing.id },
                    data: {
                      title,
                      fileName: file.name,
                      driveFolderId: schFolder.id,
                      driveWebViewLink: file.webViewLink,
                      fileSize: fileSizeInt,
                      driveModifiedTime: modifiedDate,
                      examYear,
                      examSession,
                      isAvailable: true,
                      schemeId: scheme.id,
                      subjectId: subject.id,
                      semesterId: semester.id,
                      courseId: course.id,
                      lastSyncedAt: new Date()
                    }
                  });
                  filesUpdated++;
                } else {
                  await prisma.pYQ.create({
                    data: {
                      driveFileId: file.id,
                      title,
                      fileName: file.name,
                      driveFolderId: schFolder.id,
                      driveWebViewLink: file.webViewLink,
                      fileSize: fileSizeInt,
                      driveModifiedTime: modifiedDate,
                      examYear,
                      examSession,
                      isAvailable: true,
                      schemeId: scheme.id,
                      subjectId: subject.id,
                      semesterId: semester.id,
                      courseId: course.id,
                      lastSyncedAt: new Date()
                    }
                  });
                  filesImported++;
                }
              } catch (fileErr) {
                errorsCount++;
                const msg = `Error processing file ${file.name} (${file.id}): ${fileErr.message}`;
                logger.error(`[PYQ Sync] ${msg}`);
                if (errorMessages.length < 10) errorMessages.push(msg);
              }
            }
          }
        }
      }
    }

    // 6. Only mark missing files unavailable after a successful complete scan
    const unavailableUpdate = await prisma.pYQ.updateMany({
      where: {
        driveFileId: {
          notIn: Array.from(scannedDriveFileIds)
        },
        isAvailable: true
      },
      data: {
        isAvailable: false
      }
    });
    filesUnavailable = unavailableUpdate.count;

    // Get change token for future incremental syncs
    let nextChangeToken = null;
    try {
      nextChangeToken = await googleDriveService.getStartPageToken();
    } catch (tokenErr) {
      logger.warn(`[PYQ Sync] Failed to retrieve next change token: ${tokenErr.message}`);
    }

    // Mark sync log as completed
    const completedLog = await prisma.pyqSyncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        filesFound,
        filesImported,
        filesUpdated,
        filesUnavailable,
        errorsCount,
        changeToken: nextChangeToken,
        errorDetails: errorMessages.length > 0 ? errorMessages.join('; ') : null
      }
    });

    logger.info(`[PYQ Sync] Full sync completed: ${filesFound} found, ${filesImported} imported, ${filesUpdated} updated, ${filesUnavailable} unavailable, ${errorsCount} errors.`);
    return completedLog;
  } catch (fatalErr) {
    logger.error(`[PYQ Sync] Fatal sync failure: ${fatalErr.message}`, { stack: fatalErr.stack });

    // Update log to failed (never delete existing PYQs)
    await prisma.pyqSyncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'failed',
        completedAt: new Date(),
        filesFound,
        filesImported,
        filesUpdated,
        filesUnavailable: 0,
        errorsCount: errorsCount + 1,
        errorDetails: `Fatal Error: ${fatalErr.message}`
      }
    });

    throw fatalErr;
  } finally {
    isSyncInProgress = false;
  }
}

/**
 * Performs safe incremental synchronization using Google Drive change tokens.
 * Falls back to full sync if no valid change token exists.
 *
 * @param {string|null} userId Admin user ID who initiated sync
 * @returns {Promise<Object>} Completed sync log record
 */
async function runIncrementalSync(userId = null) {
  if (await isRunning()) {
    const error = new Error('A synchronization job is already running.');
    error.statusCode = 409;
    throw error;
  }

  // Find latest change token from a completed sync
  const lastSyncWithToken = await prisma.pyqSyncLog.findFirst({
    where: {
      status: 'completed',
      changeToken: { not: null }
    },
    orderBy: { completedAt: 'desc' }
  });

  // If no previous token, execute a full sync
  if (!lastSyncWithToken || !lastSyncWithToken.changeToken) {
    logger.info('[PYQ Sync] No previous change token found. Falling back to full sync.');
    return await runFullSync(userId);
  }

  isSyncInProgress = true;

  const syncLog = await prisma.pyqSyncLog.create({
    data: {
      syncType: 'incremental',
      status: 'running',
      startedAt: new Date(),
      triggeredById: userId
    }
  });

  logger.info(`[PYQ Sync] Started incremental sync with change token: ${lastSyncWithToken.changeToken}`);

  let filesFound = 0;
  let filesImported = 0;
  let filesUpdated = 0;
  let filesUnavailable = 0;
  let errorsCount = 0;
  const errorMessages = [];

  try {
    const { changes, newStartPageToken } = await googleDriveService.listChanges(lastSyncWithToken.changeToken);
    filesFound = changes.length;

    for (const change of changes) {
      try {
        const fileId = change.fileId;

        // If file was removed or trashed in Google Drive
        if (change.removed || (change.file && change.file.trashed)) {
          const res = await prisma.pYQ.updateMany({
            where: { driveFileId: fileId, isAvailable: true },
            data: { isAvailable: false }
          });
          if (res.count > 0) filesUnavailable += res.count;
          continue;
        }

        const file = change.file;
        if (!file || file.mimeType !== 'application/pdf') {
          continue;
        }

        // Check if file belongs to a known Scheme folder
        const parentId = file.parents && file.parents[0];
        if (!parentId) continue;

        const scheme = await prisma.subjectScheme.findFirst({
          where: { driveFolderId: parentId },
          include: {
            subject: {
              include: {
                semester: {
                  include: { course: true }
                }
              }
            }
          }
        });

        if (!scheme) {
          // File is not in a tracked scheme folder
          continue;
        }

        const subject = scheme.subject;
        const semester = subject.semester;
        const course = semester.course;

        const { title, examYear, examSession } = parsePdfFileName(file.name, subject.name);
        const fileSizeInt = file.size ? parseInt(file.size, 10) : null;
        const modifiedDate = file.modifiedTime ? new Date(file.modifiedTime) : null;

        const existing = await prisma.pYQ.findUnique({
          where: { driveFileId: file.id }
        });

        if (existing) {
          await prisma.pYQ.update({
            where: { id: existing.id },
            data: {
              title,
              fileName: file.name,
              driveFolderId: parentId,
              fileSize: fileSizeInt,
              driveModifiedTime: modifiedDate,
              examYear,
              examSession,
              isAvailable: true,
              lastSyncedAt: new Date()
            }
          });
          filesUpdated++;
        } else {
          await prisma.pYQ.create({
            data: {
              driveFileId: file.id,
              title,
              fileName: file.name,
              driveFolderId: parentId,
              fileSize: fileSizeInt,
              driveModifiedTime: modifiedDate,
              examYear,
              examSession,
              isAvailable: true,
              schemeId: scheme.id,
              subjectId: subject.id,
              semesterId: semester.id,
              courseId: course.id,
              lastSyncedAt: new Date()
            }
          });
          filesImported++;
        }
      } catch (changeErr) {
        errorsCount++;
        const msg = `Error applying change for file ${change.fileId}: ${changeErr.message}`;
        logger.error(`[PYQ Sync] ${msg}`);
        if (errorMessages.length < 10) errorMessages.push(msg);
      }
    }

    const completedLog = await prisma.pyqSyncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        filesFound,
        filesImported,
        filesUpdated,
        filesUnavailable,
        errorsCount,
        changeToken: newStartPageToken || lastSyncWithToken.changeToken,
        errorDetails: errorMessages.length > 0 ? errorMessages.join('; ') : null
      }
    });

    logger.info(`[PYQ Sync] Incremental sync complete: ${filesImported} added, ${filesUpdated} updated, ${filesUnavailable} removed.`);
    return completedLog;
  } catch (err) {
    logger.error(`[PYQ Sync] Incremental sync failed: ${err.message}`);

    await prisma.pyqSyncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'failed',
        completedAt: new Date(),
        errorsCount: errorsCount + 1,
        errorDetails: `Incremental Error: ${err.message}`
      }
    });

    // If change token is invalid/expired (Google error code 410 Gone), trigger a full sync
    if (err.code === 410 || err.message?.includes('expired') || err.message?.includes('token')) {
      logger.warn('[PYQ Sync] Change token expired. Triggering full sync fallback...');
      isSyncInProgress = false;
      return await runFullSync(userId);
    }

    throw err;
  } finally {
    isSyncInProgress = false;
  }
}

module.exports = {
  isRunning,
  getSyncStatus,
  runFullSync,
  runIncrementalSync
};
