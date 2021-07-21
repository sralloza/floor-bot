import { Router } from "express";
import telegram from "./routes/telegram";
import utils from "./routes/utils";

// guaranteed to get dependencies
export default (): Router => {
  const app = Router();
  telegram(app);
  utils(app);

  return app;
};
