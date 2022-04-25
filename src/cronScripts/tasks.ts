import { scheduleJob } from "node-schedule";
import Container from "typedi";
import { Logger, loggers } from "winston";
import settings from "../config";
import GSTasksService from "../services/gsTasks";
import { areTasksCronEnabled } from "../utils/cron";

export const weeklyTasksJob = async (): Promise<void> => {
  const tasksService = Container.get(GSTasksService);
  const logger: Logger = Container.get("logger");

  logger.debug("Creating weekly tasks");
  if (!areTasksCronEnabled()) {
    logger.info("Cron is disabled, exiting cron script");
    return;
  }
  await tasksService.createWeeklyTasks(true);
  logger.debug("Weekly tasks created");
};

export default (): void => {
  if (settings.cronSchedules.weeklyTasks == "disabled") {
    const logger: Logger = Container.get("logger");
    logger.info("Disabled weekly tasks cron");
    return
  }
  scheduleJob("weekly-tasks", settings.cronSchedules.weeklyTasks, weeklyTasksJob);
};
