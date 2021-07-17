import { Router } from "express";

const route = Router();


export default (app: Router) => {
  app.use("/telegram", route);


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
  route.get("/status", (req, res) => {
    res.status(200).json({ detail: "Webhook is ready" });
  });

};
