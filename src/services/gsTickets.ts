import { GoogleSpreadsheet } from "google-spreadsheet";
import { Inject, Service } from "typedi";
import { Logger } from "winston";

interface userBalance {
  user: string;
  tickets: number;
}

@Service()
export default class GSTicketsService {
  sheetID = 1204432402;

  constructor(
    @Inject("logger") private logger: Logger,
    @Inject("doc") private doc: GoogleSpreadsheet
  ) {}

  public async getTickets(): Promise<userBalance[]> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();
    const balances: userBalance[] = rows.map(({ user, tickets }) => {
      return { user, tickets };
    });
    return balances;
  }

  public async transferTickets(from: string, to: string, tickets: number) {
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

  public async balanceSystem() {
    const balances = await this.getTickets();
    const systemBalance = balances.filter((e) => e.user == "System")[0];
    const usersBalance = balances.filter((e) => e.user !== "System");

    if (systemBalance.tickets <= -3) {
      const distribute = Math.floor(Math.abs(systemBalance.tickets) / 3);
      this.logger.info(`Distributing ${distribute} tickets`)
      if (distribute === 0) {
        this.logger.info(`No tickets to distribute (${JSON.stringify(systemBalance)})`)
        return
      };

      for (const balance of usersBalance){
        await this.transferTickets("System", balance.user, -distribute)
      }
    }
  }
}
