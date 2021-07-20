import { Markup, Telegraf } from "telegraf";
import Container from "typedi";
import GSTasksService, { TaskType } from "../services/gsTasks";
import GSUsersService from "../services/gsUsers";
import TransferService from "../services/transfer";

export default (bot: Telegraf) => {
  bot.command("transferir", async (ctx) => {
    const userService = Container.get(GSUsersService);
    const tasksService = Container.get(GSTasksService);

    const user = await userService.getUserByIDorError(
      ctx.update.message.from.id
    );
    let users = await userService.getUsers();
    users = users
      .filter((e) => e.telegramID)
      .filter((e) => e.username != user.username);

    if (!users.length)
      return ctx.reply(
        "No hay usuarios registrados para realizar la transferencia"
      );

    const tasks = await tasksService.getUserActiveAssignedTasks(user.username);
    if (!tasks)
      return ctx.reply("No tienes ninguna tarea activa para transferir");

    return ctx.reply("Elige a quién quieres realizar la transferencia", {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        ...users.map((x) =>
          Markup.button.callback(x.username, `TRANSFER1-${x.username}`)
        ),
      ]),
    });
  });

  bot.action(/TRANSFER1-(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    ctx.editMessageText("Obteniendo lista de tareas...");

    const userService = Container.get(GSUsersService);
    const tasksService = Container.get(GSTasksService);

    const userTo = ctx.match[1];
    const user = await userService.getUserByIDorError(
      ctx.update.callback_query.from.id
    );
    const tasks = await tasksService.getUserActiveAssignedTasks(user.username);

    if (!tasks.length)
      return ctx.editMessageText("No tienes ninguna tarea activa");

    return ctx.editMessageText("Elige la tarea a transferir", {
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
    const taskWeek = +ctx.match[2];
    const taskType = ctx.match[3];

    const userService = Container.get(GSUsersService);
    const userTo = await userService.getUserByUsernameOrError(ctx.match[1]);

    const userFrom = await userService.getUserByIDorError(
      ctx.update.callback_query.from.id
    );

    await ctx.answerCbQuery();
    await ctx.editMessageText("Procesando...");
    await ctx.telegram.sendMessage(
      userTo.telegramID as number,
      `${userFrom.username} desea transferirte ${taskWeek}-${taskType}`,
      Markup.inlineKeyboard([
        Markup.button.callback(
          "Aceptar",
          `TRANSFER3-[${userFrom.username}]-[${taskWeek}]-[${taskType}]`
        ),
        Markup.button.callback(
          "Rechazar",
          `TRANSFER4-[${userFrom.username}]`
        ),
      ])
    );
    await ctx.editMessageText(
      `Petición de transferencia enviada a ${userTo.username}`
    );
  });

  bot.action(/TRANSFER3-\[(.+)\]-\[(\d+)\]-\[(.+)\]/, async (ctx) => {
    const taskWeek = +ctx.match[2];
    const taskType = ctx.match[3];

    const tasksService = Container.get(TransferService);
    const userService = Container.get(GSUsersService);

    const userFrom = await userService.getUserByUsernameOrError(ctx.match[1]);
    const userTo = await userService.getUserByIDorError(
      ctx.update.callback_query.from.id
    );

    await ctx.answerCbQuery();
    ctx.editMessageText("Procesando...");
    ctx.telegram.sendMessage(
      userFrom.telegramID as number,
      `${userTo.username} ha aceptado la transferencia.`
    );

    try {
      await tasksService.transfer(
        userFrom.username,
        userTo.username,
        taskWeek,
        taskType as TaskType
      );
    } catch (error) {
      console.error(error);
      ctx.editMessageText(error.toString());
      ctx.telegram.sendMessage(
        userFrom.telegramID as number,
        "Error al realizar la transferencia."
      );
      return
    }

    ctx.telegram.sendMessage(
      userFrom.telegramID as number,
      "Transferencia realizada con éxito."
    );
    ctx.editMessageText("Transferencia realizada.");
  });

  bot.action(/TRANSFER4-\[(.+)\]/, async (ctx) => {
    const taskWeek = +ctx.match[2];
    const taskType = ctx.match[3];

    const tasksService = Container.get(TransferService);
    const userService = Container.get(GSUsersService);

    const userFrom = await userService.getUserByUsernameOrError(ctx.match[1]);
    const userTo = await userService.getUserByIDorError(
      ctx.update.callback_query.from.id
    );

    await ctx.answerCbQuery();
    ctx.editMessageText("Transferencia cancelada");
    ctx.telegram.sendMessage(
      userFrom.telegramID as number,
      `${userTo.username} ha rechazado la transferencia.`
    );
  });
};
