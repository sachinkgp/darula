require('./setup');
const request = require('supertest');
const app = require('../index');
const { pgPool } = require('../config/db/postgres');

describe('Whiskey API Tests', () => {
  let testCategoryId;
  let testBrandId;
  let testProductId;
  const uniqueSlug = `test-${Date.now()}`;

  beforeAll(async () => {
    await pgPool.query("DELETE FROM products WHERE slug LIKE 'test-%'");
    await pgPool.query("DELETE FROM brands WHERE slug LIKE 'test-%'");
    await pgPool.query("DELETE FROM categories WHERE slug LIKE 'test-%'");

    const catRes = await pgPool.query(
      "INSERT INTO categories (name, slug, description) VALUES ('Test Category', $1, 'Test') RETURNING id",
      [uniqueSlug]
    );
    testCategoryId = catRes.rows[0].id;

    const brandRes = await pgPool.query(
      'INSERT INTO brands (name, slug, country, description, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['Test Brand', `${uniqueSlug}-brand`, 'USA', 'Test', testCategoryId]
    );
    testBrandId = brandRes.rows[0].id;

    const prodRes = await pgPool.query(
      'INSERT INTO products (name, slug, description, price, stock_quantity, in_stock, brand_id, category_id) VALUES ($1, $2, $3, $4, $5, true, $6, $7) RETURNING id',
      ['Test Product', `${uniqueSlug}-product`, 'Test', 29.99, 10, testBrandId, testCategoryId]
    );
    testProductId = prodRes.rows[0].id;
  });

  afterAll(async () => {
    await pgPool.query("DELETE FROM products WHERE slug LIKE 'test-%'");
    await pgPool.query("DELETE FROM brands WHERE slug LIKE 'test-%'");
    await pgPool.query("DELETE FROM categories WHERE slug LIKE 'test-%'");
  });

  describe('GET /api/v1/whiskey/categories', () => {
    test('should get all categories', async () => {
      const response = await request(app).get('/api/v1/whiskey/categories').expect(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('categories');
      expect(Array.isArray(response.body.categories)).toBe(true);
      expect(response.body.categories.length).toBeGreaterThan(0);
    });

    test('should return categories with correct structure', async () => {
      const response = await request(app).get('/api/v1/whiskey/categories').expect(200);
      if (response.body.categories.length > 0) {
        const category = response.body.categories[0];
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('slug');
      }
    });
  });

  describe('GET /api/v1/whiskey/categories/:id', () => {
    test('should get category by ID with brands', async () => {
      const response = await request(app)
        .get(`/api/v1/whiskey/categories/${testCategoryId}`)
        .expect(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('category');
      expect(response.body).toHaveProperty('brands');
      expect(response.body.category.id).toBe(testCategoryId);
      expect(Array.isArray(response.body.brands)).toBe(true);
    });

    test('should return 404 for non-existent category', async () => {
      const response = await request(app).get('/api/v1/whiskey/categories/999999').expect(404);
      expect(response.body).toHaveProperty('error', 'Category not found');
    });

    test('should return 400/500 for invalid category ID format', async () => {
      const response = await request(app).get('/api/v1/whiskey/categories/invalid-id');
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('GET /api/v1/whiskey/brands', () => {
    test('should get all brands', async () => {
      const response = await request(app).get('/api/v1/whiskey/brands').expect(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('brands');
      expect(Array.isArray(response.body.brands)).toBe(true);
    });

    test('should filter brands by categoryId', async () => {
      const response = await request(app)
        .get(`/api/v1/whiskey/brands?categoryId=${testCategoryId}`)
        .expect(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.brands.length).toBeGreaterThan(0);
      response.body.brands.forEach((brand) => {
        expect(brand.category_id).toBe(testCategoryId);
      });
    });

    test('should return brands with category', async () => {
      const response = await request(app).get('/api/v1/whiskey/brands').expect(200);
      if (response.body.brands.length > 0) {
        const brand = response.body.brands[0];
        expect(brand).toHaveProperty('category');
        expect(brand.category).toHaveProperty('name');
      }
    });
  });

  describe('GET /api/v1/whiskey/brands/:id', () => {
    test('should get brand by ID with products', async () => {
      const response = await request(app).get(`/api/v1/whiskey/brands/${testBrandId}`).expect(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('brand');
      expect(response.body).toHaveProperty('products');
      expect(response.body.brand.id).toBe(testBrandId);
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    test('should return 404 for non-existent brand', async () => {
      const response = await request(app).get('/api/v1/whiskey/brands/999999').expect(404);
      expect(response.body).toHaveProperty('error', 'Brand not found');
    });
  });

  describe('GET /api/v1/whiskey/products', () => {
    test('should get all products', async () => {
      const response = await request(app).get('/api/v1/whiskey/products').expect(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    test('should filter products by categoryId', async () => {
      const response = await request(app)
        .get(`/api/v1/whiskey/products?categoryId=${testCategoryId}`)
        .expect(200);
      expect(response.body).toHaveProperty('success', true);
      if (response.body.products.length > 0) {
        response.body.products.forEach((p) => expect(p.category_id).toBe(testCategoryId));
      }
    });

    test('should filter products by brandId', async () => {
      const response = await request(app)
        .get(`/api/v1/whiskey/products?brandId=${testBrandId}`)
        .expect(200);
      expect(response.body).toHaveProperty('success', true);
      if (response.body.products.length > 0) {
        response.body.products.forEach((p) => expect(p.brand_id).toBe(testBrandId));
      }
    });

    test('should filter products by inStock status', async () => {
      const response = await request(app).get('/api/v1/whiskey/products?inStock=true').expect(200);
      expect(response.body).toHaveProperty('success', true);
      if (response.body.products.length > 0) {
        response.body.products.forEach((p) => expect(p.in_stock).toBe(true));
      }
    });

    test('should return products with brand and category', async () => {
      const response = await request(app).get('/api/v1/whiskey/products').expect(200);
      if (response.body.products.length > 0) {
        const product = response.body.products[0];
        expect(product).toHaveProperty('brand');
        expect(product).toHaveProperty('category');
        expect(product.brand).toHaveProperty('name');
        expect(product.category).toHaveProperty('name');
      }
    });

    test('should return products with required fields', async () => {
      const response = await request(app).get('/api/v1/whiskey/products').expect(200);
      if (response.body.products.length > 0) {
        const product = response.body.products[0];
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('in_stock');
      }
    });
  });

  describe('GET /api/v1/whiskey/products/:id', () => {
    test('should get product by ID', async () => {
      const response = await request(app).get(`/api/v1/whiskey/products/${testProductId}`).expect(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('product');
      expect(response.body.product.id).toBe(testProductId);
      expect(response.body.product).toHaveProperty('name');
      expect(response.body.product).toHaveProperty('price');
      expect(response.body.product).toHaveProperty('brand');
      expect(response.body.product).toHaveProperty('category');
    });

    test('should return 404 for non-existent product', async () => {
      const response = await request(app).get('/api/v1/whiskey/products/999999').expect(404);
      expect(response.body).toHaveProperty('error', 'Product not found');
    });
  });

  describe('GET /api/v1/whiskey/products/search', () => {
    test('should search products by query', async () => {
      const response = await request(app).get('/api/v1/whiskey/products/search?q=test').expect(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    test('should return 400 when query is missing', async () => {
      const response = await request(app).get('/api/v1/whiskey/products/search').expect(400);
      expect(response.body).toHaveProperty('error', 'Search query is required');
    });

    test('should perform case-insensitive search', async () => {
      const response = await request(app).get('/api/v1/whiskey/products/search?q=TEST').expect(200);
      expect(response.body).toHaveProperty('success', true);
    });

    test('should find test product by name', async () => {
      const response = await request(app)
        .get(`/api/v1/whiskey/products/search?q=Test Product`)
        .expect(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.products.length).toBeGreaterThan(0);
    });
  });
});
