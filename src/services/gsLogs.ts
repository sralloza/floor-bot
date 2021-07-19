import { GoogleSpreadsheet } from "google-spreadsheet";
import { Inject, Service } from "typedi";
import { Logger } from "winston";
import settings from "../config";

@Service()
export default class GSLogsService {
  sheetID = settings.google_sheets_ids.logs;

  constructor(
    @Inject("logger") private logger: Logger,
    @Inject("doc") private doc: GoogleSpreadsheet
  ) {}

  public async logMessage(message: string) {
    const sheet = this.doc.sheetsByTitle["Logs"];
    return await sheet.addRow([new Date().toLocaleString(), message]);
  }
}
