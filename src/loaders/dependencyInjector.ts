import { Container } from "typedi";
import LoggerInstance from "./logger";

export default async (): Promise<void> => {
  try {
    Container.set("logger", LoggerInstance);
    LoggerInstance.info("Logger injected into container");
  } catch (e) {
    LoggerInstance.error("🔥 Error on dependency injector loader: %o", e);
    throw e;
  }
};
