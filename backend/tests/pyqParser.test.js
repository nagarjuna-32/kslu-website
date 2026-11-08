const assert = require('assert');
const {
  parseCourseFolder,
  parseSemesterFolder,
  parseSchemeFolder,
  parseSubjectFolder,
  parsePdfFileName
} = require('../src/utils/pyqParser');

function runParserTests() {
  console.log('\n--- 1. Testing Course Folder Parsing ---');
  assert.deepStrictEqual(
    parseCourseFolder('3-Year LL.B'),
    { name: '3-Year LL.B', code: '3-year-llb', totalSemesters: 6 }
  );
  assert.deepStrictEqual(
    parseCourseFolder('3 Year LLB'),
    { name: '3-Year LL.B', code: '3-year-llb', totalSemesters: 6 }
  );
  assert.deepStrictEqual(
    parseCourseFolder('B.A. LL.B'),
    { name: 'B.A. LL.B', code: 'ba-llb', totalSemesters: 10 }
  );
  assert.deepStrictEqual(
    parseCourseFolder('B.B.A. LL.B'),
    { name: 'B.B.A. LL.B', code: 'bba-llb', totalSemesters: 10 }
  );
  assert.strictEqual(parseCourseFolder('Random Folder Name'), null);
  console.log('✓ Course parsing tests passed');

  console.log('\n--- 2. Testing Semester Folder Parsing ---');
  assert.deepStrictEqual(
    parseSemesterFolder('Semester 1', 6),
    { semesterNumber: 1, name: 'Semester 1' }
  );
  assert.deepStrictEqual(
    parseSemesterFolder('Sem-2', 6),
    { semesterNumber: 2, name: 'Semester 2' }
  );
  assert.deepStrictEqual(
    parseSemesterFolder('Sem 06', 6),
    { semesterNumber: 6, name: 'Semester 6' }
  );
  assert.deepStrictEqual(
    parseSemesterFolder('Semester 10', 10),
    { semesterNumber: 10, name: 'Semester 10' }
  );
  // Out of bounds for 3-Year LL.B (max 6 semesters)
  assert.strictEqual(parseSemesterFolder('Semester 7', 6), null);
  assert.strictEqual(parseSemesterFolder('Notes', 6), null);
  console.log('✓ Semester parsing tests passed');

  console.log('\n--- 3. Testing Scheme Folder Parsing ---');
  assert.deepStrictEqual(
    parseSchemeFolder('Scheme 80 Marks'),
    { marks: 80, name: 'Scheme 80 Marks' }
  );
  assert.deepStrictEqual(
    parseSchemeFolder('Scheme 100 Marks'),
    { marks: 100, name: 'Scheme 100 Marks' }
  );
  assert.deepStrictEqual(
    parseSchemeFolder('80 Marks'),
    { marks: 80, name: 'Scheme 80 Marks' }
  );
  assert.deepStrictEqual(
    parseSchemeFolder('100 Marks'),
    { marks: 100, name: 'Scheme 100 Marks' }
  );
  // Non-scheme folders must be rejected
  assert.strictEqual(parseSchemeFolder('Scheme 70 Marks'), null);
  assert.strictEqual(parseSchemeFolder('Model Papers'), null);
  console.log('✓ Scheme 80/100 parsing tests passed');

  console.log('\n--- 4. Testing Subject Folder Parsing ---');
  assert.deepStrictEqual(
    parseSubjectFolder('Constitutional Law - I'),
    { name: 'Constitutional Law - I', code: null }
  );
  assert.deepStrictEqual(
    parseSubjectFolder('Contract - I (KSLU-3Y-102)'),
    { name: 'Contract - I (KSLU-3Y-102)', code: 'KSLU-3Y-102' }
  );
  assert.strictEqual(parseSubjectFolder('   '), null);
  console.log('✓ Subject folder parsing tests passed');

  console.log('\n--- 5. Testing PDF Filename Parsing (Year & Session) ---');
  // Year + Session identifiable
  const r1 = parsePdfFileName('Dec_2022.pdf', 'Law of Torts');
  assert.strictEqual(r1.examYear, 2022);
  assert.strictEqual(r1.examSession, 'Dec');
  assert.strictEqual(r1.title, 'Law of Torts - Dec 2022');

  const r2 = parsePdfFileName('June_2023_80M.pdf', 'Jurisprudence');
  assert.strictEqual(r2.examYear, 2023);
  assert.strictEqual(r2.examSession, 'June');

  // Year without month
  const r3 = parsePdfFileName('Question_Paper_2021.pdf');
  assert.strictEqual(r3.examYear, 2021);
  assert.strictEqual(r3.examSession, null);

  // Filename with NO year (Must not crash, must return examYear: null)
  const r4 = parsePdfFileName('Model_Question_Paper.pdf');
  assert.strictEqual(r4.examYear, null);
  assert.strictEqual(r4.examSession, null);
  assert.strictEqual(r4.title, 'Model Question Paper');

  console.log('✓ PDF filename parsing tests passed');
}

module.exports = { runParserTests };

if (require.main === module) {
  runParserTests();
}
