import dotenv from "dotenv";
import { warn } from "winston";

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";

const envFound = dotenv.config();
if (envFound.error && process.env.NODE_ENV !== "production") {
  warn("⚠️  Couldn't find .env file  ⚠️");
}

// TODO: better settings checks
if (!process.env.ADMIN_ID) {
  /* eslint no-console: ["error", { allow: ["warn", "error"] }] */
  console.error("Must set env var ADMIN_ID");
  process.exit(1);
}

const settings = {
  admin_id: parseInt(process.env.ADMIN_ID || ""),
  api_prefix: "/",
  awaitTableGeneration: process.env.AWAIT_TABLE_GENERATION?.toLowerCase() === "true",
  enableCronIntegration: process.env.ENABLE_CRON_INTEGRATION?.toLowerCase()==="true",
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string,
  disableRedis: process.env.DISABLE_REDIS?.toLowerCase() === "true",
  google_sheets_ids: {
    users: 2084291060,
    tasks: 0,
    exchangesRates: 1120508069,
    transactions: 1169315892,
    tickets: 1204432402,
    logs: 1473685009
  },
  logs_level: process.env.LOG_LEVEL || "silly",
  port: parseInt(process.env.PORT || "80", 10),
  private_key: (process.env.GOOGLE_PRIVATE_KEY as string).replace(/\\n/gm, "\n"),
  redis_host: process.env.REDIS_HOST || "localhost",
  redis_port: parseInt(process.env.REDIS_PORT || "6379", 10),
  telegram_token_bot: process.env.TELEGRAM_TOKEN_BOT
};

export default settings;
