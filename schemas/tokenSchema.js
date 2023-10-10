const Token = `
    CREATE TABLE IF NOT EXISTS tokens (
      tokenId VARCHAR(255) UNIQUE NOT NULL,
      token VARCHAR(255) NOT NULL
    )
  `;

module.exports = Token;
