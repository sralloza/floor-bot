import { Container } from "typedi";
import LoggerInstance from "./logger";

export default async (silenced = false) => {
  try {
    Container.set("logger", LoggerInstance);
    if (!silenced) LoggerInstance.info("Logger injected into container");

  } catch (e) {
    LoggerInstance.error("🔥 Error on dependency injector loader: %o", e);
    throw e;
  }
};
