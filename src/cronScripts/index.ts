import { scheduledJobs } from "node-schedule";
import Container from "typedi";
import { Logger } from "winston";
import balance from "./balance";
import tasks from "./tasks";

export default () => {
  balance();
  tasks();
  const logger: Logger = Container.get("logger")
  const jobNames = Object.keys(scheduledJobs)
  logger.info(`Loaded ${jobNames.length} jobs (${jobNames})`);
};
