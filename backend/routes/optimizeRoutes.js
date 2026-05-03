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
router.post('/submit', verify, upload.single('resume'), optimizeResume);
router.get('/result/:id', verify, getOptimization);
router.get('/history', verify, getHistory);
router.get('/stats', verify, getStats);
module.exports = router;
