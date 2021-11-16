import { scheduleJob } from "node-schedule";
import Container from "typedi";
import { Logger } from "winston";
import GSTasksService from "../services/gsTasks";

export const weeklyTasksJob = async (): Promise<void> => {
  const tasksService = Container.get(GSTasksService);
  const logger: Logger = Container.get("logger");

  logger.debug("Creating weekly tasks");
  await tasksService.createWeeklyTasks(true);
  logger.debug("Weekly tasks created");
};

export default (): void => {
  scheduleJob("weekly-tasks", "0 9 * * 1", weeklyTasksJob);
};
