const Cart = require('../model/cart.model');
const { Product } = require('../model/whiskey.model');

const cartController = {
  getCart: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      let cart = await Cart.findOne({ userId }).populate('items.product');
      
      if (!cart) {
        cart = await Cart.create({ userId, items: [], total: 0 });
      }
      
      res.json({
        success: true,
        cart
      });
    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  addToCart: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      // Get product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (!product.inStock) {
        return res.status(400).json({ error: 'Product is out of stock' });
      }

      if (quantity > product.stockQuantity) {
        return res.status(400).json({ error: 'Insufficient stock available' });
      }

      // Find or create cart
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = await Cart.create({ userId, items: [] });
      }

      // Check if product already in cart
      const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        // Update quantity
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({
          product: productId,
          quantity,
          price: product.price
        });
      }

      await cart.save();
      await cart.populate('items.product');

      res.json({
        success: true,
        message: 'Product added to cart',
        cart
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateCartItem: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { itemId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: 'Valid quantity is required' });
      }

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      const item = cart.items.id(itemId);
      if (!item) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      // Check stock
      const product = await Product.findById(item.product);
      if (quantity > product.stockQuantity) {
        return res.status(400).json({ error: 'Insufficient stock available' });
      }

      item.quantity = quantity;
      await cart.save();
      await cart.populate('items.product');

      res.json({
        success: true,
        message: 'Cart item updated',
        cart
      });
    } catch (error) {
      console.error('Update cart item error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  removeFromCart: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { itemId } = req.params;

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      cart.items = cart.items.filter(item => item._id.toString() !== itemId);
      await cart.save();
      await cart.populate('items.product');

      res.json({
        success: true,
        message: 'Item removed from cart',
        cart
      });
    } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  clearCart: async (req, res) => {
    try {
      const userId = req.user.userId;

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      cart.items = [];
      await cart.save();

      res.json({
        success: true,
        message: 'Cart cleared',
        cart
      });
    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = cartController;

