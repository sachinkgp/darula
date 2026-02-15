const mongoose = require('mongoose');
require('dotenv').config();
const { WhiskeyCategory, Brand, Product } = require('../api/model/whiskey.model');

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB connected for seeding");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await WhiskeyCategory.deleteMany({});
    await Brand.deleteMany({});
    await Product.deleteMany({});

    // Create Categories
    const bourbon = await WhiskeyCategory.create({
      name: 'Bourbon',
      description: 'American whiskey made primarily from corn',
      slug: 'bourbon'
    });

    const singleMalt = await WhiskeyCategory.create({
      name: 'Single Malt',
      description: 'Whiskey made from malted barley at a single distillery',
      slug: 'single-malt'
    });

    const doubleBarrel = await WhiskeyCategory.create({
      name: 'Double Barrel',
      description: 'Whiskey aged in two different barrels for enhanced flavor',
      slug: 'double-barrel'
    });

    const blendedScotch = await WhiskeyCategory.create({
      name: 'Blended Scotch',
      description: 'Blend of single malt and grain whiskies from Scotland',
      slug: 'blended-scotch'
    });

    console.log('✅ Categories created');

    // Create Bourbon Brands
    const jimBeam = await Brand.create({
      name: 'Jim Beam',
      category: bourbon._id,
      description: 'America\'s #1 bourbon',
      country: 'USA',
      slug: 'jim-beam'
    });

    const makersMark = await Brand.create({
      name: 'Maker\'s Mark',
      category: bourbon._id,
      description: 'Handcrafted bourbon',
      country: 'USA',
      slug: 'makers-mark'
    });

    const wildTurkey = await Brand.create({
      name: 'Wild Turkey',
      category: bourbon._id,
      description: 'Bold and flavorful bourbon',
      country: 'USA',
      slug: 'wild-turkey'
    });

    const woodfordReserve = await Brand.create({
      name: 'Woodford Reserve',
      category: bourbon._id,
      description: 'Premium small batch bourbon',
      country: 'USA',
      slug: 'woodford-reserve'
    });

    // Create Single Malt Brands
    const macallan = await Brand.create({
      name: 'The Macallan',
      category: singleMalt._id,
      description: 'Premium single malt scotch',
      country: 'Scotland',
      slug: 'the-macallan'
    });

    const glenfiddich = await Brand.create({
      name: 'Glenfiddich',
      category: singleMalt._id,
      description: 'World\'s most awarded single malt',
      country: 'Scotland',
      slug: 'glenfiddich'
    });

    const glenlivet = await Brand.create({
      name: 'The Glenlivet',
      category: singleMalt._id,
      description: 'The single malt that started it all',
      country: 'Scotland',
      slug: 'the-glenlivet'
    });

    const lagavulin = await Brand.create({
      name: 'Lagavulin',
      category: singleMalt._id,
      description: 'Islay single malt with peaty character',
      country: 'Scotland',
      slug: 'lagavulin'
    });

    // Create Double Barrel Brands
    const woodfordDoubleOaked = await Brand.create({
      name: 'Woodford Reserve Double Oaked',
      category: doubleBarrel._id,
      description: 'Double barrel aged bourbon',
      country: 'USA',
      slug: 'woodford-reserve-double-oaked'
    });

    const balvenie = await Brand.create({
      name: 'The Balvenie',
      category: doubleBarrel._id,
      description: 'DoubleWood single malt scotch',
      country: 'Scotland',
      slug: 'the-balvenie'
    });

    // Create Blended Scotch Brands
    const johnnieWalker = await Brand.create({
      name: 'Johnnie Walker',
      category: blendedScotch._id,
      description: 'World\'s best-selling scotch',
      country: 'Scotland',
      slug: 'johnnie-walker'
    });

    const chivasRegal = await Brand.create({
      name: 'Chivas Regal',
      category: blendedScotch._id,
      description: 'Premium blended scotch',
      country: 'Scotland',
      slug: 'chivas-regal'
    });

    const dewars = await Brand.create({
      name: 'Dewar\'s',
      category: blendedScotch._id,
      description: 'Double-aged blended scotch',
      country: 'Scotland',
      slug: 'dewars'
    });

    console.log('✅ Brands created');

    // Create Products
    const products = [
      // Jim Beam products
      {
        name: 'Jim Beam White Label',
        brand: jimBeam._id,
        category: bourbon._id,
        description: 'Classic Kentucky straight bourbon',
        price: 19.99,
        volume: '750ml',
        alcoholContent: '40% ABV',
        inStock: true,
        stockQuantity: 50,
        slug: 'jim-beam-white-label'
      },
      {
        name: 'Jim Beam Black Label',
        brand: jimBeam._id,
        category: bourbon._id,
        description: 'Aged 8 years, extra smooth',
        price: 29.99,
        volume: '750ml',
        alcoholContent: '43% ABV',
        inStock: true,
        stockQuantity: 30,
        slug: 'jim-beam-black-label'
      },
      // Maker's Mark products
      {
        name: 'Maker\'s Mark',
        brand: makersMark._id,
        category: bourbon._id,
        description: 'Handcrafted bourbon with red winter wheat',
        price: 34.99,
        volume: '750ml',
        alcoholContent: '45% ABV',
        inStock: true,
        stockQuantity: 40,
        slug: 'makers-mark'
      },
      {
        name: 'Maker\'s Mark 46',
        brand: makersMark._id,
        category: bourbon._id,
        description: 'Aged with seared French oak staves',
        price: 44.99,
        volume: '750ml',
        alcoholContent: '47% ABV',
        inStock: true,
        stockQuantity: 25,
        slug: 'makers-mark-46'
      },
      // Wild Turkey products
      {
        name: 'Wild Turkey 101',
        brand: wildTurkey._id,
        category: bourbon._id,
        description: 'Bold, high-proof bourbon',
        price: 24.99,
        volume: '750ml',
        alcoholContent: '50.5% ABV',
        inStock: true,
        stockQuantity: 35,
        slug: 'wild-turkey-101'
      },
      // Woodford Reserve products
      {
        name: 'Woodford Reserve Distiller\'s Select',
        brand: woodfordReserve._id,
        category: bourbon._id,
        description: 'Premium small batch bourbon',
        price: 39.99,
        volume: '750ml',
        alcoholContent: '45.2% ABV',
        inStock: true,
        stockQuantity: 30,
        slug: 'woodford-reserve-distillers-select'
      },
      {
        name: 'Woodford Reserve Double Oaked',
        brand: woodfordDoubleOaked._id,
        category: doubleBarrel._id,
        description: 'Double barrel aged for rich flavor',
        price: 54.99,
        volume: '750ml',
        alcoholContent: '45.2% ABV',
        inStock: true,
        stockQuantity: 20,
        slug: 'woodford-reserve-double-oaked'
      },
      // Macallan products
      {
        name: 'The Macallan 12 Year Old',
        brand: macallan._id,
        category: singleMalt._id,
        description: 'Sherry oak matured single malt',
        price: 79.99,
        volume: '750ml',
        alcoholContent: '40% ABV',
        age: '12 Years',
        inStock: true,
        stockQuantity: 15,
        slug: 'the-macallan-12-year'
      },
      {
        name: 'The Macallan 18 Year Old',
        brand: macallan._id,
        category: singleMalt._id,
        description: 'Premium aged single malt',
        price: 299.99,
        volume: '750ml',
        alcoholContent: '43% ABV',
        age: '18 Years',
        inStock: true,
        stockQuantity: 5,
        slug: 'the-macallan-18-year'
      },
      // Glenfiddich products
      {
        name: 'Glenfiddich 12 Year Old',
        brand: glenfiddich._id,
        category: singleMalt._id,
        description: 'World\'s most awarded single malt',
        price: 49.99,
        volume: '750ml',
        alcoholContent: '40% ABV',
        age: '12 Years',
        inStock: true,
        stockQuantity: 25,
        slug: 'glenfiddich-12-year'
      },
      {
        name: 'Glenfiddich 15 Year Old',
        brand: glenfiddich._id,
        category: singleMalt._id,
        description: 'Solera vat matured',
        price: 69.99,
        volume: '750ml',
        alcoholContent: '40% ABV',
        age: '15 Years',
        inStock: true,
        stockQuantity: 18,
        slug: 'glenfiddich-15-year'
      },
      // Glenlivet products
      {
        name: 'The Glenlivet 12 Year Old',
        brand: glenlivet._id,
        category: singleMalt._id,
        description: 'Classic Speyside single malt',
        price: 44.99,
        volume: '750ml',
        alcoholContent: '40% ABV',
        age: '12 Years',
        inStock: true,
        stockQuantity: 22,
        slug: 'the-glenlivet-12-year'
      },
      // Lagavulin products
      {
        name: 'Lagavulin 16 Year Old',
        brand: lagavulin._id,
        category: singleMalt._id,
        description: 'Islay single malt with rich peaty character',
        price: 89.99,
        volume: '750ml',
        alcoholContent: '43% ABV',
        age: '16 Years',
        inStock: true,
        stockQuantity: 12,
        slug: 'lagavulin-16-year'
      },
      // Balvenie products
      {
        name: 'The Balvenie DoubleWood 12 Year',
        brand: balvenie._id,
        category: doubleBarrel._id,
        description: 'Aged in traditional oak and sherry casks',
        price: 64.99,
        volume: '750ml',
        alcoholContent: '40% ABV',
        age: '12 Years',
        inStock: true,
        stockQuantity: 16,
        slug: 'the-balvenie-doublewood-12-year'
      },
      // Johnnie Walker products
      {
        name: 'Johnnie Walker Red Label',
        brand: johnnieWalker._id,
        category: blendedScotch._id,
        description: 'Bold and vibrant blended scotch',
        price: 24.99,
        volume: '750ml',
        alcoholContent: '40% ABV',
        inStock: true,
        stockQuantity: 45,
        slug: 'johnnie-walker-red-label'
      },
      {
        name: 'Johnnie Walker Black Label',
        brand: johnnieWalker._id,
        category: blendedScotch._id,
        description: '12 year old blended scotch',
        price: 39.99,
        volume: '750ml',
        alcoholContent: '40% ABV',
        age: '12 Years',
        inStock: true,
        stockQuantity: 35,
        slug: 'johnnie-walker-black-label'
      },
      {
        name: 'Johnnie Walker Blue Label',
        brand: johnnieWalker._id,
        category: blendedScotch._id,
        description: 'Ultra-premium blended scotch',
        price: 199.99,
        volume: '750ml',
        alcoholContent: '40% ABV',
        inStock: true,
        stockQuantity: 8,
        slug: 'johnnie-walker-blue-label'
      },
      // Chivas Regal products
      {
        name: 'Chivas Regal 12 Year',
        brand: chivasRegal._id,
        category: blendedScotch._id,
        description: 'Premium blended scotch',
        price: 34.99,
        volume: '750ml',
        alcoholContent: '40% ABV',
        age: '12 Years',
        inStock: true,
        stockQuantity: 28,
        slug: 'chivas-regal-12-year'
      },
      {
        name: 'Chivas Regal 18 Year',
        brand: chivasRegal._id,
        category: blendedScotch._id,
        description: 'Ultra-premium blended scotch',
        price: 99.99,
        volume: '750ml',
        alcoholContent: '40% ABV',
        age: '18 Years',
        inStock: true,
        stockQuantity: 10,
        slug: 'chivas-regal-18-year'
      },
      // Dewar's products
      {
        name: 'Dewar\'s White Label',
        brand: dewars._id,
        category: blendedScotch._id,
        description: 'Double-aged blended scotch',
        price: 22.99,
        volume: '750ml',
        alcoholContent: '40% ABV',
        inStock: true,
        stockQuantity: 40,
        slug: 'dewars-white-label'
      }
    ];

    await Product.insertMany(products);
    console.log('✅ Products created');

    console.log('\n✅ Seeding completed successfully!');
    console.log(`Created ${await WhiskeyCategory.countDocuments()} categories`);
    console.log(`Created ${await Brand.countDocuments()} brands`);
    console.log(`Created ${await Product.countDocuments()} products`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

const run = async () => {
  await connectMongo();
  await seedData();
};

run();

