import { Context, Middleware } from "telegraf";
import Container from "typedi";
import { Logger } from "winston";

const VALID_USER_IDS: number[] = [752192090];

export const requireAdmin: Middleware<Context> = async (ctx, next) => {
  const logger: Logger = Container.get("logger");

  if (ctx.message) {
    if (!VALID_USER_IDS.includes(ctx.message.chat.id))
      return await ctx.reply("No tienes permiso para utilizar este comando.");
  } else if (ctx.callbackQuery) {
    if (!ctx.callbackQuery.from) {
      logger.error("ctx.callbackQuery.from empty");
      logger.error(ctx);
    } else if (!VALID_USER_IDS.includes(ctx.callbackQuery?.from.id))
      return await ctx.reply("No tienes permiso para utilizar este comando.");
  } else {
    logger.warn(ctx);
  }
  return next();
};
