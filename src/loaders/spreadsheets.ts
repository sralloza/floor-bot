import { GoogleSpreadsheet } from "google-spreadsheet";
import Container from "typedi";
import settings from "../config";

export default async (): Promise<void> => {
  const doc = new GoogleSpreadsheet("1FqHRnOMOPhknpQwxyq6Wh79jO-KV-a-bxCli0LsjKvc");

  await doc.useServiceAccountAuth({
    client_email: settings.clientEmail,
    private_key: settings.privateKey
  });

  await doc.loadInfo();
  Container.set("doc", doc);
};
