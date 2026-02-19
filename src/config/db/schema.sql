-- PostgreSQL Schema for Users
-- PostgreSQL Schema

-- Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brands
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    country VARCHAR(100),
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    in_stock BOOLEAN DEFAULT FALSE,
    brand_id INTEGER REFERENCES brands(id),
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Carts
CREATE TABLE IF NOT EXISTS carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    shipping DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    shipping_address JSONB,
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO product_images (product_id, image_url) VALUES
(1, 'https://cdn11.bigcommerce.com/s-e8lbekfe7c/images/stencil/750w/attribute_rule_images/31953_source_1771025493.jpg?compression=lossy'),
(2, 'https://ik.imagekit.io/cvygf2xse/chivas/wp-content/uploads/2022/05/Chivas12_NewBottle_2x.png?tr=q-80,w-446'),
(3, 'https://cdn11.bigcommerce.com/s-e8lbekfe7c/images/stencil/750w/attribute_rule_images/33899_source_1761928839.jpg?compression=lossy'),
(4, 'https://cdn11.bigcommerce.com/s-e8lbekfe7c/images/stencil/750w/attribute_rule_images/33057_source_1771162255.jpg?compression=lossy'),
(5, 'https://cdn11.bigcommerce.com/s-e8lbekfe7c/images/stencil/750w/attribute_rule_images/55915_source_1771442453.jpg?compression=lossy'),
(6, 'https://brand-assets.edrington.com/transform/4b050040-da76-4853-9fdf-ada51d9d4560/MAC-2025-Corvus-Still-photography-DC12-Serve-Bottle-4x5-150dpijpg-2xl?quality=100&io=transform%3Afill%2Cwidth%3A560%2Cheight%3A728'),
(7, 'https://ik.imagekit.io/cvygf2xse/jamesonwhiskey/wp-content/uploads/2025/11/JO_Pack_Shot_164x632.png?tr=q-80,w-100'),
(8, 'https://www.jackdaniels.com/_next/image?url=https%3A%2F%2Flive-jd24-backend.pantheonsite.io%2Fsites%2Fdefault%2Ffiles%2F2024-12%2FJD%2520TW%2520Global.png&w=1920&q=100'),
(9, 'https://www.jimbeam.com/sites/default/files/styles/card_1_1/public/2024-09/jim-beam-bottle-bourbon-whiskey-white_0.png.webp?itok=81aA3RYu'),
(10, 'https://cdn11.bigcommerce.com/s-e8lbekfe7c/images/stencil/750w/attribute_rule_images/31936_source_1770631311.jpg?compression=lossy'),
(11, 'https://ik.imagekit.io/cvygf2xse/chivas/wp-content/uploads/2022/05/Chivas-Regal-XVIII-Bottle-front-75cl-with-emblem.png?tr=q-80,w-300'),
(12, 'https://brand-assets.edrington.com/transform/00b930c0-1c82-42ba-bc31-532a03f8f03f/MAC-2025-Corvus-Still-photography-CC18-Serve-Bottle-Pack-4x5-150dpi-RGBjpg-2xl?quality=100&io=transform%3Afill%2Cwidth%3A560%2Cheight%3A728'),
(12, 'https://cdn11.bigcommerce.com/s-e8lbekfe7c/images/stencil/750w/attribute_rule_images/39802_source_1771442456.jpg?compression=lossy');
