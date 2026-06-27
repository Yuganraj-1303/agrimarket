-- PostgreSQL Database Schema for AgriMarket

-- 1. Create Database (Execute separately if needed)
-- CREATE DATABASE agrimarket;

-- Connect to the database
-- \c agrimarket;

-- 2. Drop existing tables if they exist to start clean
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ROLE_CUSTOMER', 'ROLE_ADMIN')),
    name VARCHAR(100),
    phone VARCHAR(15),
    address VARCHAR(255)
);

-- 4. Categories Table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    image_url VARCHAR(255)
);

-- 5. Products Table
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    stock_quantity INTEGER NOT NULL CHECK (stock_quantity >= 0),
    image_url VARCHAR(255),
    category_id BIGINT NOT NULL,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 6. Cart Items Table
CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_product UNIQUE (user_id, product_id)
);

-- 7. Orders Table
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    shipping_address VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Order Items Table
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Insert Initial Category Seeds
INSERT INTO categories (name, description, image_url) VALUES
('Fresh Vegetables', 'Organic greens, tubers, and fresh root crops directly from farms.', 'https://images.unsplash.com/photo-1566385101042-1a010c129fae?w=500'),
('Organic Fruits', 'Delicious, pesticide-free fresh apples, berries, citruses, and exotic fruits.', 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=500'),
('Grains & Cereals', 'High quality rice, wheat, millets, pulses, and farm seeds.', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500'),
('Dairy & Eggs', 'Pure farm fresh milk, butter, local cheeses, and organic eggs.', 'https://images.unsplash.com/photo-1529258283598-8d6fe6cb0987?w=500');

-- Insert Initial Featured Products Seeds
INSERT INTO products (name, description, price, stock_quantity, image_url, category_id) VALUES
('Organic Red Apples', 'Sweet, crispy organic red apples harvested locally in Shimla farms.', 180.00, 50, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500', 2),
('Fresh Spinach Bunch', 'Rich in iron, freshly cut organic spinach leaves from local green houses.', 40.00, 30, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500', 1),
('Basmati Rice (Premium)', 'Long grain, aromatic, double polished premium basmati rice (5kg bag).', 650.00, 20, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', 3),
('Fresh Cow Milk', 'Pure, pasteurized fresh farm cow milk rich in calcium (1 Liter bottle).', 75.00, 40, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', 4);
