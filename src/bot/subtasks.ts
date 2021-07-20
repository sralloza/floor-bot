import { Markup, Telegraf } from "telegraf";
import Container from "typedi";
import SubtasksService, { Subtask } from "../services/subtasks";
import { CANCEL_OPTION } from "./utils";

export default (bot: Telegraf): void => {
  bot.command("subtareas", async (ctx) => {
    const subtasksService = Container.get(SubtasksService);
    const subtasks = subtasksService.listSubtasks();
    const keyboardOptions = [
      [...subtasks.map((x) => Markup.button.callback(x, `SUBTASK-[${x}]`))],
    ];
    keyboardOptions.push(CANCEL_OPTION);

    return ctx.reply("Elige la subtarea a completar", {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard(keyboardOptions),
    });
  });

  bot.action(/SUBTASK-\[(.+)\]/, async (ctx) => {
    const subtasksService = Container.get(SubtasksService);
    const subtask = ctx.match[1];

    ctx.answerCbQuery();
    ctx.editMessageText("Procesando...");

    await subtasksService.processSubtask(
      subtask as Subtask,
      ctx.update.callback_query.from.id
    );
    ctx.editMessageText("Subtarea registrada.");
  });
};
