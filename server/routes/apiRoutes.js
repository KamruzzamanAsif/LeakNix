const express = require('express');
const apiController = require('../controllers/apiController');
const router = express.Router();

router.get('/dns-records', apiController.getDnsRecords);
router.get('/location-info', apiController.getLocationInfo);
// router.get('/linked-pages', apiController.getLinkedPages);
// router.get('/technologies', apiController.getTechnologies);
router.get('/screenshot', apiController.getScreenshot);
router.get('/check-ports', apiController.getPorts);

module.exports = router;
