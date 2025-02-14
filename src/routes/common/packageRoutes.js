const express = require('express');
const router = express.Router();
const packageController = require("../../controllers/common/packageController")

router.get('/getPackage', packageController.getAllPackages);




module.exports = router;
