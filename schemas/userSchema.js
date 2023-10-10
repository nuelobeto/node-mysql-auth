const userSchema = `
    CREATE TABLE IF NOT EXISTS users (
        userId VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255),
        verified BOOLEAN DEFAULT false
    )
`;

module.exports = userSchema;
