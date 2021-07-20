import { Markup, Telegraf } from "telegraf";
import { version } from "../../package.json";

export const COMING_SOON = (ctx: any) => {
  ctx.replyWithMarkdown("*Próximamente...*");
};

let HELP = `
- /ayuda - muestra este mensaje
- /help - muestra este mensaje
- /start - muestra unas instrucciones para empezar
- /registro - registra al usuario
- /completar_tarea - marcar tarea semanal como completada
- /transferir - pide a otro usuario una transferencia
- /subtareas - completar subtareas (basura, lavavajillas)
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

export default (bot: Telegraf) => {
  bot.command("start", (ctx) => {
    ctx.replyWithMarkdownV2(START);
  });

  bot.command("ayuda", (ctx) => {
    ctx.replyWithMarkdownV2(HELP);
  });

  bot.command("help", (ctx) => {
    ctx.replyWithMarkdownV2(HELP);
  });

  bot.command("version", (ctx) => {
    const parsedVersion = version.replace(/\./g, "\\.")
    ctx.replyWithMarkdownV2(`Versión actual: _*v${parsedVersion}*_`);
  });

  bot.action(/CANCEL/, (ctx) => {
    ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    ctx.reply("Operación cancelada.");
  });

  bot.on("text", (ctx) => {
    console.log(ctx.update.message.chat);
  });
};
