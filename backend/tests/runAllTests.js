const { runParserTests } = require('./pyqParser.test');
const { runSyncLogicTests } = require('./pyqSync.test');
const { runAuthTests } = require('./pyqAuth.test');
require('./integrationAudit.test');

console.log('========================================================');
console.log('  KSLU CIRCLE PYQ BACKEND INTEGRATION - TEST SUITE');
console.log('========================================================');

try {
  runParserTests();
  runSyncLogicTests();
  runAuthTests();
  console.log('\n========================================================');
  console.log('  ALL TESTS PASSED SUCCESSFULLY! ✓');
  console.log('========================================================\n');
  process.exit(0);
} catch (error) {
  console.error('\n❌ TEST FAILURE:', error.message);
  console.error(error.stack);
  process.exit(1);
}
