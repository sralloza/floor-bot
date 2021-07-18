import { GoogleSpreadsheet } from "google-spreadsheet";
import { Inject, Service } from "typedi";
import { Logger } from "winston";

export class TelegramIDAlreadySetError extends Error {}

export class UserNotFoundError extends Error {}

export interface RegisteredUser {
  name: string;
  telegram_id?: number;
}

@Service()
export default class GSUsersService {
  sheetID = 2084291060;

  constructor(
    @Inject("logger") private logger: Logger,
    @Inject("doc") private doc: GoogleSpreadsheet
  ) {}

  public async getUsers(): Promise<RegisteredUser[]> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();
    const users = rows.map(({ name, telegramID }) => {
      return { name, telegramID };
    });
    console.table(users);
    console.log(users);
    return users;
  }
  public async setUserTelegramID(userName: string, telegramID: number) {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();

    const users_rows = rows.filter((row) => row.name == userName);
    if (!users_rows.length) throw new UserNotFoundError();

    const user_row = users_rows[0];
    if (user_row.telegramID) throw new TelegramIDAlreadySetError();

    user_row.telegramID = telegramID;
    await user_row.save();
  }
}
