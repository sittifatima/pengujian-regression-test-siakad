// app.js
// Membungkus konfigurasi Express agar bisa diimpor oleh server.js (production)
// maupun oleh test suite (Jest + Supertest) tanpa memanggil app.listen().

const express = require('express');
const cors = require('cors');

const dataRoutes = require('./routes/dataRoutes');

const app = express();
app.use(cors());

// Memperbesar batas JSON untuk foto Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ==========================================
// ROUTES
// ==========================================
app.use('/api', dataRoutes);

module.exports = app;
