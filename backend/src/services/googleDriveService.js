const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

/**
 * Resolves Google Service Account credentials from supported environment variables:
 * 1. GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 (base64 encoded JSON)
 * 2. GOOGLE_SERVICE_ACCOUNT_KEY_PATH (secure local JSON file path)
 * 3. GOOGLE_SERVICE_ACCOUNT_JSON (raw JSON string)
 * 4. GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL & GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
 */
function resolveCredentials() {
  // Option 1: Base64-encoded Service Account JSON
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64) {
    try {
      let b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64.trim();
      if ((b64.startsWith('"') && b64.endsWith('"')) || (b64.startsWith("'") && b64.endsWith("'"))) {
        b64 = b64.slice(1, -1).trim();
      }
      const decoded = Buffer.from(b64, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (err) {
      logger.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON_BASE64: ' + err.message);
    }
  }

  // Option 2: Local JSON file path
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  if (keyPath) {
    try {
      const resolved = path.isAbsolute(keyPath)
        ? keyPath
        : path.resolve(process.cwd(), keyPath);
      if (fs.existsSync(resolved)) {
        const fileContent = fs.readFileSync(resolved, 'utf-8');
        return JSON.parse(fileContent);
      } else {
        logger.warn(`Google service account key file not found at: ${resolved}`);
      }
    } catch (err) {
      logger.error('Failed to read GOOGLE_SERVICE_ACCOUNT_KEY_PATH: ' + err.message);
    }
  }

  // Option 3: Raw JSON string in env var
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (err) {
      logger.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON: ' + err.message);
    }
  }

  // Option 4: Individual client email & private key
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (clientEmail && privateKey) {
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');
    return {
      client_email: clientEmail,
      private_key: privateKey
    };
  }

  return null;
}

let driveClientInstance = null;

/**
 * Returns an authenticated Google Drive client (drive v3)
 */
function getDriveClient() {
  if (driveClientInstance) {
    return driveClientInstance;
  }

  const credentials = resolveCredentials();
  if (!credentials) {
    throw new Error(
      'Google Drive credentials not configured. Please set GOOGLE_SERVICE_ACCOUNT_JSON_BASE64, ' +
      'GOOGLE_SERVICE_ACCOUNT_KEY_PATH, or GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.'
    );
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES
  });

  driveClientInstance = google.drive({ version: 'v3', auth });
  return driveClientInstance;
}

/**
 * Checks whether Google Drive credentials and root folder ID are configured
 */
function isConfigured() {
  const rootId = getRootFolderId();
  const creds = resolveCredentials();
  return Boolean(rootId && creds);
}

/**
 * Returns the Root Folder ID from environment
 */
function getRootFolderId() {
  let rootId = (
    process.env.GOOGLE_DRIVE_PYQ_ROOT_FOLDER_ID ||
    process.env.GOOGLE_DRIVE_PYQ_FOLDER_ID ||
    null
  );
  if (rootId && typeof rootId === 'string') {
    rootId = rootId.trim();
    if ((rootId.startsWith('"') && rootId.endsWith('"')) || (rootId.startsWith("'") && rootId.endsWith("'"))) {
      rootId = rootId.slice(1, -1).trim();
    }
  }
  return rootId;
}

/**
 * Helper to retry transient Google API failures (429, 500, 503) with exponential backoff
 */
async function executeWithRetry(fn, maxRetries = 3, initialDelayMs = 1000) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      const status = err.status || (err.response && err.response.status) || err.code;
      const isTransient = [429, 500, 502, 503, 504].includes(status) || err.message?.includes('rateLimit');
      
      if (attempt >= maxRetries || !isTransient) {
        throw err;
      }

      const delay = initialDelayMs * Math.pow(2, attempt - 1) + Math.random() * 200;
      logger.warn(`Google Drive API transient error (${status}). Retrying in ${Math.round(delay)}ms... (Attempt ${attempt}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Lists contents directly inside a parent folder, handling pagination and retries.
 * @param {string} folderId Google Drive Folder ID
 * @param {Object} options Filters: { onlyFolders: boolean, onlyPdfs: boolean, pageSize: number }
 * @returns {Promise<Array<Object>>} Array of file/folder objects
 */
async function listFolderContents(folderId, options = {}) {
  const drive = getDriveClient();
  const { onlyFolders = false, onlyPdfs = false, pageSize = 100 } = options;

  let query = `'${folderId}' in parents and trashed = false`;
  if (onlyFolders) {
    query += ` and mimeType = 'application/vnd.google-apps.folder'`;
  } else if (onlyPdfs) {
    // Retrieve non-folder documents directly inside the scheme folder
    query += ` and mimeType != 'application/vnd.google-apps.folder'`;
  }

  const files = [];
  let pageToken = null;

  do {
    const params = {
      q: query,
      pageSize,
      pageToken: pageToken || undefined,
      fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink, md5Checksum)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    };

    const response = await executeWithRetry(async () => {
      return await drive.files.list(params);
    });

    const currentFiles = response.data.files || [];
    files.push(...currentFiles);
    pageToken = response.data.nextPageToken;
  } while (pageToken);

  return files;
}

/**
 * Fetches file metadata by ID with retry
 */
async function getFileMetadata(fileId) {
  const drive = getDriveClient();
  return await executeWithRetry(async () => {
    const res = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, modifiedTime, webViewLink, md5Checksum',
      supportsAllDrives: true
    });
    return res.data;
  });
}

/**
 * Streams a file's media from Google Drive, supporting HTTP Range requests.
 * @param {string} fileId Google Drive file ID
 * @param {string|null} rangeHeader HTTP Range header (e.g., "bytes=0-1048575")
 * @returns {Promise<{ stream: ReadableStream, metadata: Object, status: number, headers: Object }>}
 */
async function streamFile(fileId, rangeHeader = null) {
  const drive = getDriveClient();
  const metadata = await getFileMetadata(fileId);

  const requestOptions = {
    fileId,
    alt: 'media',
    supportsAllDrives: true
  };

  const headers = {};
  if (rangeHeader) {
    headers['Range'] = rangeHeader;
  }

  const response = await executeWithRetry(async () => {
    return await drive.files.get(requestOptions, {
      responseType: 'stream',
      headers: Object.keys(headers).length > 0 ? headers : undefined
    });
  });

  return {
    stream: response.data,
    metadata,
    status: response.status || 200,
    headers: response.headers || {}
  };
}

/**
 * Fetches the latest change page token from Google Drive for incremental sync
 */
async function getStartPageToken() {
  const drive = getDriveClient();
  const res = await executeWithRetry(async () => {
    return await drive.changes.getStartPageToken({
      supportsAllDrives: true
    });
  });
  return res.data.startPageToken;
}

/**
 * Lists incremental changes using a pageToken
 * @param {string} pageToken Google Drive change token
 */
async function listChanges(pageToken) {
  const drive = getDriveClient();
  let currentPageToken = pageToken;
  const changes = [];
  let newStartPageToken = null;

  while (currentPageToken) {
    const res = await executeWithRetry(async () => {
      return await drive.changes.list({
        pageToken: currentPageToken,
        fields: 'nextPageToken, newStartPageToken, changes(fileId, removed, file(id, name, mimeType, trashed, parents, size, modifiedTime))',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
      });
    });

    if (res.data.changes) {
      changes.push(...res.data.changes);
    }

    if (res.data.nextPageToken) {
      currentPageToken = res.data.nextPageToken;
    } else {
      newStartPageToken = res.data.newStartPageToken;
      break;
    }
  }

  return { changes, newStartPageToken };
}

module.exports = {
  isConfigured,
  getRootFolderId,
  getDriveClient,
  listFolderContents,
  getFileMetadata,
  streamFile,
  getStartPageToken,
  listChanges
};
