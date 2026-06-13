// routes/dataRoutes.js
// Endpoint REST API CRUD generik untuk entitas Mata Pelajaran, dipetakan ke /api/data
// Endpoint ini dibuat khusus untuk memenuhi kebutuhan Regression Test Suite
// (Tugas: Pengujian dan Jaminan Kualitas Perangkat Lunak)

const express = require('express');
const router = express.Router();
const { MataPelajaran } = require('../models');
const { validateMapel } = require('../utils/validateMapel');

// GET /data - Ambil semua data
router.get('/data', async (req, res) => {
  try {
    const data = await MataPelajaran.findAll();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data.', error: error.message });
  }
});

// GET /data/:id - Ambil data berdasarkan ID
router.get('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ message: 'ID tidak valid. ID harus berupa angka.' });
    }

    const item = await MataPelajaran.findByPk(id);

    if (!item) {
      return res.status(404).json({ message: 'Data tidak ditemukan.' });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data.', error: error.message });
  }
});

// POST /data - Tambah data baru
router.post('/data', async (req, res) => {
  try {
    const { valid, errors } = validateMapel(req.body);

    if (!valid) {
      return res.status(400).json({ message: 'Validasi gagal.', errors });
    }

    const { nama_mapel, kkm } = req.body;
    const newItem = await MataPelajaran.create({
      nama_mapel,
      kkm: kkm !== undefined ? kkm : 75,
    });

    res.status(201).json({ message: 'Data berhasil ditambahkan.', data: newItem });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menambahkan data.', error: error.message });
  }
});

// PUT /data/:id - Update data
router.put('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ message: 'ID tidak valid. ID harus berupa angka.' });
    }

    const item = await MataPelajaran.findByPk(id);

    if (!item) {
      return res.status(404).json({ message: 'Data tidak ditemukan.' });
    }

    const { valid, errors } = validateMapel(req.body);

    if (!valid) {
      return res.status(400).json({ message: 'Validasi gagal.', errors });
    }

    const { nama_mapel, kkm } = req.body;
    item.nama_mapel = nama_mapel;
    if (kkm !== undefined) item.kkm = kkm;
    await item.save();

    res.status(200).json({ message: 'Data berhasil diperbarui.', data: item });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui data.', error: error.message });
  }
});

// DELETE /data/:id - Hapus data
router.delete('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ message: 'ID tidak valid. ID harus berupa angka.' });
    }

    const deleted = await MataPelajaran.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: 'Data tidak ditemukan.' });
    }

    res.status(200).json({ message: 'Data berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus data.', error: error.message });
  }
});

module.exports = router;
