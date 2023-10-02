const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
dotenv.config();
const port = process.env.PORT;
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", authRoutes);

connectDB();

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
