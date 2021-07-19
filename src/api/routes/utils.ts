import { Router } from "express";
import redoc from "redoc-express";
import swaggerJsdoc from "swagger-jsdoc";
import reqs from "../../../package.json";
import settings from "../../config";

const router = Router();
const options = {
  definition: {
    openapi: "3.0.2",
    info: {
      title: "Floor API documentation",
      version: reqs.version,
    },
    // servers: [{ url: "https://floor-api.sralloza.es" }],
  },
  apis: ["./src/api/routes/**/*.ts"],
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
  app.use("/", router);

  const jsonName = "openapi.json";
  const openapiJsonFullRoute =
    settings.api_prefix == "/"
      ? jsonName
      : settings.api_prefix + "/" + jsonName;

  router.get("/" + jsonName, (req, res) => {
    res.send(openapiSpecification).end();
  });

  router.get(
    "/docs",
    redoc({
      title: "Floor API documentation",
      specUrl: openapiJsonFullRoute,
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
  router.get("/version", (req, res) => {
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
  router.get("/status", (req, res) => {
    res.status(200).json({ detail: "Server OK" });
  });
};
