import { LoginTicket, OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { Inject, Service } from "typedi";
import { Logger } from "winston";
import settings from "../config";
import { HTTPException } from "../interfaces/errors";
import { UserPublic } from "../interfaces/user";
import { User } from "../models/user";
import UserService from "./user";

const client = new OAuth2Client();

interface LoginReturn {
  user: UserPublic;
  token: string;
}

@Service()
export default class GoogleAuthService {
  constructor(
    @Inject("logger") private logger: Logger,
    @Inject() private userService: UserService
  ) {}

  public async login(googleToken: string): Promise<LoginReturn> {
    let ticket: LoginTicket;
    try {
      ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: settings.google_client_id,
      });
    } catch (err) {
      throw new HTTPException("Invalid google token", 401);
    }

    const payload = ticket.getPayload();
    if (!payload) throw new Error();

    const { email, name } = payload;
    if (!email) throw new Error();
    if (!name) throw new Error();

    let currentUser = await this.userService.getUserByEmail(email);
    console.log({ currentUser });

    if (!currentUser) {
      currentUser = await this.userService.createUser({ email, name });
    }

    const token = this.generateToken(currentUser);
    return { token, user: {email, name} };
  }

  private generateToken(user: User): string {
    this.logger.silly(`Sign JWT for userId: ${user.id}`);
    return jwt.sign({ id: user.id }, settings.jwtSecret, {
      expiresIn: "1 day",
    });
  }
}
