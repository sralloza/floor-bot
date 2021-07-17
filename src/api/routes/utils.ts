import { Router } from "express";
import redoc from "redoc-express";
import swaggerJsdoc from "swagger-jsdoc";
import reqs from "../../../package.json";
import settings from "../../config";

const route = Router();
const options = {
  definition: {
    openapi: "3.0.2",
    info: {
      title: "Floor API documentation",
      version: reqs.version,
    },
    servers: [{ url: "https://floor.sralloza.es/api" }],
  },
  apis: ["./src/api/routes/*.ts"],
};

const openapiSpecification = swaggerJsdoc(options);

/**
 *  @openapi
 *  components:
 *    schemas:
 *      User:
 *        required:
 *        - email
 *        - name
 *        properties:
 *          email:
 *            type: string
 *            format: string
 *          name:
 *            type: string
 *
 *      HTTPValidationError:
 *        required:
 *        - detail
 *        properties:
 *          detail:
 *            type: array
 *            items:
 *              $ref: "#/components/schemas/ValidationError"
 *
 *      ValidationError:
 *        required:
 *        - loc
 *        - msg
 *        - param
 *        properties:
 *          loc:
 *            type: string
 *            example: body
 *          msg:
 *            type: string
 *          param:
 *            type: string
 *
 *      HTTPException:
 *        required:
 *        - detail
 *        properties:
 *          detail:
 *            type: string
 */

export default (app: Router) => {
  app.use("/", route);

  route.get("/openapi.json", (req, res) => {
    res.send(openapiSpecification).end();
  });

  route.get(
    "/docs",
    redoc({
      title: "Floor API documentation",
      specUrl: settings.api_prefix + "/openapi.json",
    })
  );

  /**
   *  @openapi
   *  /version:
   *    get:
   *      description: Server version
   *      summary: Server version
   *      operationId: get_version
   *      tags:
   *      - Utils
   *      responses:
   *        200:
   *          description: Server version
   *          content:
   *            application/json:
   *              schema:
   *                required:
   *                -  version
   *                properties:
   *                  version:
   *                    type: string
   */
  route.get("/version", (req, res) => {
    res.status(200).json({ version: reqs.version });
  });

  /**
   *  @openapi
   *  /status:
   *    get:
   *      description: Server status
   *      summary: Server status
   *      operationId: get_status
   *      tags:
   *      - Utils
   *      responses:
   *        200:
   *          description: Server OK
   */
  route.get("/status", (req, res) => {
    res.status(200).json({ detail: "Server OK" });
  });

  /**
   *  @openapi
   *  /status:
   *    head:
   *      description: Server status
   *      summary: Server status
   *      operationId: head_status
   *      tags:
   *      - Utils
   *      responses:
   *        200:
   *          description: Server OK
   */
  route.head("/status", (req, res) => {
    res.status(200).json({ detail: "Server OK" });
  });
};
