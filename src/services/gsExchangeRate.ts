import { GoogleSpreadsheet } from "google-spreadsheet";
import { Inject, Service } from "typedi";
import { Logger } from "winston";

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
  sheetID = 1120508069;

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
