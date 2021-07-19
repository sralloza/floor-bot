import { Markup, Telegraf } from "telegraf";
import Container from "typedi";
import GSTasksService, { TaskType } from "../services/gsTasks";
import GSUsersService from "../services/gsUsers";
import TransferService from "../services/transfer";

export default (bot: Telegraf) => {
  bot.command("transferir", async (ctx) => {
    const userService = Container.get(GSUsersService);
    const user = await userService.getUserByIDorError(
      ctx.update.message.from.id
    );
    const users = await userService.getUsers();

    return ctx.reply("Elige a quién quieres realizar la transferencia", {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        ...users
          .filter((e) => e.telegramID)
          .filter((e) => e.username != user.username)
          .map((x) =>
            Markup.button.callback(x.username, `TRANSFER1-${x.username}`)
          ),
      ]),
    });
  });

  bot.action(/TRANSFER1-(.+)/, async (ctx) => {
    const userService = Container.get(GSUsersService);
    const tasksService = Container.get(GSTasksService);

    const userTo = ctx.match[1];
    const user = await userService.getUserByIDorError(
      ctx.update.callback_query.from.id
    );
    const tasks = await tasksService.getUserActiveAssignedTasks(user.username);

    await ctx.answerCbQuery();

    if (!tasks.length)
      return ctx.editMessageText("No tienes ninguna tarea activa");

    return ctx.editMessageText("Elige la tarea a completar", {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        ...tasks.map((x) => [
          Markup.button.callback(
            `${x.taskName} [S. ${x.week}]`,
            `TRANSFER2-[${userTo}]-[${x.week}]-[${x.taskType}]`
          ),
        ]),
      ]),
    });
  });

  bot.action(/TRANSFER2-\[(.+)\]-\[(\d+)\]-\[(.+)\]/, async (ctx) => {
    const userTo = ctx.match[1];
    const taskWeek = +ctx.match[2];
    const taskType = ctx.match[3];

    const userService = Container.get(GSUsersService);
    const tasksService = Container.get(TransferService);

    const userFrom = await userService.getUserByIDorError(
      ctx.update.callback_query.from.id
    );

    await ctx.answerCbQuery();

    try {
      await tasksService.transfer(
        userFrom.username,
        userTo,
        taskWeek,
        taskType as TaskType
      );
    } catch (error) {
      console.error(error);
      return ctx.editMessageReplyMarkup(error.toString());
    }

    // TODO: Teóricamente debería enviar un mensaje al otro para aceptarla o rechazarla
    return ctx.editMessageText("Transferencia realizada.");
  });
};
