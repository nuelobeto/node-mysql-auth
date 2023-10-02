const register = async (req, res) => {
  res.status(201).send("User created");
};

const login = async (req, res) => {
  res.status(200).send("Login succesful");
};

module.exports = {
  register,
  login,
};
