#!/usr/bin/env node
/**
 * Poster de bienvenue « Actualités » — textes i18n (11 langues), structure
 * calquée sur la maquette : lead / marque / sous-titre / tagline / bouton /
 * indice de scroll + 4 features. « ConnectStar » non traduit.
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N = resolve(__dirname, "../src/i18n");

const P = {
  fr: {
    lead: "Bienvenue sur",
    sub: "Actualités",
    tagline:
      "Des actualités inspirantes, des enseignements profonds et des ressources pour nourrir votre foi chaque jour.",
    enter: "Découvrir",
    guide: "Laissez-vous guider",
    features: [
      { title: "Contenus édifiants", desc: "pour grandir chaque jour" },
      { title: "Foi & Espérance", desc: "au cœur de l'actualité" },
      { title: "Communauté", desc: "unie par la Parole" },
      { title: "Inspiration", desc: "qui transforme" },
    ],
  },
  en: {
    lead: "Welcome to",
    sub: "News",
    tagline: "Inspiring news, deep teachings and resources to nourish your faith every day.",
    enter: "Discover",
    guide: "Let yourself be guided",
    features: [
      { title: "Edifying content", desc: "to grow every day" },
      { title: "Faith & Hope", desc: "at the heart of the news" },
      { title: "Community", desc: "united by the Word" },
      { title: "Inspiration", desc: "that transforms" },
    ],
  },
  es: {
    lead: "Bienvenido a",
    sub: "Actualidad",
    tagline: "Noticias inspiradoras, enseñanzas profundas y recursos para nutrir tu fe cada día.",
    enter: "Descubrir",
    guide: "Déjate guiar",
    features: [
      { title: "Contenidos edificantes", desc: "para crecer cada día" },
      { title: "Fe y Esperanza", desc: "en el corazón de la actualidad" },
      { title: "Comunidad", desc: "unida por la Palabra" },
      { title: "Inspiración", desc: "que transforma" },
    ],
  },
  de: {
    lead: "Willkommen bei",
    sub: "Aktuelles",
    tagline:
      "Inspirierende Nachrichten, tiefe Lehren und Ressourcen, um deinen Glauben täglich zu nähren.",
    enter: "Entdecken",
    guide: "Lass dich führen",
    features: [
      { title: "Erbauliche Inhalte", desc: "um täglich zu wachsen" },
      { title: "Glaube & Hoffnung", desc: "im Herzen des Geschehens" },
      { title: "Gemeinschaft", desc: "vereint durch das Wort" },
      { title: "Inspiration", desc: "die verwandelt" },
    ],
  },
  it: {
    lead: "Benvenuto su",
    sub: "Attualità",
    tagline:
      "Notizie ispiranti, insegnamenti profondi e risorse per nutrire la tua fede ogni giorno.",
    enter: "Scopri",
    guide: "Lasciati guidare",
    features: [
      { title: "Contenuti edificanti", desc: "per crescere ogni giorno" },
      { title: "Fede & Speranza", desc: "al cuore dell'attualità" },
      { title: "Comunità", desc: "unita dalla Parola" },
      { title: "Ispirazione", desc: "che trasforma" },
    ],
  },
  pt: {
    lead: "Bem-vindo a",
    sub: "Atualidades",
    tagline:
      "Notícias inspiradoras, ensinamentos profundos e recursos para nutrir a tua fé todos os dias.",
    enter: "Descobrir",
    guide: "Deixa-te guiar",
    features: [
      { title: "Conteúdos edificantes", desc: "para crescer a cada dia" },
      { title: "Fé & Esperança", desc: "no coração da atualidade" },
      { title: "Comunidade", desc: "unida pela Palavra" },
      { title: "Inspiração", desc: "que transforma" },
    ],
  },
  ar: {
    lead: "مرحبًا بك في",
    sub: "الأخبار",
    tagline: "أخبار مُلهِمة، وتعاليم عميقة، وموارد تُغذّي إيمانك كل يوم.",
    enter: "اكتشف",
    guide: "دع نفسك تُقاد",
    features: [
      { title: "محتوى بنّاء", desc: "لتنمو كل يوم" },
      { title: "إيمان ورجاء", desc: "في قلب الأحداث" },
      { title: "جماعة", desc: "موحّدة بالكلمة" },
      { title: "إلهام", desc: "يُغيّر" },
    ],
  },
  hi: {
    lead: "आपका स्वागत है",
    sub: "समाचार",
    tagline: "प्रेरक समाचार, गहरी शिक्षाएँ और संसाधन, जो हर दिन आपकी आस्था को पोषित करें।",
    enter: "खोजें",
    guide: "स्वयं को मार्गदर्शित होने दें",
    features: [
      { title: "उन्नत करने वाली सामग्री", desc: "हर दिन बढ़ने के लिए" },
      { title: "आस्था और आशा", desc: "समाचार के केंद्र में" },
      { title: "समुदाय", desc: "वचन से एकजुट" },
      { title: "प्रेरणा", desc: "जो बदल देती है" },
    ],
  },
  id: {
    lead: "Selamat datang di",
    sub: "Kabar",
    tagline:
      "Kabar yang menginspirasi, pengajaran mendalam, dan sumber untuk memupuk imanmu setiap hari.",
    enter: "Jelajahi",
    guide: "Biarkan dirimu dituntun",
    features: [
      { title: "Konten membangun", desc: "untuk bertumbuh setiap hari" },
      { title: "Iman & Pengharapan", desc: "di jantung kabar terkini" },
      { title: "Komunitas", desc: "dipersatukan oleh Firman" },
      { title: "Inspirasi", desc: "yang mengubahkan" },
    ],
  },
  ja: {
    lead: "ようこそ",
    sub: "ニュース",
    tagline: "心を照らす知らせ、深い学び、そして日々あなたの信仰を養う糧を。",
    enter: "見てみる",
    guide: "導かれるままに",
    features: [
      { title: "心を build 上げる内容", desc: "日々成長するために" },
      { title: "信仰と希望", desc: "知らせの中心に" },
      { title: "共同体", desc: "みことばで一つに" },
      { title: "インスピレーション", desc: "人を変える" },
    ],
  },
  zh: {
    lead: "欢迎来到",
    sub: "资讯",
    tagline: "启迪人心的消息、深刻的教导，以及每天滋养你信心的资源。",
    enter: "探索",
    guide: "让自己被引导",
    features: [
      { title: "造就人的内容", desc: "每天成长" },
      { title: "信心与盼望", desc: "在资讯的核心" },
      { title: "群体", desc: "因真道而合一" },
      { title: "启发", desc: "带来改变" },
    ],
  },
};

// Correction ja (évite le mot anglais glissé par erreur).
P.ja.features[0].title = "心を高める内容";

for (const [lang, poster] of Object.entries(P)) {
  const path = resolve(I18N, lang, "common.json");
  const json = JSON.parse(await readFile(path, "utf8"));
  json.blogPage ??= {};
  json.blogPage.poster = poster;
  await writeFile(path, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log(
    `✓ ${lang} → blogPage.poster (lead/sub/tagline/enter/guide + ${poster.features.length} features)`,
  );
}
console.log("Terminé.");
