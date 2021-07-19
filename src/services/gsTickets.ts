import { GoogleSpreadsheet } from "google-spreadsheet";
import { Inject, Service } from "typedi";
import { Logger } from "winston";

interface userBalance {
  user: string;
  tickets: number;
}

@Service()
export default class GSTicketsService {
  validTasksSheetID = 1204432402;

  constructor(
    @Inject("logger") private logger: Logger,
    @Inject("doc") private doc: GoogleSpreadsheet
  ) {}

  public async getTickets(): Promise<userBalance[]> {
    const sheet = this.doc.sheetsById[this.validTasksSheetID];
    const rows = await sheet.getRows();
    const validTasks: userBalance[] = rows.map(({ user, tickets }) => {
      return { user, tickets };
    });
    return validTasks;
  }

  public async transferTickets(from: string, to: string, tickets: number) {
    const sheet = this.doc.sheetsById[this.validTasksSheetID];
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
      }
      else if (user.value == to) {
        validTo = true;
        const balanceCell = sheet.getCell(i + 1, 1);
        balanceCell.value = +balanceCell.value + tickets;
      }
    }
    if (!validFrom) throw new Error("From invalid")
    if (!validTo) throw new Error("To invalid")

    await sheet.saveUpdatedCells()
  }
}
