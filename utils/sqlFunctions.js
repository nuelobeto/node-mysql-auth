const mysql = require("mysql");
const config = require("../config/config");
const pool = mysql.createPool(config);

const checkTableExists = (tableName) => {
  return new Promise((resolve, reject) => {
    const query = `
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = ?
            AND table_name = ?
        `;

    pool.query(query, ["node-mysql-auth", tableName], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0);
      }
    });
  });
};

const createTable = (schema) => {
  return new Promise((resolve, reject) => {
    pool.query(schema, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const checkRecordExists = (tableName, column, value) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM ${tableName} WHERE ${column} = ?`;

    pool.query(query, [value], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length ? results[0] : null);
      }
    });
  });
};

const insertRecord = (tableName, record) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO ${tableName} SET ?`;

    pool.query(query, [record], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const updateRecord = (tableName, updates, column, value) => {
  return new Promise((resolve, reject) => {
    const columnValues = Object.keys(updates)
      .map((column) => `${column} = ?`)
      .join(", ");
    const query = `UPDATE ${tableName} SET ${columnValues} WHERE ${column} = ?`;

    pool.query(query, Object.values(updates).concat(value), (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const deleteRecord = (tableName, column, value) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM ${tableName} WHERE ${column} = ?`;

    pool.query(query, [value], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = {
  checkTableExists,
  createTable,
  checkRecordExists,
  insertRecord,
  updateRecord,
  deleteRecord,
};
