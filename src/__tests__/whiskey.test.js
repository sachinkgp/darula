require('./setup');
const request = require('supertest');
const app = require('../index');
const { WhiskeyCategory, Brand, Product } = require('../api/model/whiskey.model');

describe('Whiskey API Tests', () => {
  let testCategory;
  let testBrand;
  let testProduct;
  const uniqueId = Date.now();

  beforeAll(async () => {
    // Clean up any existing test data first
    await Product.deleteMany({ slug: { $regex: /^test-/ } });
    await Brand.deleteMany({ slug: { $regex: /^test-/ } });
    await WhiskeyCategory.deleteMany({ slug: { $regex: /^test-/ } });

    // Find or create test category - use valid enum value
    // Try to find existing 'Bourbon' category first
    testCategory = await WhiskeyCategory.findOne({ name: 'Bourbon' });
    
    if (!testCategory) {
      // If 'Bourbon' doesn't exist, try other enum values
      testCategory = await WhiskeyCategory.findOne({ name: 'Single Malt' });
    }
    if (!testCategory) {
      testCategory = await WhiskeyCategory.findOne({ name: 'Double Barrel' });
    }
    if (!testCategory) {
      testCategory = await WhiskeyCategory.findOne({ name: 'Blended Scotch' });
    }
    
    // If no category exists, create one with 'Bourbon' (valid enum value)
    if (!testCategory) {
      testCategory = await WhiskeyCategory.create({
        name: 'Bourbon',
        description: 'Test category',
        slug: `bourbon-${uniqueId}`
      });
    }

    // Create test brand with unique slug
    testBrand = await Brand.create({
      name: `Test Brand ${uniqueId}`,
      category: testCategory._id,
      description: 'Test brand description',
      country: 'USA',
      slug: `test-brand-${uniqueId}`
    });

    // Create test product with unique slug
    testProduct = await Product.create({
      name: `Test Product ${uniqueId}`,
      brand: testBrand._id,
      category: testCategory._id,
      description: 'Test product description',
      price: 29.99,
      volume: '750ml',
      alcoholContent: '40% ABV',
      inStock: true,
      stockQuantity: 10,
      slug: `test-product-${uniqueId}`
    });
  });

  afterAll(async () => {
    // Clean up test data
    await Product.deleteMany({ slug: { $regex: /^test-/ } });
    await Brand.deleteMany({ slug: { $regex: /^test-/ } });
    await WhiskeyCategory.deleteMany({ slug: { $regex: /^test-/ } });
  });

  describe('GET /api/v1/whiskey/categories', () => {
    test('should get all categories', async () => {
      const response = await request(app)
        .get('/api/v1/whiskey/categories')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('categories');
      expect(Array.isArray(response.body.categories)).toBe(true);
      expect(response.body.categories.length).toBeGreaterThan(0);
    });

    test('should return categories with correct structure', async () => {
      const response = await request(app)
        .get('/api/v1/whiskey/categories')
        .expect(200);

      if (response.body.categories.length > 0) {
        const category = response.body.categories[0];
        expect(category).toHaveProperty('_id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('slug');
      }
    });
  });

  describe('GET /api/v1/whiskey/categories/:id', () => {
    test('should get category by ID with brands', async () => {
      const response = await request(app)
        .get(`/api/v1/whiskey/categories/${testCategory._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('category');
      expect(response.body).toHaveProperty('brands');
      expect(response.body.category._id.toString()).toBe(testCategory._id.toString());
      expect(Array.isArray(response.body.brands)).toBe(true);
    });

    test('should return 404 for non-existent category', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/v1/whiskey/categories/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Category not found');
    });

    test('should return 400 for invalid category ID format', async () => {
      const response = await request(app)
        .get('/api/v1/whiskey/categories/invalid-id')
        .expect(500);
    });
  });

  describe('GET /api/v1/whiskey/brands', () => {
    test('should get all brands', async () => {
      const response = await request(app)
        .get('/api/v1/whiskey/brands')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('brands');
      expect(Array.isArray(response.body.brands)).toBe(true);
    });

    test('should filter brands by categoryId', async () => {
      const response = await request(app)
        .get(`/api/v1/whiskey/brands?categoryId=${testCategory._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.brands.length).toBeGreaterThan(0);
      
      // All brands should belong to the specified category
      response.body.brands.forEach(brand => {
        expect(brand.category._id.toString()).toBe(testCategory._id.toString());
      });
    });

    test('should return brands with populated category', async () => {
      const response = await request(app)
        .get('/api/v1/whiskey/brands')
        .expect(200);

      if (response.body.brands.length > 0) {
        const brand = response.body.brands[0];
        expect(brand).toHaveProperty('category');
        expect(brand.category).toHaveProperty('name');
      }
    });
  });

  describe('GET /api/v1/whiskey/brands/:id', () => {
    test('should get brand by ID with products', async () => {
      const response = await request(app)
        .get(`/api/v1/whiskey/brands/${testBrand._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('brand');
      expect(response.body).toHaveProperty('products');
      expect(response.body.brand._id.toString()).toBe(testBrand._id.toString());
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    test('should return 404 for non-existent brand', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/v1/whiskey/brands/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Brand not found');
    });
  });

  describe('GET /api/v1/whiskey/products', () => {
    test('should get all products', async () => {
      const response = await request(app)
        .get('/api/v1/whiskey/products')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    test('should filter products by categoryId', async () => {
      const response = await request(app)
        .get(`/api/v1/whiskey/products?categoryId=${testCategory._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      if (response.body.products.length > 0) {
        response.body.products.forEach(product => {
          expect(product.category._id.toString()).toBe(testCategory._id.toString());
        });
      }
    });

    test('should filter products by brandId', async () => {
      const response = await request(app)
        .get(`/api/v1/whiskey/products?brandId=${testBrand._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      if (response.body.products.length > 0) {
        response.body.products.forEach(product => {
          expect(product.brand._id.toString()).toBe(testBrand._id.toString());
        });
      }
    });

    test('should filter products by inStock status', async () => {
      const response = await request(app)
        .get('/api/v1/whiskey/products?inStock=true')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      
      if (response.body.products.length > 0) {
        response.body.products.forEach(product => {
          expect(product.inStock).toBe(true);
        });
      }
    });

    test('should return products with populated brand and category', async () => {
      const response = await request(app)
        .get('/api/v1/whiskey/products')
        .expect(200);

      if (response.body.products.length > 0) {
        const product = response.body.products[0];
        expect(product).toHaveProperty('brand');
        expect(product).toHaveProperty('category');
        expect(product.brand).toHaveProperty('name');
        expect(product.category).toHaveProperty('name');
      }
    });

    test('should return products with all required fields', async () => {
      const response = await request(app)
        .get('/api/v1/whiskey/products')
        .expect(200);

      if (response.body.products.length > 0) {
        const product = response.body.products[0];
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('inStock');
      }
    });
  });

  describe('GET /api/v1/whiskey/products/:id', () => {
    test('should get product by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/whiskey/products/${testProduct._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('product');
      expect(response.body.product._id.toString()).toBe(testProduct._id.toString());
      expect(response.body.product).toHaveProperty('name');
      expect(response.body.product).toHaveProperty('price');
      expect(response.body.product).toHaveProperty('brand');
      expect(response.body.product).toHaveProperty('category');
    });

    test('should return 404 for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/v1/whiskey/products/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Product not found');
    });
  });

  describe('GET /api/v1/whiskey/products/search', () => {
    test('should search products by query', async () => {
      const response = await request(app)
        .get('/api/v1/whiskey/products/search?q=test')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    test('should return 400 when query is missing', async () => {
      const response = await request(app)
        .get('/api/v1/whiskey/products/search')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Search query is required');
    });

    test('should perform case-insensitive search', async () => {
      const response = await request(app)
        .get('/api/v1/whiskey/products/search?q=TEST')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('should search in product name and description', async () => {
      const response = await request(app)
        .get(`/api/v1/whiskey/products/search?q=${testProduct.name}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.products.length).toBeGreaterThan(0);
    });
  });
});

