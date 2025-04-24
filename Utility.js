let db;
require('dotenv').config();
// Check if MySQL or SQLite should be used (based on the environment variable)
const isMySQL = process.env.DB === 'mysql';
console.log(isMySQL);
// Use MySQL if the environment variable is set to 'mysql', otherwise use SQLite
if (isMySQL) {
  
const mysql = require('mysql2');
  const db = mysql.createPool({
    host: process.env.DB_HOST,          // Database host from environment variable
    user: process.env.DB_USER,          // Database username from environment variable
    password: process.env.DB_PASSWORD,  // Database password from environment variable
    database: process.env.DB_NAME,      // Database name from environment variable
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} else {
  const sqlite3 = require('sqlite3').verbose();
  db = new sqlite3.Database('./schools.db'); // For local SQLite database
}

// Create schools table if not exists (for both MySQL and SQLite)
const createTable = () => {
  const sql = isMySQL
    ? `CREATE TABLE IF NOT EXISTS schools (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        latitude DOUBLE NOT NULL,
        longitude DOUBLE NOT NULL,
        UNIQUE KEY unique_name_address (name, address),
        UNIQUE KEY unique_lat_lon (latitude, longitude)
      )`
    : `CREATE TABLE IF NOT EXISTS schools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        UNIQUE(name, address),
        UNIQUE(latitude, longitude)
      )`;

  db.query ? db.query(sql, (err) => { if (err) console.error('Error creating table:', err); }) : db.run(sql);
};

// Insert school data into the database (both for MySQL and SQLite)
const insertSchoolToDB = (name, address, latitude, longitude, callback) => {
  console.log('Inserting school:', name, address, latitude, longitude);

  const sql = isMySQL
    ? 'INSERT IGNORE INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)'
    : 'INSERT OR IGNORE INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';

  const params = [name, address, latitude, longitude];
  
  if (isMySQL) {
    db.query(sql, params, (err, result) => {
      if (err) {
        console.error('Error inserting school:', err);
        return callback(err);
      }
      console.log('Rows affected:', result.affectedRows);
      if (result.affectedRows === 0) {
        console.log('Duplicate school detected.');
        callback(null, { message: 'Duplicate school (name, address) or (lat,lon). Not inserted.' });
      } else {
        console.log('School inserted with ID:', result.insertId);
        callback(null, { message: "School inserted Successfully", insertId: result.insertId });
      }
    });
  } else {
    db.run(sql, params, function (err) {
      if (err) {
        console.error('Error inserting school:', err);
        return callback(err);
      }

      console.log('Number of changes:', this.changes);
      if (this.changes === 0) {
        console.log('Duplicate school detected.');
        callback(null, { message: 'Duplicate school (name, address) or (lat,lon). Not inserted.' });
        return;
      }

      console.log('School inserted with ID:', this.lastID);
      callback(null, { message: "School inserted Successfully", insertId: this.lastID });
    });
  }
};

// Get all schools and calculate distance from user location (both for MySQL and SQLite)
const getSchoolsFromDB = (userLat, userLon, callback) => {
  const sql = 'SELECT id, name, address, latitude, longitude FROM schools';

  if (isMySQL) {
    db.query(sql, [], (err, rows) => {
      if (err) return callback(err);
      const sorted = rows.map(school => {
        const distance = calculateDistance(userLat, userLon, school.latitude, school.longitude);
        return { ...school, distance };
      }).sort((a, b) => a.distance - b.distance);
      callback(null, sorted);
    });
  } else {
    db.all(sql, [], (err, rows) => {
      if (err) return callback(err);
      const sorted = rows.map(school => {
        const distance = calculateDistance(userLat, userLon, school.latitude, school.longitude);
        return { ...school, distance };
      }).sort((a, b) => a.distance - b.distance);
      callback(null, sorted);
    });
  }
};

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get user's geolocation using IP (optional fallback)
const getGeoLocationBasedOnIP = async (ip) => {
  const axios = require('axios');
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    if (response.data.status === 'success') {
      return { lat: response.data.lat, lon: response.data.lon };
    } else {
      throw new Error('Unable to get geolocation from IP');
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createTable,
  insertSchoolToDB,
  getSchoolsFromDB,
  getGeoLocationBasedOnIP
};
