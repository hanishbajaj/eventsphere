const pool = require('./db');

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('buyer','organizer','sponsor','admin') NOT NULL,
        company VARCHAR(255) DEFAULT NULL,
        avatar VARCHAR(512),
        banned TINYINT(1) DEFAULT 0,
        budget DECIMAL(10,2) DEFAULT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        date DATETIME,
        endDate DATETIME,
        venue VARCHAR(255),
        address VARCHAR(512),
        description TEXT,
        price DECIMAL(10,2),
        image LONGTEXT,
        tags VARCHAR(255),
        status VARCHAR(50),
        featured TINYINT(1) DEFAULT 0,
        organizerId VARCHAR(36),
        organizerName VARCHAR(255),
        seats JSON,
        ticketsSold INT DEFAULT 0,
        revenue DECIMAL(10,2) DEFAULT 0.00,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id VARCHAR(36) PRIMARY KEY,
        eventId VARCHAR(36),
        eventTitle VARCHAR(255),
        eventDate DATETIME,
        eventVenue VARCHAR(255),
        eventCategory VARCHAR(100),
        eventImage LONGTEXT,
        buyerId VARCHAR(36),
        buyerName VARCHAR(255),
        \`row\` VARCHAR(10),
        number INT,
        zone VARCHAR(50),
        quantity INT,
        price DECIMAL(10,2),
        status VARCHAR(50),
        pdfUrl VARCHAR(512),
        paymentIntentId VARCHAR(255),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS systemLogs (
        id VARCHAR(36) PRIMARY KEY,
        action VARCHAR(100),
        userId VARCHAR(36),
        role VARCHAR(50),
        email VARCHAR(255),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sponsorRequests (
        id VARCHAR(36) PRIMARY KEY,
        eventId VARCHAR(36),
        eventTitle VARCHAR(255),
        organizerId VARCHAR(36),
        sponsorId VARCHAR(36),
        sponsorName VARCHAR(255),
        sponsorCompany VARCHAR(255),
        amount DECIMAL(10,2),
        message TEXT,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        responseNote TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(36) PRIMARY KEY,
        eventId VARCHAR(36) NOT NULL,
        userId VARCHAR(36) NOT NULL,
        rating INT NOT NULL,
        comment TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_review (eventId, userId)
      );
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (err) {
    console.error('❌ Failed to initialize database tables:', err.message);
  }
};

module.exports = initDB;
