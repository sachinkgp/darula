const router = require('express').Router();
const orderController = require('../controller/order.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');

// All order routes require authentication
router.use(authenticateToken);

router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);

module.exports = router;

