import express from "express";
import "reflect-metadata";
import { Telegraf } from "telegraf";
import settings from "../config";

export default async () => {
  const app = express();
  const token = settings.telegram_token_bot;
  if (token === undefined) throw new Error("BOT_TOKEN must be provided!");

  const bot = new Telegraf(token);

  await require("../loaders").default({ app, bot, silenced: true });
};
