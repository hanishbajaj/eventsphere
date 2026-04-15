-- backend/database/schema.sql
-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS eventsphere_db;
USE eventsphere_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('buyer', 'organizer', 'sponsor', 'admin') NOT NULL,
    company VARCHAR(255) DEFAULT NULL,
    avatar VARCHAR(512),
    banned TINYINT(1) DEFAULT 0,
    budget DECIMAL(10,2) DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (email)
);

-- 2. Events Table
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    date DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    venue VARCHAR(255) NOT NULL,
    address VARCHAR(512) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    image VARCHAR(512),
    tags JSON,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    featured TINYINT(1) DEFAULT 0,
    organizerId VARCHAR(36) NOT NULL,
    organizerName VARCHAR(255) NOT NULL,
    seats JSON,
    ticketsSold INT DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizerId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX (organizerId),
    INDEX (status)
);

-- 3. Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(36) PRIMARY KEY,
    eventId VARCHAR(36) NOT NULL,
    eventTitle VARCHAR(255) NOT NULL,
    eventDate DATETIME NOT NULL,
    eventVenue VARCHAR(255) NOT NULL,
    eventCategory VARCHAR(255),
    eventImage VARCHAR(512),
    buyerId VARCHAR(36) NOT NULL,
    buyerName VARCHAR(255) NOT NULL,
    row VARCHAR(50),
    number VARCHAR(50),
    zone VARCHAR(100),
    quantity INT DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('active', 'used', 'cancelled') DEFAULT 'active',
    pdfUrl VARCHAR(512),
    paymentIntentId VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (buyerId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX (eventId),
    INDEX (buyerId)
);

-- 4. SponsorRequests Table
CREATE TABLE IF NOT EXISTS sponsorRequests (
    id VARCHAR(36) PRIMARY KEY,
    eventId VARCHAR(36) NOT NULL,
    eventTitle VARCHAR(255) NOT NULL,
    organizerId VARCHAR(36) NOT NULL,
    sponsorId VARCHAR(36) NOT NULL,
    sponsorName VARCHAR(255) NOT NULL,
    sponsorCompany VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    message TEXT,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    responseNote TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (organizerId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sponsorId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX (eventId),
    INDEX (organizerId),
    INDEX (sponsorId)
);

-- 5. SystemLogs Table
CREATE TABLE IF NOT EXISTS systemLogs (
    id VARCHAR(36) PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    userId VARCHAR(36),
    role VARCHAR(50),
    email VARCHAR(255),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);
