import { GoogleSpreadsheet } from "google-spreadsheet";
import { Inject, Service } from "typedi";
import { Logger } from "winston";
import settings from "../config";
import RedisService from "./redis";

export class TelegramIDAlreadySetError extends Error {}

export class UserNotFoundError extends Error {}

export interface RegisteredUser {
  username: string;
  telegramID?: number;
}

interface DBInput {
  nick: string;
  telegramID: string;
}

@Service()
export default class GSUsersService {
  sheetID = settings.googleSheetsIDs.users;

  constructor(
    @Inject("logger") private logger: Logger,
    @Inject("doc") private doc: GoogleSpreadsheet,
    @Inject() private redisService: RedisService
  ) {}

  public async getUsers(): Promise<RegisteredUser[]> {
    const redisMemory = await this.redisService.getUsers();
    if (redisMemory) return redisMemory;

    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();
    const users = rows.map((row) => {
      const { nick: username, telegramID } = row as unknown as DBInput;
      return { username, telegramID: +telegramID };
    });

    await this.redisService.setUsers(users);
    return users;
  }

  public async getUserByIdOrError(telegramID: number): Promise<RegisteredUser> {
    const user = await this.getUserByTelegramID(telegramID);
    if (user) return user;
    throw new UserNotFoundError(telegramID.toString());
  }

  public async getUserByTelegramID(telegramID: number): Promise<RegisteredUser | null> {
    const users = await this.getUsers();
    for (const user of users) {
      if (user.telegramID == telegramID) return user;
    }
    return null;
  }

  public async getUserByUsernameOrError(username: string): Promise<RegisteredUser> {
    const user = await this.getUserByUsername(username);
    if (user) return user;
    throw new UserNotFoundError(username);
  }

  public async getUserByUsername(username: string): Promise<RegisteredUser | null> {
    const users = await this.getUsers();
    for (const user of users) if (user.username === username) return user;
    return null;
  }

  public async canRegisterTelegramID(telegramID: number): Promise<boolean> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();

    if (rows.filter((row) => row.telegramID == telegramID).length > 0) {
      return false;
    }

    return true;
  }

  public async setUserTelegramID(username: string, telegramID: number): Promise<void> {
    if ((await this.canRegisterTelegramID(telegramID)) === false)
      throw new TelegramIDAlreadySetError();

    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();

    const users_rows = rows.filter((row) => row.nick == username);
    if (!users_rows.length) throw new UserNotFoundError();

    const user_row = users_rows[0];
    if (user_row.telegramID) throw new TelegramIDAlreadySetError();

    user_row.telegramID = telegramID;
    await user_row.save();
    await this.redisService.delUsers();
  }
}
