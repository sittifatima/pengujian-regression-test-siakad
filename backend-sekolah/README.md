# Regression Test Suite — Endpoint `/api/data` (Mata Pelajaran)

Dokumen ini menjelaskan implementasi **Regression Test Suite** untuk tugas mata
kuliah *Pengujian dan Jaminan Kualitas Perangkat Lunak* pada project
**Aplikasi Manajemen Sekolah (SIAKAD)**.

Endpoint yang diuji adalah CRUD generik `/api/data` yang dipetakan ke entitas
**Mata Pelajaran**, ditambahkan khusus di:

- `routes/dataRoutes.js` — definisi endpoint REST API (CRUD)
- `utils/validateMapel.js` — fungsi validasi input
- `app.js` — Express app (tanpa `app.listen`) agar bisa diimpor oleh test
- `tests/data.test.js` — regression test suite (Jest + Supertest)
- `tests/validateMapel.test.js` — unit test untuk fungsi validasi

## Endpoint yang Tersedia

| Method | Endpoint        | Keterangan                       |
|--------|-----------------|-----------------------------------|
| GET    | `/api/data`     | Ambil semua data mata pelajaran   |
| GET    | `/api/data/:id` | Ambil data berdasarkan ID         |
| POST   | `/api/data`     | Tambah data baru                  |
| PUT    | `/api/data/:id` | Update data berdasarkan ID        |
| DELETE | `/api/data/:id` | Hapus data berdasarkan ID         |

Format body untuk `POST` / `PUT`:

```json
{
  "nama_mapel": "Matematika",
  "kkm": 75
}
```

- `nama_mapel` **wajib** diisi (string, tidak boleh kosong).
- `kkm` **opsional**, default `75`, harus angka 0–100.

## Cara Menjalankan

### 1. Install dependency

```bash
cd backend-sekolah
npm install
```

### 2. Jalankan server (development, menggunakan MySQL)

```bash
npm start
```

### 3. Jalankan test suite (menggunakan SQLite in-memory)

```bash
npm test
```

Test berjalan dengan `NODE_ENV=test`, sehingga `config/database.js` otomatis
beralih ke **SQLite in-memory** (tidak butuh koneksi MySQL). Setiap test
dijalankan secara independen — tabel dibersihkan setelah setiap test
(`afterEach`), dan koneksi database baru disinkronkan dari nol sebelum semua
test berjalan (`beforeAll`).

### 4. Jalankan test dengan laporan code coverage

```bash
npm test -- --coverage
```

Threshold minimum yang ditetapkan pada `package.json` (jest.coverageThreshold)
adalah **75%** untuk *statements*, *branches*, *functions*, dan *lines*.
Jika coverage di bawah 75%, perintah `npm test` akan **gagal (exit code ≠ 0)**.

#### Contoh hasil coverage

```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   96.00 |    90.00 |   100.00|   96.00 |
 routes            |   97.00 |    91.00 |   100.00|   97.00 |
  dataRoutes.js    |   97.00 |    91.00 |   100.00|   97.00 | 24
 utils             |   95.00 |    87.00 |   100.00|   95.00 |
  validateMapel.js |   95.00 |    87.00 |   100.00|   95.00 | 19
-------------------|---------|----------|---------|---------|-------------------
```

> Catatan: jalankan `npm test -- --coverage` di mesin Anda lalu tempel
> screenshot terminal hasil sebenarnya ke laporan, sesuai instruksi tugas
> (poin "Code Coverage" pada kriteria penilaian).

## Daftar Test Case (16 test, AAA pattern)

Setiap test menggunakan pola **Arrange–Act–Assert**.

### `tests/data.test.js` (12 test, melalui HTTP via Supertest)

| # | Endpoint | Skenario | Tipe |
|---|----------|----------|------|
| 1 | GET `/api/data` | Mengembalikan array kosong saat belum ada data | Happy path |
| 2 | GET `/api/data` | Mengembalikan seluruh data yang tersimpan | Happy path |
| 3 | GET `/api/data/:id` | Mengembalikan data sesuai ID valid | Happy path |
| 4 | GET `/api/data/:id` | 404 ketika ID tidak ditemukan | Edge case |
| 5 | GET `/api/data/:id` | 400 ketika format ID tidak valid (`abc`) | Edge case |
| 6 | POST `/api/data` | Berhasil menambah data dengan input valid | Happy path |
| 7 | POST `/api/data` | Default `kkm = 75` jika tidak dikirim | Happy path |
| 8 | POST `/api/data` | 400 ketika `nama_mapel` tidak diisi | Edge case |
| 9 | POST `/api/data` | 400 ketika body kosong | Edge case |
| 10| POST `/api/data` | 400 ketika `kkm` di luar rentang 0–100 | Edge case |
| 11| PUT `/api/data/:id` | Berhasil memperbarui data | Happy path |
| 12| PUT `/api/data/:id` | 404 ketika ID tidak ditemukan | Edge case |
| 13| PUT `/api/data/:id` | 400 ketika input tidak valid | Edge case |
| 14| DELETE `/api/data/:id` | Berhasil menghapus data | Happy path |
| 15| DELETE `/api/data/:id` | 404 ketika ID tidak ditemukan | Edge case |
| 16| DELETE `/api/data/:id` | 400 ketika format ID tidak valid | Edge case |

### `tests/validateMapel.test.js` (4 test, unit test fungsi validasi)

| # | Skenario | Tipe |
|---|----------|------|
| 1 | Valid jika `nama_mapel` dan `kkm` benar | Happy path |
| 2 | Valid jika `kkm` tidak dikirim (opsional) | Happy path |
| 3 | Tidak valid jika body bukan object | Edge case |
| 4 | Tidak valid jika `kkm` bukan angka | Edge case |

Total: **16 test case**, mencakup minimal 2 test per endpoint, happy path
dan edge case (ID tidak ditemukan, input tidak valid, data kosong).

## Demonstrasi Skenario Regresi

Untuk menunjukkan bagaimana test suite mendeteksi regresi, lakukan simulasi
berikut pada `utils/validateMapel.js`:

1. **Sebelum perubahan** — jalankan `npm test`. Semua 16 test harus **lulus**.

2. **Simulasikan bug** — ubah validasi `kkm` agar menerima nilai di luar
   rentang 0–100 (hapus / komentari blok pengecekan rentang):

   ```js
   // utils/validateMapel.js
   if (kkm !== undefined) {
     const kkmNum = Number(kkm);
     if (Number.isNaN(kkmNum)) {
       errors.push('kkm harus berupa angka.');
     }
     // else if (kkmNum < 0 || kkmNum > 100) {
     //   errors.push('kkm harus berada pada rentang 0 - 100.');
     // }
   }
   ```

3. **Jalankan ulang `npm test`** — test case
   `"POST /api/data > mengembalikan 400 ketika kkm berada di luar rentang 0-100 (edge case)"`
   akan **gagal (FAIL)**, karena API sekarang mengembalikan status `201`
   bukan `400` yang diharapkan. Ini membuktikan test berhasil mendeteksi
   regresi pada validasi.

4. **Kembalikan kode ke kondisi semula** (uncomment blok validasi) dan
   jalankan `npm test` lagi — seluruh 16 test kembali **PASS**, menunjukkan
   bug telah diperbaiki dan tidak ada regresi lain yang muncul.

## CI/CD — GitHub Actions

Pipeline pengujian otomatis didefinisikan di
`.github/workflows/test.yml`. Pipeline ini berjalan otomatis pada setiap
`push` dan `pull_request`, melakukan:

1. Checkout repository
2. Setup Node.js 20.x
3. `npm ci` (install dependency sesuai `package-lock.json`)
4. `npm test -- --coverage` (jalankan seluruh test suite + cek threshold coverage)

Jika ada test yang gagal atau coverage di bawah 75%, pipeline akan
menampilkan status **failed** pada tab *Actions* di GitHub, dan badge status
di bawah akan menunjukkan ❌.

### Badge Status CI

Tambahkan badge berikut ke bagian atas README repository Anda (sesuaikan
`OWNER` dan `REPO` dengan username/nama repo GitHub Anda):

```markdown
![Regression Test Suite](https://github.com/OWNER/REPO/actions/workflows/test.yml/badge.svg)
```

## Struktur Folder Tambahan

```
backend-sekolah/
├── app.js                     # Express app (untuk testing & produksi)
├── server.js                  # Entry point server (sudah include /api/data)
├── routes/
│   └── dataRoutes.js          # Endpoint CRUD /api/data
├── utils/
│   └── validateMapel.js       # Fungsi validasi input
├── tests/
│   ├── data.test.js           # Regression test (Supertest)
│   └── validateMapel.test.js  # Unit test validasi
└── .github/workflows/test.yml # GitHub Actions CI
```
