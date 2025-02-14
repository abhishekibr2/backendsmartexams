const express = require('express');
const router = express.Router();
const packageController = require("../../controllers/admin/packageController")

router.post('/addPackagesDetails', packageController.addPackagesDetails);
router.get('/getPackage', packageController.getAllPackages);
router.get('/available', packageController.availablePackage);
router.post('/deletePackages', packageController.deletePackage);
router.post('/publishPackages', packageController.publishPackage);
router.get('/getSinglePackageInfo/:packageId', packageController.getSinglePackageInfo)
router.get('/test', packageController.packageTest)
router.post('/AssignPackage', packageController.AssignPackages);
router.post('/tests', packageController.testInPackage);
router.get('/tests/:id', packageController.getTestsOfpackages);
router.post('/publish/:id', packageController.updatePublishPackage);
router.post('/qualityChecked/:id', packageController.updateQualityChecked);
router.put('/add-features/:packageId', packageController.saveFeature);
router.put('/update-feature/:packageId/:featureId', packageController.UpdateFeature);
router.delete('/delete-feature/:packageId/:featureId', packageController.deleteFeature);

module.exports = router;
