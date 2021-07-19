import { Telegraf } from "telegraf";
import { COMING_SOON } from "./utils";

export default (bot: Telegraf) => {
  bot.command("transferir", COMING_SOON);
  bot.command("aceptar", COMING_SOON);
  bot.command("rechazar", COMING_SOON);
};
