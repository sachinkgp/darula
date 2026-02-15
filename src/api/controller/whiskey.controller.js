const { WhiskeyCategory, Brand, Product } = require('../model/whiskey.model');

const whiskeyController = {
  // Get all categories
  getCategories: async (req, res) => {
    try {
      const categories = await WhiskeyCategory.find().sort({ name: 1 });
      res.json({
        success: true,
        count: categories.length,
        categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get single category with brands
  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await WhiskeyCategory.findById(id);
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      const brands = await Brand.find({ category: id }).populate('category', 'name');
      
      res.json({
        success: true,
        category,
        brands
      });
    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all brands
  getBrands: async (req, res) => {
    try {
      const { categoryId } = req.query;
      const query = categoryId ? { category: categoryId } : {};
      
      const brands = await Brand.find(query)
        .populate('category', 'name slug')
        .sort({ name: 1 });
      
      res.json({
        success: true,
        count: brands.length,
        brands
      });
    } catch (error) {
      console.error('Get brands error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get single brand with products
  getBrandById: async (req, res) => {
    try {
      const { id } = req.params;
      const brand = await Brand.findById(id).populate('category', 'name slug');
      
      if (!brand) {
        return res.status(404).json({ error: 'Brand not found' });
      }

      const products = await Product.find({ brand: id })
        .populate('brand', 'name')
        .populate('category', 'name')
        .sort({ name: 1 });
      
      res.json({
        success: true,
        brand,
        products
      });
    } catch (error) {
      console.error('Get brand error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all products
  getProducts: async (req, res) => {
    try {
      const { categoryId, brandId, inStock } = req.query;
      const query = {};
      
      if (categoryId) query.category = categoryId;
      if (brandId) query.brand = brandId;
      if (inStock !== undefined) query.inStock = inStock === 'true';
      
      const products = await Product.find(query)
        .populate('brand', 'name country')
        .populate('category', 'name slug')
        .sort({ name: 1 });
      
      res.json({
        success: true,
        count: products.length,
        products
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get single product
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id)
        .populate('brand', 'name country description')
        .populate('category', 'name slug description');
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json({
        success: true,
        product
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Search products
  searchProducts: async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const products = await Product.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ]
      })
        .populate('brand', 'name')
        .populate('category', 'name')
        .limit(50);
      
      res.json({
        success: true,
        count: products.length,
        products
      });
    } catch (error) {
      console.error('Search products error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = whiskeyController;

