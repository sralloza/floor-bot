import { Router } from "express";
import { Telegraf } from "telegraf";
import Container from "typedi";

const router = Router();

export default (app: Router): void => {
  app.use("/telegram", router);

  // Set the bot API endpoint
  const bot: Telegraf = Container.get("bot");
  router.use(bot.webhookCallback("/secret-url"));
};
