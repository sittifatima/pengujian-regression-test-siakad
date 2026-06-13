// utils/validateMapel.js
// Fungsi validasi untuk data Mata Pelajaran (digunakan oleh endpoint POST /api/data)

/**
 * Memvalidasi payload mata pelajaran.
 * @param {object} body - { nama_mapel, kkm }
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateMapel(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Body request tidak valid.'] };
  }

  const { nama_mapel, kkm } = body;

  if (!nama_mapel || typeof nama_mapel !== 'string' || nama_mapel.trim() === '') {
    errors.push('nama_mapel wajib diisi dan harus berupa teks.');
  }

  if (kkm !== undefined) {
    const kkmNum = Number(kkm);
    if (Number.isNaN(kkmNum)) {
      errors.push('kkm harus berupa angka.');
    } else if (kkmNum < 0 || kkmNum > 100) {
      errors.push('kkm harus berada pada rentang 0 - 100.');
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateMapel };
