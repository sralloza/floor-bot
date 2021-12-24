import "reflect-metadata";
import { Telegraf } from "telegraf";
import settings from "../config";
import botLoader from "./bot";
import dependencyInjector from "./dependencyInjector";
import "./events";
import Logger from "./logger";
import spreadsheetsLoader from "./spreadsheets";

// Loader only for external job calls
export default async (): Promise<void> => {
  const token = settings.telegramTokenBot;
  if (token === undefined) throw new Error("BOT_TOKEN must be provided!");

  const bot = new Telegraf(token);

  Logger.info("Loading Dependency Injector...");
  await dependencyInjector();
  Logger.info("Dependency Injector loaded");

  Logger.info("Loading Spreadsheets...");
  await spreadsheetsLoader();
  Logger.info("Spreadsheets loaded");

  Logger.info("Loading Bot...");
  await botLoader(bot);
  Logger.info("Bot loaded");

  Logger.info("Done, ready to launch job");
};
