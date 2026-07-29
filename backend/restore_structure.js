const fs = require('fs');
const https = require('https');
const path = require('path');

// Google Drive Root Folder ID
const ROOT_FOLDER_ID = "1tK-_AUwXOZ77oSTxR5ZHo7Cf8psI3MnT";

// Concurrency Limit for parallel downloading
const CONCURRENCY_LIMIT = 15;
const MAX_RETRIES = 3;

// Folder paths
const BASE_DIR = path.join(__dirname, "uploads");
const CACHE_DIR = path.join(BASE_DIR, "cache");
const RESTRUCTURED_DIR = path.join(BASE_DIR, "restructured");

// Ensure folders exist
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
if (!fs.existsSync(RESTRUCTURED_DIR)) fs.mkdirSync(RESTRUCTURED_DIR, { recursive: true });

// Predefined subjects map structure from coursesData.js
const SUBJECTS_DATABASE = {
  "Constitutional Law - I": {
    code: "KSLU-3Y-101",
    mappings: [
      { course: "3-Year LL.B", semester: 1 },
      { course: "B.A. LL.B", semester: 3 },
      { course: "B.B.A. LL.B", semester: 3 },
      { course: "B.Com. LL.B", semester: 3 },
      { course: "B.Sc. LL.B", semester: 3 }
    ]
  },
  "Constitutional Law - II": {
    code: "KSLU-3Y-201",
    mappings: [
      { course: "3-Year LL.B", semester: 2 },
      { course: "B.A. LL.B", semester: 4 },
      { course: "B.B.A. LL.B", semester: 4 },
      { course: "B.Com. LL.B", semester: 4 },
      { course: "B.Sc. LL.B", semester: 4 }
    ]
  },
  "Contract - I (General Principles)": {
    code: "KSLU-3Y-102",
    mappings: [
      { course: "3-Year LL.B", semester: 1 },
      { course: "B.A. LL.B", semester: 4 },
      { course: "B.B.A. LL.B", semester: 4 },
      { course: "B.Com. LL.B", semester: 4 },
      { course: "B.Sc. LL.B", semester: 3 }
    ]
  },
  "Contract - II (Special Contracts)": {
    code: "KSLU-3Y-202",
    mappings: [
      { course: "3-Year LL.B", semester: 2 },
      { course: "B.A. LL.B", semester: 5 },
      { course: "B.B.A. LL.B", semester: 5 },
      { course: "B.Com. LL.B", semester: 5 },
      { course: "B.Sc. LL.B", semester: 4 }
    ]
  },
  "Law of Torts & Consumer Protection": {
    code: "KSLU-3Y-103",
    mappings: [
      { course: "3-Year LL.B", semester: 1 },
      { course: "B.A. LL.B", semester: 2 },
      { course: "B.B.A. LL.B", semester: 2 },
      { course: "B.Com. LL.B", semester: 2 },
      { course: "B.Sc. LL.B", semester: 2 }
    ]
  },
  "Family Law - I (Hindu Law)": {
    code: "KSLU-3Y-104",
    mappings: [
      { course: "3-Year LL.B", semester: 1 },
      { course: "B.A. LL.B", semester: 5 },
      { course: "B.B.A. LL.B", semester: 5 },
      { course: "B.Com. LL.B", semester: 5 },
      { course: "B.Sc. LL.B", semester: 5 }
    ]
  },
  "Family Law - II (Mohammedan Law & Indian Succession Act)": {
    code: "KSLU-3Y-205",
    mappings: [
      { course: "3-Year LL.B", semester: 2 },
      { course: "B.A. LL.B", semester: 6 },
      { course: "B.B.A. LL.B", semester: 6 },
      { course: "B.Com. LL.B", semester: 6 },
      { course: "B.Sc. LL.B", semester: 6 }
    ]
  },
  "Criminal Law - I: Bharatiya Nyaya Sanhita (BNS)": {
    code: "KSLU-3Y-105",
    mappings: [
      { course: "3-Year LL.B", semester: 1 },
      { course: "B.A. LL.B", semester: 4 },
      { course: "B.B.A. LL.B", semester: 4 },
      { course: "B.Com. LL.B", semester: 4 },
      { course: "B.Sc. LL.B", semester: 4 }
    ]
  },
  "Criminal Law - II: BNSS, JJ Act & Probation of Offenders Act": {
    code: "KSLU-3Y-304",
    mappings: [
      { course: "3-Year LL.B", semester: 3 },
      { course: "B.A. LL.B", semester: 7 },
      { course: "B.B.A. LL.B", semester: 7 },
      { course: "B.Com. LL.B", semester: 7 },
      { course: "B.Sc. LL.B", semester: 7 }
    ]
  },
  "Administrative Law": {
    code: "KSLU-3Y-305",
    mappings: [
      { course: "3-Year LL.B", semester: 3 },
      { course: "B.A. LL.B", semester: 5 },
      { course: "B.B.A. LL.B", semester: 5 },
      { course: "B.Com. LL.B", semester: 5 },
      { course: "B.Sc. LL.B", semester: 5 }
    ]
  },
  "Jurisprudence": {
    code: "KSLU-3Y-301",
    mappings: [
      { course: "3-Year LL.B", semester: 3 },
      { course: "B.A. LL.B", semester: 5 },
      { course: "B.B.A. LL.B", semester: 5 },
      { course: "B.Com. LL.B", semester: 5 },
      { course: "B.Sc. LL.B", semester: 5 }
    ]
  },
  "Labour Law - I": {
    code: "KSLU-3Y-203",
    mappings: [
      { course: "3-Year LL.B", semester: 2 },
      { course: "B.A. LL.B", semester: 5 },
      { course: "B.B.A. LL.B", semester: 5 },
      { course: "B.Com. LL.B", semester: 5 },
      { course: "B.Sc. LL.B", semester: 5 }
    ]
  },
  "Labour Law - II": {
    code: "KSLU-3Y-302",
    mappings: [
      { course: "3-Year LL.B", semester: 3 },
      { course: "B.A. LL.B", semester: 6 },
      { course: "B.B.A. LL.B", semester: 6 },
      { course: "B.Com. LL.B", semester: 6 },
      { course: "B.Sc. LL.B", semester: 6 }
    ]
  },
  "Law of Taxation": {
    code: "KSLU-3Y-303",
    mappings: [
      { course: "3-Year LL.B", semester: 3 },
      { course: "B.A. LL.B", semester: 7 },
      { course: "B.B.A. LL.B", semester: 7 },
      { course: "B.Com. LL.B", semester: 7 },
      { course: "B.Sc. LL.B", semester: 7 }
    ]
  },
  "Public International Law": {
    code: "KSLU-3Y-401",
    mappings: [
      { course: "3-Year LL.B", semester: 4 },
      { course: "B.A. LL.B", semester: 7 },
      { course: "B.B.A. LL.B", semester: 7 },
      { course: "B.Com. LL.B", semester: 7 },
      { course: "B.Sc. LL.B", semester: 7 }
    ]
  },
  "Company Law": {
    code: "KSLU-3Y-501",
    mappings: [
      { course: "3-Year LL.B", semester: 5 },
      { course: "B.A. LL.B", semester: 6 },
      { course: "B.B.A. LL.B", semester: 6 },
      { course: "B.Com. LL.B", semester: 6 },
      { course: "B.Sc. LL.B", semester: 6 }
    ]
  },
  "Civil Procedure Code (CPC) and Limitation Act": {
    code: "KSLU-3Y-502",
    mappings: [
      { course: "3-Year LL.B", semester: 5 },
      { course: "B.A. LL.B", semester: 9 },
      { course: "B.B.A. LL.B", semester: 9 },
      { course: "B.Com. LL.B", semester: 9 },
      { course: "B.Sc. LL.B", semester: 9 }
    ]
  },
  "Law of Evidence: Bharatiya Sakshya Adhiniyam (BSA)": {
    code: "KSLU-3Y-601",
    mappings: [
      { course: "3-Year LL.B", semester: 6 },
      { course: "B.A. LL.B", semester: 8 },
      { course: "B.B.A. LL.B", semester: 8 },
      { course: "B.Com. LL.B", semester: 8 },
      { course: "B.Sc. LL.B", semester: 8 }
    ]
  },
  "Environmental Law": {
    code: "KSLU-3Y-602",
    mappings: [
      { course: "3-Year LL.B", semester: 6 },
      { course: "B.A. LL.B", semester: 10 },
      { course: "B.B.A. LL.B", semester: 10 },
      { course: "B.Com. LL.B", semester: 10 },
      { course: "B.Sc. LL.B", semester: 10 }
    ]
  },
  "English": {
    code: "KSLU-3Y-106",
    mappings: [
      { course: "3-Year LL.B", semester: 1 },
      { course: "B.A. LL.B", semester: 1 },
      { course: "B.B.A. LL.B", semester: 1 },
      { course: "B.Com. LL.B", semester: 1 },
      { course: "B.Sc. LL.B", semester: 1 }
    ]
  },
  "Kannada / Kannada Kali": {
    code: "KSLU-3Y-206",
    mappings: [
      { course: "3-Year LL.B", semester: 2 },
      { course: "B.A. LL.B", semester: 2 },
      { course: "B.B.A. LL.B", semester: 2 },
      { course: "B.Com. LL.B", semester: 2 },
      { course: "B.Sc. LL.B", semester: 2 }
    ]
  },
  "Sociology - I": {
    code: "KSLU-BA-102",
    mappings: [{ course: "B.A. LL.B", semester: 1 }]
  },
  "Political Science - I": {
    code: "KSLU-BA-103",
    mappings: [{ course: "B.A. LL.B", semester: 1 }]
  },
  "Economics - I": {
    code: "KSLU-BA-104",
    mappings: [{ course: "B.A. LL.B", semester: 1 }]
  },
  "Legal Methods": {
    code: "KSLU-BA-105",
    mappings: [
      { course: "B.A. LL.B", semester: 1 },
      { course: "B.B.A. LL.B", semester: 1 },
      { course: "B.Com. LL.B", semester: 1 },
      { course: "B.Sc. LL.B", semester: 1 }
    ]
  },
  "Clinical - II: Alternative Dispute Resolution (ADR) Systems": {
    code: "KSLU-3Y-405",
    mappings: [
      { course: "3-Year LL.B", semester: 4 },
      { course: "B.A. LL.B", semester: 8 },
      { course: "B.B.A. LL.B", semester: 8 },
      { course: "B.Com. LL.B", semester: 8 },
      { course: "B.Sc. LL.B", semester: 8 }
    ]
  },
  "Optional - I: Human Rights Law and Practice / Insurance Law": {
    code: "KSLU-3Y-402",
    mappings: [
      { course: "3-Year LL.B", semester: 4 },
      { course: "B.A. LL.B", semester: 8 },
      { course: "B.B.A. LL.B", semester: 8 },
      { course: "B.Com. LL.B", semester: 8 },
      { course: "B.Sc. LL.B", semester: 8 }
    ]
  },
  "Optional - II: Banking Law / Right to Information": {
    code: "KSLU-3Y-403",
    mappings: [
      { course: "3-Year LL.B", semester: 4 },
      { course: "B.A. LL.B", semester: 8 },
      { course: "B.B.A. LL.B", semester: 8 },
      { course: "B.Com. LL.B", semester: 8 },
      { course: "B.Sc. LL.B", semester: 8 }
    ]
  },
  "Optional - III: Intellectual Property Rights - I / Penology & Victimology": {
    code: "KSLU-3Y-503",
    mappings: [
      { course: "3-Year LL.B", semester: 5 },
      { course: "B.A. LL.B", semester: 9 },
      { course: "B.B.A. LL.B", semester: 9 },
      { course: "B.Com. LL.B", semester: 9 },
      { course: "B.Sc. LL.B", semester: 9 }
    ]
  },
  "Optional - IV: Interpretation of Statutes / Competition Law": {
    code: "KSLU-3Y-504",
    mappings: [
      { course: "3-Year LL.B", semester: 5 },
      { course: "B.A. LL.B", semester: 9 },
      { course: "B.B.A. LL.B", semester: 9 },
      { course: "B.Com. LL.B", semester: 9 },
      { course: "B.Sc. LL.B", semester: 9 }
    ]
  },
  "Optional - V: Intellectual Property Rights - II / White Collar Crimes": {
    code: "KSLU-3Y-603",
    mappings: [
      { course: "3-Year LL.B", semester: 6 },
      { course: "B.A. LL.B", semester: 10 },
      { course: "B.B.A. LL.B", semester: 10 },
      { course: "B.Com. LL.B", semester: 10 },
      { course: "B.Sc. LL.B", semester: 10 }
    ]
  },
  "Optional - VI: Land Laws / International Trade Economics": {
    code: "KSLU-3Y-604",
    mappings: [
      { course: "3-Year LL.B", semester: 6 },
      { course: "B.A. LL.B", semester: 10 },
      { course: "B.B.A. LL.B", semester: 10 },
      { course: "B.Com. LL.B", semester: 10 },
      { course: "B.Sc. LL.B", semester: 10 }
    ]
  }
};

const DRIVE_SUBJECT_MAP = {
  "administrative law": "Administrative Law",
  "alternative dispute resolution": "Clinical - II: Alternative Dispute Resolution (ADR) Systems",
  "banking law": "Optional - II: Banking Law / Right to Information",
  "civil procedure code": "Civil Procedure Code (CPC) and Limitation Act",
  "company law": "Company Law",
  "competition law": "Optional - IV: Interpretation of Statutes / Competition Law",
  "constitution law": "Constitutional Law - I",
  "contract": "Contract - I (General Principles)",
  "criminal law ii / bnss": "Criminal Law - II: BNSS, JJ Act & Probation of Offenders Act",
  "economics": "Economics - I",
  "english": "English",
  "environmental law": "Environmental Law",
  "family law i": "Family Law - I (Hindu Law)",
  "family law ii": "Family Law - II (Mohammedan Law & Indian Succession Act)",
  "human rights": "Optional - I: Human Rights Law and Practice / Insurance Law",
  "insurance": "Optional - I: Human Rights Law and Practice / Insurance Law",
  "intellectual property": "Optional - III: Intellectual Property Rights - I / Penology & Victimology",
  "international trade": "Optional - VI: Land Laws / International Trade Economics",
  "interpretation of statute": "Optional - IV: Interpretation of Statutes / Competition Law",
  "ipc / bns": "Criminal Law - I: Bharatiya Nyaya Sanhita (BNS)",
  "jurisprudence": "Jurisprudence",
  "kannada": "Kannada / Kannada Kali",
  "labour law": "Labour Law - I",
  "land law": "Optional - VI: Land Laws / International Trade Economics",
  "law of evidence/bsa": "Law of Evidence: Bharatiya Sakshya Adhiniyam (BSA)",
  "law of torts": "Law of Torts & Consumer Protection",
  "legal method": "Legal Methods",
  "penology & victimology": "Optional - III: Intellectual Property Rights - I / Penology & Victimology",
  "political science": "Political Science - I",
  "public international law": "Public International Law",
  "rti": "Optional - II: Banking Law / Right to Information",
  "sociology": "Sociology - I",
  "taxation law": "Law of Taxation"
};

function fetchHtml(url, retries = MAX_RETRIES) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
    };
    
    function makeRequest(attempt) {
      https.get(url, { headers }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', (err) => {
        if (attempt < retries) {
          console.log(`-> Retry crawling HTML (attempt ${attempt + 1}/${retries}) for: ${url} due to: ${err.message}`);
          setTimeout(() => makeRequest(attempt + 1), 1000);
        } else {
          reject(err);
        }
      });
    }
    
    makeRequest(0);
  });
}

function downloadDriveFile(fileId, destPath, retries = MAX_RETRIES) {
  return new Promise((resolve, reject) => {
    const downloadUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
    
    function makeRequest(url, attempt) {
      https.get(url, (response) => {
        const status = response.statusCode;
        if (status >= 300 && status < 400 && response.headers.location) {
          makeRequest(response.headers.location, attempt);
        } else if (status === 200) {
          const file = fs.createWriteStream(destPath);
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve(fs.statSync(destPath).size);
          });
        } else {
          if (attempt < retries) {
            console.log(`-> Retry download status ${status} (attempt ${attempt + 1}/${retries}) for file ID: ${fileId}`);
            setTimeout(() => makeRequest(downloadUrl, attempt + 1), 1000);
          } else {
            reject(new Error(`Failed to download with status: ${status}`));
          }
        }
      }).on('error', (err) => {
        if (attempt < retries) {
          console.log(`-> Retry download error ${err.message} (attempt ${attempt + 1}/${retries}) for file ID: ${fileId}`);
          setTimeout(() => makeRequest(downloadUrl, attempt + 1), 1500);
        } else {
          reject(err);
        }
      });
    }
    
    makeRequest(downloadUrl, 0);
  });
}

function parseDriveHtml(html) {
  const items = [];
  const regex = /aria-label="([^"]+)"[^>]*?ssk=\'[^:\']*:[^:\']*:([a-zA-Z0-9_-]{33})/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const rawName = match[1];
    const id = match[2];
    
    let name = rawName;
    let isFile = false;
    
    if (name.endsWith(" PDF Shared folder")) {
      name = name.replace(" PDF Shared folder", "");
      isFile = true;
    } else if (name.endsWith(" PDF Shared")) {
      name = name.replace(" PDF Shared", "");
      isFile = true;
    } else if (name.endsWith(" Shared folder")) {
      name = name.replace(" Shared folder", "");
      isFile = false;
    } else if (name.endsWith(" folder")) {
      name = name.replace(" folder", "");
      isFile = false;
    }
    
    if (!items.some(it => it.id === id)) {
      items.push({ id, name, isFile });
    }
  }
  return items;
}

async function crawlDrive(folderId, pathInfo = { subject: "", subSubject: "", marks: "" }) {
  const url = `https://drive.google.com/drive/folders/${folderId}`;
  let html;
  try {
    html = await fetchHtml(url);
  } catch (err) {
    console.error(`Failed to fetch folder page ${folderId}:`, err.message);
    return [];
  }
  
  const parsedItems = parseDriveHtml(html);
  let allFiles = [];
  
  for (const item of parsedItems) {
    if (item.isFile) {
      if (item.name.toLowerCase().endsWith(".pdf")) {
        allFiles.push({
          id: item.id,
          filename: item.name,
          ...pathInfo
        });
      }
    } else {
      const nameLower = item.name.toLowerCase();
      let nextPathInfo = { ...pathInfo };
      
      if (!pathInfo.subject) {
        nextPathInfo.subject = item.name;
      } else if (!pathInfo.subSubject && (nameLower.includes("const") || nameLower.includes("contract") || nameLower.includes("law"))) {
        nextPathInfo.subSubject = item.name;
      }
      
      if (nameLower.includes("80marks") || nameLower.includes("80_marks") || nameLower.includes("80 marks")) {
        nextPathInfo.marks = "80";
      } else if (nameLower.includes("100marks") || nameLower.includes("100_marks") || nameLower.includes("100 marks")) {
        nextPathInfo.marks = "100";
      }
      
      const subFiles = await crawlDrive(item.id, nextPathInfo);
      allFiles = allFiles.concat(subFiles);
    }
  }
  
  return allFiles;
}

function parseFileMetadata(file) {
  const nameLower = file.filename.toLowerCase();
  
  let marks = 80;
  if (file.marks === "100" || nameLower.includes("100marks") || nameLower.includes("100_marks") || nameLower.includes("100 marks")) {
    marks = 100;
  }
  
  let year = new Date().getFullYear();
  const yearMatch = nameLower.match(/(20\d{2})/);
  if (yearMatch) {
    year = parseInt(yearMatch[1]);
  } else {
    const shortYearMatch = nameLower.match(/_(2[0-9])_/) || nameLower.match(/([a-z])(2[0-9])_/) || nameLower.match(/(jan|dec|jun|oct)(2[0-9])/);
    if (shortYearMatch) {
      year = 2000 + parseInt(shortYearMatch[2]);
    }
  }
  
  let month = "";
  const monthsList = [
    { key: "jan", val: "January" }, { key: "feb", val: "February" }, { key: "mar", val: "March" },
    { key: "apr", val: "April" }, { key: "may", val: "May" }, { key: "june", val: "June" },
    { key: "jun", val: "June" }, { key: "july", val: "July" }, { key: "jul", val: "July" },
    { key: "aug", val: "August" }, { key: "sept", val: "September" }, { key: "sep", val: "September" },
    { key: "oct", val: "October" }, { key: "nov", val: "November" }, { key: "dec", val: "December" }
  ];
  for (const m of monthsList) {
    if (nameLower.includes(m.key)) {
      month = m.val;
      break;
    }
  }
  
  let resolvedSubject = "";
  const driveSub = (file.subject || "").toLowerCase();
  
  if (driveSub === "constitution law") {
    const subSub = (file.subSubject || "").toLowerCase();
    if (subSub.includes("ii") || nameLower.includes("const ii") || nameLower.includes("const 2")) {
      resolvedSubject = "Constitutional Law - II";
    } else {
      resolvedSubject = "Constitutional Law - I";
    }
  } else if (driveSub === "contract") {
    const subSub = (file.subSubject || "").toLowerCase();
    if (subSub.includes("ii") || nameLower.includes("contract ii") || nameLower.includes("contract 2")) {
      resolvedSubject = "Contract - II (Special Contracts)";
    } else {
      resolvedSubject = "Contract - I (General Principles)";
    }
  } else {
    resolvedSubject = DRIVE_SUBJECT_MAP[driveSub] || file.subject;
  }
  
  return {
    filename: file.filename,
    fileId: file.id,
    subjectName: resolvedSubject,
    marks,
    year,
    month
  };
}

function sanitizeFolderName(name) {
  return name.replace(/[\/\\:\*\?"<>\|]/g, " ").trim();
}

async function parallelProcess(items) {
  let activeIndex = 0;
  let copiedCount = 0;
  
  async function worker() {
    while (activeIndex < items.length) {
      const myIndex = activeIndex++;
      const item = items[myIndex];
      const cacheFilename = `${item.fileId}.pdf`;
      const cacheFilePath = path.join(CACHE_DIR, cacheFilename);
      
      let downloadSuccess = true;
      if (!fs.existsSync(cacheFilePath)) {
        console.log(`[${myIndex+1}/${items.length}] Downloading: ${item.filename}...`);
        try {
          await downloadDriveFile(item.fileId, cacheFilePath);
          console.log(`-> Completed: ${item.filename}`);
        } catch (err) {
          console.error(`-> Download failed for ${item.filename}:`, err.message);
          downloadSuccess = false;
        }
      } else {
        console.log(`[${myIndex+1}/${items.length}] Cached: ${item.filename}`);
      }
      
      if (downloadSuccess) {
        // Restructure/Copy
        const subjectInfo = SUBJECTS_DATABASE[item.subjectName];
        const mappings = subjectInfo ? subjectInfo.mappings : [
          { course: "B.A. LL.B", semester: 1 } // Fallback
        ];
        
        const monthStr = item.month ? `_${item.month}` : '';
        const outputFilename = `${sanitizeFolderName(item.subjectName)}_PYQ${monthStr}_${item.year}_${item.marks}marks.pdf`;
        
        for (const map of mappings) {
          const courseFolder = path.join(RESTRUCTURED_DIR, sanitizeFolderName(map.course));
          const semFolder = path.join(courseFolder, `Semester ${map.semester}`);
          const subjectFolder = path.join(semFolder, sanitizeFolderName(item.subjectName));
          const marksFolder = path.join(subjectFolder, `${item.marks} Marks`);
          
          if (!fs.existsSync(marksFolder)) {
            fs.mkdirSync(marksFolder, { recursive: true });
          }
          
          const targetPath = path.join(marksFolder, outputFilename);
          try {
            fs.copyFileSync(cacheFilePath, targetPath);
            copiedCount++;
          } catch (err) {
            console.error(`-> Failed to copy to ${targetPath}:`, err.message);
          }
        }
      }
    }
  }
  
  // Launch multiple workers concurrently
  const workers = Array(CONCURRENCY_LIMIT).fill(null).map(() => worker());
  await Promise.all(workers);
  
  return copiedCount;
}

async function main() {
  console.log("=========================================");
  console.log("ROBUST FAST PARALLEL SYNC WITH RETRIES");
  console.log("=========================================");
  
  console.log("Step 1: Crawling Google Drive folders recursively...");
  const rawFiles = await crawlDrive(ROOT_FOLDER_ID);
  console.log(`Found ${rawFiles.length} files in Google Drive.`);
  
  const parsedMaterials = rawFiles.map(f => parseFileMetadata(f));
  
  console.log(`\nStep 2: Processing with ${CONCURRENCY_LIMIT} parallel workers and retries...`);
  const totalCopied = await parallelProcess(parsedMaterials);
  
  console.log("\n=========================================");
  console.log("RESTORE AND RESTRUCTURE COMPLETED!");
  console.log(`Total PDF files downloaded/cached: ${fs.readdirSync(CACHE_DIR).length}`);
  console.log(`Total restructured copies created: ${totalCopied}`);
  console.log(`Restructured output location: ${RESTRUCTURED_DIR}`);
  console.log("=========================================");
}

main();
