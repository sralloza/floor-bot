import { Telegraf } from "telegraf";

export default (bot: Telegraf) => {
  bot.command("help", (ctx) => {
    ctx.reply("Esto es la ayuda");
  });
  bot.on("text", (ctx) => {
    console.log(ctx.update.message.chat);
  });
};
