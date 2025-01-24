const express = require('express');
const apiController = require('../controllers/apiController');
const router = express.Router();

router.post('/upload-source-code', apiController.getUploadSourceCode);
router.post('/fix-leak', apiController.fixLeak);
router.get('/get-results', apiController.getResults);
router.get('/get-diffs', apiController.getDiffs);

module.exports = router;
