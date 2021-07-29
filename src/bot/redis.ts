import { Telegraf } from "telegraf";
import Container from "typedi";
import RedisService from "../services/redis";
import { requireAdmin } from "./middleware";

export default (app: Telegraf) => {
  app.command("purgar_cache", requireAdmin, async (ctx) => {
    const redisService = Container.get(RedisService);
    const n = await redisService.clearCache();
    await ctx.reply(`Caché reseteada (${n} elementos)`);
  });
};
