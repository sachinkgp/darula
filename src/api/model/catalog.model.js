const { pgPool } = require('../../config/db/postgres');

const mapCategory = (row) => row && { id: row.id, name: row.name, slug: row.slug, description: row.description || '' };
const mapBrand = (row) => row && { id: row.id, name: row.name, slug: row.slug, country: row.country || '', description: row.description || '', category_id: row.category_id, category: row.category ? mapCategory(row.category) : undefined };
const mapProduct = (row) => row && { id: row.id, name: row.name, slug: row.slug, description: row.description || '', price: parseFloat(row.price), stock_quantity: row.stock_quantity, in_stock: row.in_stock, brand_id: row.brand_id, category_id: row.category_id, brand: row.brand ? mapBrand(row.brand) : undefined, category: row.category ? mapCategory(row.category) : undefined };

const catalogModel = {
  getCategories: async () => {
    const result = await pgPool.query('SELECT id, name, slug, description FROM categories ORDER BY name ASC');
    return result.rows.map(mapCategory);
  },

  getCategoryById: async (id) => {
    const result = await pgPool.query('SELECT id, name, slug, description FROM categories WHERE id = $1', [id]);
    return mapCategory(result.rows[0]);
  },

  getBrandsByCategoryId: async (categoryId) => {
    const result = await pgPool.query(
      `SELECT b.id, b.name, b.slug, b.country, b.description, b.category_id,
              c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug, c.description AS cat_description
       FROM brands b
       LEFT JOIN categories c ON c.id = b.category_id
       WHERE b.category_id = $1
       ORDER BY b.name ASC`,
      [categoryId]
    );
    return result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      country: r.country || '',
      description: r.description || '',
      category_id: r.category_id,
      category: r.cat_id ? { id: r.cat_id, name: r.cat_name, slug: r.cat_slug, description: r.cat_description || '' } : null
    }));
  },

  getBrands: async (categoryId = null) => {
    if (categoryId) {
      return catalogModel.getBrandsByCategoryId(categoryId);
    }
    const result = await pgPool.query(
      `SELECT b.id, b.name, b.slug, b.country, b.description, b.category_id,
              c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug, c.description AS cat_description
       FROM brands b
       LEFT JOIN categories c ON c.id = b.category_id
       ORDER BY b.name ASC`
    );
    return result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      country: r.country || '',
      description: r.description || '',
      category_id: r.category_id,
      category: r.cat_id ? { id: r.cat_id, name: r.cat_name, slug: r.cat_slug, description: r.cat_description || '' } : null
    }));
  },

  getBrandById: async (id) => {
    const result = await pgPool.query(
      `SELECT b.id, b.name, b.slug, b.country, b.description, b.category_id,
              c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug, c.description AS cat_description
       FROM brands b
       LEFT JOIN categories c ON c.id = b.category_id
       WHERE b.id = $1`,
      [id]
    );
    const r = result.rows[0];
    if (!r) return null;
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      country: r.country || '',
      description: r.description || '',
      category_id: r.category_id,
      category: r.cat_id ? { id: r.cat_id, name: r.cat_name, slug: r.cat_slug, description: r.cat_description || '' } : null
    };
  },

  getProducts: async (filters = {}) => {
    const { categoryId, brandId, inStock } = filters;
    const conditions = [];
    const params = [];
    let i = 1;
    if (categoryId) { conditions.push(`p.category_id = $${i++}`); params.push(categoryId); }
    if (brandId) { conditions.push(`p.brand_id = $${i++}`); params.push(brandId); }
    if (inStock !== undefined) { conditions.push(`p.in_stock = $${i++}`); params.push(inStock); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pgPool.query(
      `SELECT p.id, p.name, p.slug, p.description, p.price, p.stock_quantity, p.in_stock, p.brand_id, p.category_id,
              b.id AS brand_id, b.name AS brand_name, b.slug AS brand_slug, b.country AS brand_country, b.description AS brand_description,
              c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug, c.description AS cat_description
       FROM products p
       LEFT JOIN brands b ON b.id = p.brand_id
       LEFT JOIN categories c ON c.id = p.category_id
       ${where}
       ORDER BY p.name ASC`,
      params
    );
    return result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description || '',
      price: parseFloat(r.price),
      stock_quantity: r.stock_quantity,
      in_stock: r.in_stock,
      brand_id: r.brand_id,
      category_id: r.category_id,
      brand: r.brand_id ? { id: r.brand_id, name: r.brand_name, slug: r.brand_slug, country: r.brand_country || '', description: r.brand_description || '' } : null,
      category: r.cat_id ? { id: r.cat_id, name: r.cat_name, slug: r.cat_slug, description: r.cat_description || '' } : null
    }));
  },

  getProductById: async (id) => {
    const result = await pgPool.query(
      `SELECT p.id, p.name, p.slug, p.description, p.price, p.stock_quantity, p.in_stock, p.brand_id, p.category_id,
              b.id AS brand_id, b.name AS brand_name, b.slug AS brand_slug, b.country AS brand_country, b.description AS brand_description,
              c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug, c.description AS cat_description
       FROM products p
       LEFT JOIN brands b ON b.id = p.brand_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1`,
      [id]
    );
    const r = result.rows[0];
    if (!r) return null;
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description || '',
      price: parseFloat(r.price),
      stock_quantity: r.stock_quantity,
      in_stock: r.in_stock,
      brand_id: r.brand_id,
      category_id: r.category_id,
      brand: r.brand_id ? { id: r.brand_id, name: r.brand_name, slug: r.brand_slug, country: r.brand_country || '', description: r.brand_description || '' } : null,
      category: r.cat_id ? { id: r.cat_id, name: r.cat_name, slug: r.cat_slug, description: r.cat_description || '' } : null
    };
  },

  searchProducts: async (q, limit = 50) => {
    const result = await pgPool.query(
      `SELECT p.id, p.name, p.slug, p.description, p.price, p.stock_quantity, p.in_stock, p.brand_id, p.category_id,
              b.id AS brand_id, b.name AS brand_name, b.slug AS brand_slug, b.country AS brand_country, b.description AS brand_description,
              c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug, c.description AS cat_description
       FROM products p
       LEFT JOIN brands b ON b.id = p.brand_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.name ILIKE $1 OR p.description ILIKE $1
       ORDER BY p.name ASC
       LIMIT $2`,
      [`%${q}%`, limit]
    );
    return result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description || '',
      price: parseFloat(r.price),
      stock_quantity: r.stock_quantity,
      in_stock: r.in_stock,
      brand_id: r.brand_id,
      category_id: r.category_id,
      brand: r.brand_id ? { id: r.brand_id, name: r.brand_name, slug: r.brand_slug, country: r.brand_country || '', description: r.brand_description || '' } : null,
      category: r.cat_id ? { id: r.cat_id, name: r.cat_name, slug: r.cat_slug, description: r.cat_description || '' } : null
    }));
  },

  updateProductStock: async (productId, quantityChange) => {
    const client = await pgPool.connect();
    try {
      const r = await client.query(
        'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - $1), in_stock = (stock_quantity - $1 > 0) WHERE id = $2 RETURNING id, stock_quantity, in_stock',
        [quantityChange, productId]
      );
      return r.rows[0];
    } finally {
      client.release();
    }
  }
};

module.exports = catalogModel;
