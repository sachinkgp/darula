const catalogModel = require('../model/catalog.model');
const logger = require('../../utils/logger');

const whiskeyController = {
  getCategories: async (req, res) => {
    const requestId = req.requestId;
    logger.info('Business logic: getCategories start', { requestId, operation: 'business', operationName: 'getCategories' });
    try {
      const categories = await catalogModel.getCategories();
      logger.info('Business logic: getCategories success', { requestId, operation: 'business', operationName: 'getCategories', success: true, count: categories.length });
      res.json({ success: true, count: categories.length, categories });
    } catch (error) {
      logger.error('Get categories error', { requestId, operation: 'business', operationName: 'getCategories', success: false, error: error });
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await catalogModel.getCategoryById(id);
      if (!category) return res.status(404).json({ error: 'Category not found' });
      const brands = await catalogModel.getBrandsByCategoryId(id);
      res.json({ success: true, category, brands });
    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getBrands: async (req, res) => {
    try {
      const { categoryId } = req.query;
      const brands = await catalogModel.getBrands(categoryId || undefined);
      res.json({ success: true, count: brands.length, brands });
    } catch (error) {
      console.error('Get brands error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getBrandById: async (req, res) => {
    try {
      const { id } = req.params;
      const brand = await catalogModel.getBrandById(id);
      if (!brand) return res.status(404).json({ error: 'Brand not found' });
      const products = await catalogModel.getProducts({ brandId: id });
      res.json({ success: true, brand, products });
    } catch (error) {
      console.error('Get brand error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getProducts: async (req, res) => {
    try {
      const { categoryId, brandId, inStock } = req.query;
      const filters = {};
      if (categoryId) filters.categoryId = categoryId;
      if (brandId) filters.brandId = brandId;
      if (inStock !== undefined) filters.inStock = inStock === 'true';
      const products = await catalogModel.getProducts(filters);
      res.json({ success: true, count: products.length, products });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await catalogModel.getProductById(id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json({ success: true, product });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  searchProducts: async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) return res.status(400).json({ error: 'Search query is required' });
      const products = await catalogModel.searchProducts(q, 50);
      res.json({ success: true, count: products.length, products });
    } catch (error) {
      console.error('Search products error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = whiskeyController;
