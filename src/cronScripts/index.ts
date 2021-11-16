import { scheduledJobs } from "node-schedule";
import "reflect-metadata";
import Container from "typedi";
import { Logger } from "winston";
import notifications, { mondayReminderJob, sundayReminderJob } from "./notifications";
import redis, { redisMonitorJob } from "./redis";
import tasks, { weeklyTasksJob } from "./tasks";
export { mondayReminderJob, sundayReminderJob, weeklyTasksJob, redisMonitorJob };

export default (): void => {
  notifications();
  redis();
  tasks();

  const logger: Logger = Container.get("logger");
  const jobNames = Object.keys(scheduledJobs);
  logger.info(`Loaded ${jobNames.length} jobs (${jobNames})`);
};
