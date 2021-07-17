import { NextFunction, Request, Response } from "express";

const getTokenFromHeader = (req: Request) => {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["X-Token"];
  if (!token) {
    return res.status(401).json({ detail: "Not Authenticated" });
  }
  console.log({ token });
  // TODO: check token
  next();
};

export default isAuth;
