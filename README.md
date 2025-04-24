# 🏫 School Locator API

This is a simple and effective full-stack project that allows users to add schools and list schools nearby based on their current location. It is built using **Node.js**, **Express.js**, and **SQLite** for the backend, and is easily accessible both locally and online.

## 🌐 Live URL

You can check out the live version of the API here:  
👉 [https://school-api-0iou.onrender.com/](https://school-api-0iou.onrender.com/)

---

## 🚀 Features

- 📌 Add new schools with name, address, and optional latitude/longitude.
- 📍 List schools based on the user's location (auto-detected using IP or passed manually).
- 🗃️ Uses a local SQLite database to manage school data.
- 🔄 Automatically creates the database table if it doesn't exist.
- ⚡ Postman collection available for testing all endpoints.

---

## 🛠️ Technologies Used

- **Node.js** – JavaScript runtime for backend
- **Express.js** – Web framework for handling routes and APIs
- **SQLite** – Lightweight local database
- **body-parser** – Middleware to parse incoming request bodies
- **cors** – To enable cross-origin requests
- **Render** – Hosting the API live

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KoushikBinary01/School-API
   cd School-API
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the server:**
   ```bash
   node server.js
   ```

   The server runs at [http://localhost:3000](http://localhost:3000)

---

## 📫 API Endpoints

### `POST /addSchool`

Add a new school.

**Body Parameters (JSON):**
```json
{
  "name": "ABC Public School",
  "address": "Main Road, Delhi",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

> Latitude and longitude are optional. If not provided, location will be determined by IP.

---

### `GET /listSchools`

Returns a list of schools sorted by distance to the provided or detected location.

**Optional Query Params:**
- `lat` (latitude)
- `lon` (longitude)

Example:
```
GET /listSchools?lat=28.6139&lon=77.2090
```

If no parameters are passed, IP-based geolocation is used.

---

## 📁 Folder Structure

```
├── server.js             # Main server file
├── Utility.js            # Database and helper functions
├── schools.db            # SQLite database
├── public/               # Static frontend (if needed)
├── package.json          # Project metadata
```

---

## 🧪 Postman Collection

You can test the APIs using the Postman collection provided in the project root.  
If you don’t have it, you can quickly set one up by:

1. Creating two endpoints:
   - `POST /addSchool` with raw JSON body.
   - `GET /listSchools` with query parameters or none.

---

## 💡 Future Improvements

- Add authentication for admin users.
- Provide distance and sorting filters on the frontend.
- Store and fetch data from cloud database in production.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 🙋‍♂️ Author

Developed by **Nelakanti Koushik**  
GitHub: [koushikbinary01](https://github.com/koushikbinary01)  

---