import { NextFunction, Request, Response } from "express";
import { Container } from "winston";

const isAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers["X-Token"];
  if (!token) {
    res.status(401).json({ detail: "Not Authenticated" });
    return;
  }
  const logger = Container.get("logger");
  logger.info({ token });
  // TODO: check token
  next();
};

export default isAuth;
