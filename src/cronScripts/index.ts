import { scheduledJobs } from "node-schedule";
import "reflect-metadata";
import Container from "typedi";
import { Logger } from "winston";
import notifications, { mondayReminderJob, sundayReminderJob } from "./notifications";

import tasks, { weeklyTasksJob } from "./tasks";
export { mondayReminderJob, sundayReminderJob, weeklyTasksJob };

export default (): void => {
  notifications();
  tasks();

  const logger: Logger = Container.get("logger");
  const jobNames = Object.keys(scheduledJobs);
  logger.info(`Loaded ${jobNames.length} jobs (${jobNames})`);
};
