const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./schools.db');

// Create schools table if not exists
const createTable = () => {
  db.run(`CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    UNIQUE(name, address),  -- Ensures no duplicate name + address
    UNIQUE(latitude, longitude)  -- Ensures no duplicate lat + lon
  )`);
};



// Insert school data into the database
const insertSchoolToDB = (name, address, latitude, longitude, callback) => {
  console.log('Inserting school:', name, address, latitude, longitude);  // Log the values you're trying to insert

  const sql = 'INSERT OR IGNORE INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
  db.run(sql, [name, address, latitude, longitude], function (err) {
    if (err) {
      console.error('Error inserting school:', err);  // Log any errors
      return callback(err);
    }

    console.log('Number of changes:', this.changes);  // Log the number of affected rows

    // If no rows were inserted, it's a duplicate
    if (this.changes === 0) {
      console.log('Duplicate school detected.');
       callback(null, { message: 'Duplicate school (name, address) or (lat,lon). Not inserted.' });
       return;
    }

    // If rows were inserted, return the insertId
    console.log('School inserted with ID:', this.lastID);
    callback(null, { message: "School inserted Successfully ", insertId: this.lastID });
  });
};




// Get all schools and calculate distance from user location
const getSchoolsFromDB = (userLat, userLon, callback) => {
  const sql = 'SELECT id, name, address, latitude, longitude FROM schools';
  db.all(sql, [], (err, rows) => {
    if (err) return callback(err);
    console.log(rows)
    const sorted = rows.map(school => {
      const distance = calculateDistance(userLat, userLon, school.latitude, school.longitude);
      return { ...school, distance };
    }).sort((a, b) => a.distance - b.distance);

    callback(null, sorted);
  });
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