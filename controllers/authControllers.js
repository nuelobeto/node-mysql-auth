const userSchema = require("../schemas/userSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  createTable,
  checkTableExists,
  checkRecordExists,
  insertRecord,
} = require("../utils/sqlFunctions");

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

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
  const { email, password } = req.body;

  try {
    const existingUser = await checkRecordExists("users", "email", email);

    if (existingUser) {
      const passwordMatch = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (passwordMatch) {
        delete existingUser.password;
        res.status(200).json({
          ...existingUser,
          access_token: generateAccessToken(),
        });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
};
