import redis from "redis";
import { Container } from "typedi";
import { promisify } from "util";
import settings from "../config";
import LoggerInstance from "./logger";

export interface RedisObj {
  client: redis.RedisClient;
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<unknown>;
  setex: (key: string, seconds: number, value: string) => Promise<string>;
  getList: (key: string, start: number, stop: number) => Promise<string[]>;
  del: (...args: string[]) => Promise<number>;
  keys: (pattern: string) => Promise<string[]>;
}

export default async (): Promise<void> => {
  try {
    Container.set("logger", LoggerInstance);
    LoggerInstance.info("Logger injected into container");

    if (settings.disableRedis) {
      Container.set("redis", undefined);
      LoggerInstance.warn("Skipping Redis injection");
    } else{

      const client = redis.createClient({
        host: settings.redis_host,
        port: settings.redis_port
      });
      const redisObj: RedisObj = {
        client: client,
        get: promisify(client.get).bind(client),
        set: promisify(client.set).bind(client),
        setex: promisify(client.setex).bind(client),
        del: promisify(client.del).bind(client),
        getList: promisify(client.lrange).bind(client),
        keys: promisify(client.keys).bind(client)
      };
      Container.set("redis", redisObj);
      LoggerInstance.info("Redis injected into container");
    }
  } catch (e) {
    LoggerInstance.error("🔥 Error on dependency injector loader: %o", e);
    throw e;
  }
};
