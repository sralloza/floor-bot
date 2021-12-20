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

if (!process.env.SH_ID_USERS) {
  console.error("Must set env var SH_ID_USERS");
  process.exit(1);
}
if (!process.env.SH_ID_TASKS) {
  console.error("Must set env var SH_ID_TASKS");
  process.exit(1);
}
if (!process.env.SH_ID_TRANSACTIONS) {
  console.error("Must set env var SH_ID_TRANSACTIONS");
  process.exit(1);
}
if (!process.env.SH_ID_TICKETS) {
  console.error("Must set env var SH_ID_TICKETS");
  process.exit(1);
}
if (!process.env.SH_ID_LOGS) {
  console.error("Must set env var SH_ID_LOGS");
  process.exit(1);
}

const settings = {
  admin_id: parseInt(process.env.ADMIN_ID),
  api_prefix: "/",
  awaitTableGeneration: process.env.AWAIT_TABLE_GENERATION?.toLowerCase() === "true",
  enableCronIntegration: process.env.ENABLE_CRON_INTEGRATION?.toLowerCase() === "true",
  enableCacheMonitoring:
    process.env.ENABLE_CACHE_MONITORING?.toLocaleLowerCase() === "true",
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string,
  disableRedis: process.env.DISABLE_REDIS?.toLowerCase() === "true",
  google_sheets_ids: {
    users: parseInt(process.env.SH_ID_USERS),
    tasks: parseInt(process.env.SH_ID_TASKS),
    transactions: parseInt(process.env.SH_ID_TRANSACTIONS),
    tickets: parseInt(process.env.SH_ID_TICKETS),
    logs: parseInt(process.env.SH_ID_LOGS)
  },
  logs_level: process.env.LOG_LEVEL || "silly",
  port: parseInt(process.env.PORT || "80"),
  private_key: (process.env.GOOGLE_PRIVATE_KEY as string).replace(/\\n/gm, "\n"),
  redis_host: process.env.REDIS_HOST || "localhost",
  redis_port: parseInt(process.env.REDIS_PORT || "6379"),
  telegram_token_bot: process.env.TELEGRAM_TOKEN_BOT,
  disable_scheduler_start_date: process.env.DISABLE_SCHEDULER_START_DATE
    ? Date.parse(process.env.DISABLE_SCHEDULER_START_DATE)
    : null,
  disable_scheduler_end_date: process.env.DISABLE_SCHEDULER_END_DATE
    ? Date.parse(process.env.DISABLE_SCHEDULER_END_DATE)
    : null
};

export default settings;
