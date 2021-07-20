import { Telegraf } from "telegraf";
import Container from "typedi";
import botLoader from "../bot";

export default (bot: Telegraf): void => {
  botLoader(bot);
  Container.set("bot", bot);
};
