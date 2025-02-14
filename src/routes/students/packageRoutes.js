const express = require('express');
const router = express.Router();
const packageController = require('../../controllers/student/packageController');

router.get('/free', packageController.freePackage)
router.get('/testWithPackage', packageController.testWithPackage)
router.get('/allPackages', packageController.getPackages)

module.exports = router
