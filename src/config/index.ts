import dotenv from "dotenv";
import { warn } from "winston";

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";

const envFound = dotenv.config();
if (envFound.error) {
  warn("⚠️  Couldn't find .env file  ⚠️");
}

// TODO: better settings checks

const settings = {
  port: parseInt(process.env.PORT || "80", 10),
  logs_level: process.env.LOG_LEVEL || "silly",
  api_prefix: "/",
  telegram_token_bot: process.env.TELEGRAM_TOKEN_BOT,
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string,
  private_key: (process.env.GOOGLE_PRIVATE_KEY as string).replace(/\\n/gm, "\n"),
  google_sheets_ids: {
    users: 2084291060,
    tasks: 0,
    exchangesRates: 1120508069,
    transactions: 1169315892,
    tickets: 1204432402,
    logs: 1473685009
  }
};

export default settings;
