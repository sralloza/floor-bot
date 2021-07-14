const dotenv = require("dotenv");
const { warn } = require("winston");

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";

const envFound = dotenv.config();
if (envFound.error) {
  warn("⚠️  Couldn't find .env file  ⚠️");
}

module.exports = {
  type: "mysql",
  host: process.env.DATABASE_HOST,
  port: 3306,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: "test2",
  synchronize: true,
  logging: false,
  entities: ["build/src/models/**/*.js"],
  migrations: ["src/migrations/**/*.js"],
  subscribers: ["src/subscribers/**/*.js"],
  cli: {
    entitiesDir: "build/src/models",
    migrationsDir: "src/migrations",
    subscribersDir: "src/subscribers",
  },
};
