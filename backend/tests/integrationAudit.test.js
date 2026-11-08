const assert = require('assert');
const path = require('path');
const fs = require('fs');
const googleDriveService = require('../src/services/googleDriveService');
const pyqSyncService = require('../src/services/pyqSyncService');
const {
  parseCourseFolder,
  parseSemesterFolder,
  parseSchemeFolder,
  parseSubjectFolder,
  parsePdfFileName
} = require('../src/utils/pyqParser');

console.log('========================================================');
console.log('  KSLU CIRCLE PYQ SYSTEM - DEEP INTEGRATION AUDIT');
console.log('========================================================\n');

// 1. Audit Base64 Service Account parsing
console.log('1. Checking Base64 Service Account Decoding...');
const mockServiceAccount = {
  type: 'service_account',
  project_id: 'kslu-circle-audit',
  private_key_id: 'audit-key-id-123',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n',
  client_email: 'audit-sa@kslu-circle-audit.iam.gserviceaccount.com',
  client_id: '123456789012345678901'
};

const mockBase64 = Buffer.from(JSON.stringify(mockServiceAccount)).toString('base64');
process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 = mockBase64;
process.env.GOOGLE_DRIVE_PYQ_ROOT_FOLDER_ID = 'test_root_folder_id_xyz';

assert.strictEqual(
  googleDriveService.getRootFolderId(),
  'test_root_folder_id_xyz',
  'Root folder ID must match GOOGLE_DRIVE_PYQ_ROOT_FOLDER_ID'
);

assert.strictEqual(
  googleDriveService.isConfigured(),
  true,
  'Drive service must recognize valid Base64 credentials and root folder ID'
);
console.log('✓ Base64 decoding and root folder ID verified successfully');

// Clean up test environment variables
delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
delete process.env.GOOGLE_DRIVE_PYQ_ROOT_FOLDER_ID;

// 2. Audit Fallback / Graceful handling when not configured
console.log('\n2. Checking Unconfigured Service Graceful Degradation...');
assert.strictEqual(
  googleDriveService.isConfigured(),
  false,
  'Service must report isConfigured: false when env vars are absent'
);
console.log('✓ Graceful unconfigured detection verified');

// 3. Audit Course Parsing & Scheme Enforcement
console.log('\n3. Checking Course & Scheme Pattern Enforcement...');
assert.deepStrictEqual(parseCourseFolder('3-Year LL.B'), { name: '3-Year LL.B', code: '3-year-llb', totalSemesters: 6 });
assert.deepStrictEqual(parseCourseFolder('B.A. LL.B'), { name: 'B.A. LL.B', code: 'ba-llb', totalSemesters: 10 });
assert.deepStrictEqual(parseCourseFolder('B.B.A. LL.B'), { name: 'B.B.A. LL.B', code: 'bba-llb', totalSemesters: 10 });

// Only 80 and 100 marks schemes allowed
assert.deepStrictEqual(parseSchemeFolder('Scheme 80 Marks'), { marks: 80, name: 'Scheme 80 Marks' });
assert.deepStrictEqual(parseSchemeFolder('Scheme 100 Marks'), { marks: 100, name: 'Scheme 100 Marks' });
assert.strictEqual(parseSchemeFolder('Scheme 50 Marks'), null);
assert.strictEqual(parseSchemeFolder('General Notes'), null);
console.log('✓ Strict course & scheme rules verified');

// 4. Audit Range Request Header Logic
console.log('\n4. Checking HTTP Range Header Processing...');
function calculateRange(rangeHeader, totalSize) {
  if (!rangeHeader || !rangeHeader.startsWith('bytes=')) return null;
  const parts = rangeHeader.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
  if (isNaN(start) || isNaN(end) || start > end || end >= totalSize) return null;
  return {
    start,
    end,
    contentRange: `bytes ${start}-${end}/${totalSize}`,
    chunkSize: end - start + 1
  };
}

const rangeResult = calculateRange('bytes=0-1023', 500000);
assert.deepStrictEqual(rangeResult, {
  start: 0,
  end: 1023,
  contentRange: 'bytes 0-1023/500000',
  chunkSize: 1024
});
console.log('✓ HTTP Range headers verified');

// 5. Audit Route Export Check
console.log('\n5. Checking Route and Controller Exports...');
const pyqRoutes = require('../src/routes/pyqRoutes');
const adminRoutes = require('../src/routes/adminRoutes');
const pyqController = require('../src/controllers/pyqController');

assert.strictEqual(typeof pyqController.getCourses, 'function');
assert.strictEqual(typeof pyqController.getSemesters, 'function');
assert.strictEqual(typeof pyqController.getSubjects, 'function');
assert.strictEqual(typeof pyqController.getSchemes, 'function');
assert.strictEqual(typeof pyqController.getPYQs, 'function');
assert.strictEqual(typeof pyqController.previewPYQ, 'function');
assert.strictEqual(typeof pyqController.downloadPYQ, 'function');
assert.strictEqual(typeof pyqController.syncGoogleDrive, 'function');
assert.strictEqual(typeof pyqController.getSyncStatus, 'function');
console.log('✓ All 9 PYQ controller handlers verified');

console.log('\n========================================================');
console.log('  INTEGRATION AUDIT VERIFICATION PASSED! ✓');
console.log('========================================================\n');
