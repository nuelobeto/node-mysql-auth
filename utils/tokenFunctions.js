const crypto = require("crypto");
const tokenSchema = require("../schemas/tokenSchema");
const {
  insertRecord,
  createTable,
  checkRecordExists,
} = require("./sqlFunctions");
const { v4: uuidv4 } = require("uuid");
const uuid = uuidv4();

const generateLink = async (userId, backendUrl, frontendUrl) => {
  const token = crypto.randomBytes(16).toString("hex");
  const expirationTime = Date.now() + 120 * 1000;
  const link = `${backendUrl}?userId=${userId}&token=${token}&expires=${expirationTime}&redirect=${frontendUrl}/${userId}/${token}`;

  await createTable(tokenSchema);
  await insertRecord("tokens", { tokenId: uuid, token });

  return link;
};

const verifyToken = async (token, expires) => {
  const tokenExists = await checkRecordExists("tokens", "token", token);
  const expiresAt = expires.split("?")[0];
  const currentTimestamp = Date.now();

  if (tokenExists) {
    if (currentTimestamp <= Number(expiresAt)) {
      return true;
    } else {
      console.log("link expired");
      return false;
    }
  } else {
    console.log("link not found");
    return false;
  }
};

module.exports = {
  uuid,
  generateLink,
  verifyToken,
};
