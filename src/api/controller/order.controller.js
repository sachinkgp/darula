const Order = require('../model/order.model');
const Cart = require('../model/cart.model');
const { Product } = require('../model/whiskey.model');

const orderController = {
  createOrder: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { shippingAddress, paymentMethod = 'card' } = req.body;

      // Get user's cart
      const cart = await Cart.findOne({ userId }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      // Validate stock and prepare order items
      const orderItems = [];
      for (const item of cart.items) {
        const product = item.product;
        
        if (!product.inStock) {
          return res.status(400).json({ 
            error: `${product.name} is out of stock` 
          });
        }

        if (item.quantity > product.stockQuantity) {
          return res.status(400).json({ 
            error: `Insufficient stock for ${product.name}` 
          });
        }

        orderItems.push({
          product: product._id,
          productName: product.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        });
      }

      // Calculate totals
      const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
      const tax = subtotal * 0.1; // 10% tax
      const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
      const total = subtotal + tax + shipping;

      // Create order
      const order = await Order.create({
        userId,
        items: orderItems,
        subtotal,
        tax,
        shipping,
        total,
        shippingAddress: shippingAddress || {},
        paymentMethod,
        status: 'pending'
      });

      // Update product stock
      for (const item of cart.items) {
        const product = await Product.findById(item.product._id);
        product.stockQuantity -= item.quantity;
        if (product.stockQuantity <= 0) {
          product.inStock = false;
        }
        await product.save();
      }

      // Clear cart
      cart.items = [];
      await cart.save();

      await order.populate('items.product');

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getOrders: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const orders = await Order.find({ userId })
        .populate('items.product')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: orders.length,
        orders
      });
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      const order = await Order.findOne({ _id: id, userId })
        .populate('items.product');

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({
        success: true,
        order
      });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = orderController;

