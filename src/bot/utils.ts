import { Telegraf } from "telegraf";
import Container from "typedi";
import GSUsersService from "../services/gsUsers";

export const COMING_SOON = (ctx: any) => {
  ctx.replyWithMarkdown("*Próximamente...*");
};

let HELP = `
- /ayuda - muestra este mensaje.
- /help - muestra este mensaje.
- /start - muestra unas instrucciones para empezar.
- /registro USUARIO - registra al usuario.
- /transferir USUARIO - pide a otro usuario una transferencia
- /aceptar - acepta una transferencia.
- /rechazar - rechaza una transferencia.
- /basura - el usuario indica que ha bajado la basura.
`;

const START = "Para empezar a usar el bot, lee el apartado de *Primeros pasos* del manual de uso";

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

  bot.command("test", COMING_SOON)

  bot.command("users", async (ctx) => {
    const service = Container.get(GSUsersService);
    const currentUser = await service.getUserByTelegramID(
      ctx.update.message.chat.id
    );
    console.log(currentUser);
    if (!currentUser)
      return ctx.reply("No tienes permiso para ver los usuarios.");
    const users = await service.getUsers();
    ctx.reply(JSON.stringify(users));
  });

  bot.on("text", (ctx) => {
    console.log(ctx.update.message.chat);
  });
};
