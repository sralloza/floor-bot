import { scheduleJob } from "node-schedule";
import Container from "typedi";
import { Logger } from "winston";
import RedisService from "../services/redis";

export default (): void => {
  scheduleJob("redis-monitor", "*/30 * * * *", async () => {
    const redisService = Container.get(RedisService);
    const logger: Logger = Container.get("logger");

    const redis_data = await redisService.getCacheKeys();
    logger.debug("Monitoring redis cache", { keys: redis_data });
  });
};