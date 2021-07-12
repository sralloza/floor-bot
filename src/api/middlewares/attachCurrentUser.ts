import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { HTTPException } from "../../interfaces/errors";
import UserService from "../../services/user";

const attachCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userService = Container.get(UserService);
  const user = await userService.getUserByID(req.token.id);
  if (!user) throw new HTTPException("Login required", 401);

  Reflect.deleteProperty(user, "hashedPassword");
  Reflect.deleteProperty(user, "id");

  req.currentUser = user;

  return next();
};

export default attachCurrentUser;
