export const COURSES = [
  {
    id: '3-year-llb',
    name: '3-Year LL.B',
    slug: '3-year-llb',
    semesters: 6,
    description: 'Post-graduate program in law for graduates of any discipline.',
    stats: { subjects: 32, resources: 140 }
  },
  {
    id: 'ba-llb',
    name: 'B.A. LL.B',
    slug: 'ba-llb',
    semesters: 10,
    description: '5-Year Integrated program combining Arts and Law modules.',
    stats: { subjects: 45, resources: 210 }
  },
  {
    id: 'bba-llb',
    name: 'B.B.A. LL.B',
    slug: 'bba-llb',
    semesters: 10,
    description: '5-Year Integrated program focusing on Business Administration and Law.',
    stats: { subjects: 45, resources: 180 }
  },
  {
    id: 'bcom-llb',
    name: 'B.Com. LL.B',
    slug: 'bcom-llb',
    semesters: 10,
    description: '5-Year Integrated program focusing on Commerce, Accounts, and Law.',
    stats: { subjects: 45, resources: 160 }
  },
  {
    id: 'bsc-llb',
    name: 'B.Sc. LL.B',
    slug: 'bsc-llb',
    semesters: 10,
    description: '5-Year Integrated program combining Science subjects and Law courses.',
    stats: { subjects: 45, resources: 95 }
  }
];

export const SUBJECTS_MAP = {
  '3-year-llb': {
    1: [
      { code: 'KSLU-3Y-101', name: 'Constitutional Law - I', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-102', name: 'Contract - I (General Principles)', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-103', name: 'Law of Torts & Consumer Protection', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-104', name: 'Family Law - I (Hindu Law)', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-105', name: 'Criminal Law - I: Bharatiya Nyaya Sanhita (BNS)', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-106', name: 'English (Kannada Medium Option)', credits: 4, marks: 100 }
    ],
    2: [
      { code: 'KSLU-3Y-201', name: 'Constitutional Law - II', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-202', name: 'Contract - II (Special Contracts)', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-203', name: 'Labour Law - I', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-204', name: 'Property Law', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-205', name: 'Family Law - II (Mohammedan Law & Indian Succession Act)', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-206', name: 'Kannada / Kannada Kali', credits: 4, marks: 100 }
    ],
    3: [
      { code: 'KSLU-3Y-301', name: 'Jurisprudence', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-302', name: 'Labour Law - II', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-303', name: 'Law of Taxation', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-304', name: 'Criminal Law - II: BNSS, JJ Act & Probation of Offenders Act', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-305', name: 'Administrative Law', credits: 4, marks: 100 }
    ],
    4: [
      { code: 'KSLU-3Y-401', name: 'Public International Law', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-402', name: 'Optional - I: Human Rights Law and Practice / Insurance Law', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-403', name: 'Optional - II: Banking Law / Right to Information', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-404', name: 'Clinical - I: Professional Ethics & Professional Accounting', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-405', name: 'Clinical - II: Alternative Dispute Resolution (ADR) Systems', credits: 4, marks: 100 }
    ],
    5: [
      { code: 'KSLU-3Y-501', name: 'Company Law', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-502', name: 'Civil Procedure Code (CPC) and Limitation Act', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-503', name: 'Optional - III: Intellectual Property Rights - I / Penology & Victimology', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-504', name: 'Optional - IV: Interpretation of Statutes / Competition Law', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-505', name: 'Clinical - III: Drafting, Pleading and Conveyance', credits: 4, marks: 100 }
    ],
    6: [
      { code: 'KSLU-3Y-601', name: 'Law of Evidence: Bharatiya Sakshya Adhiniyam (BSA)', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-602', name: 'Environmental Law', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-603', name: 'Optional - V: Intellectual Property Rights - II / White Collar Crimes', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-604', name: 'Optional - VI: Land Laws / International Trade Economics', credits: 4, marks: 100 },
      { code: 'KSLU-3Y-605', name: 'Clinical - IV: Moot Court Exercise and Internship', credits: 4, marks: 100 }
    ]
  },
  'ba-llb': {
    1: [
      { code: 'KSLU-BA-101', name: 'English', credits: 4, marks: 100 },
      { code: 'KSLU-BA-102', name: 'Sociology - I', credits: 4, marks: 100 },
      { code: 'KSLU-BA-103', name: 'Political Science - I', credits: 4, marks: 100 },
      { code: 'KSLU-BA-104', name: 'Economics - I', credits: 4, marks: 100 },
      { code: 'KSLU-BA-105', name: 'Legal Methods', credits: 4, marks: 100 }
    ],
    2: [
      { code: 'KSLU-BA-201', name: 'Kannada', credits: 4, marks: 100 },
      { code: 'KSLU-BA-202', name: 'Indian Society', credits: 4, marks: 100 },
      { code: 'KSLU-BA-203', name: 'Law of Torts', credits: 4, marks: 100 },
      { code: 'KSLU-BA-204', name: 'Money & Banking', credits: 4, marks: 100 }
    ],
    3: [
      { code: 'KSLU-BA-301', name: 'Constitutional Law - I', credits: 4, marks: 100 },
      { code: 'KSLU-BA-302', name: 'Economic Theory', credits: 4, marks: 100 },
      { code: 'KSLU-BA-303', name: 'World Governments', credits: 4, marks: 100 },
      { code: 'KSLU-BA-304', name: 'Sociological Perspectives', credits: 4, marks: 100 }
    ],
    4: [
      { code: 'KSLU-BA-401', name: 'Constitutional Law - II', credits: 4, marks: 100 },
      { code: 'KSLU-BA-402', name: 'Criminal Law - I: Bharatiya Nyaya Sanhita (BNS)', credits: 4, marks: 100 },
      { code: 'KSLU-BA-403', name: 'Contract - I (General Principles)', credits: 4, marks: 100 },
      { code: 'KSLU-BA-404', name: 'Humanities Stream Paper (Stream Specific)', credits: 4, marks: 100 }
    ],
    5: [
      { code: 'KSLU-INT-501', name: 'Labour Law - I', credits: 4, marks: 100 },
      { code: 'KSLU-INT-502', name: 'Jurisprudence', credits: 4, marks: 100 },
      { code: 'KSLU-INT-503', name: 'Family Law - I (Hindu Law)', credits: 4, marks: 100 },
      { code: 'KSLU-INT-504', name: 'Contract - II (Special Contracts)', credits: 4, marks: 100 },
      { code: 'KSLU-INT-505', name: 'Administrative Law', credits: 4, marks: 100 }
    ],
    6: [
      { code: 'KSLU-INT-601', name: 'Labour Law - II', credits: 4, marks: 100 },
      { code: 'KSLU-INT-602', name: 'Company Law', credits: 4, marks: 100 },
      { code: 'KSLU-INT-603', name: 'Property Law', credits: 4, marks: 100 },
      { code: 'KSLU-INT-604', name: 'Family Law - II (Mohammedan Law & Succession)', credits: 4, marks: 100 }
    ],
    7: [
      { code: 'KSLU-INT-701', name: 'Public International Law', credits: 4, marks: 100 },
      { code: 'KSLU-INT-702', name: 'Law of Taxation', credits: 4, marks: 100 },
      { code: 'KSLU-INT-703', name: 'Criminal Law - II: Bharatiya Nagarik Suraksha Sanhita (BNSS)', credits: 4, marks: 100 },
      { code: 'KSLU-INT-704', name: 'Clinical Course - I: Professional Ethics & Professional Accounting', credits: 4, marks: 100 }
    ],
    8: [
      { code: 'KSLU-INT-801', name: 'Law of Evidence: Bharatiya Sakshya Adhiniyam (BSA)', credits: 4, marks: 100 },
      { code: 'KSLU-INT-802', name: 'Optional - I: Human Rights Law / Insurance Law', credits: 4, marks: 100 },
      { code: 'KSLU-INT-803', name: 'Optional - II: Banking Law / Right to Information', credits: 4, marks: 100 },
      { code: 'KSLU-INT-804', name: 'Clinical Course - II: Alternative Dispute Resolution (ADR) Systems', credits: 4, marks: 100 }
    ],
    9: [
      { code: 'KSLU-INT-901', name: 'Civil Procedure Code (CPC) and Limitation Act', credits: 4, marks: 100 },
      { code: 'KSLU-INT-902', name: 'Optional - III: Intellectual Property Rights - I / Penology & Victimology', credits: 4, marks: 100 },
      { code: 'KSLU-INT-903', name: 'Optional - IV: Interpretation of Statutes / Competition Law', credits: 4, marks: 100 },
      { code: 'KSLU-INT-904', name: 'Clinical Course - III: Drafting, Pleading and Conveyance', credits: 4, marks: 100 }
    ],
    10: [
      { code: 'KSLU-INT-1001', name: 'Environmental Law', credits: 4, marks: 100 },
      { code: 'KSLU-INT-1002', name: 'Optional - V: Intellectual Property Rights - II / White Collar Crimes', credits: 4, marks: 100 },
      { code: 'KSLU-INT-1003', name: 'Optional - VI: Land Laws / International Trade Economics', credits: 4, marks: 100 },
      { code: 'KSLU-INT-1004', name: 'Clinical Course - IV: Moot Court Exercise and Internship', credits: 4, marks: 100 }
    ]
  }
};

// Copy shared integrated core law semesters V to X for BBA, BCom and BSc LL.B.
const copyCoreLawSemesters = (target) => {
  for (let sem = 5; sem <= 10; sem++) {
    target[sem] = SUBJECTS_MAP['ba-llb'][sem];
  }
};

SUBJECTS_MAP['bba-llb'] = {
  1: [
    { code: 'KSLU-BBA-101', name: 'English', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-102', name: 'Principles of Management', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-103', name: 'Micro Economics', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-104', name: 'Financial Accounting', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-105', name: 'Legal Methods', credits: 4, marks: 100 }
  ],
  2: [
    { code: 'KSLU-BBA-201', name: 'Kannada', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-202', name: 'Business Communication', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-203', name: 'Macro Economics', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-204', name: 'Cost Accounting', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-205', name: 'Law of Torts', credits: 4, marks: 100 }
  ],
  3: [
    { code: 'KSLU-BBA-301', name: 'Human Resource Management', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-302', name: 'Financial Management', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-303', name: 'Business Statistics', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-304', name: 'Corporate Environment', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-305', name: 'Constitutional Law - I', credits: 4, marks: 100 }
  ],
  4: [
    { code: 'KSLU-BBA-401', name: 'Constitutional Law - II', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-402', name: 'Criminal Law - I: Bharatiya Nyaya Sanhita (BNS)', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-403', name: 'Contract - I (General Principles)', credits: 4, marks: 100 },
    { code: 'KSLU-BBA-404', name: 'Business Management Stream Paper (Stream Specific)', credits: 4, marks: 100 }
  ]
};
copyCoreLawSemesters(SUBJECTS_MAP['bba-llb']);

SUBJECTS_MAP['bcom-llb'] = {
  1: [
    { code: 'KSLU-COM-101', name: 'English', credits: 4, marks: 100 },
    { code: 'KSLU-COM-102', name: 'Business Environment', credits: 4, marks: 100 },
    { code: 'KSLU-COM-103', name: 'Micro Economics', credits: 4, marks: 100 },
    { code: 'KSLU-COM-104', name: 'Financial Accounting', credits: 4, marks: 100 },
    { code: 'KSLU-COM-105', name: 'Legal Methods', credits: 4, marks: 100 }
  ],
  2: [
    { code: 'KSLU-COM-201', name: 'Kannada', credits: 4, marks: 100 },
    { code: 'KSLU-COM-202', name: 'Principles of Management', credits: 4, marks: 100 },
    { code: 'KSLU-COM-203', name: 'Macro Economics', credits: 4, marks: 100 },
    { code: 'KSLU-COM-204', name: 'Corporate Accounting', credits: 4, marks: 100 },
    { code: 'KSLU-COM-205', name: 'Law of Torts', credits: 4, marks: 100 }
  ],
  3: [
    { code: 'KSLU-COM-301', name: 'Marketing & Services Management', credits: 4, marks: 100 },
    { code: 'KSLU-COM-302', name: 'Cost Accounting', credits: 4, marks: 100 },
    { code: 'KSLU-COM-303', name: 'Principles of Auditing', credits: 4, marks: 100 },
    { code: 'KSLU-COM-304', name: 'Business Statistics', credits: 4, marks: 100 },
    { code: 'KSLU-COM-305', name: 'Constitutional Law - I', credits: 4, marks: 100 }
  ],
  4: [
    { code: 'KSLU-COM-401', name: 'Constitutional Law - II', credits: 4, marks: 100 },
    { code: 'KSLU-COM-402', name: 'Criminal Law - I: Bharatiya Nyaya Sanhita (BNS)', credits: 4, marks: 100 },
    { code: 'KSLU-COM-403', name: 'Contract - I (General Principles)', credits: 4, marks: 100 },
    { code: 'KSLU-COM-404', name: 'Financial Management / International Business', credits: 4, marks: 100 }
  ]
};
copyCoreLawSemesters(SUBJECTS_MAP['bcom-llb']);

SUBJECTS_MAP['bsc-llb'] = {
  1: [
    { code: 'KSLU-SC-101', name: 'English', credits: 4, marks: 100 },
    { code: 'KSLU-SC-102', name: 'Physics - I / Chemistry - I', credits: 4, marks: 100 },
    { code: 'KSLU-SC-103', name: 'Mathematics - I / Biology - I', credits: 4, marks: 100 },
    { code: 'KSLU-SC-104', name: 'Intro to Computers', credits: 4, marks: 100 },
    { code: 'KSLU-SC-105', name: 'Legal Methods', credits: 4, marks: 100 }
  ],
  2: [
    { code: 'KSLU-SC-201', name: 'Kannada', credits: 4, marks: 100 },
    { code: 'KSLU-SC-202', name: 'Physics - II / Chemistry - II', credits: 4, marks: 100 },
    { code: 'KSLU-SC-203', name: 'Mathematics - II / Biology - II', credits: 4, marks: 100 },
    { code: 'KSLU-SC-204', name: 'Scientific Method & Logic', credits: 4, marks: 100 },
    { code: 'KSLU-SC-205', name: 'Law of Torts', credits: 4, marks: 100 }
  ],
  3: [
    { code: 'KSLU-SC-301', name: 'Environmental Science', credits: 4, marks: 100 },
    { code: 'KSLU-SC-302', name: 'Statistics for Scientists', credits: 4, marks: 100 },
    { code: 'KSLU-SC-303', name: 'Law of Contract - I', credits: 4, marks: 100 },
    { code: 'KSLU-SC-304', name: 'Constitutional Law - I', credits: 4, marks: 100 }
  ],
  4: [
    { code: 'KSLU-SC-401', name: 'Constitutional Law - II', credits: 4, marks: 100 },
    { code: 'KSLU-SC-402', name: 'Criminal Law - I: Bharatiya Nyaya Sanhita (BNS)', credits: 4, marks: 100 },
    { code: 'KSLU-SC-403', name: 'Contract - II (Special Contracts)', credits: 4, marks: 100 },
    { code: 'KSLU-SC-404', name: 'Technology & Legal Frameworks', credits: 4, marks: 100 }
  ]
};
copyCoreLawSemesters(SUBJECTS_MAP['bsc-llb']);
