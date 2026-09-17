import fs from "node:fs";
import path from "node:path";

const titles = {
  fr: "Commence à discuter avec tes proches",
  en: "Start talking with your loved ones",
  es: "Empieza a hablar con tus seres queridos",
  de: "Beginne mit deinen Liebsten zu sprechen",
  it: "Inizia a parlare con i tuoi cari",
  pt: "Comece a conversar com quem você ama",
  ar: "ابدأ الحديث مع أحبائك",
  hi: "अपने प्रियजनों से बात शुरू करें",
  id: "Mulai berbicara dengan orang terdekat",
  ja: "大切な人と話し始める",
  zh: "开始与亲近的人交流",
};

for (const [lang, title] of Object.entries(titles)) {
  const file = path.join(process.cwd(), "src", "i18n", lang, "common.json");
  const json = JSON.parse(fs.readFileSync(file, "utf8"));
  if (json.download?.steps?.items?.[1]) {
    json.download.steps.items[1].title = title;
  }
  fs.writeFileSync(file, JSON.stringify(json, null, 2) + "\n");
}
