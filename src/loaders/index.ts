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
  cronLoading: boolean;
}

export default async ({ app, bot, cronLoading = false }: Args) => {
  app.use(morgan("combined"));
  if (!cronLoading) Logger.info("Morgan loaded");

  await dependencyInjector(cronLoading);
  if (!cronLoading) Logger.info("Dependency Injector loaded");

  botLoader(bot);
  if (!cronLoading) Logger.info("Telegram Bot loaded");

  await spreadsheetsLoader();
  if (!cronLoading) Logger.info("Spreadsheets loaded");

  expressLoader({ app: app });
  if (!cronLoading) Logger.info("Express loaded");

  if (!cronLoading) {
    cronScheduler();
    Logger.info("Cron loaded");
  }
};
