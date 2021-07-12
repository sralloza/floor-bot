import { Request, Response, Router } from "express";
import middlewares from "../middlewares";

const route = Router();

/**
 *  @openapi
 *    components:
 *      schemas:
 *        UserPublic:
 *          required:
 *          - email
 *          - name
 *          properties:
 *            email:
 *              type: string
 *              format: email
 *            name:
 *              type: string
 */

export default (app: Router) => {
  app.use("/users", route);

  /**
   *  @openapi
   *  /users/me:
   *    get:
   *      description: Get user's private data
   *      summary: Get user's private data
   *      operationId: get_me
   *      tags:
   *      - Users
   *      responses:
   *        200:
   *          description: User's private data
   *          content:
   *            application/json:
   *              schema:
   *                $ref: "#/components/schemas/UserPublic"
   *        401:
   *          description: Authentication failed
   *          content:
   *            application/json:
   *              schema:
   *                $ref: "#/components/schemas/HTTPException"
   *        422:
   *          description: Validation error
   *          content:
   *            application/json:
   *              schema:
   *                $ref: "#/components/schemas/HTTPValidationError"
   */

  route.get(
    "/me",
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    (req: Request, res: Response) => {
      return res.json(req.currentUser).status(200);
    }
  );
};
