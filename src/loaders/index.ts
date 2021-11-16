import { Application } from "express";
import morgan from "morgan";
import { Telegraf } from "telegraf";
import settings from "../config";
import botLoader from "./bot";  
import cronScheduler from "./cronScheduler";
import dependencyInjector from "./dependencyInjector";
import "./events";
import expressLoader from "./express";
import Logger from "./logger";
import spreadsheetsLoader from "./spreadsheets";

interface Args {
  app: Application;
  bot: Telegraf;
}

export default async ({ app, bot }: Args): Promise<void> => {
  app.use(morgan("combined"));
  Logger.info("Morgan loaded");

  await dependencyInjector();
  Logger.info("Dependency Injector loaded");

  await spreadsheetsLoader();
  Logger.info("Spreadsheets loaded");

  botLoader(bot);
  Logger.info("Telegram Bot loaded");

  expressLoader(app);
  Logger.info("Express loaded");

  if (settings.enableCronIntegration) {
    cronScheduler();
    Logger.info("Cron loaded");
  }
};
