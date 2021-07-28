import { Markup, Telegraf } from "telegraf";
import Container from "typedi";
import { Logger } from "winston";
import GSTasksService, { TaskType } from "../services/gsTasks";
import GSUsersService from "../services/gsUsers";
import TransferService from "../services/transfer";
import { CANCEL_OPTION } from "./utils";

export default (bot: Telegraf): void => {
  bot.command("transferir", async (ctx) => {
    const userService = Container.get(GSUsersService);
    const tasksService = Container.get(GSTasksService);

    const user = await userService.getUserByIdOrError(ctx.update.message.from.id);
    let users = await userService.getUsers();
    users = users
      .filter((e) => e.telegramID)
      .filter((e) => e.username != user.username);

    if (!users.length)
      return ctx.reply("No hay usuarios registrados para realizar la transferencia");

    const tasks = await tasksService.getUserRemainingTasks(user.username);
    if (!tasks.length)
      return ctx.reply("No tienes ninguna tarea activa para transferir");

    const keyboardOptions = [
      [
        ...users.map((x) =>
          Markup.button.callback(x.username, `TRANSFER1-${x.username}`)
        )
      ]
    ];
    keyboardOptions.push(CANCEL_OPTION);

    return ctx.reply("Elige a quién quieres realizar la transferencia", {
      ...Markup.inlineKeyboard(keyboardOptions)
    });
  });

  bot.action(/TRANSFER1-(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    ctx.editMessageText("Obteniendo lista de tareas...");

    const userService = Container.get(GSUsersService);
    const tasksService = Container.get(GSTasksService);

    const userTo = ctx.match[1];
    const user = await userService.getUserByIdOrError(
      ctx.update.callback_query.from.id
    );
    const tasks = await tasksService.getUserRemainingTasks(user.username);

    if (!tasks.length) return ctx.editMessageText("No tienes ninguna tarea activa");

    const keyboardOptions = [
      ...tasks.map((x) => [
        Markup.button.callback(
          `${x.taskName} [S. ${x.week}]`,
          `TRANSFER2-[${userTo}]-[${x.week}]-[${x.taskType}]`
        )
      ])
    ];
    keyboardOptions.push(CANCEL_OPTION);

    return ctx.editMessageText("Elige la tarea a transferir", {
      ...Markup.inlineKeyboard(keyboardOptions)
    });
  });

  bot.action(/TRANSFER2-\[(.+)\]-\[(\d+)\]-\[(.+)\]/, async (ctx) => {
    const taskWeek = +ctx.match[2];
    const taskType = ctx.match[3];

    const userService = Container.get(GSUsersService);
    const userTo = await userService.getUserByUsernameOrError(ctx.match[1]);

    const userFrom = await userService.getUserByIdOrError(
      ctx.update.callback_query.from.id
    );

    const keyboardOptions = [
      [
        Markup.button.callback(
          "Aceptar",
          `TRANSFER3-[${userFrom.username}]-[${taskWeek}]-[${taskType}]`
        ),
        Markup.button.callback("Rechazar", `TRANSFER4-[${userFrom.username}]`)
      ]
    ];
    keyboardOptions.push(CANCEL_OPTION);

    await ctx.answerCbQuery();
    await ctx.editMessageText("Procesando...");
    await ctx.telegram.sendMessage(
      userTo.telegramID as number,
      `${userFrom.username} desea transferirte ${taskWeek}-${taskType}`,
      Markup.inlineKeyboard(keyboardOptions)
    );
    await ctx.editMessageText(`Petición de transferencia enviada a ${userTo.username}`);
  });

  bot.action(/TRANSFER3-\[(.+)\]-\[(\d+)\]-\[(.+)\]/, async (ctx) => {
    const taskWeek = +ctx.match[2];
    const taskType = ctx.match[3];

    const tasksService = Container.get(TransferService);
    const userService = Container.get(GSUsersService);
    const logger: Logger = Container.get("logger");

    const userFrom = await userService.getUserByUsernameOrError(ctx.match[1]);
    const userTo = await userService.getUserByIdOrError(
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
      logger.error(error);
      ctx.editMessageText(error.toString());
      ctx.telegram.sendMessage(
        userFrom.telegramID as number,
        "Error al realizar la transferencia."
      );
      return;
    }

    ctx.telegram.sendMessage(
      userFrom.telegramID as number,
      "Transferencia realizada con éxito."
    );
    ctx.editMessageText("Transferencia realizada.");
  });

  bot.action(/TRANSFER4-\[(.+)\]/, async (ctx) => {
    const userService = Container.get(GSUsersService);

    const userFrom = await userService.getUserByUsernameOrError(ctx.match[1]);
    const userTo = await userService.getUserByIdOrError(
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
