// tests/data.test.js
// Regression Test Suite untuk endpoint CRUD /api/data (Mata Pelajaran)
// Menggunakan Jest + Supertest, dengan database SQLite in-memory (NODE_ENV=test)

process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');
const { MataPelajaran } = require('../models');

// ==========================================
// SETUP & TEARDOWN
// ==========================================
beforeAll(async () => {
  // Sinkronisasi skema database in-memory sebelum semua test berjalan
  await sequelize.sync({ force: true });
});

afterEach(async () => {
  // Bersihkan tabel setelah setiap test agar test bersifat independen
  await MataPelajaran.destroy({ where: {}, truncate: true });
});

afterAll(async () => {
  await sequelize.close();
});

// ==========================================
// HELPER
// ==========================================
const buatMapel = async (overrides = {}) => {
  return MataPelajaran.create({
    nama_mapel: 'Matematika',
    kkm: 75,
    ...overrides,
  });
};

// ==========================================
// GET /api/data
// ==========================================
describe('GET /api/data', () => {
  test('mengembalikan array kosong ketika belum ada data (happy path)', async () => {
    // Arrange: tidak ada data yang dibuat

    // Act
    const response = await request(app).get('/api/data');

    // Assert
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(0);
  });

  test('mengembalikan seluruh data mata pelajaran yang tersimpan (happy path)', async () => {
    // Arrange
    await buatMapel({ nama_mapel: 'Matematika', kkm: 75 });
    await buatMapel({ nama_mapel: 'Bahasa Indonesia', kkm: 70 });

    // Act
    const response = await request(app).get('/api/data');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('nama_mapel');
    expect(response.body[0]).toHaveProperty('kkm');
  });
});

// ==========================================
// GET /api/data/:id
// ==========================================
describe('GET /api/data/:id', () => {
  test('mengembalikan data sesuai ID yang valid (happy path)', async () => {
    // Arrange
    const mapel = await buatMapel({ nama_mapel: 'Fisika', kkm: 80 });

    // Act
    const response = await request(app).get(`/api/data/${mapel.id}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(mapel.id);
    expect(response.body.nama_mapel).toBe('Fisika');
  });

  test('mengembalikan 404 ketika ID tidak ditemukan (edge case)', async () => {
    // Arrange: ID 9999 dipastikan tidak ada di database kosong

    // Act
    const response = await request(app).get('/api/data/9999');

    // Assert
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  test('mengembalikan 400 ketika ID berupa format yang tidak valid (edge case)', async () => {
    // Arrange: ID berupa string non-numerik

    // Act
    const response = await request(app).get('/api/data/abc');

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });
});

// ==========================================
// POST /api/data
// ==========================================
describe('POST /api/data', () => {
  test('berhasil menambah data baru dengan input valid (happy path)', async () => {
    // Arrange
    const payload = { nama_mapel: 'Kimia', kkm: 78 };

    // Act
    const response = await request(app).post('/api/data').send(payload);

    // Assert
    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.nama_mapel).toBe('Kimia');
    expect(response.body.data.kkm).toBe(78);

    const count = await MataPelajaran.count();
    expect(count).toBe(1);
  });

  test('menggunakan nilai KKM default (75) jika kkm tidak disertakan (happy path)', async () => {
    // Arrange
    const payload = { nama_mapel: 'Seni Budaya' };

    // Act
    const response = await request(app).post('/api/data').send(payload);

    // Assert
    expect(response.status).toBe(201);
    expect(response.body.data.kkm).toBe(75);
  });

  test('mengembalikan 400 ketika nama_mapel tidak diisi (edge case - input tidak valid)', async () => {
    // Arrange
    const payload = { kkm: 80 };

    // Act
    const response = await request(app).post('/api/data').send(payload);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.errors).toContain('nama_mapel wajib diisi dan harus berupa teks.');

    const count = await MataPelajaran.count();
    expect(count).toBe(0);
  });

  test('mengembalikan 400 ketika body request kosong (edge case - data kosong)', async () => {
    // Arrange: payload tidak dikirim sama sekali

    // Act
    const response = await request(app).post('/api/data').send({});

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
  });

  test('mengembalikan 400 ketika kkm berada di luar rentang 0-100 (edge case)', async () => {
    // Arrange
    const payload = { nama_mapel: 'Olahraga', kkm: 150 };

    // Act
    const response = await request(app).post('/api/data').send(payload);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.errors).toContain('kkm harus berada pada rentang 0 - 100.');
  });
});

// ==========================================
// PUT /api/data/:id
// ==========================================
describe('PUT /api/data/:id', () => {
  test('berhasil memperbarui data dengan input valid (happy path)', async () => {
    // Arrange
    const mapel = await buatMapel({ nama_mapel: 'Biologi', kkm: 70 });
    const payload = { nama_mapel: 'Biologi Lanjutan', kkm: 85 };

    // Act
    const response = await request(app).put(`/api/data/${mapel.id}`).send(payload);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.nama_mapel).toBe('Biologi Lanjutan');
    expect(response.body.data.kkm).toBe(85);

    const updated = await MataPelajaran.findByPk(mapel.id);
    expect(updated.nama_mapel).toBe('Biologi Lanjutan');
  });

  test('mengembalikan 404 ketika memperbarui ID yang tidak ditemukan (edge case)', async () => {
    // Arrange
    const payload = { nama_mapel: 'Geografi', kkm: 75 };

    // Act
    const response = await request(app).put('/api/data/9999').send(payload);

    // Assert
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  test('mengembalikan 400 ketika data update tidak valid (edge case)', async () => {
    // Arrange
    const mapel = await buatMapel({ nama_mapel: 'Sejarah', kkm: 70 });
    const payload = { nama_mapel: '', kkm: 70 };

    // Act
    const response = await request(app).put(`/api/data/${mapel.id}`).send(payload);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
  });
});

// ==========================================
// DELETE /api/data/:id
// ==========================================
describe('DELETE /api/data/:id', () => {
  test('berhasil menghapus data yang ada (happy path)', async () => {
    // Arrange
    const mapel = await buatMapel({ nama_mapel: 'PKN', kkm: 75 });

    // Act
    const response = await request(app).delete(`/api/data/${mapel.id}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');

    const found = await MataPelajaran.findByPk(mapel.id);
    expect(found).toBeNull();
  });

  test('mengembalikan 404 ketika menghapus ID yang tidak ditemukan (edge case)', async () => {
    // Arrange: database kosong

    // Act
    const response = await request(app).delete('/api/data/9999');

    // Assert
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  test('mengembalikan 400 ketika ID yang dihapus berformat tidak valid (edge case)', async () => {
    // Arrange: ID non-numerik

    // Act
    const response = await request(app).delete('/api/data/xyz');

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });
});
