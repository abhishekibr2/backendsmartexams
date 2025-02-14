const express = require('express');
const router = express.Router();
const settingController = require('../../controllers/admin/settingController');

router.post('/update-brand-details/', settingController.updateBrandDetails);
router.post('/single-brand-details/', settingController.getSingleBrandDetails);
router.post('/delete-brand-logo/', settingController.deleteBrandLogo);
router.post('/update-payment-details/', settingController.updatePaymentDetails);
router.post('/update-seo-details/', settingController.updateSEODetails);
router.post('/update-social-links/', settingController.updateSocialLinks);
router.post('/update-email-signature/', settingController.updateSignature);
router.post('/update-email-template/', settingController.updateEmailTemplate);
router.get('/get-all-templates/', settingController.getAllEmailTemplates);
router.post('/update-header-menu/', settingController.addUpdateHeaderData);
router.get('/get-header-menu/', settingController.getHeaderMenus);
router.post('/update-menu-order/', settingController.updateOrderOfMenu);
router.post('/update-footer-menu-order/', settingController.updateFooterOrderOfMenu);
router.post('/update-footer-menu/', settingController.addUpdateFooterData);
router.get('/get-footer-menu/', settingController.getFooterMenus);
router.post('/delete-header-menu/', settingController.deleteHeaderMenu);
router.post('/delete-footer-menu/', settingController.deleteFooterMenu);

module.exports = router;
