import { isCelebrateError } from "celebrate";
import cors from "cors";
import EscapeHtml from "escape-html";
import express, { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "express-jwt";
import Container from "typedi";
import { Logger } from "winston";
import routes from "../api";
import config from "../config";
import { HTTPException } from "../interfaces/errors";

export default ({ app }: { app: express.Application }) => {
  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable("trust proxy");

  // The magic package that prevents frontend developers going nuts
  // Alternate description:
  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(cors());

  // Some sauce that always add since 2014
  // "Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it."
  // Maybe not needed anymore ?
  //   app.use(require("method-override")());

  // Middleware that transforms the raw string of req.body into json
  app.use(express.json());
  // Load API routes
  app.use(config.api.prefix, routes());

  /// catch 404 and forward to error handler
  app.use((req, res, next) => {
    res.status(404).json({ detail: "Not Found" });
  });

  /// error handlers
  app.use(
    (
      err: HTTPException | UnauthorizedError,
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      if (err.name === "UnauthorizedError") {
        return res.status(err.status).send({ detail: err.message }).end();
      }

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
