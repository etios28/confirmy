import * as cheerio from "cheerio";

export type ScanResult = {
  status: "compliant" | "non_compliant";
  report: {
    foundKeywords: string[];
    note_conformite: number;
    commentaires: string;
  };
};

export async function scanUrl(url: string): Promise<ScanResult> {
  // fetch HTML
  const res = await fetch(url, { headers: { "User-Agent": "ConformyBot/1.0" } });
  if (!res.ok) throw new Error("Impossible d'accéder au site.");
  const html = await res.text();

  // analyse simple
  const $ = cheerio.load(html.toLowerCase());
  const keywords = ["mentions légales", "confidentialité", "cookie", "rgpd"];
  const foundKeywords = keywords.filter((k) => $("body").text().includes(k));

  const note = Math.round((foundKeywords.length / keywords.length) * 100);
  const status: "compliant" | "non_compliant" = note >= 60 ? "compliant" : "non_compliant";
  const report = {
    foundKeywords,
    note_conformite: note,
    commentaires:
      note >= 60
        ? "Le site contient les mentions légales essentielles."
        : "Site incomplet sur les mentions légales."
  };

  return { status, report };
}
