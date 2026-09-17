#!/usr/bin/env node
/**
 * Réécrit la FAQ de la page « Soutenir » (donationPageNew.faq.items) dans les
 * 11 langues. Corrections de fond :
 *   - la gratuité de ConnectStar ne dépend PAS des dons (toujours gratuite,
 *     même sans un seul don) — elle repose sur une promesse portée par Jésus ;
 *   - « qui se cache derrière » = Édouard Georges-Michel, développeur mobile.
 * Édition sûre : lecture JSON → remplacement des items → réécriture UTF-8
 * (préserve arabe/CJK). title/subtitle NON modifiés. Le schema FAQPage se
 * régénère seul (il lit ces mêmes items).
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N = resolve(__dirname, "../src/i18n");

/** Items par langue (8 questions). Noms propres non traduits : ConnectStar,
 *  Édouard Georges-Michel, HelloAsso, PayPal, e-mail. « Jésus » traduit. */
const ITEMS = {
  fr: [
    {
      q: "Est-ce vraiment sécurisé ?",
      a: "Oui. Tes paiements passent par HelloAsso, plateforme française certifiée, ou par PayPal — jamais par nos serveurs. Tes coordonnées bancaires ne nous parviennent pas : nous ne les voyons pas et ne les stockons pas.",
    },
    {
      q: "À quoi sert concrètement mon don ?",
      a: "À faire grandir ConnectStar : les serveurs qui la gardent en ligne jour et nuit, et le développement de nouvelles fonctionnalités. Ton don ne débloque rien — l'application est gratuite pour tous. Il allège la charge et aide le projet à avancer.",
    },
    {
      q: "Et si je ne peux pas donner ?",
      a: "Tu fais déjà partie de l'histoire. Prier pour ConnectStar, en parler autour de toi, l'offrir à quelqu'un qui en a besoin — c'est un soutien immense, et il ne coûte rien. Personne n'a à payer pour avoir sa place ici.",
    },
    {
      q: "Puis-je arrêter quand je veux ?",
      a: "Oui, librement et à tout moment. Aucun engagement, aucun prélèvement caché. Tu donnes ce que tu veux, quand ton cœur te le dit — jamais un centime de plus.",
    },
    {
      q: "Mon don peut-il rester anonyme ?",
      a: "Bien sûr. Tu peux donner discrètement, sans afficher ton nom. Nous ne partageons jamais ton identité et ne revendons aucune donnée — jamais.",
    },
    {
      q: "Vais-je recevoir un reçu fiscal ?",
      a: "Oui, sur simple demande à connectstar.contact@gmail.com. Selon ta situation, il peut te permettre de déduire une partie de ton don de tes impôts.",
    },
    {
      q: "ConnectStar restera-t-il vraiment gratuit ?",
      a: "Oui — toujours, quoi qu'il arrive, même sans un seul don. La gratuité ne dépend pas de l'argent qui rentre : elle repose sur une promesse. ConnectStar n'a pas été monté comme un commerce, mais reçu comme un appel. C'est sur l'aide de Jésus qu'elle tient — pas sur les dons. Jamais personne ne sera privé de la prière ou de la Parole faute de moyens.",
    },
    {
      q: "Qui se cache derrière ConnectStar ?",
      a: "Un nom, un visage : Édouard Georges-Michel, développeur d'applications mobiles. Pas d'entreprise, pas d'actionnaires à rémunérer — un croyant qui code et qui prie sur chaque détail. Il le dit simplement : « Ce projet, c'est Jésus qui me l'a confié. Alors je compte sur son aide, pas sur un compte en banque. »",
    },
  ],
  en: [
    {
      q: "Is it really secure?",
      a: "Yes. Your payments go through HelloAsso, a certified French platform, or through PayPal — never through our servers. Your bank details never reach us: we don't see them and we don't store them.",
    },
    {
      q: "What does my donation actually fund?",
      a: "Growing ConnectStar: the servers that keep it online day and night, and the development of new features. Your gift unlocks nothing — the app is free for everyone. It simply eases the load and helps the project move forward.",
    },
    {
      q: "What if I can't give?",
      a: "You're already part of the story. Praying for ConnectStar, telling others about it, sharing the app with someone who needs it — that's a huge support, and it costs nothing. No one has to pay to belong here.",
    },
    {
      q: "Can I stop whenever I want?",
      a: "Yes, freely and at any time. No commitment, no hidden charges. You give what you want, when your heart tells you to — never a cent more.",
    },
    {
      q: "Can my donation stay anonymous?",
      a: "Of course. You can give quietly, without showing your name. We never share your identity and never sell any data — ever.",
    },
    {
      q: "Will I get a tax receipt?",
      a: "Yes, simply request one at connectstar.contact@gmail.com. Depending on your situation, it may let you deduct part of your donation from your taxes.",
    },
    {
      q: "Will ConnectStar really stay free?",
      a: "Yes — always, no matter what, even without a single donation. Its being free doesn't depend on the money coming in: it rests on a promise. ConnectStar wasn't built as a business, but received as a calling. It holds by the help of Jesus — not by donations. No one will ever be denied prayer or the Word for lack of means.",
    },
    {
      q: "Who is behind ConnectStar?",
      a: "A name, a face: Édouard Georges-Michel, a mobile app developer. No company, no shareholders to pay — a believer who codes and prays over every detail. He puts it simply: “This project was entrusted to me by Jesus. So I count on His help, not on a bank account.”",
    },
  ],
  es: [
    {
      q: "¿Es realmente seguro?",
      a: "Sí. Tus pagos pasan por HelloAsso, plataforma francesa certificada, o por PayPal — nunca por nuestros servidores. Tus datos bancarios no llegan hasta nosotros: no los vemos ni los guardamos.",
    },
    {
      q: "¿Para qué sirve realmente mi donación?",
      a: "Para hacer crecer ConnectStar: los servidores que la mantienen en línea día y noche, y el desarrollo de nuevas funciones. Tu donativo no desbloquea nada — la app es gratuita para todos. Solo aligera la carga y ayuda a que el proyecto avance.",
    },
    {
      q: "¿Y si no puedo donar?",
      a: "Ya formas parte de la historia. Orar por ConnectStar, hablar de ella, compartir la app con quien la necesita — es un apoyo enorme, y no cuesta nada. Nadie tiene que pagar para tener su lugar aquí.",
    },
    {
      q: "¿Puedo parar cuando quiera?",
      a: "Sí, libremente y en cualquier momento. Sin compromiso, sin cargos ocultos. Das lo que quieres, cuando tu corazón te lo dice — ni un céntimo más.",
    },
    {
      q: "¿Puede mi donación ser anónima?",
      a: "Por supuesto. Puedes dar con discreción, sin mostrar tu nombre. Nunca compartimos tu identidad ni vendemos ningún dato — jamás.",
    },
    {
      q: "¿Recibiré un recibo fiscal?",
      a: "Sí, basta con pedirlo en connectstar.contact@gmail.com. Según tu situación, puede permitirte deducir parte de tu donación de tus impuestos.",
    },
    {
      q: "¿ConnectStar seguirá siendo realmente gratis?",
      a: "Sí — siempre, pase lo que pase, incluso sin una sola donación. Que sea gratis no depende del dinero que entra: se apoya en una promesa. ConnectStar no se montó como un negocio, sino que se recibió como un llamado. Se sostiene por la ayuda de Jesús — no por las donaciones. Nadie quedará jamás privado de la oración o de la Palabra por falta de medios.",
    },
    {
      q: "¿Quién está detrás de ConnectStar?",
      a: "Un nombre, un rostro: Édouard Georges-Michel, desarrollador de aplicaciones móviles. Sin empresa, sin accionistas a los que pagar — un creyente que programa y ora sobre cada detalle. Lo dice con sencillez: «Este proyecto me lo confió Jesús. Así que cuento con su ayuda, no con una cuenta bancaria.»",
    },
  ],
  de: [
    {
      q: "Ist es wirklich sicher?",
      a: "Ja. Deine Zahlungen laufen über HelloAsso, eine zertifizierte französische Plattform, oder über PayPal — nie über unsere Server. Deine Bankdaten erreichen uns nicht: Wir sehen sie nicht und speichern sie nicht.",
    },
    {
      q: "Wofür wird meine Spende konkret verwendet?",
      a: "Um ConnectStar wachsen zu lassen: die Server, die es Tag und Nacht online halten, und die Entwicklung neuer Funktionen. Deine Spende schaltet nichts frei — die App ist für alle kostenlos. Sie nimmt nur Last ab und hilft dem Projekt voranzukommen.",
    },
    {
      q: "Und wenn ich nicht spenden kann?",
      a: "Du bist schon Teil der Geschichte. Für ConnectStar beten, davon erzählen, die App an jemanden weitergeben, der sie braucht — das ist eine riesige Unterstützung, und sie kostet nichts. Niemand muss zahlen, um hier dazuzugehören.",
    },
    {
      q: "Kann ich jederzeit aufhören?",
      a: "Ja, frei und jederzeit. Keine Verpflichtung, keine versteckten Abbuchungen. Du gibst, was du willst, wenn dein Herz es dir sagt — keinen Cent mehr.",
    },
    {
      q: "Kann meine Spende anonym bleiben?",
      a: "Natürlich. Du kannst im Stillen geben, ohne deinen Namen zu zeigen. Wir geben deine Identität nie weiter und verkaufen keine Daten — niemals.",
    },
    {
      q: "Bekomme ich eine Spendenbescheinigung?",
      a: "Ja, einfach unter connectstar.contact@gmail.com anfragen. Je nach deiner Situation kannst du damit einen Teil deiner Spende steuerlich absetzen.",
    },
    {
      q: "Bleibt ConnectStar wirklich kostenlos?",
      a: "Ja — immer, egal was kommt, sogar ohne eine einzige Spende. Dass es kostenlos ist, hängt nicht vom eingehenden Geld ab: Es beruht auf einem Versprechen. ConnectStar wurde nicht als Geschäft aufgebaut, sondern als Berufung empfangen. Es trägt durch die Hilfe von Jesus — nicht durch Spenden. Niemand wird je aus Geldmangel vom Gebet oder vom Wort ausgeschlossen.",
    },
    {
      q: "Wer steckt hinter ConnectStar?",
      a: "Ein Name, ein Gesicht: Édouard Georges-Michel, Entwickler mobiler Apps. Kein Unternehmen, keine Aktionäre, die bezahlt werden müssen — ein Gläubiger, der programmiert und über jedes Detail betet. Er sagt es schlicht: „Dieses Projekt hat mir Jesus anvertraut. Also zähle ich auf seine Hilfe, nicht auf ein Bankkonto.“",
    },
  ],
  it: [
    {
      q: "È davvero sicuro?",
      a: "Sì. I tuoi pagamenti passano da HelloAsso, piattaforma francese certificata, o da PayPal — mai dai nostri server. I tuoi dati bancari non ci arrivano: non li vediamo e non li conserviamo.",
    },
    {
      q: "A cosa serve concretamente la mia donazione?",
      a: "A far crescere ConnectStar: i server che la tengono online giorno e notte, e lo sviluppo di nuove funzioni. La tua donazione non sblocca nulla — l'app è gratuita per tutti. Alleggerisce soltanto il carico e aiuta il progetto ad andare avanti.",
    },
    {
      q: "E se non posso donare?",
      a: "Fai già parte della storia. Pregare per ConnectStar, parlarne, condividere l'app con chi ne ha bisogno — è un sostegno immenso, e non costa nulla. Nessuno deve pagare per avere il suo posto qui.",
    },
    {
      q: "Posso smettere quando voglio?",
      a: "Sì, liberamente e in qualsiasi momento. Nessun impegno, nessun addebito nascosto. Doni ciò che vuoi, quando il tuo cuore te lo dice — mai un centesimo in più.",
    },
    {
      q: "La mia donazione può restare anonima?",
      a: "Certo. Puoi donare con discrezione, senza mostrare il tuo nome. Non condividiamo mai la tua identità e non vendiamo alcun dato — mai.",
    },
    {
      q: "Riceverò una ricevuta fiscale?",
      a: "Sì, basta richiederla a connectstar.contact@gmail.com. A seconda della tua situazione, può permetterti di dedurre una parte della donazione dalle tasse.",
    },
    {
      q: "ConnectStar resterà davvero gratuita?",
      a: "Sì — sempre, qualunque cosa accada, anche senza una sola donazione. La gratuità non dipende dal denaro che entra: si fonda su una promessa. ConnectStar non è nata come un'attività commerciale, ma è stata ricevuta come una chiamata. Si regge sull'aiuto di Gesù — non sulle donazioni. Nessuno sarà mai privato della preghiera o della Parola per mancanza di mezzi.",
    },
    {
      q: "Chi c'è dietro ConnectStar?",
      a: "Un nome, un volto: Édouard Georges-Michel, sviluppatore di app mobili. Nessuna azienda, nessun azionista da pagare — un credente che programma e prega su ogni dettaglio. Lo dice con semplicità: «Questo progetto me l'ha affidato Gesù. Perciò conto sul suo aiuto, non su un conto in banca.»",
    },
  ],
  pt: [
    {
      q: "É mesmo seguro?",
      a: "Sim. Os teus pagamentos passam pelo HelloAsso, plataforma francesa certificada, ou pelo PayPal — nunca pelos nossos servidores. Os teus dados bancários não chegam até nós: não os vemos nem os guardamos.",
    },
    {
      q: "Para que serve concretamente a minha doação?",
      a: "Para fazer crescer o ConnectStar: os servidores que o mantêm online dia e noite, e o desenvolvimento de novas funcionalidades. A tua doação não desbloqueia nada — a app é gratuita para todos. Apenas alivia a carga e ajuda o projeto a avançar.",
    },
    {
      q: "E se eu não puder doar?",
      a: "Já fazes parte da história. Orar pelo ConnectStar, falar dele, partilhar a app com quem precisa — é um apoio enorme, e não custa nada. Ninguém precisa de pagar para ter o seu lugar aqui.",
    },
    {
      q: "Posso parar quando quiser?",
      a: "Sim, livremente e a qualquer momento. Sem compromisso, sem cobranças escondidas. Dás o que quiseres, quando o teu coração te disser — nunca um cêntimo a mais.",
    },
    {
      q: "A minha doação pode ser anónima?",
      a: "Claro. Podes doar discretamente, sem mostrar o teu nome. Nunca partilhamos a tua identidade e não vendemos nenhum dado — nunca.",
    },
    {
      q: "Vou receber um recibo fiscal?",
      a: "Sim, basta pedir em connectstar.contact@gmail.com. Consoante a tua situação, pode permitir-te deduzir parte da doação nos teus impostos.",
    },
    {
      q: "O ConnectStar vai mesmo continuar gratuito?",
      a: "Sim — sempre, aconteça o que acontecer, mesmo sem uma única doação. A gratuidade não depende do dinheiro que entra: assenta numa promessa. O ConnectStar não foi montado como um negócio, mas recebido como um chamado. Sustenta-se pela ajuda de Jesus — não pelas doações. Ninguém será jamais privado da oração ou da Palavra por falta de meios.",
    },
    {
      q: "Quem está por trás do ConnectStar?",
      a: "Um nome, um rosto: Édouard Georges-Michel, programador de aplicações móveis. Sem empresa, sem acionistas a pagar — um crente que programa e ora sobre cada detalhe. Ele diz com simplicidade: «Este projeto foi-me confiado por Jesus. Por isso conto com a sua ajuda, não com uma conta bancária.»",
    },
  ],
  ar: [
    {
      q: "هل هو آمن حقًا؟",
      a: "نعم. تتم مدفوعاتك عبر HelloAsso، وهي منصة فرنسية معتمدة، أو عبر PayPal — لا عبر خوادمنا أبدًا. لا تصل إلينا بياناتك المصرفية: لا نراها ولا نخزّنها.",
    },
    {
      q: "فيمَ يُستخدم تبرعي فعليًا؟",
      a: "في تنمية ConnectStar: الخوادم التي تُبقيه متصلًا ليلًا ونهارًا، وتطوير ميزات جديدة. تبرعك لا يفتح أي شيء — التطبيق مجاني للجميع. إنه فقط يخفف العبء ويساعد المشروع على التقدم.",
    },
    {
      q: "وماذا لو لم أستطع التبرع؟",
      a: "أنت بالفعل جزء من القصة. الصلاة من أجل ConnectStar، والحديث عنه، ومشاركة التطبيق مع من يحتاجه — هذا دعم هائل، ولا يكلّف شيئًا. لا أحد مضطر للدفع ليكون له مكان هنا.",
    },
    {
      q: "هل يمكنني التوقف متى أشاء؟",
      a: "نعم، بحرية وفي أي وقت. لا التزام ولا خصومات خفية. تعطي ما تشاء، حين يدفعك قلبك — ولا سنت واحد أكثر.",
    },
    {
      q: "هل يمكن أن يبقى تبرعي مجهولًا؟",
      a: "بالطبع. يمكنك أن تعطي بتكتّم، دون إظهار اسمك. لا نشارك هويتك أبدًا ولا نبيع أي بيانات — أبدًا.",
    },
    {
      q: "هل سأحصل على إيصال ضريبي؟",
      a: "نعم، يكفي طلبه على connectstar.contact@gmail.com. وبحسب وضعك، قد يتيح لك خصم جزء من تبرعك من ضرائبك.",
    },
    {
      q: "هل سيبقى ConnectStar مجانيًا حقًا؟",
      a: "نعم — دائمًا، مهما حدث، حتى بدون تبرع واحد. مجانيّته لا تعتمد على المال الذي يدخل: بل تقوم على وعد. لم يُبنَ ConnectStar كتجارة، بل تلقّيتُه كدعوة. إنه يصمد بعون يسوع — لا بالتبرعات. لن يُحرَم أحد يومًا من الصلاة أو من الكلمة بسبب ضيق ذات اليد.",
    },
    {
      q: "من يقف وراء ConnectStar؟",
      a: "اسم ووجه: Édouard Georges-Michel، مطوّر تطبيقات للهواتف المحمولة. لا شركة ولا مساهمون يُدفع لهم — مؤمن يبرمج ويصلّي على كل تفصيل. يقولها ببساطة: «هذا المشروع ائتمنني عليه يسوع. لذلك أعتمد على عونه، لا على حساب مصرفي.»",
    },
  ],
  hi: [
    {
      q: "क्या यह सचमुच सुरक्षित है?",
      a: "हाँ। आपके भुगतान HelloAsso, एक प्रमाणित फ़्रेंच प्लेटफ़ॉर्म, या PayPal के ज़रिए होते हैं — कभी हमारे सर्वर से नहीं। आपके बैंक विवरण हम तक पहुँचते ही नहीं: न हम उन्हें देखते हैं, न सहेजते हैं।",
    },
    {
      q: "मेरा दान असल में किस काम आता है?",
      a: "ConnectStar को बढ़ाने में: वे सर्वर जो इसे दिन-रात ऑनलाइन रखते हैं, और नई सुविधाओं का विकास। आपका दान कुछ भी अनलॉक नहीं करता — ऐप सबके लिए मुफ़्त है। यह बस बोझ हल्का करता है और परियोजना को आगे बढ़ाता है।",
    },
    {
      q: "और अगर मैं दान न कर सकूँ?",
      a: "आप पहले से ही इस कहानी का हिस्सा हैं। ConnectStar के लिए प्रार्थना करना, इसके बारे में बताना, ज़रूरतमंद के साथ ऐप साझा करना — यह बहुत बड़ा सहयोग है, और इसमें कुछ खर्च नहीं होता। यहाँ अपनी जगह पाने के लिए किसी को भुगतान नहीं करना पड़ता।",
    },
    {
      q: "क्या मैं जब चाहूँ रोक सकता हूँ?",
      a: "हाँ, स्वतंत्र रूप से और कभी भी। कोई प्रतिबद्धता नहीं, कोई छिपा शुल्क नहीं। आप जितना चाहें, जब आपका दिल कहे उतना देते हैं — एक पैसा भी अधिक नहीं।",
    },
    {
      q: "क्या मेरा दान गुमनाम रह सकता है?",
      a: "बिलकुल। आप बिना अपना नाम दिखाए, चुपचाप दे सकते हैं। हम आपकी पहचान कभी साझा नहीं करते और कोई डेटा नहीं बेचते — कभी नहीं।",
    },
    {
      q: "क्या मुझे कर रसीद मिलेगी?",
      a: "हाँ, बस connectstar.contact@gmail.com पर अनुरोध करें। आपकी स्थिति के अनुसार, यह आपको अपने दान का कुछ हिस्सा कर में छूट दिला सकती है।",
    },
    {
      q: "क्या ConnectStar सचमुच मुफ़्त रहेगा?",
      a: "हाँ — हमेशा, चाहे कुछ भी हो, एक भी दान के बिना भी। इसका मुफ़्त होना आने वाले पैसे पर निर्भर नहीं: यह एक वादे पर टिका है। ConnectStar को व्यापार की तरह नहीं बनाया गया, बल्कि एक बुलाहट की तरह पाया गया। यह यीशु की मदद से टिकता है — दान से नहीं। धन की कमी के कारण किसी को कभी प्रार्थना या वचन से वंचित नहीं किया जाएगा।",
    },
    {
      q: "ConnectStar के पीछे कौन है?",
      a: "एक नाम, एक चेहरा: Édouard Georges-Michel, मोबाइल ऐप डेवलपर। कोई कंपनी नहीं, भुगतान पाने वाले कोई शेयरधारक नहीं — एक विश्वासी जो हर विवरण पर कोड करता और प्रार्थना करता है। वह सरलता से कहता है: «यह परियोजना यीशु ने मुझे सौंपी है। इसलिए मैं उसकी मदद पर भरोसा करता हूँ, बैंक खाते पर नहीं।»",
    },
  ],
  id: [
    {
      q: "Apakah benar-benar aman?",
      a: "Ya. Pembayaranmu melewati HelloAsso, platform Prancis bersertifikat, atau PayPal — tidak pernah melalui server kami. Data bankmu tidak sampai kepada kami: kami tidak melihatnya dan tidak menyimpannya.",
    },
    {
      q: "Untuk apa sebenarnya donasiku?",
      a: "Untuk menumbuhkan ConnectStar: server yang menjaganya tetap daring siang dan malam, dan pengembangan fitur baru. Donasimu tidak membuka apa pun — aplikasinya gratis untuk semua. Ia hanya meringankan beban dan membantu proyek ini maju.",
    },
    {
      q: "Bagaimana jika aku tidak bisa berdonasi?",
      a: "Kamu sudah menjadi bagian dari kisah ini. Mendoakan ConnectStar, menceritakannya, membagikan aplikasinya kepada yang membutuhkan — itu dukungan yang luar biasa, dan tidak memerlukan biaya. Tak seorang pun harus membayar untuk punya tempat di sini.",
    },
    {
      q: "Bisakah aku berhenti kapan saja?",
      a: "Ya, dengan bebas dan kapan saja. Tanpa ikatan, tanpa potongan tersembunyi. Kamu memberi sesukamu, saat hatimu menggerakkanmu — tidak sesen pun lebih.",
    },
    {
      q: "Bisakah donasiku tetap anonim?",
      a: "Tentu. Kamu bisa memberi diam-diam, tanpa menampilkan namamu. Kami tidak pernah membagikan identitasmu dan tidak menjual data apa pun — tidak pernah.",
    },
    {
      q: "Apakah aku akan menerima bukti pajak?",
      a: "Ya, cukup minta di connectstar.contact@gmail.com. Tergantung situasimu, itu bisa membuatmu mengurangi sebagian donasi dari pajakmu.",
    },
    {
      q: "Apakah ConnectStar benar-benar akan tetap gratis?",
      a: "Ya — selalu, apa pun yang terjadi, bahkan tanpa satu donasi pun. Gratisnya tidak bergantung pada uang yang masuk: ia bersandar pada sebuah janji. ConnectStar tidak dibangun sebagai bisnis, melainkan diterima sebagai panggilan. Ia bertahan oleh pertolongan Yesus — bukan oleh donasi. Tak seorang pun akan pernah kehilangan doa atau Firman karena kekurangan biaya.",
    },
    {
      q: "Siapa yang ada di balik ConnectStar?",
      a: "Satu nama, satu wajah: Édouard Georges-Michel, pengembang aplikasi seluler. Tanpa perusahaan, tanpa pemegang saham yang harus dibayar — seorang percaya yang mengoding dan berdoa atas setiap detail. Ia mengatakannya dengan sederhana: «Proyek ini dipercayakan kepadaku oleh Yesus. Maka aku mengandalkan pertolongan-Nya, bukan rekening bank.»",
    },
  ],
  ja: [
    {
      q: "本当に安全ですか？",
      a: "はい。お支払いは認証済みのフランスのプラットフォームHelloAsso、またはPayPalを通じて行われ、当方のサーバーを経由することはありません。あなたの銀行情報が当方に届くことはなく、閲覧も保存もしません。",
    },
    {
      q: "私の寄付は具体的に何に使われますか？",
      a: "ConnectStarを育てるためです。昼夜を問わずオンラインを保つサーバー、そして新機能の開発に使われます。あなたの寄付が何かを解除することはありません——アプリは誰にとっても無料です。ただ負担を軽くし、プロジェクトを前に進める助けになります。",
    },
    {
      q: "寄付ができない場合は？",
      a: "あなたはすでに物語の一部です。ConnectStarのために祈ること、人に伝えること、必要としている人にアプリを届けること——それは大きな支えであり、何の費用もかかりません。ここに居場所を得るために支払う必要は誰にもありません。",
    },
    {
      q: "いつでもやめられますか？",
      a: "はい、自由に、いつでも。契約も、隠れた請求もありません。心が動いたときに、望む分だけ——それ以上は一円もかかりません。",
    },
    {
      q: "寄付を匿名にできますか？",
      a: "もちろんです。名前を出さず、そっと贈ることができます。あなたの身元を共有することは決してなく、いかなるデータも販売しません——決して。",
    },
    {
      q: "税の領収書はもらえますか？",
      a: "はい、connectstar.contact@gmail.com にご依頼ください。状況によっては、寄付の一部を税から控除できる場合があります。",
    },
    {
      q: "ConnectStarは本当にずっと無料のままですか？",
      a: "はい——何があっても、たとえ寄付が一件もなくても、いつまでも。無料であることは入ってくるお金に左右されません。それは一つの約束に基づいています。ConnectStarは事業として作られたのではなく、召しとして受け取られたものです。それを支えるのはイエスの助けであり、寄付ではありません。お金がないために祈りやみことばから遠ざけられる人は、決していません。",
    },
    {
      q: "ConnectStarの背後にいるのは誰ですか？",
      a: "一つの名前、一つの顔——Édouard Georges-Michel、モバイルアプリ開発者です。会社もなく、報酬を払う株主もいません。すべての細部にコードを書き、祈る一人の信仰者です。彼はこう言います。「このプロジェクトはイエスが私に託されたものです。だから私は銀行口座ではなく、その助けに頼っています。」",
    },
  ],
  zh: [
    {
      q: "真的安全吗？",
      a: "是的。你的付款通过经过认证的法国平台 HelloAsso 或 PayPal 进行，绝不经过我们的服务器。你的银行信息不会到达我们这里：我们看不到，也不会存储。",
    },
    {
      q: "我的捐助具体用在哪里？",
      a: "用于让 ConnectStar 成长：让它昼夜在线的服务器，以及新功能的开发。你的捐助不会解锁任何东西——应用对所有人免费。它只是减轻负担，帮助项目前行。",
    },
    {
      q: "如果我无法捐款怎么办？",
      a: "你已经是这个故事的一部分。为 ConnectStar 祷告、向他人讲述、把应用分享给需要的人——这是巨大的支持，而且分文不花。没有人需要付费才能在这里拥有一席之地。",
    },
    {
      q: "我可以随时停止吗？",
      a: "可以，自由地、随时。没有任何承诺，没有隐藏扣款。你凭心意给予你所愿的——绝不会多收一分。",
    },
    {
      q: "我的捐助可以匿名吗？",
      a: "当然。你可以悄悄地给予，不显示你的名字。我们绝不分享你的身份，也不出售任何数据——永不。",
    },
    {
      q: "我会收到税务收据吗？",
      a: "会的，只需发邮件到 connectstar.contact@gmail.com 索取。视你的情况而定，它或许能让你从税款中抵扣一部分捐助。",
    },
    {
      q: "ConnectStar 真的会一直免费吗？",
      a: "是的——永远，无论如何，即使没有一笔捐助。它的免费并不取决于进来的钱：它建立在一个承诺之上。ConnectStar 不是作为一门生意建立的，而是作为一个呼召被领受的。支撑它的是耶稣的帮助——不是捐助。绝不会有人因缺乏财力而被拒于祷告或圣言之外。",
    },
    {
      q: "谁在 ConnectStar 背后？",
      a: "一个名字，一张面孔：Édouard Georges-Michel，一位移动应用开发者。没有公司，没有需要分红的股东——一位在每个细节上编写代码并祷告的信徒。他简单地说：“这个项目是耶稣托付给我的。所以我倚靠的是祂的帮助，而不是银行账户。”",
    },
  ],
};

for (const [lang, items] of Object.entries(ITEMS)) {
  const path = resolve(I18N, lang, "common.json");
  const json = JSON.parse(await readFile(path, "utf8"));
  json.donationPageNew ??= {};
  json.donationPageNew.faq ??= {};
  json.donationPageNew.faq.items = items;
  await writeFile(path, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log(`✓ ${lang} → donationPageNew.faq.items (${items.length} questions)`);
}
console.log("Terminé.");
