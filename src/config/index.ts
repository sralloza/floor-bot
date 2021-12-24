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
  adminID: parseInt(process.env.ADMIN_ID || ""),
  apiPrefix: "/",
  awaitTableGeneration: process.env.AWAIT_TABLE_GENERATION?.toLowerCase() === "true",
  clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string,
  cronSchedules: {
    mondayReminder: process.env.CRON_SCHEDULE_MONDAY_REMINDER || "30 8 * * 1",
    redisMonitor: process.env.CRON_SCHEDULE_REDIS_MONITOR || "*/30 * * * *",
    sundayReminder: process.env.CRON_SCHEDULE_SUNDAY_REMINDER || "0 9 * * 0",
    weeklyTasks: process.env.CRON_SCHEDULE_WEEKLY_TASKS || "0 9 * * 1"
  },
  disableRedis: process.env.DISABLE_REDIS?.toLowerCase() === "true",
  disableSchedulerEndDate: process.env.DISABLE_SCHEDULER_END_DATE
    ? Date.parse(process.env.DISABLE_SCHEDULER_END_DATE)
    : null,
  disableSchedulerStartDate: process.env.DISABLE_SCHEDULER_START_DATE
    ? Date.parse(process.env.DISABLE_SCHEDULER_START_DATE)
    : null,
  enableCronIntegration: process.env.ENABLE_CRON_INTEGRATION?.toLowerCase() === "true",
  enableCacheMonitoring:
    process.env.ENABLE_CACHE_MONITORING?.toLocaleLowerCase() === "true",
  googleSheetsIDs: {
    users: parseInt(process.env.SH_ID_USERS),
    tasks: parseInt(process.env.SH_ID_TASKS),
    transactions: parseInt(process.env.SH_ID_TRANSACTIONS),
    tickets: parseInt(process.env.SH_ID_TICKETS),
    logs: parseInt(process.env.SH_ID_LOGS)
  },
  logLevel: process.env.LOG_LEVEL || "silly",
  port: parseInt(process.env.PORT || "80"),
  privateKey: (process.env.GOOGLE_PRIVATE_KEY as string).replace(/\\n/gm, "\n"),
  redisHost: process.env.REDIS_HOST || "localhost",
  redisPort: parseInt(process.env.REDIS_PORT || "6379"),
  telegramTokenBot: process.env.TELEGRAM_TOKEN_BOT
};

export default settings;
