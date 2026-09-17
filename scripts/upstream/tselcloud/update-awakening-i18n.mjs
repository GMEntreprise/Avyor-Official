import { readFileSync, writeFileSync } from "node:fs";

/* Section « réveil » de la home : les particules écrivent une courte séquence
   émotionnelle, centrée sur Jésus (réveil + sécurité), qui se termine sur
   « ConnectStar » (→ cœur + colombes). Phrases volontairement très courtes
   (lisibilité en particules + traduction propre dans toutes les langues). */

const D = {
  fr: {
    eyebrow: "Ce que tu rejoins vraiment",
    cta: "Viens comme tu es.",
    phrases: [
      "Ce n'est pas une app.",
      "C'est un réveil.",
      "Jésus au centre.",
      "Toi, en sécurité.",
      "ConnectStar",
    ],
  },
  en: {
    eyebrow: "What you're really joining",
    cta: "Come as you are.",
    phrases: [
      "It's not an app.",
      "It's an awakening.",
      "Jesus at the center.",
      "You, safe.",
      "ConnectStar",
    ],
  },
  es: {
    eyebrow: "A lo que de verdad te unes",
    cta: "Ven tal como eres.",
    phrases: [
      "No es una app.",
      "Es un despertar.",
      "Jesús en el centro.",
      "Tú, a salvo.",
      "ConnectStar",
    ],
  },
  de: {
    eyebrow: "Wem du dich wirklich anschließt",
    cta: "Komm, wie du bist.",
    phrases: [
      "Es ist keine App.",
      "Es ist ein Erwachen.",
      "Jesus im Mittelpunkt.",
      "Du, geborgen.",
      "ConnectStar",
    ],
  },
  it: {
    eyebrow: "Ciò a cui davvero ti unisci",
    cta: "Vieni come sei.",
    phrases: [
      "Non è un'app.",
      "È un risveglio.",
      "Gesù al centro.",
      "Tu, al sicuro.",
      "ConnectStar",
    ],
  },
  pt: {
    eyebrow: "Ao que você realmente se une",
    cta: "Venha como você é.",
    phrases: [
      "Não é um app.",
      "É um avivamento.",
      "Jesus no centro.",
      "Você, em segurança.",
      "ConnectStar",
    ],
  },
  ar: {
    eyebrow: "ما تنضمّ إليه حقًّا",
    cta: "تعال كما أنت.",
    phrases: ["إنه ليس تطبيقًا.", "إنه صحوة.", "يسوع في المركز.", "أنت، في أمان.", "ConnectStar"],
  },
  hi: {
    eyebrow: "तुम सच में किससे जुड़ते हो",
    cta: "जैसे हो वैसे आओ।",
    phrases: [
      "यह कोई ऐप नहीं है।",
      "यह एक जागृति है।",
      "यीशु केंद्र में।",
      "तुम, सुरक्षित।",
      "ConnectStar",
    ],
  },
  id: {
    eyebrow: "Apa yang sungguh kamu ikuti",
    cta: "Datanglah apa adanya.",
    phrases: [
      "Ini bukan aplikasi.",
      "Ini sebuah kebangunan.",
      "Yesus di pusatnya.",
      "Kamu, aman.",
      "ConnectStar",
    ],
  },
  ja: {
    eyebrow: "あなたが本当に加わるもの",
    cta: "ありのままで来なさい。",
    phrases: [
      "アプリではありません。",
      "それは目覚めです。",
      "中心にイエス。",
      "あなたは、守られる。",
      "ConnectStar",
    ],
  },
  zh: {
    eyebrow: "你真正加入的",
    cta: "照你本相来吧。",
    phrases: ["这不是一个应用。", "这是一场复兴。", "耶稣居中。", "你，得安全。", "ConnectStar"],
  },
};

for (const [l, data] of Object.entries(D)) {
  const path = `src/i18n/${l}/common.json`;
  const j = JSON.parse(readFileSync(path, "utf8"));
  j.home = j.home || {};
  j.home.awakening = data;
  writeFileSync(path, JSON.stringify(j, null, 2) + "\n", "utf8");
}
console.log("✓ home.awakening — eyebrow + cta + 5 phrases × 11 langues.");
