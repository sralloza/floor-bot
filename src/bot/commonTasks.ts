import { Telegraf } from "telegraf";
import Container from "typedi";
import CommonTasksService from "../services/commonTasks";

export default (bot: Telegraf) => {
  bot.command("basura", async (ctx) => {
    const commonTasksService = Container.get(CommonTasksService);
    await commonTasksService.trash(ctx.update.message.from.id);

    ctx.reply("Registrado.");
  });
};
