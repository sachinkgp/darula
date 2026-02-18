const { cartService } = require('../../config/db/redis');
const catalogModel = require('../model/catalog.model');

const cartController = {
  getCart: async (req, res) => {
    try {
      const userId = req.user.userId;
      let cart = await cartService.getCart(userId);
      const items = cart.items || [];
      const total = items.reduce((sum, i) => sum + (Number(i.price) || 0) * (i.quantity || 0), 0);
      res.json({
        success: true,
        cart: { userId, items, total, updatedAt: cart.updatedAt }
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

      const product = await catalogModel.getProductById(productId);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      if (!product.in_stock) return res.status(400).json({ error: 'Product is out of stock' });
      const qty = Math.max(1, parseInt(quantity, 10) || 1);
      if (qty > product.stock_quantity) {
        return res.status(400).json({ error: 'Insufficient stock available' });
      }

      let cart = await cartService.getCart(userId);
      const items = cart.items || [];
      const existing = items.find((i) => String(i.productId) === String(productId));
      if (existing) {
        existing.quantity += qty;
        existing.subtotal = existing.price * existing.quantity;
      } else {
        items.push({
          productId: product.id,
          productName: product.name,
          quantity: qty,
          price: product.price,
          subtotal: product.price * qty
        });
      }
      cart = await cartService.setCart(userId, { items });
      const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

      res.json({
        success: true,
        message: 'Product added to cart',
        cart: { userId, items: cart.items, total, updatedAt: cart.updatedAt }
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateCartItem: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { itemId: productId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: 'Valid quantity is required' });
      }

      const cart = await cartService.getCart(userId);
      const items = cart.items || [];
      const item = items.find((i) => String(i.productId) === String(productId));
      if (!item) return res.status(404).json({ error: 'Cart item not found' });

      const product = await catalogModel.getProductById(productId);
      if (quantity > product.stock_quantity) {
        return res.status(400).json({ error: 'Insufficient stock available' });
      }

      item.quantity = quantity;
      item.subtotal = item.price * quantity;
      const updated = await cartService.setCart(userId, { items });
      const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

      res.json({
        success: true,
        message: 'Cart item updated',
        cart: { userId, items: updated.items, total, updatedAt: updated.updatedAt }
      });
    } catch (error) {
      console.error('Update cart item error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  removeFromCart: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { itemId: productId } = req.params;

      const cart = await cartService.getCart(userId);
      const items = (cart.items || []).filter((i) => String(i.productId) !== String(productId));
      const updated = await cartService.setCart(userId, { items });
      const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

      res.json({
        success: true,
        message: 'Item removed from cart',
        cart: { userId, items: updated.items, total, updatedAt: updated.updatedAt }
      });
    } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  clearCart: async (req, res) => {
    try {
      const userId = req.user.userId;
      await cartService.deleteCart(userId);
      res.json({
        success: true,
        message: 'Cart cleared',
        cart: { userId, items: [], total: 0, updatedAt: null }
      });
    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = cartController;
