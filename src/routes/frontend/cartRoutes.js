const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/frontend/cartController');

// router.get('/single/:slug', cartController.singleCart);
router.post('/addToCartDetails', cartController.addToCartDetails);
router.delete('/removeCartItem', cartController.removeCartItem);
router.post('/', cartController.allCartItems);
router.post('/singleCartItemData', cartController.singleCartItem);
router.post('/updateCartItemQuantity', cartController.updateCartItemQuantity);
router.post('/validateCouponCode', cartController.validateCouponCode);
router.post('/applyCouponCode', cartController.applyCouponCode);
module.exports = router;
