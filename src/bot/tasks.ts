import { Markup, Telegraf } from "telegraf";
import Container from "typedi";
import GSTasksService, { TaskType } from "../services/gsTasks";
import GSUsersService from "../services/gsUsers";
import { CANCEL_OPTION } from "./utils";

export default (bot: Telegraf): void => {
  bot.command("completar_tarea", async (ctx) => {
    const userService = Container.get(GSUsersService);
    const tasksService = Container.get(GSTasksService);
    const user = await userService.getUserByIdOrError(ctx.update.message.from.id);
    const tasks = await tasksService.getUserRemainingTasks(user.username);

    const keyboardOptions = [
      ...tasks.map((x) => [
        Markup.button.callback(
          `${x.taskName} [S. ${x.week}]`,
          `COMPLETE-[${x.week}-${x.taskType}]`
        )
      ])
    ];
    keyboardOptions.push(CANCEL_OPTION);

    if (!tasks.length) return ctx.reply("No tienes ninguna tarea activa");

    return ctx.reply("Elige la tarea a completar", {
      ...Markup.inlineKeyboard(keyboardOptions)
    });
  });

  bot.action(/COMPLETE-\[(\d+)-(.+)\]/, async (ctx) => {
    const userService = Container.get(GSUsersService);
    const tasksService = Container.get(GSTasksService);
    const user = await userService.getUserByIdOrError(ctx.callbackQuery.from.id);
    const week = +ctx.match[1];
    const taskType = ctx.match[2];

    try {
      await tasksService.completeTask(user.username, week, taskType as TaskType);
    } catch (error) {
      await ctx.answerCbQuery();
      return ctx.editMessageText(error.toString());
    }
    await ctx.answerCbQuery();
    ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    ctx.reply("Tarea completada con éxito");
  });
};
