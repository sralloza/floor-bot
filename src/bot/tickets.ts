import { Telegraf } from "telegraf";
import Container from "typedi";
import { Logger } from "winston";
import GSTicketsService from "../services/gsTickets";

export default async (bot: Telegraf): Promise<void> => {
  const ticketsService = Container.get(GSTicketsService);
  const logger: Logger = Container.get("logger");

  bot.command("tickets", async (ctx) => {
    const imageURL = await ticketsService.getTicketsAsTable();

    if (imageURL === "error") {
      await ctx.reply("Se ha producido un error generando la imagen");
      await ctx.reply("Puedes utilizar el excel mientras el servicio esté caído");
      return;
    }
    try {
      await ctx.replyWithPhoto(imageURL);
    } catch (error) {
      logger.error(error);
      await ctx.reply(`Se ha producido el siguiente error: ${error}`);
      await ctx.reply("Operación cancelada");
    }
  });
};
