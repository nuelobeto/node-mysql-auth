const mysql = require("mysql");
const config = require("./config");

const connectDB = async () => {
  const pool = mysql.createPool(process.env.DATABASE_URL);

  pool.getConnection((err, connection) => {
    if (err) {
      console.log({ error: err.message });
    }

    console.log("Connected to MySQL database");
    connection.release();
  });
};

module.exports = connectDB;
