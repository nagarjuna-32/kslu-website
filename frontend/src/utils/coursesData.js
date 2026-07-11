export const COURSES = [
  {
    id: '3-year-llb',
    name: '3-Year LL.B',
    slug: '3-year-llb',
    semesters: 6,
    description: 'Post-graduate program in law for graduates of any discipline.',
    stats: { subjects: 30, resources: 140 }
  },
  {
    id: 'ba-llb',
    name: 'B.A. LL.B',
    slug: 'ba-llb',
    semesters: 10,
    description: '5-Year Integrated program combining Arts and Law modules.',
    stats: { subjects: 50, resources: 210 }
  },
  {
    id: 'bba-llb',
    name: 'B.B.A. LL.B',
    slug: 'bba-llb',
    semesters: 10,
    description: '5-Year Integrated program focusing on Business Administration and Law.',
    stats: { subjects: 50, resources: 180 }
  },
  {
    id: 'bcom-llb',
    name: 'B.Com. LL.B',
    slug: 'bcom-llb',
    semesters: 10,
    description: '5-Year Integrated program focusing on Commerce, Accounts, and Law.',
    stats: { subjects: 50, resources: 160 }
  },
  {
    id: 'bsc-llb',
    name: 'B.Sc. LL.B',
    slug: 'bsc-llb',
    semesters: 10,
    description: '5-Year Integrated program combining Science subjects and Law courses.',
    stats: { subjects: 50, resources: 95 }
  }
];

export const SUBJECTS_MAP = {
  '3-year-llb': {
    1: [
      { code: 'KSLU-101', name: 'Constitutional Law I', credits: 4, marks: 100 },
      { code: 'KSLU-102', name: 'Law of Contract I', credits: 4, marks: 100 },
      { code: 'KSLU-103', name: 'Law of Torts & Consumer Protection', credits: 4, marks: 100 },
      { code: 'KSLU-104', name: 'Family Law I: Hindu Law', credits: 4, marks: 100 },
      { code: 'KSLU-105', name: 'Criminal Law I: Indian Penal Code', credits: 4, marks: 100 }
    ],
    2: [
      { code: 'KSLU-201', name: 'Constitutional Law II', credits: 4, marks: 100 },
      { code: 'KSLU-202', name: 'Law of Contract II (Special Contracts)', credits: 4, marks: 100 },
      { code: 'KSLU-203', name: 'Family Law II: Mohammadan Law & Succession', credits: 4, marks: 100 },
      { code: 'KSLU-204', name: 'Property Law & Easements', credits: 4, marks: 100 },
      { code: 'KSLU-205', name: 'Administrative Law', credits: 4, marks: 100 }
    ],
    3: [
      { code: 'KSLU-301', name: 'Jurisprudence', credits: 4, marks: 100 },
      { code: 'KSLU-302', name: 'Labour Law I', credits: 4, marks: 100 },
      { code: 'KSLU-303', name: 'Law of Taxation', credits: 4, marks: 100 },
      { code: 'KSLU-304', name: 'Criminal Law II: CrPC & Juvenile Justice', credits: 4, marks: 100 },
      { code: 'KSLU-305', name: 'Law of Medicine and Health', credits: 4, marks: 100 }
    ],
    4: [
      { code: 'KSLU-401', name: 'Public International Law', credits: 4, marks: 100 },
      { code: 'KSLU-402', name: 'Labour Law II', credits: 4, marks: 100 },
      { code: 'KSLU-403', name: 'Optional-I: Banking Law / Insurance Law', credits: 4, marks: 100 },
      { code: 'KSLU-404', name: 'Optional-II: Human Rights / Intellectual Property Rights', credits: 4, marks: 100 },
      { code: 'KSLU-405', name: 'Clinical Course I: Drafting, Pleading & Conveyance', credits: 4, marks: 100 }
    ],
    5: [
      { code: 'KSLU-501', name: 'Company Law', credits: 4, marks: 100 },
      { code: 'KSLU-502', name: 'Civil Procedure Code & Limitation Act', credits: 4, marks: 100 },
      { code: 'KSLU-503', name: 'Optional-III: Environmental Law', credits: 4, marks: 100 },
      { code: 'KSLU-504', name: 'Optional-IV: Criminology & Penology', credits: 4, marks: 100 },
      { code: 'KSLU-505', name: 'Clinical Course II: Professional Ethics & Accounting System', credits: 4, marks: 100 }
    ],
    6: [
      { code: 'KSLU-601', name: 'Law of Evidence', credits: 4, marks: 100 },
      { code: 'KSLU-602', name: 'Land Laws including Tenure & Tenancy System', credits: 4, marks: 100 },
      { code: 'KSLU-603', name: 'Optional-V: Arbitration, Conciliation & ADR', credits: 4, marks: 100 },
      { code: 'KSLU-604', name: 'Optional-VI: Gender Justice & Feminist Jurisprudence', credits: 4, marks: 100 },
      { code: 'KSLU-605', name: 'Clinical Course III: Moot Court Exercise & Internship', credits: 4, marks: 100 }
    ]
  },
  'ba-llb': {
    // 5-Year Integrated courses map pre-law first
    1: [
      { code: 'KSLU-BA101', name: 'English I', credits: 4, marks: 100 },
      { code: 'KSLU-BA102', name: 'Political Science I: Principles of Political Science', credits: 4, marks: 100 },
      { code: 'KSLU-BA103', name: 'Sociology I: Invitation to Sociology', credits: 4, marks: 100 },
      { code: 'KSLU-BA104', name: 'Economics I: General Principles', credits: 4, marks: 100 }
    ],
    2: [
      { code: 'KSLU-BA201', name: 'English II', credits: 4, marks: 100 },
      { code: 'KSLU-BA202', name: 'Political Science II: Foundations of Political Obligation', credits: 4, marks: 100 },
      { code: 'KSLU-BA203', name: 'Sociology II: Indian Society', credits: 4, marks: 100 },
      { code: 'KSLU-BA204', name: 'Economics II: Indian Economic Environment', credits: 4, marks: 100 }
    ],
    3: [
      { code: 'KSLU-BA301', name: 'Political Science III: International Relations', credits: 4, marks: 100 },
      { code: 'KSLU-BA302', name: 'Sociology III: Sociology of Development', credits: 4, marks: 100 },
      { code: 'KSLU-BA303', name: 'Law of Torts & Consumer Protection', credits: 4, marks: 100 },
      { code: 'KSLU-BA304', name: 'Law of Contract I', credits: 4, marks: 100 }
    ],
    4: [
      { code: 'KSLU-BA401', name: 'Constitutional Law I', credits: 4, marks: 100 },
      { code: 'KSLU-BA402', name: 'Family Law I: Hindu Law', credits: 4, marks: 100 },
      { code: 'KSLU-BA403', name: 'Law of Contract II', credits: 4, marks: 100 },
      { code: 'KSLU-BA404', name: 'History of India (Legal & Constitutional)', credits: 4, marks: 100 }
    ],
    5: [
      { code: 'KSLU-101', name: 'Constitutional Law II', credits: 4, marks: 100 },
      { code: 'KSLU-104', name: 'Family Law II: Muslim Law', credits: 4, marks: 100 },
      { code: 'KSLU-105', name: 'Criminal Law I: IPC', credits: 4, marks: 100 },
      { code: 'KSLU-204', name: 'Property Law', credits: 4, marks: 100 }
    ],
    6: [
      { code: 'KSLU-205', name: 'Administrative Law', credits: 4, marks: 100 },
      { code: 'KSLU-302', name: 'Labour Law I', credits: 4, marks: 100 },
      { code: 'KSLU-301', name: 'Jurisprudence', credits: 4, marks: 100 },
      { code: 'KSLU-401', name: 'Public International Law', credits: 4, marks: 100 }
    ],
    7: [
      { code: 'KSLU-501', name: 'Company Law', credits: 4, marks: 100 },
      { code: 'KSLU-303', name: 'Law of Taxation', credits: 4, marks: 100 },
      { code: 'KSLU-402', name: 'Labour Law II', credits: 4, marks: 100 },
      { code: 'KSLU-403', name: 'Optional-I: Banking / Insurance', credits: 4, marks: 100 }
    ],
    8: [
      { code: 'KSLU-304', name: 'Criminal Law II: CrPC', credits: 4, marks: 100 },
      { code: 'KSLU-404', name: 'Optional-II: Human Rights / IPR', credits: 4, marks: 100 },
      { code: 'KSLU-503', name: 'Optional-III: Environmental Law', credits: 4, marks: 100 },
      { code: 'KSLU-405', name: 'Clinical Course I: Drafting', credits: 4, marks: 100 }
    ],
    9: [
      { code: 'KSLU-502', name: 'Civil Procedure Code & Limitation Act', credits: 4, marks: 100 },
      { code: 'KSLU-601', name: 'Law of Evidence', credits: 4, marks: 100 },
      { code: 'KSLU-504', name: 'Optional-IV: Criminology', credits: 4, marks: 100 },
      { code: 'KSLU-505', name: 'Clinical Course II: Ethics', credits: 4, marks: 100 }
    ],
    10: [
      { code: 'KSLU-602', name: 'Land Laws', credits: 4, marks: 100 },
      { code: 'KSLU-603', name: 'Optional-V: ADR', credits: 4, marks: 100 },
      { code: 'KSLU-604', name: 'Optional-VI: Gender Justice', credits: 4, marks: 100 },
      { code: 'KSLU-605', name: 'Clinical Course III: Moot Court', credits: 4, marks: 100 }
    ]
  }
};

// Map other integrated courses to follow BA LL.B structures but with different pre-law subjects
SUBJECTS_MAP['bba-llb'] = {
  ...SUBJECTS_MAP['ba-llb'],
  1: [
    { code: 'KSLU-BBA101', name: 'English I', credits: 4, marks: 100 },
    { code: 'KSLU-BBA102', name: 'Principles of Management', credits: 4, marks: 100 },
    { code: 'KSLU-BBA103', name: 'Business Environment', credits: 4, marks: 100 },
    { code: 'KSLU-BBA104', name: 'Financial Accounting', credits: 4, marks: 100 }
  ],
  2: [
    { code: 'KSLU-BBA201', name: 'English II', credits: 4, marks: 100 },
    { code: 'KSLU-BBA202', name: 'Organizational Behavior', credits: 4, marks: 100 },
    { code: 'KSLU-BBA203', name: 'Marketing Management', credits: 4, marks: 100 },
    { code: 'KSLU-BBA204', name: 'Managerial Economics', credits: 4, marks: 100 }
  ],
  3: [
    { code: 'KSLU-BBA301', name: 'Human Resource Management', credits: 4, marks: 100 },
    { code: 'KSLU-BBA302', name: 'Business Statistics', credits: 4, marks: 100 },
    { code: 'KSLU-BA303', name: 'Law of Torts & Consumer Protection', credits: 4, marks: 100 },
    { code: 'KSLU-BA304', name: 'Law of Contract I', credits: 4, marks: 100 }
  ],
  4: [
    { code: 'KSLU-BA401', name: 'Constitutional Law I', credits: 4, marks: 100 },
    { code: 'KSLU-BA402', name: 'Family Law I: Hindu Law', credits: 4, marks: 100 },
    { code: 'KSLU-BA403', name: 'Law of Contract II', credits: 4, marks: 100 },
    { code: 'KSLU-BBA404', name: 'Corporate Communication', credits: 4, marks: 100 }
  ]
};

SUBJECTS_MAP['bcom-llb'] = {
  ...SUBJECTS_MAP['ba-llb'],
  1: [
    { code: 'KSLU-COM101', name: 'English I', credits: 4, marks: 100 },
    { code: 'KSLU-COM102', name: 'Financial Accounting', credits: 4, marks: 100 },
    { code: 'KSLU-COM103', name: 'Business Management', credits: 4, marks: 100 },
    { code: 'KSLU-COM104', name: 'Micro Economics', credits: 4, marks: 100 }
  ],
  2: [
    { code: 'KSLU-COM201', name: 'English II', credits: 4, marks: 100 },
    { code: 'KSLU-COM202', name: 'Corporate Accounting', credits: 4, marks: 100 },
    { code: 'KSLU-COM203', name: 'Business Communication', credits: 4, marks: 100 },
    { code: 'KSLU-COM204', name: 'Macro Economics', credits: 4, marks: 100 }
  ],
  3: [
    { code: 'KSLU-COM301', name: 'Cost & Management Accounting', credits: 4, marks: 100 },
    { code: 'KSLU-COM302', name: 'Business Statistics', credits: 4, marks: 100 },
    { code: 'KSLU-BA303', name: 'Law of Torts & Consumer Protection', credits: 4, marks: 100 },
    { code: 'KSLU-BA304', name: 'Law of Contract I', credits: 4, marks: 100 }
  ],
  4: [
    { code: 'KSLU-BA401', name: 'Constitutional Law I', credits: 4, marks: 100 },
    { code: 'KSLU-BA402', name: 'Family Law I: Hindu Law', credits: 4, marks: 100 },
    { code: 'KSLU-BA403', name: 'Law of Contract II', credits: 4, marks: 100 },
    { code: 'KSLU-COM404', name: 'Indian Economic Development', credits: 4, marks: 100 }
  ]
};

SUBJECTS_MAP['bsc-llb'] = {
  ...SUBJECTS_MAP['ba-llb'],
  1: [
    { code: 'KSLU-SC101', name: 'English I', credits: 4, marks: 100 },
    { code: 'KSLU-SC102', name: 'Physics I / Chemistry I', credits: 4, marks: 100 },
    { code: 'KSLU-SC103', name: 'Mathematics I / Biology I', credits: 4, marks: 100 },
    { code: 'KSLU-SC104', name: 'Intro to Computers', credits: 4, marks: 100 }
  ],
  2: [
    { code: 'KSLU-SC201', name: 'English II', credits: 4, marks: 100 },
    { code: 'KSLU-SC202', name: 'Physics II / Chemistry II', credits: 4, marks: 100 },
    { code: 'KSLU-SC203', name: 'Mathematics II / Biology II', credits: 4, marks: 100 },
    { code: 'KSLU-SC204', name: 'Scientific Method & Logic', credits: 4, marks: 100 }
  ],
  3: [
    { code: 'KSLU-SC301', name: 'Environmental Science', credits: 4, marks: 100 },
    { code: 'KSLU-SC302', name: 'Statistics for Scientists', credits: 4, marks: 100 },
    { code: 'KSLU-BA303', name: 'Law of Torts & Consumer Protection', credits: 4, marks: 100 },
    { code: 'KSLU-BA304', name: 'Law of Contract I', credits: 4, marks: 100 }
  ],
  4: [
    { code: 'KSLU-BA401', name: 'Constitutional Law I', credits: 4, marks: 100 },
    { code: 'KSLU-BA402', name: 'Family Law I: Hindu Law', credits: 4, marks: 100 },
    { code: 'KSLU-BA403', name: 'Law of Contract II', credits: 4, marks: 100 },
    { code: 'KSLU-SC404', name: 'Technology & Legal Frameworks', credits: 4, marks: 100 }
  ]
};
