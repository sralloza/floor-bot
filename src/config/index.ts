import dotenv from "dotenv";
import { warn } from "winston";
import ormsettings from "../../ormconfig";

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";

const envFound = dotenv.config();
if (envFound.error) {
  warn("⚠️  Couldn't find .env file  ⚠️");
}

// TODO: better settings checks

const settings = {
  port: parseInt(process.env.PORT || "80", 10),

  // TODO: rename to serverSecret
  jwtSecret: process.env.JWT_SECRET || "",
  jwtAlgorithm: process.env.JWT_ALGO || "",

  // TODO: unnest?
  logs: {
    level: process.env.LOG_LEVEL || "silly",
  },

  // TODO: unnest (apiPrefix or versionPrefix)
  api: {
    prefix: "/api",
  },

  orm: ormsettings,

  google_client_id: process.env.GOOGLE_CLIENT_ID as string,
};

export default settings;
