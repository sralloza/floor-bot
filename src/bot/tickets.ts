import { Telegraf } from "telegraf";
import Container from "typedi";
import { Logger } from "winston";
import GSTicketsService from "../services/gsTickets";

export default async (bot: Telegraf): Promise<void> => {
  const ticketsService = Container.get(GSTicketsService);
  const logger: Logger = Container.get("logger");

  bot.command("tickets", async (ctx) => {
    const imageURL = await ticketsService.getTicketsAsTable();
    try {
      await ctx.replyWithPhoto(imageURL);
    } catch (error) {
      logger.error(error);
      await ctx.reply(`Se ha producido el siguiente error: ${error}`);
      await ctx.reply("Operación cancelada");
    }
  });
};
