import { readFileSync, writeFileSync } from "node:fs";

/* Versets révélés par les étoiles filantes du hero. Courts, porteurs d'espérance,
   sur le thème lumière/élévation/repos. Texte sans guillemets (l'italique +
   l'overlay s'en chargent). Réf. en versification standard (34:18 partout). */

const V = {
  fr: [
    {
      text: "Il compte le nombre des étoiles, et il les appelle toutes par leur nom.",
      ref: "Psaume 147:4",
    },
    { text: "Ceux qui se confient en l'Éternel renouvellent leur force.", ref: "Ésaïe 40:31" },
    {
      text: "Venez à moi, vous tous qui êtes fatigués, et je vous donnerai du repos.",
      ref: "Matthieu 11:28",
    },
    {
      text: "Fortifie-toi et prends courage, car l'Éternel ton Dieu est avec toi.",
      ref: "Josué 1:9",
    },
    { text: "L'Éternel est près de ceux qui ont le cœur brisé.", ref: "Psaume 34:18" },
  ],
  en: [
    {
      text: "He determines the number of the stars and calls them each by name.",
      ref: "Psalm 147:4",
    },
    { text: "Those who hope in the Lord will renew their strength.", ref: "Isaiah 40:31" },
    { text: "Come to me, all you who are weary, and I will give you rest.", ref: "Matthew 11:28" },
    { text: "Be strong and courageous, for the Lord your God is with you.", ref: "Joshua 1:9" },
    { text: "The Lord is close to the brokenhearted.", ref: "Psalm 34:18" },
  ],
  es: [
    {
      text: "Él cuenta el número de las estrellas y a todas ellas llama por su nombre.",
      ref: "Salmo 147:4",
    },
    { text: "Los que esperan en el Señor renovarán sus fuerzas.", ref: "Isaías 40:31" },
    {
      text: "Vengan a mí todos los que están cansados, y yo los haré descansar.",
      ref: "Mateo 11:28",
    },
    { text: "Esfuérzate y sé valiente, porque el Señor tu Dios estará contigo.", ref: "Josué 1:9" },
    { text: "El Señor está cerca de los quebrantados de corazón.", ref: "Salmo 34:18" },
  ],
  de: [
    { text: "Er zählt die Sterne und nennt sie alle mit Namen.", ref: "Psalm 147,4" },
    { text: "Die auf den Herrn harren, kriegen neue Kraft.", ref: "Jesaja 40,31" },
    {
      text: "Kommt her zu mir, alle, die ihr mühselig seid, ich will euch erquicken.",
      ref: "Matthäus 11,28",
    },
    { text: "Sei stark und mutig, denn der Herr, dein Gott, ist mit dir.", ref: "Josua 1,9" },
    { text: "Der Herr ist nahe denen, die zerbrochenen Herzens sind.", ref: "Psalm 34,18" },
  ],
  it: [
    { text: "Egli conta il numero delle stelle e le chiama tutte per nome.", ref: "Salmo 147:4" },
    { text: "Quelli che sperano nel Signore acquistano nuove forze.", ref: "Isaia 40:31" },
    {
      text: "Venite a me, voi tutti che siete affaticati, e io vi darò riposo.",
      ref: "Matteo 11:28",
    },
    { text: "Sii forte e coraggioso, perché il Signore, il tuo Dio, è con te.", ref: "Giosuè 1:9" },
    { text: "Il Signore è vicino a chi ha il cuore spezzato.", ref: "Salmo 34:18" },
  ],
  pt: [
    { text: "Ele conta o número das estrelas, chamando-as todas pelo nome.", ref: "Salmo 147:4" },
    { text: "Os que esperam no Senhor renovarão as suas forças.", ref: "Isaías 40:31" },
    { text: "Vinde a mim todos os que estais cansados, e eu vos aliviarei.", ref: "Mateus 11:28" },
    { text: "Sê forte e corajoso, porque o Senhor, teu Deus, está contigo.", ref: "Josué 1:9" },
    { text: "O Senhor está perto dos que têm o coração quebrantado.", ref: "Salmo 34:18" },
  ],
  ar: [
    { text: "يُحْصِي عَدَدَ الْكَوَاكِبِ، وَيَدْعُو كُلَّهَا بِأَسْمَاءٍ.", ref: "مزمور 147:4" },
    { text: "وَأَمَّا مُنْتَظِرُو الرَّبِّ فَيُجَدِّدُونَ قُوَّةً.", ref: "إشعياء 40:31" },
    {
      text: "تَعَالَوْا إِلَيَّ يَا جَمِيعَ الْمُتْعَبِينَ، وَأَنَا أُرِيحُكُمْ.",
      ref: "متى 11:28",
    },
    { text: "تَشَدَّدْ وَتَشَجَّعْ، لِأَنَّ الرَّبَّ إِلهَكَ مَعَكَ.", ref: "يشوع 1:9" },
    { text: "الرَّبُّ قَرِيبٌ مِنَ الْمُنْكَسِرِي الْقُلُوبِ.", ref: "مزمور 34:18" },
  ],
  hi: [
    { text: "वह तारों को गिनता है और उन सब को नाम ले-लेकर बुलाता है।", ref: "भजन संहिता 147:4" },
    { text: "परन्तु जो यहोवा की बाट जोहते हैं, वे नया बल पाते जाएँगे।", ref: "यशायाह 40:31" },
    { text: "हे सब परिश्रम करनेवालो, मेरे पास आओ, मैं तुम्हें विश्राम दूँगा।", ref: "मत्ती 11:28" },
    {
      text: "हियाव बाँधकर दृढ़ हो जा, क्योंकि तेरा परमेश्वर यहोवा तेरे संग रहेगा।",
      ref: "यहोशू 1:9",
    },
    { text: "यहोवा टूटे मनवालों के समीप रहता है।", ref: "भजन संहिता 34:18" },
  ],
  id: [
    {
      text: "Ia menentukan jumlah bintang-bintang dan menyebut nama-nama semuanya.",
      ref: "Mazmur 147:4",
    },
    {
      text: "Tetapi orang yang menanti-nantikan TUHAN mendapat kekuatan baru.",
      ref: "Yesaya 40:31",
    },
    {
      text: "Marilah kepada-Ku, kamu semua yang letih lesu, dan Aku akan memberi kelegaan.",
      ref: "Matius 11:28",
    },
    {
      text: "Kuatkan dan teguhkanlah hatimu, sebab TUHAN Allahmu menyertai engkau.",
      ref: "Yosua 1:9",
    },
    { text: "TUHAN itu dekat kepada orang-orang yang patah hati.", ref: "Mazmur 34:18" },
  ],
  ja: [
    { text: "主は星の数を定め、すべての星を名で呼ばれる。", ref: "詩篇 147:4" },
    { text: "主を待ち望む者は新たな力を得る。", ref: "イザヤ書 40:31" },
    { text: "すべて疲れた人はわたしのもとに来なさい。休ませてあげよう。", ref: "マタイ 11:28" },
    { text: "強く、雄々しくあれ。あなたの神、主が共におられる。", ref: "ヨシュア記 1:9" },
    { text: "主は心の打ち砕かれた者に近くおられる。", ref: "詩篇 34:18" },
  ],
  zh: [
    { text: "他数点星宿的数目，一一称它们的名。", ref: "诗篇 147:4" },
    { text: "但那等候耶和华的，必重新得力。", ref: "以赛亚书 40:31" },
    { text: "凡劳苦担重担的人，可以到我这里来，我就使你们得安息。", ref: "马太福音 11:28" },
    { text: "你当刚强壮胆，因为耶和华你的神必与你同在。", ref: "约书亚记 1:9" },
    { text: "耶和华靠近伤心的人。", ref: "诗篇 34:18" },
  ],
};

for (const [l, verses] of Object.entries(V)) {
  const path = `src/i18n/${l}/common.json`;
  const j = JSON.parse(readFileSync(path, "utf8"));
  j.hero = j.hero || {};
  j.hero.verses = verses;
  writeFileSync(path, JSON.stringify(j, null, 2) + "\n", "utf8");
}
console.log("✓ hero.verses — 5 versets × 11 langues.");
