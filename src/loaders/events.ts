//Here we import all events
// import '../subscribers/user';

import Container from "typedi";
import { Logger } from "winston";

const shutDown = () => {
  const logger: Logger = Container.get("logger");

  logger.info("Closing server...");
  process.exit();
};

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
