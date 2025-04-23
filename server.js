const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { connectToDB, insertSchoolToDB, getSchoolsFromDB, getGeoLocationBasedOnIP, createTable } = require('./Utility');



const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create table if it doesn't exist
createTable(); 


// Home route
app.get('/', (req, res) => {
  res.send('Welcome to the School API');
});

// Add School API
app.post('/addSchool', async (req, res) => {
  let { name, address, latitude, longitude } = req.body;

  if (!name || !address) {
    return res.status(400).json({ error: "Name and address are required" });
  }

  let lat, lon;

  if (latitude == null || longitude == null) {
    const rawIP = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
const ip = rawIP === '::1' || rawIP === '127.0.0.1' ? '8.8.8.8' : rawIP; // use Google Public DNS IP as fallback

    try {
      const geo = await getGeoLocationBasedOnIP(ip);
      lat = geo.lat;
      lon = geo.lon;
    } catch (err) {
      return res.status(400).json({ error: 'Could not determine location from IP' });
    }
  } else {
    lat = parseFloat(latitude);
    lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ error: 'Invalid latitude or longitude values' });
    }
  }

  insertSchoolToDB(name, address, lat, lon, (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error while adding school' });
    res.status(201).json({ message: result.message, schoolId: result.insertId });
  });
});

// List Schools API
app.get('/listSchools', async (req, res) => {
  let lat = parseFloat(req.query.lat);
  let lon = parseFloat(req.query.lon);

  if (isNaN(lat) || isNaN(lon)) {
    // Fallback to IP-based location
    const rawIP = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
const ip = rawIP === '::1' || rawIP === '127.0.0.1' ? '8.8.8.8' : rawIP; // use Google Public DNS IP as fallback

    try {
      const geo = await getGeoLocationBasedOnIP(ip);
      lat = geo.lat;
      lon = geo.lon;
      console.log(lat+" "+lon)
    } catch (err) {
      return res.status(400).json({ error: 'Latitude and Longitude are required or could not be determined from IP' });
    }
  }

  getSchoolsFromDB(lat, lon, (err, schools) => {
    if (err) return res.status(500).json({ error: 'Database error while fetching schools' });
    res.status(200).json({ schools });
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
