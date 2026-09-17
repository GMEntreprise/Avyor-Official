#!/usr/bin/env node
/**
 * Refonte section « Ressources & Articles » de la home — i18n (11 langues) :
 *   home.resources.{title, subtitle}
 * (le badge réutilise blogPage.poster.sub, « lire »/« voir tout » réutilisent
 *  blogPage.sections.readArticle/viewAll — déjà traduits.)
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N = resolve(__dirname, "../src/i18n");

const D = {
  fr: {
    title: "Ressources & Articles",
    subtitle: "Foi, prière, Bible, sécurité, communauté — de quoi nourrir ta vie spirituelle.",
  },
  en: {
    title: "Resources & Articles",
    subtitle:
      "Faith, prayer, Bible, security, community — everything to nourish your spiritual life.",
  },
  es: {
    title: "Recursos y Artículos",
    subtitle: "Fe, oración, Biblia, seguridad, comunidad — todo para nutrir tu vida espiritual.",
  },
  de: {
    title: "Ressourcen & Artikel",
    subtitle:
      "Glaube, Gebet, Bibel, Sicherheit, Gemeinschaft — Nahrung für dein geistliches Leben.",
  },
  it: {
    title: "Risorse e Articoli",
    subtitle:
      "Fede, preghiera, Bibbia, sicurezza, comunità — tutto per nutrire la tua vita spirituale.",
  },
  pt: {
    title: "Recursos e Artigos",
    subtitle: "Fé, oração, Bíblia, segurança, comunidade — tudo para nutrir a tua vida espiritual.",
  },
  ar: {
    title: "موارد ومقالات",
    subtitle: "الإيمان، الصلاة، الكتاب المقدس، الأمان، الجماعة — ما يغذّي حياتك الروحية.",
  },
  hi: {
    title: "संसाधन और लेख",
    subtitle:
      "आस्था, प्रार्थना, बाइबिल, सुरक्षा, समुदाय — आपके आध्यात्मिक जीवन को पोषण देने के लिए।",
  },
  id: {
    title: "Sumber & Artikel",
    subtitle: "Iman, doa, Alkitab, keamanan, komunitas — semua untuk memupuk hidup rohanimu.",
  },
  ja: {
    title: "リソースと記事",
    subtitle: "信仰、祈り、聖書、安全、共同体——あなたの霊的な歩みを養うすべて。",
  },
  zh: { title: "资源与文章", subtitle: "信心、祷告、圣经、安全、群体——滋养你属灵生命的一切。" },
};

for (const [lang, d] of Object.entries(D)) {
  const path = resolve(I18N, lang, "common.json");
  const json = JSON.parse(await readFile(path, "utf8"));
  json.home ??= {};
  json.home.resources = d;
  await writeFile(path, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log(`✓ ${lang} → home.resources`);
}
console.log("Terminé.");
