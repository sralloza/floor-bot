import { Telegraf } from "telegraf";
import account from "./account";
import subtasks from "./subtasks";
import tasks from "./tasks";
import transfer from "./transfer";
import utils from "./utils";

export default (bot: Telegraf) => {
  account(bot);
  subtasks(bot);
  tasks(bot);
  transfer(bot);
  utils(bot);
};
