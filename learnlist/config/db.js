// db.js
const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PW || '',
    database: process.env.DB_NAME || 'learnlistsdb',
    port: process.env.DB_PORT || 3306,
});

module.exports = db;
