import { scheduledJobs } from "node-schedule";
import Container from "typedi";
import { Logger } from "winston";
import notifications from "./notifications";
import tasks from "./tasks";
import redis from "./redis";

export default (): void => {
  notifications();
  redis();
  tasks();

  const logger: Logger = Container.get("logger");
  const jobNames = Object.keys(scheduledJobs);
  logger.info(`Loaded ${jobNames.length} jobs (${jobNames})`);
};
