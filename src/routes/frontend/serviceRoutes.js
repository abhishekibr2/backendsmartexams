const express = require('express');
const router = express.Router();
const headerMenuControllers = require('../../controllers/frontend/serviceController')

router.get('/menus', headerMenuControllers.getHeaderMenus);
router.get('/updateMenus', headerMenuControllers.addUpdateHeaderData);
router.get('/allStates', headerMenuControllers.getAllStates);
router.get('/footer', headerMenuControllers.getFooterMenus)
router.get('/brandSetting', headerMenuControllers.getSingleBrandDetails)
router.post('/allTests', headerMenuControllers.getAllTests);
router.get('/getAllStateWithTheirTests', headerMenuControllers.getAllStateWithTheirTests)
router.post('/allExamTypes', headerMenuControllers.getAllExamTypes);

router.get('/getStateWithExamTypes', headerMenuControllers.getStateWithExamTypes);
router.get('/:stateslug/:examSlug', headerMenuControllers.getStateWithExamTypesWithSlug);
router.get('/getAllFooterTests', headerMenuControllers.getFooterTests);





module.exports = router;
