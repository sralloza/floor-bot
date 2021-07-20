import { scheduleJob } from "node-schedule";
import { Telegraf } from "telegraf";
import Container from "typedi";
import { Logger } from "winston";
import GSTasksService from "../services/gsTasks";
import GSUsersService from "../services/gsUsers";

export default () => {
  scheduleJob("sunday-reminder", "0 9 * * 0", async () => {
    const tasksService = Container.get(GSTasksService);
    const usersService = Container.get(GSUsersService);
    const logger: Logger = Container.get("logger");
    const bot: Telegraf = Container.get("bot");

    logger.debug("Firing sunday reminder");
    const users = await usersService.getUsers();

    for (const user of users) {
      let tasks = await tasksService.getUserActiveAssignedTasks(user.username);
      if (tasks.length && user.telegramID) {
        const taskNames = tasks.map((e) => e.taskName).join(", ");
        const preMsg = "Recordatorio de que es domingo y tienes las siguientes tareas:";

        let msg = `${preMsg} ${taskNames}`;
        await bot.telegram.sendMessage(user.telegramID, msg);
        logger.info(`User ${user.username} notified for tasks '${taskNames}'`)
      }
    }
    logger.debug("Sunday reminder finished");
  });
};
