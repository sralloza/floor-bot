import { scheduleJob } from "node-schedule";
import { Telegraf } from "telegraf";
import Container from "typedi";
import { Logger } from "winston";
import settings from "../config";
import GSTasksService from "../services/gsTasks";
import GSUsersService from "../services/gsUsers";
import { areTasksCronEnabled } from "../utils/cron";

export const sundayReminderJob = async (): Promise<void> => {
  const tasksService = Container.get(GSTasksService);
  const usersService = Container.get(GSUsersService);
  const logger: Logger = Container.get("logger");
  const bot: Telegraf = Container.get("bot");

  logger.debug("Firing sunday reminder");
  if (!areTasksCronEnabled()) {
    logger.info("Cron is disabled, exiting cron script");
    return;
  }
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
};

export const mondayReminderJob = async (): Promise<void> => {
  const tasksService = Container.get(GSTasksService);
  const usersService = Container.get(GSUsersService);
  const logger: Logger = Container.get("logger");
  const bot: Telegraf = Container.get("bot");

  logger.debug("Firing monday reminder");
  if (!areTasksCronEnabled()) {
    logger.info("Cron is disabled, exiting cron script");
    return;
  }
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
};

export default (): void => {
  const logger: Logger = Container.get("logger");
  if (settings.cronSchedules.sundayReminder == "disabled") {
    logger.info("Disabled sunday reminder cron");
  } else {
    scheduleJob(
      "sunday-reminder",
      settings.cronSchedules.sundayReminder,
      sundayReminderJob
    );
  }

  if (settings.cronSchedules.mondayReminder == "disabled") {
    logger.info("Disabled monday reminder cron");
  } else {
    scheduleJob(
      "monday-reminder",
      settings.cronSchedules.mondayReminder,
      mondayReminderJob
    );
  }
};
