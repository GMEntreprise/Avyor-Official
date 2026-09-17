import { readFileSync, writeFileSync } from "node:fs";

/* Refonte complète de la FAQ d'accueil (pageFAQ.home.categories), 11 langues.
   Message clé, sans confusion :
   - ConnectStar est totalement gratuit et le restera — ce n'est PAS grâce aux dons ;
   - les dons soutiennent le développement et ceux qui y consacrent temps et prières ;
   - derrière ConnectStar : Édouard Georges-Michel, le développeur qui construit et
     prie sur chaque fonctionnalité.
   Ton émotionnel, chaleureux. On préserve title/subtitle/ctaText existants (déjà
   localisés) et on ne remplace que `categories`. Bible : « plus de 60 versions »
   + attribution YouVersion. Aucun chiffre inventé. */

const L = {
  fr: {
    general: [
      "Général",
      [
        [
          "ConnectStar est-elle vraiment gratuite ?",
          "Oui, totalement — et pour toujours. Aucun abonnement, aucune publicité, aucune option payante cachée. Et non, ce n'est pas grâce aux dons : l'app reste gratuite pour toi, quoi qu'il arrive.",
        ],
        [
          "Qu'est-ce que ConnectStar, au fond ?",
          "Bien plus qu'une messagerie : un lieu pour prier ensemble, lire la Bible, partager un verset et s'encourager. Une communauté où tu viens comme tu es, sans masque.",
        ],
        [
          "Puis-je lire la Bible gratuitement ?",
          "Oui. Plus de 60 versions de la Bible, dont plusieurs hors ligne, propulsées par YouVersion. Lis, annote et partage un verset directement dans tes conversations.",
        ],
      ],
    ],
    securite: [
      "Sécurité & Confiance",
      [
        [
          "Mes conversations restent-elles privées ?",
          "Oui. Tes échanges sont chiffrés de bout en bout : tes prières et tes messages n'appartiennent qu'à toi et à ceux à qui tu écris.",
        ],
        [
          "Vendez-vous mes données ?",
          "Jamais. ConnectStar ne vit pas de la publicité et ne vend aucune donnée. Ici, tu n'es pas le produit — tu es une personne aimée.",
        ],
      ],
    ],
    soutien: [
      "Les coulisses",
      [
        [
          "Alors, à quoi servent les dons ?",
          "Pas à débloquer l'app — elle est et restera gratuite. Les dons soutiennent le développement de ConnectStar et ceux qui y consacrent leur temps et leurs prières. Donner, ce n'est pas acheter un accès : c'est porter le projet, si ton cœur t'y invite.",
        ],
        [
          "Qui se cache derrière ConnectStar ?",
          "Un nom, un visage : Édouard Georges-Michel, le développeur qui construit — et qui prie — sur chaque fonctionnalité. ConnectStar n'est pas une entreprise sans âme : c'est une œuvre née de la foi, façonnée avec soin.",
        ],
        [
          "Comment aider, même sans donner ?",
          "En priant pour le projet, en partageant l'app autour de toi, en invitant un proche. Ton encouragement vaut autant qu'un don.",
        ],
      ],
    ],
  },
  en: {
    general: [
      "General",
      [
        [
          "Is ConnectStar really free?",
          "Yes, completely — and forever. No subscription, no ads, no hidden paid features. And no, it isn't thanks to donations: the app stays free for you, no matter what.",
        ],
        [
          "What is ConnectStar, really?",
          "Far more than a messenger: a place to pray together, read the Bible, share a verse and encourage one another. A community where you come as you are, without a mask.",
        ],
        [
          "Can I read the Bible for free?",
          "Yes. More than 60 Bible versions, several available offline, powered by YouVersion. Read, highlight and share a verse right inside your conversations.",
        ],
      ],
    ],
    securite: [
      "Safety & Trust",
      [
        [
          "Do my conversations stay private?",
          "Yes. Your messages are end-to-end encrypted: your prayers and messages belong only to you and the people you write to.",
        ],
        [
          "Do you sell my data?",
          "Never. ConnectStar doesn't live off advertising and sells no data. Here, you're not the product — you're a loved person.",
        ],
      ],
    ],
    soutien: [
      "Behind the scenes",
      [
        [
          "So what are donations for?",
          "Not to unlock the app — it is and will remain free. Donations support the development of ConnectStar and those who pour their time and prayers into it. Giving isn't buying access: it's carrying the project, if your heart moves you to.",
        ],
        [
          "Who is behind ConnectStar?",
          "A name, a face: Édouard Georges-Michel, the developer who builds — and prays — over every feature. ConnectStar isn't a faceless company: it's a work born of faith, shaped with care.",
        ],
        [
          "How can I help, even without giving?",
          "By praying for the project, sharing the app around you, inviting a loved one. Your encouragement is worth as much as a donation.",
        ],
      ],
    ],
  },
  es: {
    general: [
      "General",
      [
        [
          "¿ConnectStar es realmente gratis?",
          "Sí, totalmente — y para siempre. Sin suscripción, sin publicidad, sin funciones de pago ocultas. Y no, no es gracias a las donaciones: la app sigue siendo gratuita para ti, pase lo que pase.",
        ],
        [
          "¿Qué es ConnectStar, en el fondo?",
          "Mucho más que una mensajería: un lugar para orar juntos, leer la Biblia, compartir un versículo y animarse. Una comunidad donde vienes tal como eres, sin máscara.",
        ],
        [
          "¿Puedo leer la Biblia gratis?",
          "Sí. Más de 60 versiones de la Biblia, varias disponibles sin conexión, con la tecnología de YouVersion. Lee, subraya y comparte un versículo directamente en tus conversaciones.",
        ],
      ],
    ],
    securite: [
      "Seguridad y confianza",
      [
        [
          "¿Mis conversaciones son privadas?",
          "Sí. Tus mensajes están cifrados de extremo a extremo: tus oraciones y mensajes solo te pertenecen a ti y a quienes escribes.",
        ],
        [
          "¿Venden mis datos?",
          "Nunca. ConnectStar no vive de la publicidad y no vende ningún dato. Aquí no eres el producto — eres una persona amada.",
        ],
      ],
    ],
    soutien: [
      "Detrás de escena",
      [
        [
          "Entonces, ¿para qué sirven las donaciones?",
          "No para desbloquear la app — es y seguirá siendo gratuita. Las donaciones apoyan el desarrollo de ConnectStar y a quienes dedican su tiempo y sus oraciones. Dar no es comprar acceso: es sostener el proyecto, si tu corazón te lo inspira.",
        ],
        [
          "¿Quién está detrás de ConnectStar?",
          "Un nombre, un rostro: Édouard Georges-Michel, el desarrollador que construye — y ora — sobre cada función. ConnectStar no es una empresa sin alma: es una obra nacida de la fe, forjada con cuidado.",
        ],
        [
          "¿Cómo puedo ayudar, aunque no done?",
          "Orando por el proyecto, compartiendo la app a tu alrededor, invitando a un ser querido. Tu ánimo vale tanto como una donación.",
        ],
      ],
    ],
  },
  de: {
    general: [
      "Allgemein",
      [
        [
          "Ist ConnectStar wirklich kostenlos?",
          "Ja, völlig — und für immer. Kein Abo, keine Werbung, keine versteckten Bezahlfunktionen. Und nein, es liegt nicht an den Spenden: Die App bleibt für dich kostenlos, was auch geschieht.",
        ],
        [
          "Was ist ConnectStar eigentlich?",
          "Viel mehr als ein Messenger: ein Ort, um gemeinsam zu beten, die Bibel zu lesen, einen Vers zu teilen und einander zu ermutigen. Eine Gemeinschaft, in die du kommst, wie du bist, ohne Maske.",
        ],
        [
          "Kann ich die Bibel kostenlos lesen?",
          "Ja. Mehr als 60 Bibelübersetzungen, mehrere offline verfügbar, bereitgestellt von YouVersion. Lies, markiere und teile einen Vers direkt in deinen Gesprächen.",
        ],
      ],
    ],
    securite: [
      "Sicherheit & Vertrauen",
      [
        [
          "Bleiben meine Gespräche privat?",
          "Ja. Deine Nachrichten sind Ende-zu-Ende verschlüsselt: Deine Gebete und Nachrichten gehören nur dir und denen, an die du schreibst.",
        ],
        [
          "Verkauft ihr meine Daten?",
          "Niemals. ConnectStar lebt nicht von Werbung und verkauft keine Daten. Hier bist du nicht das Produkt — du bist ein geliebter Mensch.",
        ],
      ],
    ],
    soutien: [
      "Hinter den Kulissen",
      [
        [
          "Wofür sind die Spenden dann?",
          "Nicht, um die App freizuschalten — sie ist und bleibt kostenlos. Spenden unterstützen die Entwicklung von ConnectStar und jene, die ihre Zeit und ihre Gebete hineingeben. Geben heißt nicht, Zugang zu kaufen: Es heißt, das Projekt mitzutragen, wenn dein Herz dich dazu bewegt.",
        ],
        [
          "Wer steht hinter ConnectStar?",
          "Ein Name, ein Gesicht: Édouard Georges-Michel, der Entwickler, der jede Funktion baut — und über sie betet. ConnectStar ist kein gesichtsloses Unternehmen: Es ist ein Werk, aus Glauben geboren und mit Sorgfalt geformt.",
        ],
        [
          "Wie kann ich helfen, auch ohne zu spenden?",
          "Indem du für das Projekt betest, die App in deinem Umfeld teilst, einen lieben Menschen einlädst. Deine Ermutigung ist so viel wert wie eine Spende.",
        ],
      ],
    ],
  },
  it: {
    general: [
      "Generale",
      [
        [
          "ConnectStar è davvero gratuita?",
          "Sì, del tutto — e per sempre. Nessun abbonamento, nessuna pubblicità, nessuna funzione a pagamento nascosta. E no, non è grazie alle donazioni: l'app resta gratuita per te, qualunque cosa accada.",
        ],
        [
          "Cos'è ConnectStar, in fondo?",
          "Molto più di una messaggeria: un luogo per pregare insieme, leggere la Bibbia, condividere un versetto e incoraggiarsi. Una comunità in cui vieni come sei, senza maschere.",
        ],
        [
          "Posso leggere la Bibbia gratis?",
          "Sì. Oltre 60 versioni della Bibbia, molte disponibili offline, con tecnologia YouVersion. Leggi, evidenzia e condividi un versetto direttamente nelle tue conversazioni.",
        ],
      ],
    ],
    securite: [
      "Sicurezza e fiducia",
      [
        [
          "Le mie conversazioni restano private?",
          "Sì. I tuoi messaggi sono cifrati end-to-end: le tue preghiere e i tuoi messaggi appartengono solo a te e a chi scrivi.",
        ],
        [
          "Vendete i miei dati?",
          "Mai. ConnectStar non vive di pubblicità e non vende alcun dato. Qui non sei il prodotto — sei una persona amata.",
        ],
      ],
    ],
    soutien: [
      "Dietro le quinte",
      [
        [
          "Allora, a cosa servono le donazioni?",
          "Non a sbloccare l'app — è e resterà gratuita. Le donazioni sostengono lo sviluppo di ConnectStar e chi vi dedica tempo e preghiere. Donare non è comprare l'accesso: è portare il progetto, se il tuo cuore te lo suggerisce.",
        ],
        [
          "Chi c'è dietro ConnectStar?",
          "Un nome, un volto: Édouard Georges-Michel, lo sviluppatore che costruisce — e prega — su ogni funzione. ConnectStar non è un'azienda senz'anima: è un'opera nata dalla fede, plasmata con cura.",
        ],
        [
          "Come posso aiutare, anche senza donare?",
          "Pregando per il progetto, condividendo l'app attorno a te, invitando una persona cara. Il tuo incoraggiamento vale quanto una donazione.",
        ],
      ],
    ],
  },
  pt: {
    general: [
      "Geral",
      [
        [
          "O ConnectStar é mesmo gratuito?",
          "Sim, totalmente — e para sempre. Sem assinatura, sem publicidade, sem recursos pagos escondidos. E não, não é graças às doações: o app continua gratuito para você, aconteça o que acontecer.",
        ],
        [
          "O que é o ConnectStar, no fundo?",
          "Muito mais que um mensageiro: um lugar para orar juntos, ler a Bíblia, compartilhar um versículo e encorajar uns aos outros. Uma comunidade onde você vem como é, sem máscara.",
        ],
        [
          "Posso ler a Bíblia de graça?",
          "Sim. Mais de 60 versões da Bíblia, várias disponíveis offline, com tecnologia YouVersion. Leia, destaque e compartilhe um versículo diretamente nas suas conversas.",
        ],
      ],
    ],
    securite: [
      "Segurança e confiança",
      [
        [
          "Minhas conversas continuam privadas?",
          "Sim. Suas mensagens têm criptografia de ponta a ponta: suas orações e mensagens pertencem só a você e a quem você escreve.",
        ],
        [
          "Vocês vendem meus dados?",
          "Nunca. O ConnectStar não vive de publicidade e não vende nenhum dado. Aqui você não é o produto — você é uma pessoa amada.",
        ],
      ],
    ],
    soutien: [
      "Nos bastidores",
      [
        [
          "Então, para que servem as doações?",
          "Não para desbloquear o app — ele é e continuará gratuito. As doações apoiam o desenvolvimento do ConnectStar e quem dedica tempo e orações a ele. Doar não é comprar acesso: é sustentar o projeto, se o seu coração te mover a isso.",
        ],
        [
          "Quem está por trás do ConnectStar?",
          "Um nome, um rosto: Édouard Georges-Michel, o desenvolvedor que constrói — e ora — sobre cada funcionalidade. O ConnectStar não é uma empresa sem alma: é uma obra nascida da fé, moldada com cuidado.",
        ],
        [
          "Como posso ajudar, mesmo sem doar?",
          "Orando pelo projeto, compartilhando o app ao seu redor, convidando alguém querido. Seu incentivo vale tanto quanto uma doação.",
        ],
      ],
    ],
  },
  ar: {
    general: [
      "عام",
      [
        [
          "هل ConnectStar مجاني حقًّا؟",
          "نعم، تمامًا — وإلى الأبد. لا اشتراك، لا إعلانات، لا ميزات مدفوعة مخفية. ولا، ليس بفضل التبرعات: يبقى التطبيق مجانيًا لك مهما حدث.",
        ],
        [
          "ما هو ConnectStar في جوهره؟",
          "أكثر بكثير من مجرّد مراسلة: مكان للصلاة معًا، وقراءة الكتاب المقدس، ومشاركة آية، وتشجيع بعضنا. مجتمع تأتي إليه كما أنت، بلا قناع.",
        ],
        [
          "هل أستطيع قراءة الكتاب المقدس مجانًا؟",
          "نعم. أكثر من 60 نسخة من الكتاب المقدس، عدة منها بلا اتصال، مدعومة من YouVersion. اقرأ وظلّل وشارك آية مباشرة في محادثاتك.",
        ],
      ],
    ],
    securite: [
      "الأمان والثقة",
      [
        [
          "هل تبقى محادثاتي خاصة؟",
          "نعم. رسائلك مشفّرة من طرف إلى طرف: صلواتك ورسائلك ملك لك ولمن تكتب إليهم فقط.",
        ],
        [
          "هل تبيعون بياناتي؟",
          "أبدًا. ConnectStar لا يعيش على الإعلانات ولا يبيع أي بيانات. هنا لست سلعة — أنت إنسان محبوب.",
        ],
      ],
    ],
    soutien: [
      "خلف الكواليس",
      [
        [
          "إذًا، ما فائدة التبرعات؟",
          "ليست لفتح التطبيق — فهو مجاني ويبقى كذلك. التبرعات تدعم تطوير ConnectStar ومن يبذلون وقتهم وصلواتهم فيه. العطاء ليس شراءً للوصول: بل حملٌ للمشروع، إن حرّكك قلبك لذلك.",
        ],
        [
          "من يقف خلف ConnectStar؟",
          "اسمٌ ووجه: Édouard Georges-Michel، المطوّر الذي يبني — ويصلّي — على كل ميزة. ConnectStar ليس شركة بلا روح: بل عمل وُلِد من الإيمان، صيغ بعناية.",
        ],
        [
          "كيف أساعد، حتى دون تبرّع؟",
          "بالصلاة من أجل المشروع، ومشاركة التطبيق مع من حولك، ودعوة شخص عزيز. تشجيعك يعادل تبرّعًا.",
        ],
      ],
    ],
  },
  hi: {
    general: [
      "सामान्य",
      [
        [
          "क्या ConnectStar सचमुच मुफ़्त है?",
          "हाँ, पूरी तरह — और हमेशा के लिए। कोई सदस्यता नहीं, कोई विज्ञापन नहीं, कोई छिपा शुल्क नहीं। और नहीं, यह दान की वजह से नहीं है: ऐप तुम्हारे लिए मुफ़्त रहेगा, चाहे कुछ भी हो।",
        ],
        [
          "असल में ConnectStar है क्या?",
          "यह सिर्फ़ मैसेजिंग से कहीं बढ़कर है: साथ प्रार्थना करने, बाइबल पढ़ने, वचन साझा करने और एक-दूसरे को हौसला देने की जगह। एक समुदाय जहाँ तुम जैसे हो वैसे आते हो, बिना किसी मुखौटे के।",
        ],
        [
          "क्या मैं बाइबल मुफ़्त में पढ़ सकता हूँ?",
          "हाँ। बाइबल के 60 से अधिक संस्करण, कई ऑफ़लाइन भी, YouVersion द्वारा संचालित। पढ़ो, चिह्नित करो और कोई वचन सीधे अपनी बातचीत में साझा करो।",
        ],
      ],
    ],
    securite: [
      "सुरक्षा और भरोसा",
      [
        [
          "क्या मेरी बातचीत निजी रहती है?",
          "हाँ। तुम्हारे संदेश एंड-टू-एंड एन्क्रिप्टेड हैं: तुम्हारी प्रार्थनाएँ और संदेश केवल तुम्हारे और जिन्हें तुम लिखते हो उनके हैं।",
        ],
        [
          "क्या आप मेरा डेटा बेचते हैं?",
          "कभी नहीं। ConnectStar विज्ञापनों पर नहीं चलता और कोई डेटा नहीं बेचता। यहाँ तुम उत्पाद नहीं हो — तुम एक प्रिय व्यक्ति हो।",
        ],
      ],
    ],
    soutien: [
      "पर्दे के पीछे",
      [
        [
          "तो फिर दान किस काम आते हैं?",
          "ऐप खोलने के लिए नहीं — वह मुफ़्त है और रहेगा। दान ConnectStar के विकास और उन लोगों का सहारा बनते हैं जो इसमें अपना समय और प्रार्थनाएँ लगाते हैं। देना पहुँच खरीदना नहीं है: यह परियोजना को थामना है, अगर तुम्हारा दिल तुम्हें प्रेरित करे।",
        ],
        [
          "ConnectStar के पीछे कौन है?",
          "एक नाम, एक चेहरा: Édouard Georges-Michel, वह डेवलपर जो हर फ़ीचर पर काम करता है — और प्रार्थना करता है। ConnectStar कोई बेजान कंपनी नहीं: यह विश्वास से जन्मी, प्रेम से गढ़ी गई एक कृति है।",
        ],
        [
          "बिना दान दिए मैं कैसे मदद करूँ?",
          "परियोजना के लिए प्रार्थना करके, अपने आसपास ऐप साझा करके, किसी अपने को आमंत्रित करके। तुम्हारा प्रोत्साहन एक दान जितना ही मूल्यवान है।",
        ],
      ],
    ],
  },
  id: {
    general: [
      "Umum",
      [
        [
          "Apakah ConnectStar benar-benar gratis?",
          "Ya, sepenuhnya — dan selamanya. Tanpa langganan, tanpa iklan, tanpa fitur berbayar tersembunyi. Dan tidak, ini bukan karena donasi: aplikasi tetap gratis untukmu, apa pun yang terjadi.",
        ],
        [
          "Sebenarnya ConnectStar itu apa?",
          "Jauh lebih dari sekadar pesan: tempat untuk berdoa bersama, membaca Alkitab, membagikan ayat, dan saling menguatkan. Komunitas tempat kamu datang apa adanya, tanpa topeng.",
        ],
        [
          "Bisakah saya membaca Alkitab gratis?",
          "Ya. Lebih dari 60 versi Alkitab, beberapa tersedia offline, didukung oleh YouVersion. Baca, tandai, dan bagikan ayat langsung di percakapanmu.",
        ],
      ],
    ],
    securite: [
      "Keamanan & Kepercayaan",
      [
        [
          "Apakah percakapan saya tetap pribadi?",
          "Ya. Pesanmu dienkripsi ujung-ke-ujung: doa dan pesanmu hanya milikmu dan orang yang kamu kirimi.",
        ],
        [
          "Apakah kalian menjual data saya?",
          "Tidak pernah. ConnectStar tidak hidup dari iklan dan tidak menjual data apa pun. Di sini kamu bukan produk — kamu pribadi yang dikasihi.",
        ],
      ],
    ],
    soutien: [
      "Di balik layar",
      [
        [
          "Lalu, untuk apa donasi itu?",
          "Bukan untuk membuka aplikasi — ia gratis dan akan tetap gratis. Donasi mendukung pengembangan ConnectStar dan mereka yang mencurahkan waktu dan doa mereka. Memberi bukan membeli akses: itu menopang proyek ini, jika hatimu tergerak.",
        ],
        [
          "Siapa di balik ConnectStar?",
          "Sebuah nama, sebuah wajah: Édouard Georges-Michel, pengembang yang membangun — dan berdoa — atas setiap fitur. ConnectStar bukan perusahaan tanpa jiwa: ini karya yang lahir dari iman, dibentuk dengan penuh perhatian.",
        ],
        [
          "Bagaimana saya bisa membantu, meski tanpa donasi?",
          "Dengan mendoakan proyek ini, membagikan aplikasi di sekitarmu, mengundang orang terkasih. Dukunganmu bernilai sama seperti donasi.",
        ],
      ],
    ],
  },
  ja: {
    general: [
      "基本",
      [
        [
          "ConnectStar は本当に無料ですか？",
          "はい、完全に——そしてずっと。サブスクも広告も、隠れた有料機能もありません。そして、それは寄付のおかげではありません。何があってもアプリはあなたに無料のままです。",
        ],
        [
          "ConnectStar とは、そもそも何ですか？",
          "単なるメッセンジャーではありません。共に祈り、聖書を読み、御言葉を分かち合い、励まし合う場所。ありのままの姿で、仮面なしで来られる共同体です。",
        ],
        [
          "聖書を無料で読めますか？",
          "はい。60を超える聖書訳、いくつかはオフラインでも、YouVersion によって提供されます。会話の中で直接、御言葉を読み、印を付け、分かち合えます。",
        ],
      ],
    ],
    securite: [
      "安全と信頼",
      [
        [
          "私の会話は非公開のままですか？",
          "はい。あなたのメッセージはエンドツーエンドで暗号化されます。あなたの祈りとメッセージは、あなたと、あなたが送る相手だけのものです。",
        ],
        [
          "私のデータを売りますか？",
          "決して。ConnectStar は広告で成り立っておらず、いかなるデータも売りません。ここではあなたは商品ではなく——愛された一人の人です。",
        ],
      ],
    ],
    soutien: [
      "舞台裏",
      [
        [
          "では、寄付は何のためですか？",
          "アプリの解除のためではありません——無料であり、これからも無料です。寄付は ConnectStar の開発と、時間と祈りを注ぐ人々を支えます。献げることはアクセスを買うことではなく、心が動くなら、この働きを共に担うことです。",
        ],
        [
          "ConnectStar の背後にいるのは誰ですか？",
          "名前と顔があります。Édouard Georges-Michel——すべての機能を造り、そして祈る開発者です。ConnectStar は顔のない企業ではなく、信仰から生まれ、丁寧に形づくられた一つの働きです。",
        ],
        [
          "献げなくても、どう助けられますか？",
          "この働きのために祈り、周りにアプリを分かち合い、大切な人を招くことで。あなたの励ましは、寄付と同じだけ尊いのです。",
        ],
      ],
    ],
  },
  zh: {
    general: [
      "常见",
      [
        [
          "ConnectStar 真的免费吗？",
          "是的，完全免费——而且永远如此。没有订阅、没有广告、没有隐藏的付费功能。而且不，这并不是靠捐款：无论如何，这款应用对你始终免费。",
        ],
        [
          "ConnectStar 究竟是什么？",
          "远不止是一款通讯工具：一个一起祷告、读圣经、分享经文、彼此勉励的地方。一个让你以本相前来、无需伪装的群体。",
        ],
        [
          "我可以免费读圣经吗？",
          "可以。超过 60 个圣经版本，多个可离线使用，由 YouVersion 提供支持。你可以在对话中直接阅读、标注并分享经文。",
        ],
      ],
    ],
    securite: [
      "安全与信任",
      [
        [
          "我的对话会保持私密吗？",
          "会。你的消息端到端加密：你的祷告和消息只属于你和你所联系的人。",
        ],
        [
          "你们会出售我的数据吗？",
          "绝不。ConnectStar 不靠广告生存，也不出售任何数据。在这里你不是产品——你是被爱的人。",
        ],
      ],
    ],
    soutien: [
      "幕后",
      [
        [
          "那么，捐款是用来做什么的？",
          "不是用来解锁应用——它是免费的，也将一直免费。捐款支持 ConnectStar 的开发，以及那些为它付出时间与祷告的人。奉献不是购买权限：若你心受感动，那是与我们一同托住这项事工。",
        ],
        [
          "谁在 ConnectStar 背后？",
          "一个名字，一张面孔：Édouard Georges-Michel，那位为每一个功能编写——并祷告——的开发者。ConnectStar 不是一家没有灵魂的公司：它是一份由信仰而生、用心雕琢的作品。",
        ],
        [
          "即使不捐款，我该如何帮助？",
          "为这项事工祷告，向身边的人分享应用，邀请你所爱的人。你的鼓励与一笔捐款同样宝贵。",
        ],
      ],
    ],
  },
};

const toCat = ([label, items]) => ({
  label,
  items: items.map(([question, answer]) => ({ question, answer })),
});

for (const [lang, cats] of Object.entries(L)) {
  const path = `src/i18n/${lang}/common.json`;
  const j = JSON.parse(readFileSync(path, "utf8"));
  j.pageFAQ = j.pageFAQ || {};
  j.pageFAQ.home = j.pageFAQ.home || {};
  j.pageFAQ.home.categories = {
    general: toCat(cats.general),
    securite: toCat(cats.securite),
    soutien: toCat(cats.soutien),
  };
  writeFileSync(path, JSON.stringify(j, null, 2) + "\n", "utf8");
}
console.log("✓ pageFAQ.home.categories refaite (3 catégories, 8 Q/R) × 11 langues.");
