const userSchema = require("../schemas/userSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  createTable,
  checkTableExists,
  checkRecordExists,
  insertRecord,
} = require("../utils/sqlFunctions");

const register = async (req, res) => {
  const { email, username, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = {
    username,
    email,
    password: hashedPassword,
  };

  try {
    const tableExists = await checkTableExists("users");

    if (tableExists) {
      const userAlreadyExists = await checkRecordExists(
        "users",
        "email",
        email
      );

      if (userAlreadyExists) {
        res.status(409).json({ error: "Email already exists" });
      } else {
        await insertRecord("users", newUser);
        res.status(201).json({ message: "User Created successfully!" });
      }
    } else {
      await createTable(userSchema);
      await insertRecord("users", newUser);
      res.status(201).json({ message: "User Created successfully!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  res.status(200).send("Login succesful");
};

module.exports = {
  register,
  login,
};
