const router = require('express').Router();
const cartController = require('../controller/cart.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');

// All cart routes require authentication
router.use(authenticateToken);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/item/:itemId', cartController.updateCartItem);
router.delete('/item/:itemId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

module.exports = router;

