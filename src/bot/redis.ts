import { Telegraf } from "telegraf";
import Container from "typedi";
import RedisService from "../services/redis";
import { requireAdmin } from "./middleware";

export default (app: Telegraf): void => {
  app.command("purgar_cache", requireAdmin, async (ctx) => {
    const redisService = Container.get(RedisService);
    const n = await redisService.clearCache();
    await ctx.reply(`Caché reseteada (${n} elementos)`);
  });

  app.command("mostrar_cache", requireAdmin, async (ctx) => {
    const redisService = Container.get(RedisService);
    const redisData = await redisService.getCacheKeys();
    let msg = "";
    for (const key of redisData) {
      msg = msg + `- ${key}\n`;
    }
    await ctx.reply(`Detectadas ${redisData.length} claves en la caché`);
    if (!msg) return;
    await ctx.reply(msg);
  });
};
