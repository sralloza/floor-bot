import { Application } from "express";
import morgan from "morgan";
import { Telegraf } from "telegraf";
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

export default async ({ app, bot }: Args) => {
  app.use(morgan("combined"));
  Logger.info("Morgan loaded");

  await dependencyInjector();
  Logger.info("Dependency Injector loaded");

  botLoader(bot);
  Logger.info("Telegram Bot loaded");

  await spreadsheetsLoader();
  Logger.info("Spreadsheets loaded");

  expressLoader({ app: app });
  Logger.info("Express loaded");

  cronScheduler();
  Logger.info("Cron loaded");
};
