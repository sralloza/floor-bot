import { GoogleSpreadsheet } from "google-spreadsheet";
import { Inject, Service } from "typedi";
import { Logger } from "winston";
import settings from "../config";

interface userBalance {
  user: string;
  tickets: number;
}

interface DBInput {
  usuario: string;
  tickets: string;
}

@Service()
export default class GSTicketsService {
  sheetID = settings.google_sheets_ids.tickets;

  constructor(
    @Inject("logger") private logger: Logger,
    @Inject("doc") private doc: GoogleSpreadsheet
  ) {}

  public async getTickets(): Promise<userBalance[]> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();
    const balances: userBalance[] = rows.map((row) => {
      const { usuario: user, tickets } = row as unknown as DBInput;
      return { user, tickets: +tickets };
    });
    return balances;
  }

  public async transferTickets(
    from: string,
    to: string,
    tickets: number
  ): Promise<void> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();

    let validFrom = false;
    let validTo = false;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      await sheet.loadCells(row.a1Range.split("!")[1]);
      const user = sheet.getCell(i + 1, 0);
      if (user.value == from) {
        validFrom = true;
        const balanceCell = sheet.getCell(i + 1, 1);
        balanceCell.value = +balanceCell.value - tickets;
      } else if (user.value == to) {
        validTo = true;
        const balanceCell = sheet.getCell(i + 1, 1);
        balanceCell.value = +balanceCell.value + tickets;
      }
    }
    if (!validFrom) throw new Error("From invalid");
    if (!validTo) throw new Error("To invalid");

    await sheet.saveUpdatedCells();
  }

  public async balanceSystem(): Promise<void> {
    const balances = await this.getTickets();
    const systemBalance = balances.filter((e) => e.user == "System")[0];
    const usersBalance = balances.filter((e) => e.user !== "System");
    const nUsers = usersBalance.length;

    if (systemBalance.tickets <= -nUsers) {
      const distribute = Math.floor(Math.abs(systemBalance.tickets) / nUsers);
      this.logger.info(`Distributing ${distribute} tickets`);
      if (distribute === 0) {
        this.logger.info(
          `No tickets to distribute (${JSON.stringify(systemBalance)})`
        );
        return;
      }

      for (const balance of usersBalance) {
        await this.transferTickets("System", balance.user, -distribute);
      }
    }
  }
}
