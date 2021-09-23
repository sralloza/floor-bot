import { scheduleJob } from "node-schedule";
import { Telegraf } from "telegraf";
import Container from "typedi";
import { Logger } from "winston";
import GSTasksService from "../services/gsTasks";
import GSUsersService from "../services/gsUsers";

export default (): void => {
  scheduleJob("sunday-reminder", "0 9 * * 0", async () => {
    const tasksService = Container.get(GSTasksService);
    const usersService = Container.get(GSUsersService);
    const logger: Logger = Container.get("logger");
    const bot: Telegraf = Container.get("bot");

    logger.debug("Firing sunday reminder");
    const users = await usersService.getUsers();

    for (const user of users) {
      const tasks = await tasksService.getUserRemainingTasks(user.username);
      if (tasks.length && user.telegramID) {
        const taskNames = tasks.map((e) => e.taskName).join(", ");
        const preMsg = "Recordatorio de que es domingo y tienes las siguientes tareas:";

        const msg = `${preMsg} ${taskNames}`;
        await bot.telegram.sendMessage(user.telegramID, msg);
        logger.info(`User ${user.username} notified for tasks '${taskNames}'`);
      }
    }
    logger.debug("Sunday reminder finished");
  });

  scheduleJob("monday-reminder", "30 8 * * 1", async () => {
    const tasksService = Container.get(GSTasksService);
    const usersService = Container.get(GSUsersService);
    const logger: Logger = Container.get("logger");
    const bot: Telegraf = Container.get("bot");

    logger.debug("Firing monday reminder");
    const users = await usersService.getUsers();

    for (const user of users) {
      const tasks = await tasksService.getUserRemainingTasks(user.username);
      if (tasks.length && user.telegramID) {
        const taskNames = tasks.map((e) => e.taskName).join(", ");
        const msg =
          `Ya es lunes y tienes tareas pendientes (${taskNames}). Si no puedes ` +
          "completarlas, tranfiérelas a alguien que pueda.\nEn futuras versiones " +
          "se efectuará la transferencia automáticamente el lunes por la noche " +
          "si la tarea no se ha completado.";

        await bot.telegram.sendMessage(user.telegramID, msg);
        logger.info(`User ${user.username} notified for tasks '${taskNames}'`);
      }
    }
    logger.debug("Monday reminder finished");
  });
};
