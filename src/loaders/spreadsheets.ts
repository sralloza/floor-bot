import { GoogleSpreadsheet } from "google-spreadsheet";
import Container from "typedi";
import settings from "../config";

export default async (): Promise<void> => {
  const doc = new GoogleSpreadsheet(settings.googleSheetID);

  await doc.useServiceAccountAuth({
    client_email: settings.clientEmail,
    private_key: settings.privateKey
  });

  await doc.loadInfo();
  Container.set("doc", doc);
};
