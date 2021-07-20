import { Markup, Telegraf } from "telegraf";
import Container from "typedi";
import SubtasksService, { Subtask } from "../services/subtasks";

export default (bot: Telegraf) => {
  bot.command("subtareas", async (ctx) => {
    const subtasksService = Container.get(SubtasksService);
    const subtasks = subtasksService.listSubtasks();

    return ctx.reply("Elige la tarea a completar", {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        ...subtasks.map((x) => Markup.button.callback(x, `SUBTASK-[${x}]`)),
      ]),
    });
  });

  bot.action(/SUBTASK-\[(.+)\]/, async (ctx) => {
    const subtasksService = Container.get(SubtasksService);
    const subtask = ctx.match[1];

    ctx.answerCbQuery()
    ctx.editMessageText("Procesando...")

    await subtasksService.processSubtask(
      subtask as Subtask,
      ctx.update.callback_query.from.id
    );
    ctx.editMessageText("Subtarea registrada.")
  });
};
