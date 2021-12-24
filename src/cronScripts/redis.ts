import { scheduleJob } from "node-schedule";
import Container from "typedi";
import { Logger } from "winston";
import settings from "../config";
import RedisService from "../services/redis";

export const redisMonitorJob = async () => {
  const redisService = Container.get(RedisService);
  const logger: Logger = Container.get("logger");

  const redis_data = await redisService.getCacheKeys();
  logger.debug("Monitoring redis cache", { keys: redis_data });
};

export default (): void => {
  if (settings.enableCacheMonitoring)
    scheduleJob("redis-monitor", settings.cronSchedules.redisMonitor, redisMonitorJob);
};
