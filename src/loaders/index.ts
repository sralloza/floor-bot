import { Application } from "express";
import morgan from "morgan";
import { Telegraf } from "telegraf";
import botLoader from "./bot";
import dependencyInjector from "./dependencyInjector";
import "./events";
import expressLoader from "./express";
import Logger from "./logger";
import spreadsheetsLoader from "./spreadsheets";

export default async ({ app, bot }: { app: Application; bot: Telegraf }) => {
  app.use(morgan("combined"));
  Logger.info("Morgan loaded");

  await dependencyInjector();
  Logger.info("Dependency Injector loaded");

  botLoader(bot);
  Logger.info("Telegram Bot loaded");

  await spreadsheetsLoader();
  Logger.info("Spreadsheets loaded")

  expressLoader({ app: app });
  Logger.info("Express loaded");
};
