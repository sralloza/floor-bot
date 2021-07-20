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
  silenced: boolean;
}

export default async ({ app, bot, silenced = false }: Args) => {
  app.use(morgan("combined"));
  if (!silenced) Logger.info("Morgan loaded");

  await dependencyInjector(silenced);
  if (!silenced) Logger.info("Dependency Injector loaded");

  botLoader(bot);
  if (!silenced) Logger.info("Telegram Bot loaded");

  await spreadsheetsLoader();
  if (!silenced) Logger.info("Spreadsheets loaded");

  expressLoader({ app: app });
  if (!silenced) Logger.info("Express loaded");

  cronScheduler();
  if (!silenced) Logger.info("Cron loaded");
};
