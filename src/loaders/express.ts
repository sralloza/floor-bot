import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import Container from "typedi";
import { Logger } from "winston";
import routes from "../api";
import config from "../config";
import { HTTPException } from "../interfaces/errors";

export default (app: express.Application): void => {
  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable("trust proxy");

  app.use(cors());

  app.use(express.json());

  app.use(config.api_prefix, routes());

  app.use((req, res, next) => {
    res.status(404).json({ detail: "Not Found" });
    next();
  });

  app.use((err: HTTPException, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof HTTPException) {
      return res.status(err.status).json({ detail: err.message }).end();
    }
    return next(err);
  });

  app.use((err: HTTPException, req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get("logger");
    logger.error("🔥 error: %o", err);
    res.status(err.status || 500).json({ detail: err.message });
    next();
  });
};
