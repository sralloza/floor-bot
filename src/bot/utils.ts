import { Markup, Telegraf } from "telegraf";
import { Container } from "typedi";
import { Logger } from "winston";
import { version } from "../../package.json";

let HELP = `
- /ayuda - muestra este mensaje
- /help - muestra este mensaje
- /start - muestra unas instrucciones para empezar
- /registro - registra al usuario
- /tickets - muestra los tickets de todos los usuarios
- /completar_tarea - marcar tarea semanal como completada
- /transferir - pide a otro usuario una transferencia
- /version - muestra la versión del bot
`;

HELP = HELP.replace(/_/g, "\\_")
  .replace(/-/g, "\\-")
  .replace(/\./g, "\\.")
  .replace(/\(/g, "\\(")
  .replace(/\)/g, "\\)");

const START =
  "Para empezar a usar el bot, lee el apartado de *Primeros pasos* del manual de uso";

export const CANCEL_OPTION = [Markup.button.callback("Cancelar", "CANCEL")];

export default (bot: Telegraf): void => {
  bot.command("start", async (ctx) => {
    await ctx.replyWithMarkdownV2(START);
  });

  bot.command("ayuda", async (ctx) => {
    await ctx.replyWithMarkdownV2(HELP);
  });

  bot.command("help", async (ctx) => {
    await ctx.replyWithMarkdownV2(HELP);
  });

  bot.command("version", async (ctx) => {
    const parsedVersion = version.replace(/\./g, "\\.");
    await ctx.replyWithMarkdownV2(`Versión actual: _*v${parsedVersion}*_`);
  });

  bot.action(/CANCEL/, async (ctx) => {
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.reply("Operación cancelada.");
  });

  bot.on("text", async (ctx) => {
    const logger: Logger = Container.get("logger");
    logger.info(JSON.stringify(ctx.update.message.chat));
    await ctx.reply("No estaba esperando ninguna respuesta.")
  });
};
