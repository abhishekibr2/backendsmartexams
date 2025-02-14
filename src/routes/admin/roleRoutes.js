const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/admin/roleController');

router.get('/', roleController.allRoles);
router.post('/add-Update-Role-Details/', roleController.addUpdateRoleDetails);
router.post('/delete-Role', roleController.deleteRole);

module.exports = router;
