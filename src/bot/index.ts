import { Telegraf } from "telegraf";
import account from "./account";
import commonTasks from "./commonTasks";
import tasks from "./tasks";
import transfer from "./transfer";
import utils from "./utils";

export default (bot: Telegraf) => {
  account(bot);
  commonTasks(bot);
  tasks(bot);
  transfer(bot);
  utils(bot);
};
