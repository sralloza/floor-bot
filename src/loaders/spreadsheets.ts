import { GoogleSpreadsheet } from "google-spreadsheet";
import Container from "typedi";
import settings from "../config";

export default async () => {
  const doc = new GoogleSpreadsheet(
    "1FqHRnOMOPhknpQwxyq6Wh79jO-KV-a-bxCli0LsjKvc"
  );

  await doc.useServiceAccountAuth({
    client_email: settings.client_email,
    private_key: settings.private_key,
  });

  await doc.loadInfo();
  Container.set("doc", doc);
};
