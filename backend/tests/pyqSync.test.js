const assert = require('assert');

/**
 * Tests for synchronization logic invariants:
 * - Duplicate handling (idempotency by Google Drive file ID)
 * - Missing file unavailable state logic
 */
function runSyncLogicTests() {
  console.log('\n--- 6. Testing Upsert Idempotency & Duplicate Handling ---');
  
  // Simulated database collection
  const mockDatabase = new Map();

  function mockUpsertPyq(fileRecord) {
    if (mockDatabase.has(fileRecord.driveFileId)) {
      const existing = mockDatabase.get(fileRecord.driveFileId);
      const updated = { ...existing, ...fileRecord, lastSyncedAt: new Date() };
      mockDatabase.set(fileRecord.driveFileId, updated);
      return { action: 'updated', record: updated };
    } else {
      const created = { ...fileRecord, isAvailable: true, createdAt: new Date() };
      mockDatabase.set(fileRecord.driveFileId, created);
      return { action: 'imported', record: created };
    }
  }

  const file1 = { driveFileId: 'drive_file_abc_1', fileName: 'Dec_2022.pdf', title: 'Dec 2022' };
  const res1 = mockUpsertPyq(file1);
  assert.strictEqual(res1.action, 'imported');
  assert.strictEqual(mockDatabase.size, 1);

  // Re-scanning the exact same file ID should UPDATE, not insert duplicate
  const res2 = mockUpsertPyq(file1);
  assert.strictEqual(res2.action, 'updated');
  assert.strictEqual(mockDatabase.size, 1, 'Database must not contain duplicate records for the same driveFileId');
  console.log('✓ Idempotent upsert verification passed (no duplicate records)');

  console.log('\n--- 7. Testing Missing Files Mark Unavailable Logic ---');
  const file2 = { driveFileId: 'drive_file_abc_2', fileName: 'June_2023.pdf', title: 'June 2023' };
  mockUpsertPyq(file2);
  assert.strictEqual(mockDatabase.size, 2);

  // Simulate a scan where file1 is found, but file2 is missing from Google Drive
  const scannedDriveFileIds = new Set(['drive_file_abc_1']);

  function markMissingUnavailable(scannedIds, scanStatus) {
    // REQUIREMENT: "Only mark missing files unavailable after a successful complete scan"
    if (scanStatus !== 'completed') {
      return 0; // Abort: do not touch records on failure
    }

    let marked = 0;
    for (const [id, record] of mockDatabase.entries()) {
      if (!scannedIds.has(id) && record.isAvailable) {
        record.isAvailable = false;
        marked++;
      }
    }
    return marked;
  }

  // If scan failed, missing files must NOT be marked unavailable
  const failedScanResult = markMissingUnavailable(scannedDriveFileIds, 'failed');
  assert.strictEqual(failedScanResult, 0);
  assert.strictEqual(mockDatabase.get('drive_file_abc_2').isAvailable, true, 'Files must remain available if scan failed');

  // If scan succeeded, missing files ARE marked unavailable
  const successfulScanResult = markMissingUnavailable(scannedDriveFileIds, 'completed');
  assert.strictEqual(successfulScanResult, 1);
  assert.strictEqual(mockDatabase.get('drive_file_abc_1').isAvailable, true);
  assert.strictEqual(mockDatabase.get('drive_file_abc_2').isAvailable, false, 'Missing file marked unavailable after complete scan');
  console.log('✓ Missing file unavailable transition verified safely');
}

module.exports = { runSyncLogicTests };

if (require.main === module) {
  runSyncLogicTests();
}
