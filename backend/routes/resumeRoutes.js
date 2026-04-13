const router = require('express').Router();
const verify = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {
	uploadResume,
	getResume,
	matchJob,
	generateEmail,
	scrapeLinkedInJobPosts,
} = require('../controllers/resumeController');

router.post('/upload', verify, upload.single('resume'), uploadResume);
router.get('/me', verify, getResume);
router.get('/matches', verify, require('../controllers/resumeController').getJobMatches);
router.post('/match', verify, matchJob);
router.get('/suggest-jobs', verify, require('../controllers/resumeController').suggestJobs);
router.get('/scrape-job-posts', verify, scrapeLinkedInJobPosts);
router.post('/generate-email', verify, generateEmail);

module.exports = router;
