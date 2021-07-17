import { Container } from "typedi";
import cronScheduler from "./cronScheduler";
import LoggerInstance from "./logger";

export default async () => {
  try {
    Container.set("logger", LoggerInstance);
    LoggerInstance.info("Logger injected into container");

    cronScheduler()
    LoggerInstance.info("Cron Scheduler loaded")
  } catch (e) {
    LoggerInstance.error("🔥 Error on dependency injector loader: %o", e);
    throw e;
  }
};
