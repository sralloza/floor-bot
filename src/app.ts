import express from "express";
import "reflect-metadata";
import { Telegraf } from "telegraf";
import { version } from "../package.json";
import settings from "./config";
import Logger from "./loaders/logger";

async function startServer() {
  Logger.info(`Launching version v${version}`);
  Logger.info(`Current configuration: ${JSON.stringify(settings)}`);
  const app = express();
  const token = settings.telegram_token_bot;
  if (token === undefined) throw new Error("BOT_TOKEN must be provided!");

  const bot = new Telegraf(token);

  const loader = await import("./loaders");
  await loader.default({ app, bot });

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
