import { Router } from "express";
import utils from "./utils";
import core from "./core";

export default (app: Router): Router => {
  utils(app);
  core(app);

  return app;
};
