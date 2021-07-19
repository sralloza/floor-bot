import { GoogleSpreadsheet } from "google-spreadsheet";
import { Inject, Service } from "typedi";
import { Logger } from "winston";
import settings from "../config";

interface exchangeRate {
  concept: string;
  tickets: number;
}

interface DBInput {
  concepto: string;
  tickets: string;
}

@Service()
export default class GSExchangeRate {
  sheetID = settings.google_sheets_ids.exchangesRates;

  constructor(
    @Inject("logger") private logger: Logger,
    @Inject("doc") private doc: GoogleSpreadsheet
  ) {}

  public async getRates(): Promise<exchangeRate[]> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();
    const balances: exchangeRate[] = rows.map((row) => {
      const { concepto: concept, tickets } = row as unknown as DBInput;
      return { concept, tickets: +tickets };
    });
    return balances;
  }
}
