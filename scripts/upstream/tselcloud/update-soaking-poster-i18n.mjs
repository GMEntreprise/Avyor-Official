#!/usr/bin/env node
/**
 * Poster d'adoration (page Soaking) — i18n (11 langues) :
 *   soaking.poster.{lead, brand, sub, tagline, enter, nowPlaying}
 * « ConnectStar » non traduit.
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N = resolve(__dirname, "../src/i18n");

const P = {
  fr: {
    lead: "Entre dans",
    sub: "Adoration",
    tagline: "Ferme les yeux. Laisse la louange monter. Il est déjà là.",
    enter: "Entrer dans Sa présence",
    nowPlaying: "Lecture en cours",
  },
  en: {
    lead: "Enter into",
    sub: "Worship",
    tagline: "Close your eyes. Let the praise rise. He is already here.",
    enter: "Enter His presence",
    nowPlaying: "Now playing",
  },
  es: {
    lead: "Entra en",
    sub: "Adoración",
    tagline: "Cierra los ojos. Deja que suba la alabanza. Él ya está aquí.",
    enter: "Entra en Su presencia",
    nowPlaying: "Reproduciendo",
  },
  de: {
    lead: "Tritt ein in",
    sub: "Anbetung",
    tagline: "Schließ die Augen. Lass den Lobpreis aufsteigen. Er ist schon da.",
    enter: "Tritt in Seine Gegenwart",
    nowPlaying: "Läuft gerade",
  },
  it: {
    lead: "Entra nella",
    sub: "Adorazione",
    tagline: "Chiudi gli occhi. Lascia salire la lode. Lui è già qui.",
    enter: "Entra nella Sua presenza",
    nowPlaying: "In riproduzione",
  },
  pt: {
    lead: "Entra na",
    sub: "Adoração",
    tagline: "Fecha os olhos. Deixa o louvor subir. Ele já está aqui.",
    enter: "Entra na Sua presença",
    nowPlaying: "A reproduzir",
  },
  ar: {
    lead: "ادخل إلى",
    sub: "العبادة",
    tagline: "أغمض عينيك. دع التسبيح يصعد. هو هنا بالفعل.",
    enter: "ادخل إلى حضوره",
    nowPlaying: "قيد التشغيل",
  },
  hi: {
    lead: "प्रवेश करो",
    sub: "आराधना",
    tagline: "आँखें बंद करो। स्तुति को उठने दो। वे पहले से यहाँ हैं।",
    enter: "उनकी उपस्थिति में प्रवेश करें",
    nowPlaying: "अभी चल रहा है",
  },
  id: {
    lead: "Masuk ke dalam",
    sub: "Penyembahan",
    tagline: "Pejamkan matamu. Biarkan pujian naik. Dia sudah di sini.",
    enter: "Masuk ke hadirat-Nya",
    nowPlaying: "Sedang diputar",
  },
  ja: {
    lead: "入りましょう",
    sub: "礼拝",
    tagline: "目を閉じて。賛美を昇らせて。主はもうここに。",
    enter: "み前に入る",
    nowPlaying: "再生中",
  },
  zh: {
    lead: "进入",
    sub: "敬拜",
    tagline: "闭上眼睛，让赞美升起。祂已经在这里。",
    enter: "进入祂的同在",
    nowPlaying: "正在播放",
  },
};

for (const [lang, poster] of Object.entries(P)) {
  const path = resolve(I18N, lang, "common.json");
  const json = JSON.parse(await readFile(path, "utf8"));
  json.soaking ??= {};
  json.soaking.poster = poster;
  await writeFile(path, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log(`✓ ${lang} → soaking.poster`);
}
console.log("Terminé.");
