import axios from "axios";
import tableToLatex from "make-latex";
import { Inject, Service } from "typedi";
import { Logger } from "winston";
import settings from "../config";

@Service()
export default class Latex2PNGService {
  constructor(@Inject("logger") private logger: Logger) {}

  public async genTableImageUrl(table: object[]) {
    const latexTable = tableToLatex(table);
    const regex = /\\begin{tabular}{c+}\s([{}\s&\\\-\wñáéíóú*]+)\\end{tabular}/;
    const match = regex.exec(latexTable);
    if (!match) throw new Error(`Invalid latex table: ${latexTable}`);

    let filteredTable = `
    \\begin{tabular}{cccc}
    \\hline
    ${match[1]}
    \\hline
    \\end{tabular}
    `;
    filteredTable = filteredTable
      .replace("á", "\\'{a}")
      .replace("é", "\\'{e}")
      .replace("í", "\\'{i}")
      .replace("ó", "\\'{o}")
      .replace("ú", "\\'{u}")
      .replace("ñ", "\\~{n}");

    try {
      const response = await axios.post(
        "http://latex2png.com/api/convert",
        {
          auth: { user: "guest", password: "guest" },
          latex: filteredTable,
          resolution: 600,
          color: "000000"
        },
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: settings.latex2pngApiTimeout
        }
      );

      if (response.data.url === undefined) {
        this.logger.error("Invalid image generation");
        return "error"
      }

      const newURL = "http://latex2png.com" + response.data.url;
      return newURL;
    } catch (err) {
      this.logger.error("HTTP Exception using latex2png API: " + err);
      return "error"
    }
  }
}
