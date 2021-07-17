import { Router } from "express";
import utils from "./utils";

export default (app: Router) => {
  utils(app);

  return app;
};
