import { Router } from "express";

const router = Router();

export default (app: Router): void => {
  app.use("/telegram", router);

  /**
   *  @openapi
   *  /telegram/status:
   *    get:
   *      description: Webhook status
   *      summary: Webhook status
   *      operationId: get_telegram_status
   *      tags:
   *      - Telegram Utils
   *      responses:
   *        200:
   *          description: Webhook is ready
   */
  router.get("/status", (req, res) => {
    res.status(200).json({ detail: "Webhook is ready" });
  });
};
