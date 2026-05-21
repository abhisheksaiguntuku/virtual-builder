-- Virtual Builder Database Schema
-- Database: PostgreSQL

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'homeowner', -- homeowner, builder, admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    state VARCHAR(100) NOT NULL,
    tier VARCHAR(20) -- Tier 1, Tier 2, etc.
);

CREATE TABLE plots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    city_id INTEGER REFERENCES cities(id),
    length_ft DECIMAL(10, 2) NOT NULL,
    width_ft DECIMAL(10, 2) NOT NULL,
    area_sqft DECIMAL(10, 2) GENERATED ALWAYS AS (length_ft * width_ft) STORED,
    facing VARCHAR(50), -- North, South, East, West, etc.
    budget_lakhs DECIMAL(10, 2),
    floors INTEGER DEFAULT 1,
    rooms JSONB, -- { bedrooms: 3, bathrooms: 2, pooja: true }
    quality_tier VARCHAR(50) DEFAULT 'Standard', -- Budget, Standard, Premium
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100), -- Foundation, Walls, Slab, Flooring, etc.
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50), -- sqft, kg, bag, nos
    description TEXT
);

CREATE TABLE prices (
    id SERIAL PRIMARY KEY,
    material_id INTEGER REFERENCES materials(id) ON DELETE CASCADE,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    tier VARCHAR(50) NOT NULL, -- Budget, Standard, Premium
    price DECIMAL(10, 2) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(material_id, city_id, tier)
);

CREATE TABLE vastu_rules (
    id SERIAL PRIMARY KEY,
    room_type VARCHAR(100) NOT NULL, -- Kitchen, Pooja Room, Master Bedroom
    best_direction VARCHAR(100) NOT NULL,
    good_direction VARCHAR(100),
    avoid_direction VARCHAR(100),
    remedy TEXT
);

CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100), -- Builder, Cement Dealer, Tile Shop, etc.
    address TEXT,
    phone VARCHAR(20),
    rating DECIMAL(3, 2),
    reviews_count INTEGER DEFAULT 0,
    special_offer TEXT,
    lat DECIMAL(10, 7),
    lng DECIMAL(10, 7)
);

CREATE TABLE workers (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id),
    name VARCHAR(255) NOT NULL,
    trade VARCHAR(100), -- Mason, Electrician, Plumber, Painter
    daily_rate_budget DECIMAL(10, 2),
    daily_rate_standard DECIMAL(10, 2),
    daily_rate_premium DECIMAL(10, 2),
    phone VARCHAR(20),
    rating DECIMAL(3, 2),
    lat DECIMAL(10, 7),
    lng DECIMAL(10, 7)
);

-- Insert basic Vastu Rules
INSERT INTO vastu_rules (room_type, best_direction, good_direction, avoid_direction, remedy) VALUES
('Pooja Room', 'North-East', 'East, North', 'South-West, South', 'Face East while praying, use white color'),
('Kitchen', 'South-East', 'West', 'North-East, South-West', 'Use red color, cook facing East'),
('Master Bedroom', 'South-West', 'West, South', 'North-East, North', 'Sleep head towards South, use brown/beige colors'),
('Bathroom', 'North-West', 'North', 'North-East, South-East', 'Use blue color, keep door closed');
