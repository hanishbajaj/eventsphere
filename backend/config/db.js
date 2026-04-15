require('dotenv').config();
const mysql = require('mysql2/promise');

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;