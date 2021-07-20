import { scheduleJob } from "node-schedule";
import Container from "typedi";
import { Logger } from "winston";
import GSTasksService from "../services/gsTasks";
import base from "./base";

export default () => {
  scheduleJob("* * * * *", async () => {
    await base();

    const tasksService = Container.get(GSTasksService);
    const logger: Logger = Container.get("logger");

    logger.debug("Creating weekly tasks");
    await tasksService.createWeeklyTasks();
    logger.debug("Weekly tasks created");
  });
};
