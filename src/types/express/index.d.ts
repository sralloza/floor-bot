import { UserPublic } from "../../interfaces/user";

export interface Token {
  id: number;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    export interface Request {
      currentUser: UserPublic;
      token: Token;
    }
  }
}
