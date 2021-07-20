import { scheduleJob } from "node-schedule";
import Container from "typedi";
import { Logger } from "winston";
import GSTicketsService from "../services/gsTickets";

export default () => {
  scheduleJob("balance-system", "0 3 * * *", async () => {
    const ticketsService = Container.get(GSTicketsService);
    const logger: Logger = Container.get("logger");

    logger.debug("Firing balance system");
    await ticketsService.balanceSystem();
    logger.debug("Balance system finished");
  });
};
