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

  if (process.env.NODE_ENV === "development") {
    bot.launch();

    // Enable graceful stop
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
  }
}

startServer();
