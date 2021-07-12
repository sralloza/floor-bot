import { Container } from "typedi";
import { createConnection } from "typeorm";
import { User } from "../models/user";
import cronScheduler from "./cronScheduler";
import LoggerInstance from "./logger";

export default async () => {
  try {
    Container.set("logger", LoggerInstance);
    LoggerInstance.info("✌️ Logger injected into container");

    Container.set("userModel", User);
    LoggerInstance.info("✌️ userModel injected into container");

    Container.set("Connection", await createConnection());
    LoggerInstance.info("✌️ Connection injected into container");

    cronScheduler()
    LoggerInstance.info("Cron Scheduler loaded")
  } catch (e) {
    LoggerInstance.error("🔥 Error on dependency injector loader: %o", e);
    throw e;
  }
};

