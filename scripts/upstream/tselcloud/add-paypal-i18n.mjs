import { readFileSync, writeFileSync } from "node:fs";

const P = {
  fr: {
    title: "Don rapide par PayPal",
    subtitle: "Choisis un montant, ou saisis le tien. Sécurisé par PayPal.",
    customPlaceholder: "Autre montant",
    invalid: "Entre un montant supérieur à 0.",
    soon: "Le don PayPal sera bientôt disponible. En attendant, utilise la carte bancaire ou le virement.",
    reassurance: "Don sécurisé · annulable à tout moment",
    error: "Le paiement n'a pas abouti. Réessaie.",
    cancelled: "Paiement annulé.",
    successTitle: "Merci du fond du cœur 🙏",
    successBody:
      "Ton don aide ConnectStar à rester gratuit et libre pour des croyants partout dans le monde.",
    again: "Faire un autre don",
  },
  en: {
    title: "Quick PayPal donation",
    subtitle: "Pick an amount, or enter your own. Secured by PayPal.",
    customPlaceholder: "Other amount",
    invalid: "Enter an amount greater than 0.",
    soon: "PayPal donation coming soon. Meanwhile, use card or bank transfer.",
    reassurance: "Secure gift · cancellable anytime",
    error: "The payment didn't go through. Try again.",
    cancelled: "Payment cancelled.",
    successTitle: "Thank you, from the heart 🙏",
    successBody: "Your gift helps keep ConnectStar free for believers all over the world.",
    again: "Give again",
  },
  es: {
    title: "Donación rápida con PayPal",
    subtitle: "Elige un importe o escribe el tuyo. Protegido por PayPal.",
    customPlaceholder: "Otro importe",
    invalid: "Introduce un importe mayor que 0.",
    soon: "La donación con PayPal estará disponible pronto. Mientras tanto, usa tarjeta o transferencia.",
    reassurance: "Donación segura · cancelable en cualquier momento",
    error: "El pago no se completó. Inténtalo de nuevo.",
    cancelled: "Pago cancelado.",
    successTitle: "Gracias de corazón 🙏",
    successBody:
      "Tu donación ayuda a que ConnectStar siga siendo gratis para creyentes de todo el mundo.",
    again: "Donar de nuevo",
  },
  de: {
    title: "Schnelle PayPal-Spende",
    subtitle: "Wähle einen Betrag oder gib deinen ein. Gesichert durch PayPal.",
    customPlaceholder: "Anderer Betrag",
    invalid: "Gib einen Betrag größer als 0 ein.",
    soon: "PayPal-Spende bald verfügbar. Nutze bis dahin Karte oder Überweisung.",
    reassurance: "Sichere Spende · jederzeit kündbar",
    error: "Die Zahlung ist fehlgeschlagen. Versuche es erneut.",
    cancelled: "Zahlung abgebrochen.",
    successTitle: "Danke, von Herzen 🙏",
    successBody: "Deine Spende hält ConnectStar kostenlos für Gläubige auf der ganzen Welt.",
    again: "Erneut spenden",
  },
  it: {
    title: "Donazione rapida con PayPal",
    subtitle: "Scegli un importo o inserisci il tuo. Protetto da PayPal.",
    customPlaceholder: "Altro importo",
    invalid: "Inserisci un importo maggiore di 0.",
    soon: "La donazione con PayPal sarà presto disponibile. Nel frattempo usa carta o bonifico.",
    reassurance: "Donazione sicura · annullabile in ogni momento",
    error: "Il pagamento non è andato a buon fine. Riprova.",
    cancelled: "Pagamento annullato.",
    successTitle: "Grazie di cuore 🙏",
    successBody:
      "La tua donazione aiuta ConnectStar a restare gratuita per credenti in tutto il mondo.",
    again: "Dona ancora",
  },
  pt: {
    title: "Donativo rápido por PayPal",
    subtitle: "Escolhe um valor ou escreve o teu. Protegido pelo PayPal.",
    customPlaceholder: "Outro valor",
    invalid: "Introduz um valor maior que 0.",
    soon: "O donativo por PayPal estará disponível em breve. Entretanto, usa cartão ou transferência.",
    reassurance: "Donativo seguro · cancelável a qualquer momento",
    error: "O pagamento não foi concluído. Tenta de novo.",
    cancelled: "Pagamento cancelado.",
    successTitle: "Obrigado, do fundo do coração 🙏",
    successBody:
      "O teu donativo ajuda o ConnectStar a continuar gratuito para crentes em todo o mundo.",
    again: "Doar de novo",
  },
  ar: {
    title: "تبرّع سريع عبر PayPal",
    subtitle: "اختر مبلغًا أو أدخل مبلغك. محميّ بواسطة PayPal.",
    customPlaceholder: "مبلغ آخر",
    invalid: "أدخل مبلغًا أكبر من 0.",
    soon: "تبرّع PayPal سيكون متاحًا قريبًا. في الأثناء استخدم البطاقة أو التحويل.",
    reassurance: "تبرّع آمن · يمكن إلغاؤه في أي وقت",
    error: "لم تكتمل عملية الدفع. حاول مجددًا.",
    cancelled: "تم إلغاء الدفع.",
    successTitle: "شكرًا من القلب 🙏",
    successBody: "تبرّعك يساعد ConnectStar على البقاء مجانيًا للمؤمنين في كل أنحاء العالم.",
    again: "تبرّع مرة أخرى",
  },
  hi: {
    title: "PayPal से तेज़ दान",
    subtitle: "एक राशि चुनो, या अपनी राशि लिखो। PayPal द्वारा सुरक्षित।",
    customPlaceholder: "अन्य राशि",
    invalid: "0 से बड़ी राशि दर्ज करो।",
    soon: "PayPal दान जल्द उपलब्ध होगा। तब तक कार्ड या बैंक ट्रांसफर का उपयोग करो।",
    reassurance: "सुरक्षित दान · कभी भी रद्द करने योग्य",
    error: "भुगतान पूरा नहीं हुआ। पुनः प्रयास करो।",
    cancelled: "भुगतान रद्द किया गया।",
    successTitle: "दिल से धन्यवाद 🙏",
    successBody:
      "तुम्हारा दान ConnectStar को दुनिया भर के विश्वासियों के लिए मुफ़्त रखने में मदद करता है।",
    again: "फिर से दान करें",
  },
  id: {
    title: "Donasi cepat lewat PayPal",
    subtitle: "Pilih jumlah, atau masukkan milikmu. Diamankan oleh PayPal.",
    customPlaceholder: "Jumlah lain",
    invalid: "Masukkan jumlah lebih dari 0.",
    soon: "Donasi PayPal segera hadir. Sementara itu, gunakan kartu atau transfer bank.",
    reassurance: "Donasi aman · bisa dibatalkan kapan saja",
    error: "Pembayaran tidak berhasil. Coba lagi.",
    cancelled: "Pembayaran dibatalkan.",
    successTitle: "Terima kasih dari hati 🙏",
    successBody: "Donasimu membantu ConnectStar tetap gratis bagi orang percaya di seluruh dunia.",
    again: "Donasi lagi",
  },
  ja: {
    title: "PayPalでかんたん寄付",
    subtitle: "金額を選ぶか、自分で入力。PayPalで安全に。",
    customPlaceholder: "その他の金額",
    invalid: "0より大きい金額を入力してください。",
    soon: "PayPal寄付は近日対応予定です。それまではカードまたは銀行振込をご利用ください。",
    reassurance: "安全な寄付・いつでもキャンセル可能",
    error: "決済が完了しませんでした。もう一度お試しください。",
    cancelled: "決済をキャンセルしました。",
    successTitle: "心から感謝します 🙏",
    successBody: "あなたの寄付が、世界中の信仰者のためにConnectStarを無料で保ちます。",
    again: "もう一度寄付する",
  },
  zh: {
    title: "通过 PayPal 快速奉献",
    subtitle: "选择一个金额，或输入你的金额。由 PayPal 保障安全。",
    customPlaceholder: "其他金额",
    invalid: "请输入大于 0 的金额。",
    soon: "PayPal 奉献即将上线。在此期间，请使用银行卡或转账。",
    reassurance: "安全奉献 · 随时可取消",
    error: "支付未完成，请重试。",
    cancelled: "支付已取消。",
    successTitle: "由衷感谢 🙏",
    successBody: "你的奉献帮助 ConnectStar 为世界各地的信徒保持免费。",
    again: "再次奉献",
  },
};

// 3e méthode (PayPal) ajoutée au tableau methods.items
const METHOD_PAYPAL = {
  fr: {
    title: "PayPal",
    sub: "Rapide & sécurisé",
    desc: "Don en quelques secondes avec ton compte PayPal.",
  },
  en: {
    title: "PayPal",
    sub: "Fast & secure",
    desc: "Donate in seconds with your PayPal account.",
  },
  es: { title: "PayPal", sub: "Rápido y seguro", desc: "Dona en segundos con tu cuenta PayPal." },
  de: {
    title: "PayPal",
    sub: "Schnell & sicher",
    desc: "Spende in Sekunden mit deinem PayPal-Konto.",
  },
  it: {
    title: "PayPal",
    sub: "Veloce e sicuro",
    desc: "Dona in pochi secondi con il tuo conto PayPal.",
  },
  pt: { title: "PayPal", sub: "Rápido e seguro", desc: "Doa em segundos com a tua conta PayPal." },
  ar: { title: "PayPal", sub: "سريع وآمن", desc: "تبرّع في ثوانٍ عبر حسابك على PayPal." },
  hi: {
    title: "PayPal",
    sub: "तेज़ और सुरक्षित",
    desc: "अपने PayPal खाते से कुछ ही सेकंड में दान करो।",
  },
  id: {
    title: "PayPal",
    sub: "Cepat & aman",
    desc: "Berdonasi dalam hitungan detik dengan akun PayPal-mu.",
  },
  ja: { title: "PayPal", sub: "速くて安全", desc: "PayPalアカウントで数秒で寄付。" },
  zh: { title: "PayPal", sub: "快捷且安全", desc: "用你的 PayPal 账户几秒内完成奉献。" },
};

for (const [l, v] of Object.entries(P)) {
  const path = `src/i18n/${l}/common.json`;
  const j = JSON.parse(readFileSync(path, "utf8"));
  j.donationPageNew.paypal = v;
  // insère PayPal en 2e position des méthodes (entre CB et virement), si absent
  const items = j.donationPageNew.methods.items;
  if (!items.some((m) => m.title === "PayPal")) {
    items.splice(1, 0, METHOD_PAYPAL[l]);
  }
  writeFileSync(path, JSON.stringify(j, null, 2) + "\n", "utf8");
}
console.log("✓ paypal + 3e méthode (11 langues)");
console.log(
  "fr methods.items:",
  JSON.parse(readFileSync("src/i18n/fr/common.json", "utf8"))
    .donationPageNew.methods.items.map((m) => m.title)
    .join(" / "),
);
