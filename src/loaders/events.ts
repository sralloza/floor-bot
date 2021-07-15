//Here we import all events
// import '../subscribers/user';

import Container from "typedi";
import { Connection } from "typeorm";
import { Logger } from "winston";

const shutDown = () => {
  const connection: Connection = Container.get("Connection");
  const logger: Logger = Container.get("logger");

  logger.info("Closing database connection...");
  connection.close();
  logger.info("✂️ Database connection closed");
  process.exit();
};

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
