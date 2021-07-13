import { Application } from "express";
import morgan from "morgan";
import dependencyInjector from "./dependencyInjector";
import "./events";
import expressLoader from "./express";
import Logger from "./logger";

export default async ({ expressApp }: { expressApp: Application }) => {
  expressApp.use(morgan("combined"));

  await dependencyInjector();
  Logger.info("✌️ Dependency Injector loaded");

  expressLoader({ app: expressApp });
  Logger.info("✌️ Express loaded");
};
