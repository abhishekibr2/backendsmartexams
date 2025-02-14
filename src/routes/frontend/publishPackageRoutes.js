const express = require('express');
const router = express.Router();
const publishPackageController = require('../../controllers/frontend/packageController');

router.get('/single/:slug', publishPackageController.singlePackage);
router.post('/', publishPackageController.getAllTestPacks);

module.exports = router;
