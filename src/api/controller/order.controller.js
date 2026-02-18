const orderModel = require('../model/order.model');
const { cartService } = require('../../config/db/redis');
const catalogModel = require('../model/catalog.model');

const orderController = {
  createOrder: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { shippingAddress, paymentMethod = 'card' } = req.body;

      const cart = await cartService.getCart(userId);
      const items = cart.items || [];
      if (items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      const orderItems = [];
      for (const item of items) {
        const product = await catalogModel.getProductById(item.productId);
        if (!product) return res.status(400).json({ error: `Product not found: ${item.productId}` });
        if (!product.in_stock) {
          return res.status(400).json({ error: `${product.name} is out of stock` });
        }
        if (item.quantity > product.stock_quantity) {
          return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
        }
        orderItems.push({
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          price: Number(item.price),
          subtotal: Number(item.price) * item.quantity
        });
      }

      const subtotal = orderItems.reduce((sum, it) => sum + it.subtotal, 0);
      const tax = subtotal * 0.1;
      const shipping = subtotal > 100 ? 0 : 10;
      const total = subtotal + tax + shipping;

      const order = await orderModel.createWithItems(
        userId,
        { subtotal, tax, shipping, total, shippingAddress, paymentMethod },
        orderItems
      );

      await cartService.deleteCart(userId);

      const finalOrder = await orderModel.findById(order.id, userId);
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order: finalOrder
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getOrders: async (req, res) => {
    try {
      const userId = req.user.userId;
      const orders = await orderModel.findByUserId(userId);
      res.json({ success: true, count: orders.length, orders });
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { id } = req.params;
      const order = await orderModel.findById(id, userId);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      res.json({ success: true, order });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = orderController;
