import { Telegraf } from "telegraf";
import Container from "typedi";
import { Logger } from "winston";
import GSUsersService, {
  TelegramIDAlreadySetError,
  UserNotFoundError
} from "../services/gsUsers";

export default (bot: Telegraf) => {
  bot.command("registro", async (ctx) => {
    const service = Container.get(GSUsersService);
    const userName = ctx.message.text.substr(10);
    if (!userName.length) {
      ctx.reply("Tienes que especificar tu nombre de usuario.");
      ctx.replyWithMarkdownV2("Así: `/registro fede`");
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

    const logger: Logger = Container.get("logger")
    const tgUser = ctx.update.message.chat
    logger.info(`Telegram user ${JSON.stringify(tgUser)} registered as '${userName}'`)
  });
};
