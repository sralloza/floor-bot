import { Telegraf } from "telegraf";

export const COMING_SOON = (ctx: any) => {
  ctx.replyWithMarkdown("*Próximamente...*");
};

let HELP = `
- /ayuda - muestra este mensaje.
- /help - muestra este mensaje.
- /start - muestra unas instrucciones para empezar.
- /registro - registra al usuario.
- /completar_tarea - marcar tarea semanal como completada
- /reiniciar_tarea - marcar tarea semanal como pendiente
- /transferir - pide a otro usuario una transferencia
- /basura - el usuario indica que ha bajado la basura.
`;

const START =
  "Para empezar a usar el bot, lee el apartado de *Primeros pasos* del manual de uso";

export default (bot: Telegraf) => {
  bot.command("start", (ctx) => {
    ctx.replyWithMarkdown(START);
  });

  bot.command("ayuda", (ctx) => {
    ctx.replyWithMarkdown(HELP);
  });

  bot.command("help", (ctx) => {
    ctx.replyWithMarkdown(HELP);
  });

  bot.on("text", (ctx) => {
    console.log(ctx.update.message.chat);
  });
};
