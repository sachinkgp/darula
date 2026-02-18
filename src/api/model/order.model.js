const { pgPool } = require('../../config/db/postgres');

const orderModel = {
  createWithItems: async (userId, { subtotal, tax, shipping, total, shippingAddress, paymentMethod }, items) => {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, subtotal, tax, shipping, total, shipping_address, payment_method, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
         RETURNING id, user_id, subtotal, tax, shipping, total, shipping_address, payment_method, status, created_at`,
        [userId, subtotal, tax, shipping, total, JSON.stringify(shippingAddress || {}), paymentMethod || 'card']
      );
      const order = orderResult.rows[0];
      for (const it of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [order.id, it.productId, it.productName, it.quantity, it.price, it.subtotal]
        );
        await client.query(
          `UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - $1), in_stock = (stock_quantity - $1 > 0) WHERE id = $2`,
          [it.quantity, it.productId]
        );
      }
      await client.query('COMMIT');
      return order;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  findById: async (id, userId = null) => {
    const params = userId ? [id, userId] : [id];
    const where = userId ? 'WHERE o.id = $1 AND o.user_id = $2' : 'WHERE o.id = $1';
    const result = await pgPool.query(
      `SELECT o.id, o.user_id, o.subtotal, o.tax, o.shipping, o.total, o.shipping_address, o.payment_method, o.status, o.created_at,
              (SELECT COALESCE(json_agg(json_build_object('id', oi.id, 'product_id', oi.product_id, 'product_name', oi.product_name, 'quantity', oi.quantity, 'price', oi.price, 'subtotal', oi.subtotal)), '[]'::json)
               FROM order_items oi WHERE oi.order_id = o.id) AS items
       FROM orders o
       ${where}`,
      params
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      user_id: row.user_id,
      subtotal: parseFloat(row.subtotal),
      tax: parseFloat(row.tax),
      shipping: parseFloat(row.shipping),
      total: parseFloat(row.total),
      shipping_address: row.shipping_address,
      payment_method: row.payment_method,
      status: row.status,
      created_at: row.created_at,
      items: row.items || []
    };
  },

  findByUserId: async (userId) => {
    const result = await pgPool.query(
      `SELECT o.id, o.user_id, o.subtotal, o.tax, o.shipping, o.total, o.shipping_address, o.payment_method, o.status, o.created_at,
              (SELECT json_agg(json_build_object('id', oi.id, 'product_id', oi.product_id, 'product_name', oi.product_name, 'quantity', oi.quantity, 'price', oi.price, 'subtotal', oi.subtotal))
               FROM order_items oi WHERE oi.order_id = o.id) AS items
       FROM orders o
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return result.rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      subtotal: parseFloat(row.subtotal),
      tax: parseFloat(row.tax),
      shipping: parseFloat(row.shipping),
      total: parseFloat(row.total),
      shipping_address: row.shipping_address,
      payment_method: row.payment_method,
      status: row.status,
      created_at: row.created_at,
      items: row.items || []
    }));
  }
};

module.exports = orderModel;
