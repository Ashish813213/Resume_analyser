const router = require('express').Router();
const verify = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { 
    optimizeResume, 
    getOptimization, 
    getHistory, 
    getStats 
} = require('../controllers/optimizeController');

// Submit resume for ATS optimization (with optional file upload)
router.post('/submit', verify, upload.single('resume'), optimizeResume);

// Get optimization status/result
router.get('/result/:id', verify, getOptimization);

// Get optimization history
router.get('/history', verify, getHistory);

// Get dashboard stats
router.get('/stats', verify, getStats);

module.exports = router;
