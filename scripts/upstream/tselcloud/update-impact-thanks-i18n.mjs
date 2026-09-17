#!/usr/bin/env node
/**
 * Ajoute `donationPageNew.impact.thanks` (messages de remerciement affichés en
 * pop-up sur la scène « atelier » — ServerLabScene) dans les 11 langues.
 * Édition sûre : lecture JSON → ajout de la clé → réécriture UTF-8 (arabe/CJK).
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N = resolve(__dirname, "../src/i18n");

const THANKS = {
  fr: [
    "Merci. Vraiment.",
    "Grâce à toi, ça continue.",
    "Une ligne de plus, pour toi.",
    "Ton soutien devient concret.",
    "Chaque commit, une prière.",
  ],
  en: [
    "Thank you. Truly.",
    "Because of you, it keeps going.",
    "One more line, for you.",
    "Your support becomes real.",
    "Every commit, a prayer.",
  ],
  es: [
    "Gracias. De verdad.",
    "Gracias a ti, esto sigue.",
    "Una línea más, por ti.",
    "Tu apoyo se vuelve concreto.",
    "Cada commit, una oración.",
  ],
  de: [
    "Danke. Wirklich.",
    "Dank dir geht es weiter.",
    "Eine Zeile mehr, für dich.",
    "Deine Hilfe wird konkret.",
    "Jeder Commit, ein Gebet.",
  ],
  it: [
    "Grazie. Davvero.",
    "Grazie a te, si va avanti.",
    "Una riga in più, per te.",
    "Il tuo sostegno diventa concreto.",
    "Ogni commit, una preghiera.",
  ],
  pt: [
    "Obrigado. A sério.",
    "Graças a ti, continua.",
    "Mais uma linha, por ti.",
    "O teu apoio torna-se concreto.",
    "Cada commit, uma oração.",
  ],
  ar: [
    "شكرًا. حقًا.",
    "بفضلك، يستمر المشروع.",
    "سطر آخر، من أجلك.",
    "دعمك يصير واقعًا.",
    "كل سطر، صلاة.",
  ],
  hi: [
    "धन्यवाद। सच में।",
    "आपकी वजह से यह चलता रहता है।",
    "एक और पंक्ति, आपके लिए।",
    "आपका सहयोग ठोस बनता है।",
    "हर कमिट, एक प्रार्थना।",
  ],
  id: [
    "Terima kasih. Sungguh.",
    "Karena kamu, ini terus berjalan.",
    "Satu baris lagi, untukmu.",
    "Dukunganmu menjadi nyata.",
    "Setiap commit, sebuah doa.",
  ],
  ja: [
    "ありがとう。心から。",
    "あなたのおかげで、続いています。",
    "もう一行、あなたのために。",
    "あなたの支えが、形になる。",
    "一つのコミットが、祈り。",
  ],
  zh: [
    "谢谢你。真心的。",
    "因为你，这一切得以继续。",
    "再写一行，为你。",
    "你的支持化为实在。",
    "每一次提交，都是祷告。",
  ],
};

for (const [lang, thanks] of Object.entries(THANKS)) {
  const path = resolve(I18N, lang, "common.json");
  const json = JSON.parse(await readFile(path, "utf8"));
  json.donationPageNew ??= {};
  json.donationPageNew.impact ??= {};
  json.donationPageNew.impact.thanks = thanks;
  await writeFile(path, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log(`✓ ${lang} → donationPageNew.impact.thanks (${thanks.length})`);
}
console.log("Terminé.");
