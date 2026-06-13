// tests/validateMapel.test.js
// Unit test untuk fungsi validasi utils/validateMapel.js

const { validateMapel } = require('../utils/validateMapel');

describe('validateMapel', () => {
  test('valid ketika nama_mapel dan kkm dalam rentang benar (happy path)', () => {
    // Arrange
    const input = { nama_mapel: 'Matematika', kkm: 80 };

    // Act
    const result = validateMapel(input);

    // Assert
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('valid ketika kkm tidak disertakan (opsional)', () => {
    // Arrange
    const input = { nama_mapel: 'Matematika' };

    // Act
    const result = validateMapel(input);

    // Assert
    expect(result.valid).toBe(true);
  });

  test('tidak valid ketika body bukan object (edge case)', () => {
    // Arrange & Act
    const result = validateMapel(null);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/Body request tidak valid/);
  });

  test('tidak valid ketika kkm bukan angka (edge case)', () => {
    // Arrange
    const input = { nama_mapel: 'Matematika', kkm: 'delapan puluh' };

    // Act
    const result = validateMapel(input);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('kkm harus berupa angka.');
  });
});
