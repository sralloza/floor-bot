import { GoogleSpreadsheet } from "google-spreadsheet";
import { Inject, Service } from "typedi";
import { Logger } from "winston";
import settings from "../config";

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
  sheetID = settings.google_sheets_ids.users;

  constructor(
    @Inject("logger") private logger: Logger,
    @Inject("doc") private doc: GoogleSpreadsheet
  ) {}

  public async getUsers(): Promise<RegisteredUser[]> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();
    const users = rows.map((row) => {
      const { nick: username, telegramID } = row as unknown as DBInput;
      return { username, telegramID: +telegramID };
    });
    return users;
  }

  public async getUserByTelegramID(
    telegramID: number
  ): Promise<RegisteredUser | null> {
    const users = await this.getUsers();
    for (let user of users) {
      if (user.telegramID == telegramID) return user;
    }
    return null;
  }

  public async setUserTelegramID(userName: string, telegramID: number) {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();

    const users_rows = rows.filter((row) => row.username == userName);
    if (!users_rows.length) throw new UserNotFoundError();

    const user_row = users_rows[0];
    if (user_row.telegramID) throw new TelegramIDAlreadySetError();

    user_row.telegramID = telegramID;
    await user_row.save();
  }
}
