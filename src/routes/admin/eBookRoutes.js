const express = require('express');
const router = express.Router();
const eBookController = require('../../controllers/admin/eBookController');

router.post('/addUpdateEBook', eBookController.addUpdateEBook);
router.get('/', eBookController.getAllEBooks);
router.post('/deleteEbook', eBookController.deleteEbook);
router.get('/freeEbooks', eBookController.getAllFreeEBooks);
module.exports = router
