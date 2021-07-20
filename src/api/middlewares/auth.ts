import { NextFunction, Request, Response } from "express";

const isAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers["X-Token"];
  if (!token) {
    res.status(401).json({ detail: "Not Authenticated" });
    return;
  }
  console.log({ token });
  // TODO: check token
  next();
};

export default isAuth;
