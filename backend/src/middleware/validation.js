const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide name, email, and password' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Please provide a valid email address' });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide email and password' });
  }
  next();
};

const validateMaterial = (req, res, next) => {
  const { title, type, subjectCode, semester, university } = req.body;
  if (!title || !type || !subjectCode || !semester || !university) {
    return res.status(400).json({ 
      success: false, 
      error: 'Please provide title, type, subjectCode, semester, and university' 
    });
  }
  if (!['note', 'paper'].includes(type)) {
    return res.status(400).json({ success: false, error: 'Type must be note or paper' });
  }
  const semNum = Number(semester);
  if (isNaN(semNum) || semNum < 1 || semNum > 10) {
    return res.status(400).json({ success: false, error: 'Semester must be a number between 1 and 10' });
  }
  if (!['KSLU', 'NLSIU', 'Christ', 'Other'].includes(university)) {
    return res.status(400).json({ success: false, error: 'Invalid university selection' });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateMaterial
};
