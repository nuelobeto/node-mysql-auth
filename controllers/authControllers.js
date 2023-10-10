const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const userSchema = require("../schemas/userSchema");
const bcrypt = require("bcryptjs");
const {
  createTable,
  checkRecordExists,
  insertRecord,
  updateRecord,
  deleteRecord,
} = require("../utils/sqlFunctions");
const { generateLink, verifyToken } = require("../utils/tokenFunctions");
const sendEmail = require("../utils/sendMail");

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const sendEmailVerificationLink = async (user) => {
  const backendUrl = `${process.env.BASE_URL}/verify_email`;
  const frontendUrl = `${process.env.FRONTEND_URL}/verify_email`;
  const verificationLink = await generateLink(
    user.userId,
    backendUrl,
    frontendUrl
  );
  const message = `
    <h3>Welcome to MERN-Auth-Tutorial.</h3>
    <p>Please click the link below to verify your email.</p>
    <a href="${verificationLink}">verify email</a>
  `;

  await sendEmail(user.email, "verify email", message);
};

// ROUTES

const register = async (req, res) => {
  const { email, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = {
    userId: uuidv4(),
    email,
    password: hashedPassword,
  };

  try {
    const userAlreadyExists = await checkRecordExists("users", "email", email);

    if (userAlreadyExists) {
      res.status(409).json({ error: "Email already exists" });
    } else {
      await createTable(userSchema);
      await insertRecord("users", user);
      await sendEmailVerificationLink(user);
      res.status(201).json({ message: "user created successfully!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const { userId, token, expires, redirect } = req.query;
  const isTokenValid = await verifyToken(token, expires);
  const errorUrl = `${process.env.FRONTEND_URL}/invalid_link`;

  try {
    if (isTokenValid) {
      const userExists = await checkRecordExists("users", "userId", userId);
      if (userExists) {
        const updates = {
          verified: true,
        };
        console.log(req.query);
        await updateRecord("users", updates, "userId", userId);
        await deleteRecord("tokens", "token", token);
        res.redirect(redirect);
      } else {
        res.redirect(errorUrl);
      }
    } else {
      res.redirect(errorUrl);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const resendEmailVerificationLink = async (req, res) => {
  const userId = req.params.userId;
  const user = await checkRecordExists("users", "userId", userId);

  await sendEmailVerificationLink(user);

  res.send("Email sent");
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
          access_token: generateAccessToken(existingUser.userId),
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

const googleAuth = async (req, res) => {
  const { email } = req.body;
  const user = {
    userId: uuidv4(),
    email,
    verified: true,
  };

  try {
    const existingUser = await checkRecordExists("users", "email", email);

    if (existingUser) {
      delete existingUser.password;

      res.status(200).json({
        ...existingUser,
        access_token: generateAccessToken(existingUser.userId),
      });
    } else {
      await createTable(userSchema);
      await insertRecord("users", user);
      const existingUser = await checkRecordExists("users", "email", email);

      delete existingUser.password;

      res.status(200).json({
        ...existingUser,
        access_token: generateAccessToken(existingUser.userId),
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sendPasswordResetLink = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await checkRecordExists("users", "email", email);

    if (user) {
      const backendUrl = `${process.env.BASE_URL}/verify_password_rest_link`;
      const frontendUrl = `${process.env.FRONTEND_URL}/reset_password`;
      const resetLink = await generateLink(
        user.userId,
        backendUrl,
        frontendUrl
      );
      const message = `
    <h3>Welcome to MERN-Auth-Tutorial.</h3>
    <p>Please click the link below to reset your password.</p>
    <a href="${resetLink}">Update password</a>
  `;

      await sendEmail(user.email, "verify email", message);

      res.status(201).json({
        message: "A link to update your password has been sent to your email",
      });
    } else {
      res.status(401).json({ error: "Invalid Credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const verifyResetPasswordLink = async (req, res) => {
  const { userId, token, expires, redirect } = req.query;
  const isTokenValid = await verifyToken(token, expires);
  const errorUrl = `${process.env.FRONTEND_URL}/invalid_reset_link`;

  try {
    if (isTokenValid) {
      const userExists = await checkRecordExists("users", "userId", userId);
      if (userExists) {
        await deleteRecord("tokens", "token", token);
        res.redirect(redirect);
      } else {
        await deleteRecord("tokens", "token", token);
        res.redirect(errorUrl);
      }
    } else {
      await deleteRecord("tokens", "token", token);
      res.redirect(errorUrl);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const resetPassword = async (req, res) => {
  const userId = req.params.userId;
  const { password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const updates = {
      password: hashedPassword,
    };

    await updateRecord("users", updates, "userId", userId);
    res.status(200).json({ message: "Password successfully updated" });
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  register,
  verifyEmail,
  resendEmailVerificationLink,
  login,
  googleAuth,
  sendPasswordResetLink,
  verifyResetPasswordLink,
  resetPassword,
};
