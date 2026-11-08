/**
 * Utility for parsing Google Drive folder and file names into structured PYQ metadata.
 */

// Canonical course catalog matching KSLU degree programs
// Note: B.B.A. LL.B is evaluated before B.A. LL.B to prevent substring collisions
const KNOWN_COURSES = [
  {
    name: '3-Year LL.B',
    code: '3-year-llb',
    totalSemesters: 6,
    patterns: [/\b3[\s_-]*(?:years?|yrs?)?[\s_-]*ll\.?b\b/i, /\b3[\s_-]*ll\.?b\b/i]
  },
  {
    name: 'B.B.A. LL.B',
    code: 'bba-llb',
    totalSemesters: 10,
    patterns: [/\bb\.?b\.?a\.?[\s_-]*ll\.?b\b/i, /\bbba[\s_-]*ll\.?b\b/i]
  },
  {
    name: 'B.A. LL.B',
    code: 'ba-llb',
    totalSemesters: 10,
    patterns: [/\bb\.?a\.?[\s_-]*ll\.?b\b/i, /\bba[\s_-]*ll\.?b\b/i]
  }
];

/**
 * Normalizes Unicode dashes, spaces, and trims input strings
 */
function normalizeString(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[\u2010-\u2015\u2212]/g, '-').replace(/\s+/g, ' ').trim();
}

/**
 * Matches a folder name to a recognized Course.
 * @param {string} folderName
 * @returns {{ name: string, code: string, totalSemesters: number } | null}
 */
function parseCourseFolder(folderName) {
  const trimmed = normalizeString(folderName);
  if (!trimmed) return null;

  for (const course of KNOWN_COURSES) {
    for (const pattern of course.patterns) {
      if (pattern.test(trimmed)) {
        return {
          name: course.name,
          code: course.code,
          totalSemesters: course.totalSemesters
        };
      }
    }
  }

  return null;
}

/**
 * Parses a semester folder name (e.g., "Semester 1", "Sem-2", "Semester 10").
 * @param {string} folderName
 * @param {number} maxSemesters
 * @returns {{ semesterNumber: number, name: string } | null}
 */
function parseSemesterFolder(folderName, maxSemesters = 10) {
  const trimmed = normalizeString(folderName);
  if (!trimmed) return null;

  // Match: "Semester 1", "Sem 1", "Sem-01", "S1", "Semester 10"
  const match = trimmed.match(/(?:sem(?:ester)?|s)\s*[-_]?\s*(\d{1,2})/i);
  if (!match) return null;

  const num = parseInt(match[1], 10);
  if (isNaN(num) || num < 1 || num > maxSemesters) return null;

  return {
    semesterNumber: num,
    name: `Semester ${num}`
  };
}

/**
 * Parses a Scheme folder name.
 * Strictly checks for Scheme 80 Marks or Scheme 100 Marks.
 * @param {string} folderName
 * @returns {{ marks: number, name: string } | null}
 */
function parseSchemeFolder(folderName) {
  const trimmed = normalizeString(folderName);
  if (!trimmed) return null;

  // Checks for 80 or 100 with optional "scheme" and "marks"
  const match = trimmed.match(/(?:scheme)?\s*(80|100)\s*(?:marks?|m)?/i);
  if (!match) return null;

  const marks = parseInt(match[1], 10);
  if (marks !== 80 && marks !== 100) return null;

  return {
    marks,
    name: `Scheme ${marks} Marks`
  };
}

/**
 * Normalizes subject names and extracts/assigns standard subject codes when identifiable.
 * @param {string} folderName
 * @returns {{ name: string, code: string | null }}
 */
function parseSubjectFolder(folderName) {
  const name = normalizeString(folderName);
  if (!name) return null;

  // Extract explicit subject code in parentheses if present e.g. "Constitutional Law (KSLU-3Y-101)"
  const codeMatch = name.match(/\(([A-Z0-9_-]+)\)/i);
  const code = codeMatch ? codeMatch[1].toUpperCase() : null;

  return {
    name,
    code
  };
}

const MONTH_SESSIONS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
  'Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Sept', 'Oct', 'Nov', 'Dec',
  'June/July', 'Jan/Feb', 'Dec/Jan', 'Nov/Dec', 'Supplementary', 'Annual'
];

/**
 * Parses a PDF filename to extract examination year, session/month, and a clean display title.
 * DOES NOT assume every file contains a year.
 * @param {string} fileName
 * @param {string} [subjectName]
 * @returns {{ title: string, examYear: number | null, examSession: string | null }}
 */
function parsePdfFileName(fileName, subjectName = '') {
  if (!fileName || typeof fileName !== 'string') {
    return { title: 'Question Paper', examYear: null, examSession: null };
  }

  // Remove .pdf extension and normalize separators (underscores, dashes) into spaces
  const baseName = fileName.replace(/\.pdf$/i, '').trim();
  const normalized = baseName.replace(/[_\-]/g, ' ').replace(/\s+/g, ' ');

  // 1. Detect 4-digit examination year (1990 - 2099)
  let examYear = null;
  const yearMatch = normalized.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    const parsedYear = parseInt(yearMatch[1], 10);
    const currentYear = new Date().getFullYear() + 2;
    if (parsedYear >= 1990 && parsedYear <= currentYear) {
      examYear = parsedYear;
    }
  }

  // 2. Detect examination month/session
  let examSession = null;
  for (const session of MONTH_SESSIONS) {
    const escaped = session.replace('/', '\\/');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(normalized)) {
      examSession = session;
      break;
    }
  }

  // 3. Format clean display title
  let title = normalized.trim();

  // If title is just a date/month (e.g. "Dec 2022") and subject name is known, combine nicely
  if (subjectName && (title.length <= 15 || /^(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d)/i.test(title))) {
    title = `${subjectName} - ${title}`;
  }

  return {
    title: title || fileName,
    examYear,
    examSession
  };
}

module.exports = {
  KNOWN_COURSES,
  parseCourseFolder,
  parseSemesterFolder,
  parseSchemeFolder,
  parseSubjectFolder,
  parsePdfFileName
};
