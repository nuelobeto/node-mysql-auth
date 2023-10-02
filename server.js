const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const port = 5000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
