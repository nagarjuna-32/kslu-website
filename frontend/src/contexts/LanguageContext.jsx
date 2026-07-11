import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext(); // Placeholder to compile properly if used
const LanguageContext = createContext();

const translations = {
  en: {
    // Navigation & Footer
    home: 'Home',
    notes: 'Notes',
    papers: 'Question Papers',
    upload: 'Upload',
    profile: 'Profile',
    admin: 'Admin',
    login: 'Sign In',
    register: 'Sign Up',
    logout: 'Sign Out',
    navigation: 'Navigation',
    legalContact: 'Legal & Contact',
    portal: 'KSLU Portal',
    privacy: 'Privacy Policy',
    terms: 'Terms & Conditions',
    footerDesc: 'KSLU Circle is a community-driven repository designed specifically for law students affiliated with Karnataka State Law University. We facilitate peer-to-peer sharing of lecture notes, study materials, and university question papers.',
    createdFor: 'Created for law students. Not affiliated with KSLU.',
    
    // Hero & Home
    tagline: 'Learn • Share • Succeed',
    heroTitle: "Karnataka's Largest Learning Platform for KSLU Students",
    heroSubtitle: "Access semester-wise notes, previous year question papers, syllabus modules, important questions, and peer study resources in one unified hub.",
    browseNotesBtn: 'Browse Notes',
    previousPapersBtn: 'Previous Year Papers',
    searchPlaceholder: 'Search by Subject, Semester, Course, or Question Paper...',
    quickFilters: 'Quick Filters',
    browseCourses: 'Browse by Law Course',
    recentUploads: 'Recent Uploads',
    topContributors: 'Top Contributors',
    activeStudents: 'Active Students',
    totalDownloads: 'Total Downloads',
    studyNotes: 'Study Notes',
    reputation: 'Reputation',
    viewAll: 'View All',
    syllabusPortal: 'Syllabus Portal',
    selectCourseDesc: 'Select your program to access semester-wise modules and subject syllabi.',
    newlyPublished: 'Newly Published',
    leaderboard: 'Leaderboard',
    leaderboardEmpty: 'Leaderboard currently empty.',
    noFeatured: 'No featured materials available yet.',
    noRecent: 'No resources published yet.',
    
    // Upload Page
    shareResources: 'Share Resources',
    uploadTitle: 'Upload study material',
    uploadSubtitle: 'Submit notes or old question papers. In development mode, files are automatically approved and searchable instantly.',
    docInfo: 'Document Information',
    materialType: 'Material Type',
    studyNoteToggle: 'Study Note',
    questionPaperToggle: 'Question Paper',
    docTitle: 'Document Title',
    lawCourse: 'Law Course',
    subjectCode: 'Subject Code',
    subjectName: 'Subject Name',
    semester: 'Semester',
    university: 'University',
    examYear: 'Exam Year',
    description: 'Description',
    tags: 'Keywords / Tags',
    uploadBtn: 'Upload & Publish Note',
    fileDragDrop: 'Drag & drop your PDF file here',
    fileClickBrowse: 'or click to browse local files',
    ownershipTitle: 'Legal Ownership Declaration',
    ownershipText: 'By submitting, you confirm that you possess the rights to share this document and that it does not violate copyright rules.',
    historyTitle: 'My Upload History',
    historyEmpty: 'No document uploads logged yet.',
    tblTitle: 'Title',
    tblType: 'Type',
    tblCourse: 'Course',
    tblCode: 'Code',
    tblDate: 'Upload Date',
    tblDownloads: 'Downloads',
    tblStatus: 'Status',
    tblViews: 'Views',
    tblActions: 'Actions',
    attachementTitle: 'PDF Attachment',
    attachementPreview: 'Attached',
    reasonRejected: 'Reason',
    
    // Course Detail Page
    academicHub: 'KSLU Academic Hub',
    selectSemester: 'Select Semester',
    courseNotFound: 'Course Not Found',
    semSubjects: 'Semester Subjects',
    syllabusMapped: 'Standard syllabus subjects mapped for this course.',
    credits: 'Credits',
    marks: 'Marks',
    viewResources: 'View Resources',
    maxMarks: 'Max Marks',

    // Subject Detail Page
    subjectNotFound: 'Subject Not Found',
    beFirstUpload: 'Be the first to upload',
    noResources: 'No resources found',
    noResourcesDesc: 'We do not have files under this tab yet. Share your study guides to assist other students.',
    studyNotesTab: 'Study Notes',
    pyqsTab: 'Previous Papers (PYQs)',
    importantQsTab: 'Important Qs',
    refBooksTab: 'Reference Books',
    caseLawsTab: 'Case Laws',
    
    // Profile / Dashboard
    accountDashboard: 'Account Dashboard',
    reputationStars: 'Reputation Stars',
    activeUploads: 'My Uploads',
    dashboardMenu: 'Dashboard',
    bookmarksMenu: 'Bookmarks',
    settingsMenu: 'Settings',
    uploadResourceMenu: 'Upload Resource',
    darkModeMenu: 'Dark Mode',
    joinedIn: 'Joined in',
    verificationCardTitle: 'Legal Academic Network Integrity',
    verificationCardDesc: 'Your submissions help fellow students. By uploading syllabus documents and verified LLB papers, you maintain academic honesty. Every download earns you reputational stars.',
    bookmarkedTitle: 'Bookmarked Materials',
    noBookmarks: 'You have not bookmarked any materials yet.',
    noUploads: 'You have not uploaded any study materials yet.',
    updateProfile: 'Update Profile',
    fullName: 'Full Name',
    lawCollege: 'Law College',
    yearOfStudy: 'Year of Study',
    alertPreferences: 'Alert Preferences',
    emailAlerts: 'Receive Email Notifications',
    inAppAlerts: 'Enable In-App Popups',
    saveProfile: 'Save Profile Settings',
    securityPassword: 'Security & Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password (6+ chars)',
    changePassword: 'Change Password',
    updatingBtn: 'Updating...',
    
    // Notes & Papers page
    notesTitle: 'Study Notes',
    notesSubtitle: 'Explore legal lecture notes, summaries, and curriculum digests uploaded by classmates.',
    papersTitle: 'Question Papers',
    papersSubtitle: 'Browse previous years\' university law question papers sorted by academic term.',
    noNotesFound: 'No notes found',
    noNotesDesc: 'Be the first to upload lecture notes or summaries for this selection.',
    noPapersFound: 'No question papers found',
    noPapersDesc: 'Be the first to upload previous semester papers for this course configuration.',
    searchNotesPlaceholder: 'Search notes by title, tag, subject code...',
    searchPapersPlaceholder: 'Search question papers by title, course, year...',
    sortResults: 'Sort Results',
    resetFilters: 'Reset Filters',
    allYears: 'All Years'
  },
  kn: {
    // Navigation & Footer
    home: 'ಮುಖಪುಟ',
    notes: 'ನೋಟ್ಸ್',
    papers: 'ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಗಳು',
    upload: 'ಅಪ್‌ಲೋಡ್',
    profile: 'ಪ್ರೊಫೈಲ್',
    admin: 'ಅಡ್ಮಿನ್',
    login: 'ಲಾಗಿನ್',
    register: 'ನೋಂದಣಿ',
    logout: 'ನಿರ್ಗಮಿಸಿ',
    navigation: 'ನ್ಯಾವಿಗೇಷನ್',
    legalContact: 'ಕಾನೂನು ಮತ್ತು ಸಂಪರ್ಕ',
    portal: 'ಕೆ.ಎಸ್.ಎಲ್.ಯು ಪೋರ್ಟಲ್',
    privacy: 'ಗೌಪ್ಯತಾ ನೀತಿ',
    terms: 'ನಿಯಮಗಳು ಮತ್ತು ನಿಬಂಧನೆಗಳು',
    footerDesc: 'ಕೆ.ಎಸ್.ಎಲ್.ಯು ಸರ್ಕಲ್ ಎನ್ನುವುದು ಕರ್ನಾಟಕ ರಾಜ್ಯ ಕಾನೂನು ವಿಶ್ವವಿದ್ಯಾಲಯದ ಕಾನೂನು ವಿದ್ಯಾರ್ಥಿಗಳಿಗಾಗಿ ವಿಶೇಷವಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಸಮುದಾಯ-ಚಾಲಿತ ರೆಪೊಸಿಟರಿಯಾಗಿದೆ. ನಾವು ಉಪನ್ಯಾಸ ಟಿಪ್ಪಣಿಗಳು, ಅಭ್ಯಾಸ ಸಾಮಗ್ರಿಗಳು ಮತ್ತು ವಿಶ್ವವಿದ್ಯಾಲಯದ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಗಳ ಪೀರ್-ಟು-ಪೀರ್ ಹಂಚಿಕೆಯನ್ನು ಸುಲಭಗೊಳಿಸುತ್ತೇವೆ.',
    createdFor: 'ಕಾನೂನು ವಿದ್ಯಾರ್ಥಿಗಳಿಗಾಗಿ ರಚಿಸಲಾಗಿದೆ. ಕೆ.ಎಸ್.ಎಲ್.ಯು ಗೆ ಸಂಬಂಧಿಸಿಲ್ಲ.',
    
    // Hero & Home
    tagline: 'ಕಲಿಯಿರಿ • ಹಂಚಿಕೊಳ್ಳಿ • ಯಶಸ್ವಿಯಾಗಿ',
    heroTitle: "ಕೆ.ಎಸ್.ಎಲ್.ಯು ವಿದ್ಯಾರ್ಥಿಗಳಿಗಾಗಿ ಕರ್ನಾಟಕದ ಅತಿ ದೊಡ್ಡ ಕಲಿಕಾ ವೇದಿಕೆ",
    heroSubtitle: "ಸೆಮಿಸ್ಟರ್ ವೈಸ್ ನೋಟ್ಸ್, ಹಿಂದಿನ ವರ್ಷದ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಗಳು, ಪಠ್ಯಕ್ರಮ ಮತ್ತು ಅಭ್ಯಾಸ ಸಂಪನ್ಮೂಲಗಳನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ಪ್ರವೇಶಿಸಿ.",
    browseNotesBtn: 'ನೋಟ್ಸ್ ಬ್ರೌಸ್ ಮಾಡಿ',
    previousPapersBtn: 'ಹಳೆಯ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಗಳು',
    searchPlaceholder: 'ವಿಷಯ, ಸೆಮಿಸ್ಟರ್, ಕೋರ್ಸ್ ಅಥವಾ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಯ ಮೂಲಕ ಹುಡುಕಿ...',
    quickFilters: 'ತ್ವರಿತ ಶೋಧಕಗಳು',
    browseCourses: 'ಕಾನೂನು ಕೋರ್ಸ್ ಮೂಲಕ ಬ್ರೌಸ್ ಮಾಡಿ',
    recentUploads: 'ಇತ್ತೀಚಿನ ಅಪ್‌ಲೋಡ್‌ಗಳು',
    topContributors: 'ಉನ್ನತ ಕೊಡುಗೆದಾರರು',
    activeStudents: 'ಸಕ್ರಿಯ ವಿದ್ಯಾರ್ಥಿಗಳು',
    totalDownloads: 'ಒಟ್ಟು ಡೌನ್‌ಲೋಡ್‌ಗಳು',
    studyNotes: 'ಅಭ್ಯಾಸ ಪತ್ರಿಕೆಗಳು',
    reputation: 'ಗೌರವ ಅಂಕಗಳು',
    viewAll: 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ',
    syllabusPortal: 'ಪಠ್ಯಕ್ರಮ ಪೋರ್ಟಲ್',
    selectCourseDesc: 'ಸೆಮಿಸ್ಟರ್ ವೈಸ್ ಮಾಡ್ಯೂಲ್‌ಗಳು ಮತ್ತು ವಿಷಯ ಪಠ್ಯಕ್ರಮಗಳನ್ನು ಪ್ರವೇಶಿಸಲು ನಿಮ್ಮ ಕೋರ್ಸ್ ಆಯ್ಕೆಮಾಡಿ.',
    newlyPublished: 'ಹೊಸದಾಗಿ ಪ್ರಕಟಿಸಲಾಗಿದೆ',
    leaderboard: 'ಕೊಡುಗೆದಾರರ ಪಟ್ಟಿ',
    leaderboardEmpty: 'ಕೊಡುಗೆದಾರರ ಪಟ್ಟಿ ಸದ್ಯ ಖಾಲಿ ಇದೆ.',
    noFeatured: 'ಯಾವುದೇ ಶಿಫಾರಸು ಮಾಡಲಾದ ಸಾಮಗ್ರಿಗಳು ಲಭ್ಯವಿಲ್ಲ.',
    noRecent: 'ಇನ್ನೂ ಯಾವುದೇ ಸಂಪನ್ಮೂಲಗಳನ್ನು ಪ್ರಕಟಿಸಲಾಗಿಲ್ಲ.',
    
    // Upload Page
    shareResources: 'ಸಂಪನ್ಮೂಲ ಹಂಚಿಕೆ',
    uploadTitle: 'ಅಭ್ಯಾಸ ಸಾಮಗ್ರಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    uploadSubtitle: 'ನೋಟ್ಸ್ ಅಥವಾ ಹಳೆಯ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಗಳನ್ನು ಸಲ್ಲಿಸಿ. ಅಭಿವೃದ್ಧಿ ಮೋಡ್‌ನಲ್ಲಿ, ಫೈಲ್‌ಗಳು ತಕ್ಷಣವೇ ಅನುಮೋದನೆಗೊಂಡು ಸರ್ಚ್‌ಗೆ ಲಭ್ಯವಿರುತ್ತವೆ.',
    docInfo: 'ದಸ್ತಾವೇಜು ಮಾಹಿತಿ',
    materialType: 'ಸಾಮಗ್ರಿ ಪ್ರಕಾರ',
    studyNoteToggle: 'ಅಭ್ಯಾಸ ನೋಟ್ಸ್',
    questionPaperToggle: 'ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆ',
    docTitle: 'ಸಾಮಗ್ರಿ ಶೀರ್ಷಿಕೆ',
    lawCourse: 'ಕಾನೂನು ಕೋರ್ಸ್',
    subjectCode: 'ವಿಷಯ ಕೋಡ್',
    subjectName: 'ವಿಷಯದ ಹೆಸರು',
    semester: 'ಸೆಮಿಸ್ಟರ್',
    university: 'ವಿಶ್ವವಿದ್ಯಾಲಯ',
    examYear: 'ಪರೀಕ್ಷೆಯ ವರ್ಷ',
    description: 'ವಿವರಣೆ',
    tags: 'ಕೀವರ್ಡ್ಗಳು / ಟ್ಯಾಗ್ಗಳು',
    uploadBtn: 'ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಪ್ರಕಟಿಸಿ',
    fileDragDrop: 'ನಿಮ್ಮ ಪಿಡಿಎಫ್ ಫೈಲ್ ಅನ್ನು ಇಲ್ಲಿ ಎಳೆಯಿರಿ ಮತ್ತು ಬಿಡಿ',
    fileClickBrowse: 'ಅಥವಾ ಫೈಲ್ ಬ್ರೌಸ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
    ownershipTitle: 'ಕಾನೂನುಬದ್ಧ ಮಾಲೀಕತ್ವದ ಘೋಷಣೆ',
    ownershipText: 'ಸಲ್ಲಿಸುವ ಮೂಲಕ, ಈ ದಸ್ತಾವೇಜನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ನೀವು ಹಕ್ಕುಗಳನ್ನು ಹೊಂದಿದ್ದೀರಿ ಮತ್ತು ಇದು ಹಕ್ಕುಸ್ವಾಮ್ಯ ನಿಯಮಗಳನ್ನು ಉಲ್ಲಂಘಿಸುವುದಿಲ್ಲ ಎಂದು ನೀವು ಖಚಿತಪಡಿಸುತ್ತೀರಿ.',
    historyTitle: 'ನನ್ನ ಅಪ್‌ಲೋಡ್ ಇತಿಹಾಸ',
    historyEmpty: 'ಇನ್ನೂ ಯಾವುದೇ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗಿಲ್ಲ.',
    tblTitle: 'ಶೀರ್ಷಿಕೆ',
    tblType: 'ಪ್ರಕಾರ',
    tblCourse: 'ಕೋರ್ಸ್',
    tblCode: 'ಕೋಡ್',
    tblDate: 'ಅಪ್‌ಲೋಡ್ ದಿನಾಂಕ',
    tblDownloads: 'ಡೌನ್‌ಲೋಡ್‌ಗಳು',
    tblStatus: 'ಸ್ಥಿತಿ',
    tblViews: 'ವೀಕ್ಷಣೆಗಳು',
    tblActions: 'ಕ್ರಮಗಳು',
    attachementTitle: 'ಪಿಡಿಎಫ್ ಲಗತ್ತು',
    attachementPreview: 'ಲಗತ್ತಿಸಲಾಗಿದೆ',
    reasonRejected: 'ತಿರಸ್ಕರಿಸಲು ಕಾರಣ',
    
    // Course Detail Page
    academicHub: 'ಕೆ.ಎಸ್.ಎಲ್.ಯು ಶೈಕ್ಷಣಿಕ ಹಬ್',
    selectSemester: 'ಸೆಮಿಸ್ಟರ್ ಆಯ್ಕೆಮಾಡಿ',
    courseNotFound: 'ಕೋರ್ಸ್ ಕಂಡುಬಂದಿಲ್ಲ',
    semSubjects: 'ಸೆಮಿಸ್ಟರ್ ವಿಷಯಗಳು',
    syllabusMapped: 'ಈ ಕೋರ್ಸ್‌ಗಾಗಿ ಪ್ರಮಾಣಿತ ಪಠ್ಯಕ್ರಮ ವಿಷಯಗಳನ್ನು ಮ್ಯಾಪ್ ಮಾಡಲಾಗಿದೆ.',
    credits: 'ಕ್ರೆಡಿಟ್ಗಳು',
    marks: 'ಅಂಕಗಳು',
    viewResources: 'ಸಂಪನ್ಮೂಲಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    maxMarks: 'ಗರಿಷ್ಠ ಅಂಕಗಳು',

    // Subject Detail Page
    subjectNotFound: 'ವಿಷಯ ಕಂಡುಬಂದಿಲ್ಲ',
    beFirstUpload: 'ಮೊದಲು ಅಪ್‌ಲೋಡ್ ಮಾಡುವವರಾಗಿ',
    noResources: 'ಯಾವುದೇ ಸಂಪನ್ಮೂಲಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    noResourcesDesc: 'ಈ ಟ್ಯಾಬ್ ಅಡಿಯಲ್ಲಿ ನಾವು ಇನ್ನೂ ಫೈಲ್‌ಗಳನ್ನು ಹೊಂದಿಲ್ಲ. ಇತರ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಸಹಾಯ ಮಾಡಲು ನಿಮ್ಮ ಅಭ್ಯಾಸ ಮಾರ್ಗದರ್ಶಿಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.',
    studyNotesTab: 'ಅಭ್ಯಾಸ ನೋಟ್ಸ್',
    pyqsTab: 'ಹಳೆಯ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಗಳು (PYQs)',
    importantQsTab: 'ಪ್ರಮುಖ ಪ್ರಶ್ನೆಗಳು',
    refBooksTab: 'ಉಲ್ಲೇಖಿತ ಪುಸ್ತಕಗಳು',
    caseLawsTab: 'ಪ್ರಮುಖ ಪ್ರಕರಣಗಳು',
    
    // Profile / Dashboard
    accountDashboard: 'ಖಾತೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    reputationStars: 'ಖ್ಯಾತಿ ನಕ್ಷತ್ರಗಳು',
    activeUploads: 'ನನ್ನ ಅಪ್‌ಲೋಡ್‌ಗಳು',
    dashboardMenu: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    bookmarksMenu: 'ಬುಕ್‌ಮಾರ್ಕ್‌ಗಳು',
    settingsMenu: 'ಸಂಯೋಜನೆಗಳು',
    uploadResourceMenu: 'ಅಪ್‌ಲೋಡ್ ಸಾಮಗ್ರಿ',
    darkModeMenu: 'ಡಾರ್ಕ್ ಮೋಡ್',
    joinedIn: 'ಸೇರಿದ್ದು',
    verificationCardTitle: 'ಶೈಕ್ಷಣಿಕ ನೆಟ್‌ವರ್ಕ್ ಸಮಗ್ರತೆ',
    verificationCardDesc: 'ನಿಮ್ಮ ಸಲ್ಲಿಕೆಗಳು ಸಹಪಾಠಿಗಳಿಗೆ ಸಹಾಯ ಮಾಡುತ್ತವೆ. ಪಠ್ಯಕ್ರಮ ದಾಖಲೆಗಳು ಮತ್ತು ಪರಿಶೀಲಿಸಿದ ಎಲ್ಎಲ್ ಬಿ ಪೇಪರ್‌ಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡುವ ಮೂಲಕ, ನೀವು ಶೈಕ್ಷಣಿಕ ಪ್ರಾಮಾಣಿಕತೆಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುತ್ತೀರಿ. ಪ್ರತಿಯೊಂದು ಡೌನ್‌ಲೋಡ್ ನಿಮಗೆ ಗೌರವ ನಕ್ಷತ್ರಗಳನ್ನು ಗಳಿಸಿಕೊಡುತ್ತದೆ.',
    bookmarkedTitle: 'ಉಳಿಸಿದ ಸಾಮಗ್ರಿಗಳು',
    noBookmarks: 'ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಸಾಮಗ್ರಿಗಳನ್ನು ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಿಲ್ಲ.',
    noUploads: 'ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಅಭ್ಯಾಸ ಸಾಮಗ್ರಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿಲ್ಲ.',
    updateProfile: 'ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಿ',
    fullName: 'ಪೂರ್ಣ ಹೆಸರು',
    lawCollege: 'ಕಾನೂನು ಕಾಲೇಜು',
    yearOfStudy: 'ಅಭ್ಯಾಸದ ವರ್ಷ',
    alertPreferences: 'ಅಧಿಸೂಚನೆ ಆದ್ಯತೆಗಳು',
    emailAlerts: 'ಇಮೇಲ್ ಅಧಿಸೂಚನೆಗಳನ್ನು ಸ್ವೀಕರಿಸಿ',
    inAppAlerts: 'ಅಪ್ಲಿಕೇಶನ್ ಪಾಪ್-ಅಪ್‌ಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ',
    saveProfile: 'ಪ್ರೊಫೈಲ್ ಸಂಯೋಜನೆಗಳನ್ನು ಉಳಿಸಿ',
    securityPassword: 'ಭದ್ರತೆ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್',
    currentPassword: 'ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್',
    newPassword: 'ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ (6+ ಅಕ್ಷರಗಳು)',
    changePassword: 'ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಿ',
    updatingBtn: 'ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ...',
    
    // Notes & Papers page
    notesTitle: 'ಅಭ್ಯಾಸ ನೋಟ್ಸ್',
    notesSubtitle: 'ಸಹಪಾಠಿಗಳು ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಕಾನೂನು ಉಪನ್ಯಾಸ ಟಿಪ್ಪಣಿಗಳು, ಸಾರಾಂಶಗಳು ಮತ್ತು ಪಠ್ಯಕ್ರಮದ ಡೈಜೆಸ್ಟ್‌ಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.',
    papersTitle: 'ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಗಳು',
    papersSubtitle: 'ಶೈಕ್ಷಣಿಕ ಪದದ ಮೂಲಕ ವಿಂಗಡಿಸಲಾದ ಹಿಂದಿನ ವರ್ಷಗಳ ಕಾನೂನು ವಿಶ್ವವಿದ್ಯಾಲಯದ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ.',
    noNotesFound: 'ಯಾವುದೇ ನೋಟ್ಸ್ ಕಂಡುಬಂದಿಲ್ಲ',
    noNotesDesc: 'ಈ ಆಯ್ಕೆಗೆ ಉಪನ್ಯಾಸ ಟಿಪ್ಪಣಿಗಳು ಅಥವಾ ಸಾರಾಂಶಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ಮೊದಲಿಗರಾಗಿರಿ.',
    noPapersFound: 'ಯಾವುದೇ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    noPapersDesc: 'ಈ ಕೋರ್ಸ್ ಕಾನ್ಫಿಗರೇಶನ್‌ಗಾಗಿ ಹಿಂದಿನ ಸೆಮಿಸ್ಟರ್ ಪೇಪರ್‌ಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ಮೊದಲಿಗರಾಗಿರಿ.',
    searchNotesPlaceholder: 'ಶೀರ್ಷಿಕೆ, ಟ್ಯಾಗ್, ವಿಷಯದ ಕೋಡ್ ಮೂಲಕ ನೋಟ್ಸ್ ಹುಡುಕಿ...',
    searchPapersPlaceholder: 'ಶೀರ್ಷಿಕೆ, ಕೋರ್ಸ್, ವರ್ಷದ ಮೂಲಕ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಗಳನ್ನು ಹುಡುಕಿ...',
    sortResults: 'ಫಲಿತಾಂಶಗಳ ವರ್ಗೀಕರಣ',
    resetFilters: 'ಫಿಲ್ಟರ್‌ ರದ್ದುಗೊಳಿಸಿ',
    allYears: 'ಎಲ್ಲಾ ವರ್ಷಗಳು'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem('language');
    return savedLang === 'kn' ? 'kn' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'kn' : 'en'));
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
