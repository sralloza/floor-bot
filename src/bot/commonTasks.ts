import { Telegraf } from "telegraf";
import { COMING_SOON } from "./utils";

export default (bot: Telegraf) => {
  bot.command("basura", COMING_SOON);
};
