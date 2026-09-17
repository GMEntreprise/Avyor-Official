import { readFileSync, writeFileSync } from "node:fs";

/* FAQ « page Soutenir » — refonte complète : concrète, émotionnelle, qui
   rassure. 8 questions couvrant sécurité, destination du don, soutien sans
   argent, liberté d'arrêter, anonymat, reçu fiscal, gratuité, équipe.
   Email réel : connectstar.contact@gmail.com. Aucun chiffre inventé
   (70/30 = répartition déjà affichée dans la section Impact). */

const EMAIL = "connectstar.contact@gmail.com";

const FAQ = {
  fr: {
    title: "Questions fréquentes",
    subtitle: "Tout ce que tu te demandes avant de donner — répondu avec honnêteté.",
    items: [
      {
        q: "Est-ce vraiment sécurisé ?",
        a: `Oui, à 100 %. Les paiements passent par HelloAsso, plateforme française certifiée, ou par PayPal — jamais par nos serveurs. Tes coordonnées bancaires ne nous parviennent jamais : nous ne les voyons pas et nous ne les stockons pas.`,
      },
      {
        q: "Où va concrètement mon don ?",
        a: `Chaque euro fait vivre l'application : environ 70 % couvrent les serveurs qui gardent ConnectStar en ligne jour et nuit, 30 % vont au développement de nouvelles fonctionnalités. Rien ne part dans la publicité — nous n'en faisons pas.`,
      },
      {
        q: "Et si je ne peux pas donner d'argent ?",
        a: `Tu fais déjà partie de l'histoire. Prier pour ConnectStar, en parler autour de toi, partager l'application à une personne qui en a besoin — c'est un soutien immense, et il ne coûte rien.`,
      },
      {
        q: "Puis-je arrêter quand je veux ?",
        a: `Oui, librement et à tout moment. Aucun engagement, aucun prélèvement caché. Tu donnes ce que tu veux, quand ton cœur te le dit — pas un centime de plus.`,
      },
      {
        q: "Mon don peut-il rester anonyme ?",
        a: `Bien sûr. Tu peux donner discrètement, sans afficher ton nom. Nous ne partageons jamais ton identité et nous ne revendons aucune donnée — jamais.`,
      },
      {
        q: "Vais-je recevoir un reçu fiscal ?",
        a: `Oui. Un reçu fiscal est disponible sur simple demande à ${EMAIL}. Selon ta situation, il peut te permettre de déduire une partie de ton don de tes impôts.`,
      },
      {
        q: "ConnectStar restera-t-il vraiment gratuit ?",
        a: `Oui, et c'est un engagement profond. ConnectStar est gratuit par principe — pour que personne ne soit jamais privé de la prière ou de la Parole faute de moyens. Ton don est exactement ce qui nous permet de tenir cette promesse.`,
      },
      {
        q: "Qui se cache derrière ConnectStar ?",
        a: `Une petite équipe de croyants, portée par une conviction simple : offrir un espace numérique sain, sans publicité et sans pièges, où chacun peut grandir dans la foi. Pas d'actionnaires à rémunérer — seulement une mission à faire vivre.`,
      },
    ],
  },
  en: {
    title: "Frequently asked questions",
    subtitle: "Everything you're wondering before you give — answered honestly.",
    items: [
      {
        q: "Is it really secure?",
        a: `Yes, completely. Payments go through HelloAsso, a certified French platform, or through PayPal — never through our servers. Your banking details never reach us: we don't see them and we don't store them.`,
      },
      {
        q: "Where does my gift actually go?",
        a: `Every euro keeps the app alive: around 70% covers the servers that keep ConnectStar online day and night, 30% goes to building new features. Nothing goes to advertising — we don't run any.`,
      },
      {
        q: "What if I can't give money?",
        a: `You're already part of the story. Praying for ConnectStar, talking about it around you, sharing the app with someone who needs it — that's a huge support, and it costs nothing.`,
      },
      {
        q: "Can I stop whenever I want?",
        a: `Yes, freely and at any time. No commitment, no hidden charges. You give what you want, when your heart tells you to — not a cent more.`,
      },
      {
        q: "Can my gift stay anonymous?",
        a: `Of course. You can give discreetly, without showing your name. We never share your identity and we never sell any data — ever.`,
      },
      {
        q: "Will I get a tax receipt?",
        a: `Yes. A tax receipt is available on simple request at ${EMAIL}. Depending on your situation, it may let you deduct part of your gift from your taxes.`,
      },
      {
        q: "Will ConnectStar really stay free?",
        a: `Yes, and it's a deep commitment. ConnectStar is free on principle — so that no one is ever cut off from prayer or the Word for lack of means. Your gift is exactly what lets us keep that promise.`,
      },
      {
        q: "Who is behind ConnectStar?",
        a: `A small team of believers, driven by one simple conviction: to offer a healthy digital space, ad-free and trap-free, where everyone can grow in faith. No shareholders to pay — only a mission to keep alive.`,
      },
    ],
  },
  es: {
    title: "Preguntas frecuentes",
    subtitle: "Todo lo que te preguntas antes de donar — respondido con honestidad.",
    items: [
      {
        q: "¿Es realmente seguro?",
        a: `Sí, totalmente. Los pagos pasan por HelloAsso, plataforma francesa certificada, o por PayPal — nunca por nuestros servidores. Tus datos bancarios nunca llegan a nosotros: no los vemos ni los guardamos.`,
      },
      {
        q: "¿A dónde va realmente mi donación?",
        a: `Cada euro mantiene viva la aplicación: alrededor del 70 % cubre los servidores que mantienen ConnectStar en línea día y noche, y el 30 % se destina al desarrollo de nuevas funciones. Nada va a la publicidad — no la usamos.`,
      },
      {
        q: "¿Y si no puedo dar dinero?",
        a: `Ya formas parte de la historia. Orar por ConnectStar, hablar de él a tu alrededor, compartir la aplicación con alguien que la necesita — es un apoyo enorme, y no cuesta nada.`,
      },
      {
        q: "¿Puedo parar cuando quiera?",
        a: `Sí, libremente y en cualquier momento. Sin compromiso, sin cargos ocultos. Das lo que quieras, cuando tu corazón te lo diga — ni un céntimo más.`,
      },
      {
        q: "¿Puede mi donación ser anónima?",
        a: `Por supuesto. Puedes donar con discreción, sin mostrar tu nombre. Nunca compartimos tu identidad ni vendemos ningún dato — jamás.`,
      },
      {
        q: "¿Recibiré un recibo fiscal?",
        a: `Sí. Hay un recibo fiscal disponible con una simple solicitud a ${EMAIL}. Según tu situación, puede permitirte deducir parte de tu donación de tus impuestos.`,
      },
      {
        q: "¿ConnectStar seguirá siendo gratis de verdad?",
        a: `Sí, y es un compromiso profundo. ConnectStar es gratuito por principio — para que nadie quede nunca privado de la oración o de la Palabra por falta de medios. Tu donación es justo lo que nos permite cumplir esa promesa.`,
      },
      {
        q: "¿Quién está detrás de ConnectStar?",
        a: `Un pequeño equipo de creyentes, movido por una convicción sencilla: ofrecer un espacio digital sano, sin publicidad y sin trampas, donde cada uno pueda crecer en la fe. Sin accionistas a quienes pagar — solo una misión que mantener viva.`,
      },
    ],
  },
  de: {
    title: "Häufige Fragen",
    subtitle: "Alles, was du dich vor dem Spenden fragst — ehrlich beantwortet.",
    items: [
      {
        q: "Ist es wirklich sicher?",
        a: `Ja, vollkommen. Zahlungen laufen über HelloAsso, eine zertifizierte französische Plattform, oder über PayPal — nie über unsere Server. Deine Bankdaten erreichen uns nie: Wir sehen sie nicht und speichern sie nicht.`,
      },
      {
        q: "Wohin geht meine Spende konkret?",
        a: `Jeder Euro hält die App am Leben: Rund 70 % decken die Server, die ConnectStar Tag und Nacht online halten, 30 % fließen in die Entwicklung neuer Funktionen. Nichts geht in Werbung — wir machen keine.`,
      },
      {
        q: "Und wenn ich kein Geld geben kann?",
        a: `Du bist schon Teil der Geschichte. Für ConnectStar beten, davon erzählen, die App mit jemandem teilen, der sie braucht — das ist eine riesige Unterstützung, und sie kostet nichts.`,
      },
      {
        q: "Kann ich jederzeit aufhören?",
        a: `Ja, frei und jederzeit. Keine Verpflichtung, keine versteckten Abbuchungen. Du gibst, was du willst, wenn dein Herz es dir sagt — keinen Cent mehr.`,
      },
      {
        q: "Kann meine Spende anonym bleiben?",
        a: `Natürlich. Du kannst diskret spenden, ohne deinen Namen zu zeigen. Wir geben deine Identität nie weiter und verkaufen keine Daten — niemals.`,
      },
      {
        q: "Bekomme ich eine Spendenquittung?",
        a: `Ja. Eine Spendenquittung gibt es auf einfache Anfrage an ${EMAIL}. Je nach deiner Situation kannst du damit einen Teil deiner Spende von der Steuer absetzen.`,
      },
      {
        q: "Bleibt ConnectStar wirklich kostenlos?",
        a: `Ja, und das ist eine tiefe Verpflichtung. ConnectStar ist aus Prinzip kostenlos — damit niemand je aus Geldmangel vom Gebet oder vom Wort ausgeschlossen wird. Deine Spende ist genau das, was uns dieses Versprechen halten lässt.`,
      },
      {
        q: "Wer steckt hinter ConnectStar?",
        a: `Ein kleines Team von Gläubigen, getragen von einer einfachen Überzeugung: einen gesunden digitalen Raum zu bieten, ohne Werbung und ohne Fallen, in dem jeder im Glauben wachsen kann. Keine Aktionäre, die bezahlt werden müssen — nur eine Mission, die am Leben bleiben soll.`,
      },
    ],
  },
  it: {
    title: "Domande frequenti",
    subtitle: "Tutto ciò che ti chiedi prima di donare — con risposte oneste.",
    items: [
      {
        q: "È davvero sicuro?",
        a: `Sì, al 100 %. I pagamenti passano da HelloAsso, piattaforma francese certificata, o da PayPal — mai dai nostri server. I tuoi dati bancari non ci arrivano mai: non li vediamo e non li conserviamo.`,
      },
      {
        q: "Dove va concretamente la mia donazione?",
        a: `Ogni euro tiene viva l'app: circa il 70 % copre i server che mantengono ConnectStar online giorno e notte, il 30 % va allo sviluppo di nuove funzioni. Niente va in pubblicità — non ne facciamo.`,
      },
      {
        q: "E se non posso donare denaro?",
        a: `Fai già parte della storia. Pregare per ConnectStar, parlarne intorno a te, condividere l'app con chi ne ha bisogno — è un sostegno immenso, e non costa nulla.`,
      },
      {
        q: "Posso smettere quando voglio?",
        a: `Sì, liberamente e in qualsiasi momento. Nessun impegno, nessun addebito nascosto. Doni quello che vuoi, quando il tuo cuore te lo dice — non un centesimo di più.`,
      },
      {
        q: "La mia donazione può restare anonima?",
        a: `Certo. Puoi donare con discrezione, senza mostrare il tuo nome. Non condividiamo mai la tua identità e non vendiamo alcun dato — mai.`,
      },
      {
        q: "Riceverò una ricevuta fiscale?",
        a: `Sì. Una ricevuta fiscale è disponibile su semplice richiesta a ${EMAIL}. A seconda della tua situazione, può permetterti di dedurre parte della donazione dalle tasse.`,
      },
      {
        q: "ConnectStar resterà davvero gratuito?",
        a: `Sì, ed è un impegno profondo. ConnectStar è gratuito per principio — perché nessuno sia mai privato della preghiera o della Parola per mancanza di mezzi. La tua donazione è esattamente ciò che ci permette di mantenere questa promessa.`,
      },
      {
        q: "Chi c'è dietro ConnectStar?",
        a: `Una piccola squadra di credenti, mossa da una convinzione semplice: offrire uno spazio digitale sano, senza pubblicità e senza trappole, dove ognuno possa crescere nella fede. Nessun azionista da pagare — solo una missione da tenere viva.`,
      },
    ],
  },
  pt: {
    title: "Perguntas frequentes",
    subtitle: "Tudo o que você se pergunta antes de doar — respondido com honestidade.",
    items: [
      {
        q: "É realmente seguro?",
        a: `Sim, totalmente. Os pagamentos passam pelo HelloAsso, plataforma francesa certificada, ou pelo PayPal — nunca pelos nossos servidores. Os seus dados bancários nunca chegam até nós: não os vemos nem os guardamos.`,
      },
      {
        q: "Para onde vai realmente a minha doação?",
        a: `Cada euro mantém o aplicativo vivo: cerca de 70 % cobrem os servidores que mantêm o ConnectStar online dia e noite, e 30 % vão para o desenvolvimento de novos recursos. Nada vai para publicidade — não fazemos nenhuma.`,
      },
      {
        q: "E se eu não puder doar dinheiro?",
        a: `Você já faz parte da história. Orar pelo ConnectStar, falar dele ao seu redor, compartilhar o aplicativo com alguém que precisa — é um apoio imenso, e não custa nada.`,
      },
      {
        q: "Posso parar quando quiser?",
        a: `Sim, livremente e a qualquer momento. Sem compromisso, sem cobranças ocultas. Você dá o que quiser, quando o seu coração disser — nem um centavo a mais.`,
      },
      {
        q: "Minha doação pode permanecer anônima?",
        a: `Claro. Você pode doar com discrição, sem mostrar o seu nome. Nunca compartilhamos a sua identidade e nunca vendemos nenhum dado — jamais.`,
      },
      {
        q: "Vou receber um recibo fiscal?",
        a: `Sim. Um recibo fiscal está disponível mediante simples solicitação para ${EMAIL}. Dependendo da sua situação, ele pode permitir deduzir parte da doação dos seus impostos.`,
      },
      {
        q: "O ConnectStar continuará realmente gratuito?",
        a: `Sim, e é um compromisso profundo. O ConnectStar é gratuito por princípio — para que ninguém fique privado da oração ou da Palavra por falta de recursos. A sua doação é exatamente o que nos permite manter essa promessa.`,
      },
      {
        q: "Quem está por trás do ConnectStar?",
        a: `Uma pequena equipe de crentes, movida por uma convicção simples: oferecer um espaço digital saudável, sem publicidade e sem armadilhas, onde cada um possa crescer na fé. Sem acionistas a remunerar — apenas uma missão a manter viva.`,
      },
    ],
  },
  ar: {
    title: "الأسئلة الشائعة",
    subtitle: "كل ما تتساءل عنه قبل التبرّع — بإجابات صادقة.",
    items: [
      {
        q: "هل هو آمن حقًّا؟",
        a: `نعم، بشكل كامل. تمرّ المدفوعات عبر HelloAsso، وهي منصّة فرنسية معتمدة، أو عبر PayPal — وليس عبر خوادمنا أبدًا. بياناتك البنكية لا تصل إلينا إطلاقًا: لا نراها ولا نخزّنها.`,
      },
      {
        q: "أين يذهب تبرّعي فعليًّا؟",
        a: `كل يورو يُبقي التطبيق حيًّا: نحو 70 % يغطّي الخوادم التي تُبقي ConnectStar متّصلًا ليلًا ونهارًا، و30 % لتطوير ميزات جديدة. لا شيء يذهب إلى الإعلانات — فنحن لا نعرض أيّ إعلان.`,
      },
      {
        q: "وماذا لو لم أستطع التبرّع بالمال؟",
        a: `أنت جزء من القصّة بالفعل. الصلاة من أجل ConnectStar، والحديث عنه لمن حولك، ومشاركة التطبيق مع من يحتاجه — دعمٌ هائل، ولا يكلّف شيئًا.`,
      },
      {
        q: "هل يمكنني التوقّف متى أردت؟",
        a: `نعم، بحرّية وفي أي وقت. لا التزام ولا خصومات خفيّة. تُعطي ما تشاء، حين يدفعك قلبك — ولا سنتًا واحدًا أكثر.`,
      },
      {
        q: "هل يمكن أن يبقى تبرّعي مجهولًا؟",
        a: `بالطبع. يمكنك التبرّع بتكتّم، دون إظهار اسمك. لا نشارك هويّتك أبدًا ولا نبيع أيّ بيانات — إطلاقًا.`,
      },
      {
        q: "هل سأحصل على إيصال ضريبي؟",
        a: `نعم. يتوفّر إيصال ضريبي بطلب بسيط عبر ${EMAIL}. وبحسب وضعك، قد يتيح لك خصم جزء من تبرّعك من ضرائبك.`,
      },
      {
        q: "هل سيبقى ConnectStar مجانيًّا فعلًا؟",
        a: `نعم، وهذا التزام عميق. ConnectStar مجاني من حيث المبدأ — كي لا يُحرَم أحد يومًا من الصلاة أو الكلمة بسبب ضيق ذات اليد. تبرّعك هو تحديدًا ما يتيح لنا الوفاء بهذا الوعد.`,
      },
      {
        q: "مَن وراء ConnectStar؟",
        a: `فريق صغير من المؤمنين، يدفعه اقتناع بسيط: تقديم فضاء رقمي سليم، بلا إعلانات وبلا فخاخ، ينمو فيه كلّ شخص في الإيمان. لا مساهمين يُدفَع لهم — بل رسالة نُبقيها حيّة فحسب.`,
      },
    ],
  },
  hi: {
    title: "अक्सर पूछे जाने वाले प्रश्न",
    subtitle: "दान करने से पहले आप जो भी सोचते हैं — ईमानदारी से उसका जवाब।",
    items: [
      {
        q: "क्या यह वाकई सुरक्षित है?",
        a: `हाँ, पूरी तरह। भुगतान HelloAsso, एक प्रमाणित फ्रांसीसी प्लेटफ़ॉर्म, या PayPal के ज़रिए होता है — कभी हमारे सर्वर से नहीं। आपकी बैंक जानकारी हम तक कभी नहीं पहुँचती: हम न उसे देखते हैं, न संग्रहित करते हैं।`,
      },
      {
        q: "मेरा दान असल में कहाँ जाता है?",
        a: `हर यूरो ऐप को जीवित रखता है: लगभग 70% उन सर्वरों पर खर्च होता है जो ConnectStar को दिन-रात ऑनलाइन रखते हैं, 30% नई सुविधाओं के विकास में जाता है। कुछ भी विज्ञापन में नहीं जाता — हम विज्ञापन नहीं दिखाते।`,
      },
      {
        q: "अगर मैं पैसे न दे सकूँ तो?",
        a: `आप पहले से ही इस कहानी का हिस्सा हैं। ConnectStar के लिए प्रार्थना करना, इसके बारे में बताना, ज़रूरतमंद किसी व्यक्ति के साथ ऐप साझा करना — यह बहुत बड़ा सहयोग है, और इसमें कुछ खर्च नहीं होता।`,
      },
      {
        q: "क्या मैं जब चाहूँ रोक सकता हूँ?",
        a: `हाँ, स्वतंत्र रूप से और कभी भी। कोई प्रतिबद्धता नहीं, कोई छिपा शुल्क नहीं। आप जितना चाहें देते हैं, जब आपका दिल कहे — एक पैसा भी अधिक नहीं।`,
      },
      {
        q: "क्या मेरा दान गुमनाम रह सकता है?",
        a: `बिलकुल। आप बिना अपना नाम दिखाए, चुपचाप दान कर सकते हैं। हम आपकी पहचान कभी साझा नहीं करते और कोई डेटा कभी नहीं बेचते — कभी नहीं।`,
      },
      {
        q: "क्या मुझे कर रसीद मिलेगी?",
        a: `हाँ। ${EMAIL} पर एक साधारण अनुरोध से कर रसीद उपलब्ध है। आपकी स्थिति के अनुसार, यह आपको अपने दान का कुछ हिस्सा कर में घटाने की अनुमति दे सकती है।`,
      },
      {
        q: "क्या ConnectStar सचमुच मुफ़्त रहेगा?",
        a: `हाँ, और यह एक गहरी प्रतिबद्धता है। ConnectStar सिद्धांत रूप से मुफ़्त है — ताकि साधनों की कमी से कोई भी प्रार्थना या वचन से कभी वंचित न रहे। आपका दान ही वह है जो हमें यह वादा निभाने देता है।`,
      },
      {
        q: "ConnectStar के पीछे कौन है?",
        a: `विश्वासियों की एक छोटी टीम, एक सरल विश्वास से प्रेरित: एक स्वस्थ डिजिटल स्थान देना, बिना विज्ञापन और बिना जाल के, जहाँ हर कोई विश्वास में बढ़ सके। चुकाने को कोई शेयरधारक नहीं — बस एक मिशन को जीवित रखना है।`,
      },
    ],
  },
  id: {
    title: "Pertanyaan yang sering diajukan",
    subtitle: "Semua yang kamu pertanyakan sebelum berdonasi — dijawab dengan jujur.",
    items: [
      {
        q: "Apakah benar-benar aman?",
        a: `Ya, sepenuhnya. Pembayaran melalui HelloAsso, platform Prancis bersertifikat, atau melalui PayPal — tidak pernah melalui server kami. Data bank kamu tidak pernah sampai ke kami: kami tidak melihatnya dan tidak menyimpannya.`,
      },
      {
        q: "Ke mana sebenarnya donasiku pergi?",
        a: `Setiap euro membuat aplikasi tetap hidup: sekitar 70% menutupi server yang menjaga ConnectStar online siang dan malam, 30% untuk pengembangan fitur baru. Tidak ada yang masuk ke iklan — kami tidak memasangnya.`,
      },
      {
        q: "Bagaimana jika aku tidak bisa memberi uang?",
        a: `Kamu sudah menjadi bagian dari kisah ini. Mendoakan ConnectStar, membicarakannya di sekitarmu, membagikan aplikasi kepada yang membutuhkan — itu dukungan yang besar, dan tidak memerlukan biaya.`,
      },
      {
        q: "Bisakah aku berhenti kapan saja?",
        a: `Ya, dengan bebas dan kapan saja. Tanpa ikatan, tanpa biaya tersembunyi. Kamu memberi sesuai keinginanmu, saat hatimu menggerakkan — tidak sesen pun lebih.`,
      },
      {
        q: "Bisakah donasiku tetap anonim?",
        a: `Tentu. Kamu bisa memberi secara diam-diam, tanpa menampilkan namamu. Kami tidak pernah membagikan identitasmu dan tidak pernah menjual data apa pun — tidak akan pernah.`,
      },
      {
        q: "Apakah aku akan menerima tanda terima pajak?",
        a: `Ya. Tanda terima pajak tersedia dengan permintaan sederhana ke ${EMAIL}. Tergantung situasimu, itu bisa memungkinkanmu mengurangi sebagian donasi dari pajakmu.`,
      },
      {
        q: "Apakah ConnectStar akan benar-benar tetap gratis?",
        a: `Ya, dan itu komitmen yang dalam. ConnectStar gratis berdasarkan prinsip — agar tidak ada yang pernah terputus dari doa atau Firman karena keterbatasan dana. Donasimu justru yang memungkinkan kami menepati janji itu.`,
      },
      {
        q: "Siapa di balik ConnectStar?",
        a: `Sebuah tim kecil orang percaya, digerakkan oleh satu keyakinan sederhana: menyediakan ruang digital yang sehat, tanpa iklan dan tanpa jebakan, tempat setiap orang bisa bertumbuh dalam iman. Tidak ada pemegang saham yang dibayar — hanya misi yang dijaga tetap hidup.`,
      },
    ],
  },
  ja: {
    title: "よくある質問",
    subtitle: "寄付の前に気になることすべてに、正直にお答えします。",
    items: [
      {
        q: "本当に安全ですか？",
        a: `はい、完全に安全です。お支払いは認証済みのフランスのプラットフォームHelloAsso、またはPayPalを通じて行われ、当方のサーバーを経由することは一切ありません。あなたの銀行情報が当方に届くことはなく、閲覧も保存もしません。`,
      },
      {
        q: "私の寄付は実際どこへ使われますか？",
        a: `すべての寄付がアプリを支えます。約70%はConnectStarを昼夜オンラインに保つサーバーに、30%は新機能の開発に充てられます。広告には一切使いません——そもそも広告を出していません。`,
      },
      {
        q: "お金を寄付できない場合は？",
        a: `あなたはすでに物語の一部です。ConnectStarのために祈ること、まわりに伝えること、必要としている人にアプリを共有すること——それは大きな支えであり、何の費用もかかりません。`,
      },
      {
        q: "いつでもやめられますか？",
        a: `はい、いつでも自由に。契約も、隠れた請求もありません。あなたが望むときに、心が動いた分だけ——それ以上は1円もいただきません。`,
      },
      {
        q: "寄付は匿名のままにできますか？",
        a: `もちろんです。名前を出さず、そっと寄付することができます。あなたの身元を共有することは決してなく、いかなるデータも販売しません——決して。`,
      },
      {
        q: "税控除の領収書はもらえますか？",
        a: `はい。${EMAIL} へのご依頼だけで税控除の領収書を発行します。状況によっては、寄付の一部を税金から控除できる場合があります。`,
      },
      {
        q: "ConnectStarは本当に無料のままですか？",
        a: `はい、それは深い約束です。ConnectStarは原則として無料です——資金がないために、誰も祈りや御言葉から遠ざけられないように。あなたの寄付こそが、その約束を守らせてくれます。`,
      },
      {
        q: "ConnectStarの背後にいるのは誰ですか？",
        a: `小さな信仰者のチームです。広告も罠もない健全なデジタルの場を提供し、誰もが信仰の中で成長できるように——というシンプルな信念に支えられています。報いるべき株主はいません。ただ、生かし続けるべき使命があるだけです。`,
      },
    ],
  },
  zh: {
    title: "常见问题",
    subtitle: "捐助前你想知道的一切——诚实作答。",
    items: [
      {
        q: "真的安全吗？",
        a: `是的，完全安全。付款通过经过认证的法国平台 HelloAsso 或 PayPal 进行——绝不经过我们的服务器。你的银行信息从不会到达我们这里：我们既看不到，也不会存储。`,
      },
      {
        q: "我的捐助到底用在哪里？",
        a: `每一欧元都让应用得以延续：约 70% 用于让 ConnectStar 日夜在线的服务器，30% 用于开发新功能。没有一分钱用于广告——我们不投放任何广告。`,
      },
      {
        q: "如果我无法捐钱怎么办？",
        a: `你已经是这个故事的一部分。为 ConnectStar 祷告、向身边的人讲述、把应用分享给需要的人——这就是巨大的支持，而且分文不费。`,
      },
      {
        q: "我可以随时停止吗？",
        a: `可以，随时自由停止。没有任何承诺，没有隐藏扣费。你想给多少就给多少，在你心受感动的时候——绝不多收一分。`,
      },
      {
        q: "我的捐助可以匿名吗？",
        a: `当然。你可以悄悄捐助，不显示姓名。我们绝不分享你的身份，也绝不出售任何数据——永远不会。`,
      },
      {
        q: "我会收到捐赠收据吗？",
        a: `会的。只需发邮件至 ${EMAIL} 即可获得捐赠收据。视你的情况而定，它或许能让你的部分捐助用于抵扣税款。`,
      },
      {
        q: "ConnectStar 真的会一直免费吗？",
        a: `会的，这是一份深切的承诺。ConnectStar 出于原则而免费——好让没有人因缺乏经济条件而被隔绝于祷告或圣言之外。你的捐助，正是让我们能守住这份承诺的力量。`,
      },
      {
        q: "ConnectStar 背后是谁？",
        a: `一支小小的信徒团队，怀着一个简单的信念：提供一个健康的数字空间，没有广告、没有陷阱，让每个人都能在信仰中成长。没有需要回报的股东——只有一份要守护下去的使命。`,
      },
    ],
  },
};

for (const [l, v] of Object.entries(FAQ)) {
  const path = `src/i18n/${l}/common.json`;
  const j = JSON.parse(readFileSync(path, "utf8"));
  j.donationPageNew.faq = v;
  writeFileSync(path, JSON.stringify(j, null, 2) + "\n", "utf8");
}
console.log("✓ donationPageNew.faq réécrite — 8 questions × 11 langues.");
