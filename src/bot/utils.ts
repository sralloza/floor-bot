import { Telegraf } from "telegraf";
import Container from "typedi";
import GSUsersService, {
  TelegramIDAlreadySetError,
  UserNotFoundError
} from "../services/gsUsers";

export default (bot: Telegraf) => {
  bot.command("help", (ctx) => {
    ctx.reply("Esto es la ayuda");
  });

  bot.command("users", async (ctx) => {
    const service = Container.get(GSUsersService);
    const currentUser = await service.getUserByTelegramID(ctx.update.message.chat.id);
    console.log(currentUser)
    if (!currentUser)
      return ctx.reply("No tienes permiso para ver los usuarios.");
    const users = await service.getUsers();
    ctx.reply(JSON.stringify(users));
  });

  bot.command("register", async (ctx) => {
    const service = Container.get(GSUsersService);
    const userName = ctx.message.text.substr(10);
    if (!userName.length) {
      ctx.reply("Tienes que especificar tu nombre de usuario.");
      ctx.replyWithMarkdownV2("Así: `/register fede`");
      return;
    }

    try {
      await service.setUserTelegramID(userName, ctx.update.message.chat.id);
    } catch (error) {
      if (error instanceof TelegramIDAlreadySetError) {
        ctx.reply(
          "Error: ya te has registrado. No hace falta que te vuelvas a registrar."
        );
        ctx.reply("Si crees que es un error, contacta con el administrador");
        return;
      }
      if (error instanceof UserNotFoundError)
        return ctx.reply("Nombre de ususario no encontrado");
      throw error;
    }
    ctx.reply("Registro completado con éxito");
  });

  bot.on("text", (ctx) => {
    console.log(ctx.update.message.chat);
  });
};
