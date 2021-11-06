import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import Logger from "../../loaders/logger";
import GSUsersService from "../../services/gsUsers";

const getInfo = async (json: any) => {
  if (!json) {
    Logger.warn("Empty request");
    return "";
  }

  const userService = Container.get(GSUsersService);

  if (json.message) {
    const username =
      (await userService.getUserByTelegramID(json.message.from.id))?.username ||
      json.message.from.first_name;

    const text = json.message.text;
    return `[message] ${username}: ${text}`;
  } else if (json.callback_query) {
    const username =
      (await userService.getUserByTelegramID(json.callback_query.message.chat.id))
        ?.username || json.callback_query.message.chat.first_name;

    const text = json.callback_query.data;
    return `[callback] ${username}: ${text}`;
  }
  return JSON.stringify(json);
};

const logRequestBody = (req: Request, res: Response, next: NextFunction): void => {
  getInfo(req.body).then(Logger.debug);
  next();
};

export default logRequestBody;
