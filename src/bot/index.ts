import { Telegraf } from "telegraf";
import account from "./account";
import commonTasks from "./commonTasks";
import transfer from "./transfer";
import utils from "./utils";

export default (bot: Telegraf) => {
  account(bot);
  commonTasks(bot);
  transfer(bot);
  utils(bot);
};
