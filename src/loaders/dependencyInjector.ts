import redis from "redis";
import { Container } from "typedi";
import { promisify } from "util";
import LoggerInstance from "./logger";

export interface RedisObj {
  client: redis.RedisClient;
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<unknown>;
  setex: (key: string, seconds: number, value: string) => Promise<string>;
  getList: (key: string, start: number, stop: number) => Promise<string[]>;
  del: (...args: string[]) => Promise<number>;
}

export default async (): Promise<void> => {
  try {
    Container.set("logger", LoggerInstance);
    LoggerInstance.info("Logger injected into container");

    const client = redis.createClient();
    client.del();
    const redisObj: RedisObj = {
      client: client,
      get: promisify(client.get).bind(client),
      set: promisify(client.set).bind(client),
      setex: promisify(client.setex).bind(client),
      del: promisify(client.del).bind(client),
      getList: promisify(client.lrange).bind(client)
    };
    Container.set("redis", redisObj);
    LoggerInstance.info("Redis injected into container");
  } catch (e) {
    LoggerInstance.error("🔥 Error on dependency injector loader: %o", e);
    throw e;
  }
};
