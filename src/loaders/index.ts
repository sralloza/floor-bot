import { Application } from "express";
import dependencyInjector from "./dependencyInjector";
import "./events";
import expressLoader from "./express";
import Logger from "./logger";

export default async ({ expressApp }: { expressApp: Application }) => {
  await dependencyInjector();
  Logger.info("✌️ Dependency Injector loaded");

  expressLoader({ app: expressApp });
  Logger.info("✌️ Express loaded");
};
