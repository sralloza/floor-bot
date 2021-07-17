import express from "express";
import "reflect-metadata";
import { Telegraf } from "telegraf";
import settings from "./config";
import Logger from "./loaders/logger";

async function startServer() {
  const app = express();
  const token = settings.telegram_token_bot;
  if (token === undefined) throw new Error("BOT_TOKEN must be provided!");

  const bot = new Telegraf(token);

  await require("./loaders").default({ app, bot });

  app
    .listen(settings.port, () => {
      Logger.info(`Server listening on port: ${settings.port}`);
    })
    .on("error", (err) => {
      Logger.error(err);
      process.exit(1);
    });
}

startServer();
