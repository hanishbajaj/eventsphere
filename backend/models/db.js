const pool = require('../config/db');

module.exports = {
  pool, // Expose pool directly if needed

  async findById(table, id) {
    const [rows] = await pool.query(`SELECT * FROM ?? WHERE id = ?`, [table, id]);
    return rows[0] || null;
  },

  async findOne(table, conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    if (keys.length === 0) return null;

    const whereClause = keys.map(k => `?? = ?`).join(' AND ');
    const queryParams = [];
    keys.forEach((k, i) => {
      queryParams.push(k, values[i]);
    });

    const [rows] = await pool.query(`SELECT * FROM ?? WHERE ${whereClause} LIMIT 1`, [table, ...queryParams]);
    return rows[0] || null;
  },

  async findAll(table, conditions = {}) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);

    if (keys.length === 0) {
      const [rows] = await pool.query(`SELECT * FROM ??`, [table]);
      return rows;
    }

    const whereClause = keys.map(k => `?? = ?`).join(' AND ');
    const queryParams = [];
    keys.forEach((k, i) => {
      queryParams.push(k, values[i]);
    });

    const [rows] = await pool.query(`SELECT * FROM ?? WHERE ${whereClause}`, [table, ...queryParams]);
    return rows;
  },

  async create(table, data) {
    // If the data has JSON fields that need stringifying
    // In MySQL2, objects/arrays are automatically converted to JSON strings if the column is JSON type
    // However, it's safer to explicitly stringify arrays if mysql2 doesn't handle them perfectly.
    // The instructions say: "When inserting: JSON.stringify(seats)"
    const processedData = { ...data };
    if (processedData.seats && typeof processedData.seats !== 'string') {
      processedData.seats = JSON.stringify(processedData.seats);
    }
    if (processedData.tags && typeof processedData.tags !== 'string') {
      processedData.tags = JSON.stringify(processedData.tags);
    }

    await pool.query(`INSERT INTO ?? SET ?`, [table, processedData]);
    return module.exports.findById(table, data.id);
  },

  async updateById(table, id, data) {
    const processedData = { ...data };
    if (processedData.seats && typeof processedData.seats !== 'string') {
      processedData.seats = JSON.stringify(processedData.seats);
    }
    if (processedData.tags && typeof processedData.tags !== 'string') {
      processedData.tags = JSON.stringify(processedData.tags);
    }

    const [result] = await pool.query(`UPDATE ?? SET ? WHERE id = ?`, [table, processedData, id]);
    if (result.affectedRows === 0) return null;
    return module.exports.findById(table, id);
  },

  async deleteById(table, id) {
    const [result] = await pool.query(`DELETE FROM ?? WHERE id = ?`, [table, id]);
    return result.affectedRows > 0;
  },

  async query(sql, params) {
    const [rows] = await pool.query(sql, params);
    return rows;
  }
};
