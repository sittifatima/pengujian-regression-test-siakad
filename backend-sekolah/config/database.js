// config/database.js
const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.NODE_ENV === 'test') {
  // Gunakan SQLite in-memory saat testing / CI agar tidak butuh MySQL
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false,
  });
} else {
  // Format: new Sequelize('nama_database', 'username', 'password', { options })
  sequelize = new Sequelize('siakad_sekolah_orm', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // Ubah ke console.log jika ingin melihat raw SQL yang di-generate
  });

  // Tes koneksi (hanya relevan untuk dev/production dengan MySQL)
  sequelize.authenticate()
    .then(() => console.log('Koneksi Sequelize berhasil.'))
    .catch(err => console.error('Tidak dapat terkoneksi ke database:', err));
}

module.exports = sequelize;
