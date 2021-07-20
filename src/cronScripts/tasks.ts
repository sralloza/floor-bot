import { scheduleJob } from "node-schedule";
import Container from "typedi";
import { Logger } from "winston";
import GSTasksService from "../services/gsTasks";

export default () => {
  scheduleJob("weekly-tasks", "0 11 * * 0", async () => {
    const tasksService = Container.get(GSTasksService);
    const logger: Logger = Container.get("logger");

    logger.debug("Creating weekly tasks");
    await tasksService.createWeeklyTasks();
    logger.debug("Weekly tasks created");
  });
};
