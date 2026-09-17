import { readFileSync, writeFileSync } from "node:fs";

/* « count » est interpolé par DonorCounter. <bold> entoure le nombre + le mot
   « personnes ». Formulations naturelles, sans pluriel cassant (5 partout). */
const C = {
  fr: "Déjà <bold>{{count}} personnes</bold> ont soutenu ConnectStar",
  en: "Already <bold>{{count}} people</bold> have supported ConnectStar",
  es: "Ya <bold>{{count}} personas</bold> han apoyado ConnectStar",
  de: "Bereits <bold>{{count}} Menschen</bold> haben ConnectStar unterstützt",
  it: "Già <bold>{{count}} persone</bold> hanno sostenuto ConnectStar",
  pt: "Já <bold>{{count}} pessoas</bold> apoiaram o ConnectStar",
  ar: "‏<bold>{{count}} أشخاص</bold> دعموا ConnectStar بالفعل",
  hi: "अब तक <bold>{{count}} लोगों</bold> ने ConnectStar का समर्थन किया है",
  id: "Sudah <bold>{{count}} orang</bold> mendukung ConnectStar",
  ja: "すでに<bold>{{count}}人</bold>がConnectStarを支援しました",
  zh: "已有 <bold>{{count}} 位</bold>朋友支持了 ConnectStar",
};

for (const [l, v] of Object.entries(C)) {
  const path = `src/i18n/${l}/common.json`;
  const j = JSON.parse(readFileSync(path, "utf8"));
  j.donationPageNew.emotion.counter = v;
  writeFileSync(path, JSON.stringify(j, null, 2) + "\n", "utf8");
}
console.log("✓ emotion.counter ({{count}}) — 11 langues. fr:", C.fr);
