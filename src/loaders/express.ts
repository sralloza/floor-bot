import { isCelebrateError } from "celebrate";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import Container from "typedi";
import { Logger } from "winston";
import routes from "../api";
import config from "../config";
import { HTTPException } from "../interfaces/errors";

export default ({ app }: { app: express.Application }) => {
  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable("trust proxy");

  app.use(cors());

  app.use(express.json());

  app.use(config.api_prefix, routes());

  app.use((req, res, next) => {
    res.status(404).json({ detail: "Not Found" });
  });

  app.use(
    (err: HTTPException, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof HTTPException) {
        return res.status(err.status).json({ detail: err.message }).end();
      }
      return next(err);
    }
  );

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // If this isn't a Celebrate error, send it to the next error handler
    if (!isCelebrateError(err)) {
      return next(err);
    }

    const errors = [];
    for (const [loc, joiError] of err.details.entries()) {
      if (joiError.details.length > 1) {
        console.error("MORE ERRORS THAN ANTICIPATED: %o", joiError.details);
      }
      if (joiError.details[0].path.length > 1) {
        console.error("MORE ERRORS THAN ANTICIPATED: %o", joiError.details);
      }

      const msg = joiError.details[0].message;
      const param = joiError.details[0].path[0];
      errors.push({ loc, msg, param });
    }

    return res.status(422).send({ detail: errors });
  });

  app.use(
    (err: HTTPException, req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get("logger");
      logger.error("🔥 error: %o", err);
      res.status(err.status || 500).json({ detail: err.message });
    }
  );
};
