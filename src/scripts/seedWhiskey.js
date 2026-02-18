require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pgPool } = require('../config/db/postgres');

const runSchemaIfNeeded = async () => {
  const schemaPath = path.join(__dirname, '../config/db/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  try {
    await pgPool.query(schema);
  } catch (e) {
    if (!e.message.includes('already exists')) throw e;
  }
};

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const seedData = async () => {
  const client = await pgPool.connect();
  try {
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM brands');
    await client.query('DELETE FROM categories');

    const catResult = (name, description) =>
      client.query(
        'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING id',
        [name, slugify(name), description]
      );

    const entryBlended = (await catResult('Entry Premium Blended Scotch', 'Accessible premium blended Scotch whiskies')).rows[0].id;
    const entrySingle = (await catResult('Entry Single Malt', 'Accessible single malt Scotch whiskies')).rows[0].id;
    const cocktail = (await catResult('Cocktail Premium', 'Premium whiskies for cocktails')).rows[0].id;
    const prestige = (await catResult('Prestige & gifting', 'Prestige and gifting expressions')).rows[0].id;
    const luxury = (await catResult('Luxury collectors', 'Luxury and collector editions')).rows[0].id;

    const brand = async (name, categoryId, country, description, slug) => {
      const r = await client.query(
        'INSERT INTO brands (name, slug, country, description, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [name, slug || slugify(name), country, description, categoryId]
      );
      return r.rows[0].id;
    };

    const product = async (name, brandId, categoryId, price, stock, slug, description) => {
      await client.query(
        'INSERT INTO products (name, slug, description, price, stock_quantity, in_stock, brand_id, category_id) VALUES ($1, $2, $3, $4, $5, true, $6, $7)',
        [name, slug || slugify(name), description || '', price, stock, brandId, categoryId]
      );
    };

    // 1. Entry Premium Blended Scotch
    const jwId = await brand('Johnnie Walker', entryBlended, 'Scotland', "World's best-selling Scotch");
    const chivasId = await brand('Chivas Regal', entryBlended, 'Scotland', 'Premium blended Scotch');
    const ballId = await brand("Ballantine's", entryBlended, 'Scotland', 'Blended Scotch whisky');
    await product('JW Black Label', jwId, entryBlended, 39.99, 50, 'jw-black-label', '12 year old blended Scotch');
    await product('Chivas 12', chivasId, entryBlended, 34.99, 45, 'chivas-12', 'Chivas Regal 12 Year');
    await product("Ballantine's 12", ballId, entryBlended, 32.99, 40, 'ballantines-12', "Ballantine's 12 Year blended Scotch");

    // 2. Entry Single Malt
    const glenfiddichId = await brand('Glenfiddich', entrySingle, 'Scotland', "World's most awarded single malt");
    const glenlivetId = await brand('The Glenlivet', entrySingle, 'Scotland', 'Speyside single malt');
    const macallanId = await brand('The Macallan', entrySingle, 'Scotland', 'Premium single malt Scotch');
    await product('Glenfiddich 12', glenfiddichId, entrySingle, 49.99, 35, 'glenfiddich-12', 'Glenfiddich 12 Year Old');
    await product('Glenlivet 12', glenlivetId, entrySingle, 44.99, 38, 'glenlivet-12', 'The Glenlivet 12 Year Old');
    await product('Macallan 12', macallanId, entrySingle, 79.99, 25, 'macallan-12', 'The Macallan 12 Year Old');

    // 3. Cocktail Premium
    const jamesonId = await brand('Jameson', cocktail, 'Ireland', 'Irish whiskey');
    const jackId = await brand("Jack Daniel's", cocktail, 'USA', 'Tennessee whiskey');
    const jimId = await brand('Jim Beam', cocktail, 'USA', 'Kentucky straight bourbon');
    await product('Jameson', jamesonId, cocktail, 28.99, 60, 'jameson', 'Jameson Irish Whiskey');
    await product("Jack Daniel's", jackId, cocktail, 29.99, 55, 'jack-daniels', "Jack Daniel's Old No. 7");
    await product('Jim Beam', jimId, cocktail, 19.99, 70, 'jim-beam', 'Jim Beam Kentucky Straight Bourbon');

    // 4. Prestige & gifting
    const jwPrestigeId = await brand('Johnnie Walker', prestige, 'Scotland', "World's best-selling Scotch", 'johnnie-walker-prestige');
    const chivasPrestigeId = await brand('Chivas Regal', prestige, 'Scotland', 'Premium blended Scotch', 'chivas-regal-prestige');
    await product('JW Blue Label', jwPrestigeId, prestige, 199.99, 10, 'jw-blue-label', 'Johnnie Walker Blue Label');
    await product('Chivas 18', chivasPrestigeId, prestige, 99.99, 15, 'chivas-18', 'Chivas Regal 18 Year');

    // 5. Luxury collectors
    const macLuxuryId = await brand('The Macallan', luxury, 'Scotland', 'Premium single malt Scotch', 'the-macallan-luxury');
    const dalmoreId = await brand('Dalmore', luxury, 'Scotland', 'Highland single malt Scotch');
    await product('Macallan 18', macLuxuryId, luxury, 299.99, 8, 'macallan-18', 'The Macallan 18 Year Old');
    await product('Dalmore', dalmoreId, luxury, 89.99, 20, 'dalmore', 'Dalmore single malt Scotch');

    const catCount = (await client.query('SELECT COUNT(*) FROM categories')).rows[0].count;
    const brandCount = (await client.query('SELECT COUNT(*) FROM brands')).rows[0].count;
    const productCount = (await client.query('SELECT COUNT(*) FROM products')).rows[0].count;

    console.log('✅ Categories created');
    console.log('✅ Brands and products created');
    console.log('\n✅ Seeding completed successfully!');
    console.log(`Created ${catCount} categories`);
    console.log(`Created ${brandCount} brands`);
    console.log(`Created ${productCount} products`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    client.release();
  }
};

const run = async () => {
  try {
    await pgPool.query('SELECT 1');
    console.log('✅ PostgreSQL connected for seeding');
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1);
  }
  try {
    await runSchemaIfNeeded();
    console.log('✅ Schema ensured');
  } catch (e) {
    if (!e.message.includes('already exists')) console.warn('Schema note:', e.message);
  }
  await seedData();
};

run();
