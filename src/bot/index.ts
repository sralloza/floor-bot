import { Telegraf } from "telegraf";
import account from "./account";
import tasks from "./tasks";
import tickets from "./tickets";
import transfer from "./transfer";
import utils from "./utils";

export default (bot: Telegraf): void => {
  account(bot);
  tasks(bot);
  tickets(bot);
  transfer(bot);
  utils(bot);
};
