import { Markup, Telegraf } from "telegraf";
import Container from "typedi";
import { Logger } from "winston";
import GSUsersService, {
  TelegramIDAlreadySetError,
  UserNotFoundError
} from "../services/gsUsers";

export default (bot: Telegraf) => {
  bot.command("registro", async (ctx) => {
    const service = Container.get(GSUsersService);
    const users = await service.getUsers();
    const canUserRegister = await service.canRegisterTelegramID(
      ctx.update.message.chat.id
    );
    if (canUserRegister === false) {
      ctx.reply(
        "Ya te has registrado. No hace falta que te vuelvas a registrar."
      );
      ctx.reply("Si crees que es un error, contacta con el administrador.");
      return;
    }

    return ctx.reply("Select username to register:", {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        ...users
          .filter((x) => !x.telegramID)
          .map((x) =>
            Markup.button.callback(
              x.username,
              `REGISTER_USERNAME-${x.username}`
            )
          ),
      ]),
    });
  });
  
  bot.action(/REGISTER_USERNAME-(.+)/, async (ctx) => {
    const username = ctx.match[1];
    const telegramID = ctx.callbackQuery.from.id;
    const service = Container.get(GSUsersService);

    try {
      await service.setUserTelegramID(username, telegramID);
    } catch (error) {
      await ctx.answerCbQuery();
      if (error instanceof TelegramIDAlreadySetError) {
        ctx.editMessageText(
          "Ya te has registrado. No hace falta que te vuelvas a registrar."
        );
        ctx.reply("Si crees que es un error, contacta con el administrador");
        return;
      }
      if (error instanceof UserNotFoundError) {
        return ctx.editMessageText(
          `Nombre de usuario no encontrado (${username})`
        );
      }
      ctx.editMessageText("Fatal error");
      throw error;
    }
    await ctx.answerCbQuery();
    ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    ctx.reply("Registro completado con éxito");

    const logger: Logger = Container.get("logger");
    const tgUser = ctx.callbackQuery.from;
    logger.info(
      `Telegram user ${JSON.stringify(tgUser)} registered as '${username}'`
    );
  });
};
