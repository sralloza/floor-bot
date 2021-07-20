import { Telegraf } from "telegraf";

export const COMING_SOON = (ctx: any) => {
  ctx.replyWithMarkdown("*Próximamente...*");
};

let HELP = `
- /ayuda - muestra este mensaje.
- /help - muestra este mensaje.
- /start - muestra unas instrucciones para empezar.
- /registro - registra al usuario.
- /completar_tarea - marcar tarea semanal como completada
- /transferir - pide a otro usuario una transferencia
- /subtareas - completar subtareas (basura, lavavajillas)
`;

HELP = HELP.replace(/_/g, "\\_").replace(/-/g, "\\-").replace(/\./g, "\\.")

const START =
  "Para empezar a usar el bot, lee el apartado de *Primeros pasos* del manual de uso";

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

  bot.on("text", (ctx) => {
    console.log(ctx.update.message.chat);
  });
};
