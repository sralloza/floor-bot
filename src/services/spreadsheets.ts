import { GoogleSpreadsheet } from "google-spreadsheet";
import { Inject, Service } from "typedi";
import { Logger } from "winston";

@Service()
export default class SpreadsheetsService {
  constructor(
    @Inject("logger") private logger: Logger,
    @Inject("doc") private doc: GoogleSpreadsheet
  ) {}

  public async getUsers() {}
  public async getTasks() {}
  public async getValidTasks() {}
  public async getTransactions() {}
  public async getTickets() {}
  public async logMessage(message: string) {
    const sheet = this.doc.sheetsByTitle["Logs"];
    return await sheet.addRow([new Date().toLocaleString(), message]);
  }
}
