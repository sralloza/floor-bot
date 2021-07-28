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

  public async logMessage(message: string): Promise<void> {
    const sheet = this.doc.sheetsById[this.sheetID];
    await sheet.addRow([new Date().toJSON(), message]);
  }
}
