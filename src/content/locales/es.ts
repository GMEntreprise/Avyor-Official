import type { SiteContent } from '../types';

export const facts =
  'AVYOR es una plataforma móvil de colaboración entre Creators y marcas. Descubre perfiles, lanza campañas y sigue tus proyectos en un mismo lugar.';

export const es: SiteContent = {
  facts,
  faqs: [
    { q: '¿Qué es AVYOR?', a: facts },
    {
      q: '¿A quién está dirigido AVYOR?',
      a: 'A los Creators que quieren mostrar su trabajo y encontrar colaboraciones, y a las marcas que buscan perfiles para sus campañas de contenido. El rol se elige al registrarse.',
    },
    {
      q: '¿AVYOR es gratuito?',
      a: 'Crear una cuenta, publicar tu perfil, explorar campañas y descubrir perfiles no tiene coste. Los movimientos de dinero corresponden a las colaboraciones: la marca financia el proyecto y el Creator cobra una vez validado el entregable. Los importes y las comisiones aplicables se muestran en la aplicación antes de cualquier compromiso.',
    },
    {
      q: '¿Cómo se crea una campaña?',
      a: 'Un asistente de cuatro pasos te guía: información (imagen, título, categoría, descripción, objetivo), presupuesto (importe total e importe por Creator, en modelo fijo, por comisión o mixto), segmentación (plataformas, audiencia, plazo) y revisión del briefing completo antes de publicar.',
    },
    {
      q: '¿Cómo se entra en una campaña?',
      a: 'Desde la pestaña Campañas, filtra por tus nichos y tus plataformas, lee el briefing y las condiciones, y envía tu candidatura. Su estado avanza a la vista: pendiente, en revisión, preseleccionada, aceptada, rechazada o finalizada.',
    },
    {
      q: '¿Puedo cancelar una candidatura?',
      a: 'Desde la aplicación, por ahora no: una candidatura enviada no se puede retirar. Si ya no quieres seguir adelante, díselo a la marca en la conversación; ella puede cerrarla por su parte.',
    },
    {
      q: '¿Cómo funciona el matching?',
      a: 'AVYOR compara la información de un perfil con la de una campaña y muestra los motivos de la compatibilidad: especialización en el nicho, presencia en las plataformas objetivo, tasa de interacción, ubicación e idioma, puntuación de confianza y actividad reciente. La marca consulta esos motivos y sigue eligiendo libremente.',
    },
    {
      q: '¿Cómo se desarrolla una colaboración?',
      a: 'Una marca te contacta, o tú te presentas a una campaña. Acordáis el importe en la conversación, y cualquiera de las dos partes puede hacer una contraoferta. Una vez aceptada la propuesta, la marca paga: AVYOR retiene el importe hasta que valide el entregable.',
    },
    {
      q: '¿Cómo y cuándo cobro?',
      a: 'El pago sale cuando la marca valida el entregable, nunca antes. El importe pasa entonces a tu saldo de Stripe y después a tu cuenta bancaria según el calendario de pagos de esa cuenta. La pantalla de pagos distingue cada etapa en cada colaboración. AVYOR no garantiza ningún plazo: depende del proveedor de pagos.',
    },
    {
      q: '¿Puedo crear un vídeo desde la aplicación?',
      a: 'Sí. Las plantillas guiadas cubren siete familias de formatos —gancho de producto, testimonio, lifestyle, unboxing, tutorial, antes/después, storytelling—, cada una con sus pasos, su duración y su nivel de dificultad. El estudio te acompaña en la grabación, la elección de la portada y la revisión antes de publicar.',
    },
    {
      q: '¿Cómo protejo mi cuenta?',
      a: 'Los ajustes de seguridad permiten cambiar la contraseña con un indicador de robustez, modificar el correo electrónico con verificación y consultar las sesiones abiertas. La autenticación y los cambios sensibles pasan por Supabase.',
    },
    {
      q: '¿Cómo denuncio un contenido o bloqueo una cuenta?',
      a: 'La denuncia y el bloqueo están disponibles directamente desde un vídeo, una conversación o un perfil. Se pide un motivo: spam, cuenta falsa, acoso, violencia, contenido sexual no solicitado, fraude, vulneración de derechos de autor u otro. El equipo revisa cada denuncia.',
    },
    {
      q: '¿Cómo elimino mi cuenta?',
      a: 'En Ajustes y después Seguridad, elige eliminar la cuenta. La acción es irreversible y pide una confirmación escrita explícita. Termina antes tus colaboraciones en curso: algunos registros vinculados a un pago deben conservarse por motivos legales.',
    },
    {
      q: '¿AVYOR está disponible en iOS y Android?',
      a: 'AVYOR es una aplicación móvil prevista para iOS y Android. El lanzamiento público está en preparación: los enlaces oficiales de App Store y Google Play aparecerán en la página de descarga en cuanto existan. No se distribuye ningún archivo de instalación fuera de esas dos tiendas.',
    },
    {
      q: '¿Cómo contacto con AVYOR?',
      a: 'Escribe a la dirección de contacto oficial indicada en la página Contacto, precisando si eres Creator o si representas a una marca. No envíes contraseñas ni datos bancarios completos.',
    },
    {
      q: '¿Las capturas muestran usuarios reales?',
      a: 'Las capturas muestran las pantallas de AVYOR con datos de demostración. Los perfiles, marcas, importes y estadísticas ilustran los recorridos; no son testimonios ni resultados de clientes.',
    },
  ],
  scenes: [
    {
      id: '02-matching',
      label: 'Descubrir',
      heading: 'Un estilo se reconoce. No se resume.',
      body: 'Recorre los perfiles, mira las creaciones y encuentra los universos que encajan con tu proyecto.',
      tag: '01 / DISCOVER',
    },
    {
      id: '03-match-detail',
      label: 'Encajar',
      heading: 'Entender por qué puede funcionar.',
      body: 'Consulta la información de compatibilidad entre un Creator y tu campaña. La decisión es tuya.',
      tag: '02 / MATCH',
    },
    {
      id: '05-campaign',
      label: 'Crear una campaña',
      heading: 'Una buena creación empieza por un briefing claro.',
      body: 'Presenta tu proyecto, el contenido esperado y las condiciones de la colaboración en una campaña.',
      tag: '03 / CAMPAIGN',
    },
    {
      id: '06-collaboration',
      label: 'Colaborar',
      heading: 'Del primer mensaje al último entregable.',
      body: 'Mantén los mensajes y las etapas del proyecto en un mismo espacio, para avanzar con el mismo contexto.',
      tag: '04 / COLLABORATE',
    },
  ],
  pages: [
    {
      slug: '',
      label: 'Inicio',
      title: 'AVYOR — Creators y marcas, unidos por la creación',
      description:
        'El Creator adecuado. La campaña adecuada. Descubre AVYOR, la aplicación móvil que reúne descubrimiento en vídeo, campañas, portafolio y colaboraciones entre Creators y marcas.',
      eyebrow: 'LA CREACIÓN CREA EL ENCUENTRO',
      heading: 'El Creator adecuado. La campaña adecuada.',
      intro: facts,
    },
    {
      slug: 'creators',
      label: 'Creators',
      title: 'Creators: portafolio, campañas y pagos | AVYOR',
      description:
        'Publica tus vídeos con plantillas guiadas, monta tu portafolio, preséntate a campañas, acuerda el importe en la conversación y sigue tu pago tras la validación.',
      eyebrow: 'PARA CREATORS',
      heading: 'Tu trabajo merece los encuentros adecuados.',
      intro:
        'Tu universo, tus vídeos, tu forma de crear. AVYOR te da con qué mostrarlos, encontrar campañas afines y llevar la colaboración hasta el pago.',
      screen: '08-portfolio',
    },
    {
      slug: 'brands',
      label: 'Marcas',
      title: 'Marcas: lanza una campaña y encuentra Creators | AVYOR',
      description:
        'Crea tu campaña en cuatro pasos, segmenta plataformas y audiencia, lee los motivos de compatibilidad de cada perfil, preselecciona y valida los entregables antes de pagar.',
      eyebrow: 'PARA MARCAS',
      heading: 'La mirada adecuada para contar tu marca.',
      intro:
        'Mira lo que los Creators hacen de verdad y construye después una campaña con un briefing claro, una segmentación precisa y unas condiciones legibles por ambas partes.',
      screen: '02-matching',
    },
    {
      slug: 'features',
      label: 'Producto',
      title: 'El producto AVYOR: descubrir, crear, colaborar, dirigir',
      description:
        'Feed de vídeo, búsqueda por nicho, plantillas de vídeo guiadas, portafolio, series e historias, campañas, mensajería con contraoferta, seguimiento de pagos y progresión.',
      eyebrow: 'EL PRODUCTO',
      heading: 'Ver. Encontrarse. Crear juntos.',
      intro:
        'Cuatro momentos: descubrir las creaciones, crear las tuyas, colaborar con un marco, dirigir lo que avanza.',
      screen: '04-feed',
    },
    {
      slug: 'how-it-works',
      label: 'Cómo funciona',
      title: 'Cómo funciona AVYOR — como Creator o como marca',
      description:
        'Los dos recorridos de AVYOR, paso a paso: perfil, publicación, campañas, candidatura, acuerdo sobre el importe, entregable, validación y pago. Cinco pasos por cada lado.',
      eyebrow: 'CÓMO FUNCIONA',
      heading: 'Un encuentro. Un briefing. Un proyecto.',
      intro: 'Dos puntos de partida, cinco pasos cada uno, un espacio común para crear juntos.',
      screen: '05-campaign',
    },
    {
      slug: 'security',
      label: 'Seguridad',
      title: 'Cuenta, pagos y denuncias en AVYOR',
      description:
        'Ajustes de seguridad de la cuenta, eliminación definitiva, pago retenido hasta la validación del entregable, seguimiento del pago, motivos de denuncia y bloqueo en AVYOR.',
      eyebrow: 'CONFIANZA Y CONTROL',
      heading: 'Crear juntos, con reglas claras.',
      intro: 'Entender qué se comparte, cómo avanza un pago y dónde actuar cuando algo no va bien.',
      screen: '07-payment',
    },
    {
      slug: 'faq',
      label: 'Preguntas',
      title: 'Preguntas frecuentes sobre AVYOR — producto, pago, cuenta',
      description:
        '¿Cómo funcionan las campañas, el matching, la negociación y los pagos en AVYOR? ¿Cómo proteger o eliminar tu cuenta? Las respuestas, comprobadas en la aplicación.',
      eyebrow: 'LAS RESPUESTAS',
      heading: 'Antes del encuentro.',
      intro: 'Lo útil para entender AVYOR y preparar tu primera colaboración.',
    },
    {
      slug: 'download',
      label: 'Descargar',
      title: 'Descargar AVYOR — lanzamiento en iOS y Android',
      description:
        'Aquí encontrarás los enlaces oficiales de descarga de AVYOR para iOS y Android en cuanto se publiquen. Descubre el producto y contacta con el equipo.',
      eyebrow: 'AVYOR, PRONTO EN TUS MANOS',
      heading: 'El próximo encuentro empieza aquí.',
      intro:
        'AVYOR es una aplicación móvil para iOS y Android. El lanzamiento público está en preparación: los enlaces oficiales de App Store y Google Play aparecerán aquí en cuanto se publiquen.',
      screen: '04-feed',
    },
    {
      slug: 'privacy',
      label: 'Privacidad',
      title: 'Política de privacidad de AVYOR — datos y derechos',
      description:
        'Consulta la política de privacidad de la aplicación AVYOR: datos, finalidades, proveedores, conservación y contacto para ejercer tus derechos.',
      eyebrow: 'TUS DATOS',
      heading: 'Política de privacidad.',
      intro:
        'La información de privacidad de la aplicación y la propia de este sitio de presentación.',
      noindex: true,
    },
    {
      slug: 'terms',
      label: 'Condiciones de uso',
      title: 'Condiciones de uso de AVYOR — cuentas y colaboraciones',
      description:
        'Consulta las condiciones de uso de AVYOR: cuentas, contenidos, campañas, derechos de uso, normas de conducta, colaboraciones y pagos.',
      eyebrow: 'LAS REGLAS',
      heading: 'Condiciones de uso.',
      intro:
        'Las reglas que enmarcan el uso de la aplicación AVYOR y las colaboraciones entre Creators y marcas.',
      noindex: true,
    },
    {
      slug: 'contact',
      label: 'Contacto',
      title: 'Contactar con AVYOR — producto, soporte y privacidad',
      description:
        'Contacta con el equipo de AVYOR por una duda sobre el producto, una colaboración o tus datos personales, en la dirección oficial de soporte.',
      eyebrow: 'HABLEMOS',
      heading: '¿Una pregunta? Hablemos.',
      intro:
        '¿Una duda sobre AVYOR, un proyecto de campaña o ayuda con tu cuenta? Contacta con el equipo.',
    },
    {
      slug: 'legal',
      label: 'Aviso legal',
      title: 'Aviso legal de AVYOR — editor y contacto',
      description:
        'Información disponible sobre el editor del producto AVYOR, la propiedad intelectual y el contacto oficial. Documento en preparación para el lanzamiento.',
      eyebrow: 'INFORMACIÓN DEL EDITOR',
      heading: 'Aviso legal.',
      intro:
        'AVYOR es un producto móvil operado por Shavod. La información de publicación se reúne en esta página.',
      noindex: true,
    },
    {
      slug: 'video',
      label: 'Vídeo de AVYOR',
      title: 'Abrir un vídeo en la aplicación AVYOR',
      description:
        'Este enlace lleva a un vídeo publicado en AVYOR. La aplicación muestra el vídeo, su autor y las campañas vinculadas.',
      eyebrow: 'ENLACE AVYOR',
      heading: 'Este vídeo se abre en la aplicación.',
      intro:
        'AVYOR es una aplicación móvil: los vídeos de los Creators se ven allí y allí se proponen a las marcas. Este sitio presenta el producto.',
      noindex: true,
    },
    {
      slug: 'creator',
      label: 'Perfil de Creator',
      title: 'Abrir un perfil de Creator en la aplicación AVYOR',
      description:
        'Este enlace lleva al perfil de un Creator en AVYOR: su portfolio, sus formatos preferidos y sus colaboraciones.',
      eyebrow: 'ENLACE AVYOR',
      heading: 'Este perfil se abre en la aplicación.',
      intro:
        'El portfolio de un Creator, sus vídeos y su forma de trabajar se consultan en la aplicación AVYOR.',
      noindex: true,
    },
    {
      slug: 'campaign',
      label: 'Campaña',
      title: 'Abrir una campaña en la aplicación AVYOR',
      description:
        'Este enlace lleva a una campaña publicada por una marca en AVYOR: su brief, los entregables esperados y sus condiciones.',
      eyebrow: 'ENLACE AVYOR',
      heading: 'Esta campaña se abre en la aplicación.',
      intro:
        'Las campañas se leen y se solicitan desde la aplicación, con su brief y sus condiciones.',
      noindex: true,
    },
    {
      slug: 'collaboration',
      label: 'Colaboración',
      title: 'Abrir una colaboración en la aplicación AVYOR',
      description:
        'Este enlace lleva a una colaboración privada entre una marca y un Creator. Su contenido solo se consulta en la aplicación.',
      eyebrow: 'ENLACE PRIVADO',
      heading: 'Esta colaboración permanece en la aplicación.',
      intro:
        'Una colaboración reúne un brief, unos entregables y un pago. Solo concierne a sus dos partes.',
      noindex: true,
    },
    {
      slug: 'messages',
      label: 'Conversación',
      title: 'Abrir una conversación en la aplicación AVYOR',
      description:
        'Este enlace lleva a una conversación privada en AVYOR. Solo se lee en la aplicación, por sus participantes.',
      eyebrow: 'ENLACE PRIVADO',
      heading: 'Esta conversación permanece en la aplicación.',
      intro:
        'Los mensajes entre una marca y un Creator se leen únicamente en la aplicación, por las personas implicadas.',
      noindex: true,
    },
    {
      slug: 'auth/confirm',
      label: 'Confirmación de correo',
      title: 'Confirmar su dirección de correo AVYOR',
      description:
        'Esta página acompaña la confirmación del correo de una cuenta AVYOR. La confirmación termina en la aplicación.',
      eyebrow: 'SU CUENTA',
      heading: 'Termine la confirmación en la aplicación.',
      intro:
        'Abra este enlace desde su teléfono, con AVYOR instalado: la confirmación termina allí. Este sitio no valida nada por sí mismo.',
      noindex: true,
    },
    {
      slug: 'auth/reset-password',
      label: 'Nueva contraseña',
      title: 'Definir una nueva contraseña de AVYOR',
      description:
        'Esta página acompaña el restablecimiento de una contraseña de AVYOR. La nueva contraseña se escribe en la aplicación.',
      eyebrow: 'SU CUENTA',
      heading: 'Elija su contraseña en la aplicación.',
      intro:
        'Abra este enlace desde su teléfono, con AVYOR instalado. Si el enlace caducó o ya se usó, pida uno nuevo desde la pantalla de inicio de sesión.',
      noindex: true,
    },
    {
      slug: 'auth/callback',
      label: 'Vuelta de conexión',
      title: 'Vuelta de conexión de AVYOR',
      description:
        'Esta página es la dirección de vuelta de un inicio de sesión en AVYOR. No conserva nada ni valida nada por sí misma.',
      eyebrow: 'SU CUENTA',
      heading: 'Retome la conexión en la aplicación.',
      intro:
        'Esta dirección sirve de vuelta técnica tras un inicio de sesión. Si ve esta página, termine de conectarse en la aplicación AVYOR.',
      noindex: true,
    },
  ],
  related: {
    creators: {
      lead: 'Lo que sigue en el recorrido Creator.',
      links: [
        ['El recorrido paso a paso', 'how-it-works'],
        ['El producto en detalle', 'features'],
        ['Pagos y seguridad', 'security'],
      ],
    },
    brands: {
      lead: 'Ir más lejos por el lado de la marca.',
      links: [
        ['El producto en detalle', 'features'],
        ['El recorrido paso a paso', 'how-it-works'],
        ['Pagos y seguridad', 'security'],
      ],
    },
    features: {
      lead: 'Ver el producto en funcionamiento.',
      links: [
        ['El recorrido paso a paso', 'how-it-works'],
        ['Para Creators', 'creators'],
        ['Descargar la app', 'download'],
      ],
    },
    'how-it-works': {
      lead: 'Elegir tu punto de partida.',
      links: [
        ['Para Creators', 'creators'],
        ['Para marcas', 'brands'],
        ['Preguntas frecuentes', 'faq'],
      ],
    },
    security: {
      lead: 'Los documentos que marcan las reglas.',
      links: [
        ['Política de privacidad', 'privacy'],
        ['Condiciones de uso', 'terms'],
        ['Preguntas frecuentes', 'faq'],
      ],
    },
    faq: {
      lead: 'Las reglas y los documentos.',
      links: [
        ['Pagos y seguridad', 'security'],
        ['Política de privacidad', 'privacy'],
        ['Condiciones de uso', 'terms'],
      ],
    },
    download: {
      lead: 'Descubrir AVYOR antes de instalarla.',
      links: [
        ['El producto en detalle', 'features'],
        ['El recorrido paso a paso', 'how-it-works'],
        ['Preguntas frecuentes', 'faq'],
      ],
    },
    contact: {
      lead: 'Quizá la respuesta ya esté aquí.',
      links: [
        ['Preguntas frecuentes', 'faq'],
        ['Pagos y seguridad', 'security'],
        ['Descargar la app', 'download'],
      ],
    },
  },
  navigation: [
    ['Producto', 'features'],
    ['Creators', 'creators'],
    ['Marcas', 'brands'],
    ['Seguridad', 'security'],
    ['Preguntas', 'faq'],
  ],
  ui: {
    skipToContent: 'Ir al contenido',
    brandHome: 'AVYOR, inicio',
    nav: {
      main: 'Navegación principal',
      mobile: 'Navegación móvil',
      open: 'Abrir el menú',
      close: 'Cerrar el menú',
      menuTitle: 'Menú de AVYOR',
      menuDescription: 'Descubre el producto y elige tu recorrido.',
    },
    language: {
      label: 'Idioma',
      current: 'Idioma actual',
      error: 'No se ha podido cambiar de idioma. Inténtalo de nuevo.',
    },
    download: { app: 'Descargar la app', discover: 'Descubrir AVYOR' },
    store: {
      comingSoon: 'Próximamente',
      launching: 'El lanzamiento está en preparación.',
      talk: 'Hablemos de tu proyecto',
      apple: { lead: 'Descárgalo en el', name: 'App Store' },
      google: { lead: 'Disponible en', name: 'Google Play' },
    },
    media: {
      pauseVideo: 'Pausar el vídeo',
      playVideo: 'Reproducir el vídeo',
      pauseBackground: 'Pausar el fondo',
      playBackground: 'Reproducir el fondo',
      pause: 'Pausa',
      play: 'Reproducir',
    },
    demoCaption:
      'Pantallas de AVYOR · Datos de demostración. Perfiles, importes y estadísticas ilustrativos.',
    screen: {
      prefix: 'Pantalla de AVYOR',
      fallback: 'la aplicación',
      scenes: {
        '04-feed': 'feed de vídeo',
        '02-matching': 'descubrimiento de Creators',
        '03-match-detail': 'compatibilidad con una campaña',
        '05-campaign': 'briefing de campaña',
        '06-collaboration': 'conversación de colaboración',
        '07-payment': 'seguimiento del pago',
        '08-portfolio': 'portafolio de Creator',
      },
    },
    hero: {
      eyebrow: 'LA CREACIÓN CREA EL ENCUENTRO',
      title: { lead: ['El Creator adecuado.'], accent: ['La campaña', 'adecuada.'] },
      description: [
        'Creators y marcas, encontraos.',
        'Cread juntos. Mantened el proyecto en un mismo lugar.',
      ],
      seeHow: 'Ver cómo funciona',
      tagTop: 'EL TALENTO SE VE.',
      tagBottom: 'EL ENCUENTRO SE CREA.',
      explore: 'EXPLORAR AVYOR',
    },
    manifesto: {
      eyebrow: 'UNA APP. DOS UNIVERSOS. EL MISMO IMPULSO.',
      title: {
        lead: ['Hay talentos por descubrir.', 'Historias por contar.'],
        accent: ['Y todo lo que puede nacer entre ambos.'],
      },
      body: 'AVYOR reúne a Creators y marcas en una aplicación móvil: descubre las creaciones, encuentra los perfiles adecuados y da un marco a tus colaboraciones.',
      pillars: [
        ['Descubrir', 'El feed de vídeo y los perfiles Creator.'],
        ['Crear', 'Plantillas guiadas, estudio y portafolio.'],
        ['Colaborar', 'Briefing, mensajes y entregables.'],
      ],
    },
    audiences: {
      eyebrow: '02 — CADA UNO SU UNIVERSO',
      title: { lead: ['La creación tiene dos lados.'], accent: ['AVYOR los conecta.'] },
      creator: {
        eyebrow: 'CREATORS',
        title: ['Que hable', 'tu trabajo.'],
        body: ['Un portafolio para tu universo.', 'Campañas para lo que viene.'],
        link: 'Descubrir el recorrido Creator',
        alt: 'Imagen de demostración: creación de contenido en exteriores',
      },
      brand: {
        eyebrow: 'MARCAS',
        title: ['Tu historia.', 'La mirada adecuada.'],
        body: ['Descubre un estilo.', 'Construye una colaboración.'],
        link: 'Descubrir el recorrido de marca',
        alt: 'Imagen de demostración: contenido de belleza para una campaña',
      },
    },
    feed: {
      eyebrow: '03 — VIDEO FIRST. TALENT FIRST.',
      title: { lead: ['El talento se ve.'], accent: ['Así que mira.'] },
      body: 'Una mirada, un montaje, una forma de contar. Descubre lo que los Creators saben hacer, directamente en el feed de vídeo.',
      note: 'Las creaciones van antes que las presentaciones.',
      link: 'Descubrir el feed de AVYOR',
    },
    trust: {
      eyebrow: '06 — EL PROYECTO TIENE UN MARCO',
      title: { lead: ['Todo el proyecto.'], accent: ['Un solo lugar.'] },
      lead: 'Las conversaciones hacen avanzar las ideas. Las etapas claras hacen avanzar la colaboración.',
      cards: [
        [
          'El contexto se queda.',
          'Mensajes y etapas de la colaboración están reunidos. Recupera los intercambios cuando el proyecto evoluciona.',
        ],
        [
          'El pago se sigue.',
          'La marca financia la colaboración con Stripe. La transferencia al Creator sigue a la validación del entregable y a las condiciones del proyecto.',
        ],
        [
          'Mantienes el control.',
          'Ajustes de la cuenta, denuncia, bloqueo y soporte: las acciones útiles siguen accesibles.',
        ],
      ],
      link: 'Entender los pagos y la seguridad',
    },
    story: {
      eyebrow: '01 — EL ENCUENTRO, LUEGO EL PROYECTO',
      title: { lead: ['Menos herramientas.'], accent: ['Más creación.'] },
      lead: 'De la primera mirada al proyecto entregado, un hilo continuo.',
      link: 'Explorar el producto',
      inApp: 'EN LA APP',
      steps: 'Etapas del producto',
    },
    workflow: {
      eyebrow: '04 — TE TOCA',
      title: { lead: ['Dos recorridos.'], accent: ['Un mismo encuentro.'] },
      tabsLabel: 'Tu recorrido en AVYOR',
      creatorTab: 'Soy Creator',
      brandTab: 'Soy una marca',
      creator: [
        [
          'Muestra tu trabajo.',
          'Tu perfil, tus vídeos, tu portafolio. Da una idea concreta de tu universo.',
        ],
        [
          'Encuentra tu próximo proyecto.',
          'Explora las campañas y elige las que encajan con tu forma de crear.',
        ],
        [
          'Crea y después colabora.',
          'Habla con la marca, comparte tus entregables y sigue las etapas del proyecto.',
        ],
      ],
      brand: [
        [
          'Plantea tu briefing.',
          'Presenta tu campaña, los contenidos esperados y las condiciones de colaboración.',
        ],
        [
          'Descubre los perfiles adecuados.',
          'Mira las creaciones, consulta los portafolios y la información de compatibilidad.',
        ],
        [
          'Haz avanzar el proyecto.',
          'Mantén mensajes, financiación y validación de entregables en el mismo recorrido.',
        ],
      ],
      link: 'El recorrido en detalle',
    },
    gallery: {
      eyebrow: '05 — EL PRODUCTO, SIN RODEOS',
      title: { lead: ['Un vistazo.'], accent: ['Posibilidades reales.'] },
      previous: 'Capturas anteriores',
      next: 'Capturas siguientes',
      region: 'Capturas de la aplicación, usa las flechas para recorrerlas',
      shots: [
        ['04-feed', 'El trabajo, primero.', 'Un feed para descubrir las creaciones.'],
        ['08-portfolio', 'Tu universo, en detalle.', 'Proyectos reunidos en un portafolio.'],
        ['05-campaign', 'Un briefing para entenderse.', 'El contexto de tu próxima creación.'],
        [
          '06-collaboration',
          'El proyecto mantiene su hilo.',
          'La conversación acompaña el trabajo.',
        ],
        ['03-match-detail', 'Los motivos del encuentro.', 'Una lectura de la compatibilidad.'],
      ],
    },
    faq: {
      eyebrow: 'LAS PREGUNTAS QUE IMPORTAN',
      title: '¿Hablamos?',
      lead: 'Un proyecto empieza también por las respuestas adecuadas.',
      link: 'Contactar con el equipo',
    },
    footer: {
      eyebrow: 'EL PRÓXIMO PROYECTO EMPIEZA POR UN ENCUENTRO',
      title: { lead: ['¿Y si fuera'], accent: ['el bueno?'] },
      link: 'Encontrar AVYOR',
      tagline: 'La creación crea el encuentro.',
      navLabel: 'Enlaces del pie de página',
      columns: [
        [
          'Explorar',
          [
            ['El producto', 'features'],
            ['Para Creators', 'creators'],
            ['Para marcas', 'brands'],
            ['Cómo funciona', 'how-it-works'],
          ],
        ],
        [
          'Hablar',
          [
            ['Seguridad y pagos', 'security'],
            ['Preguntas frecuentes', 'faq'],
            ['Contacto', 'contact'],
            ['Descargar', 'download'],
          ],
        ],
        [
          'Las reglas',
          [
            ['Privacidad', 'privacy'],
            ['Condiciones de uso', 'terms'],
            ['Aviso legal', 'legal'],
          ],
        ],
      ],
      product: 'Un producto de Shavod.',
      audience: 'Creators × Marcas',
      top: 'Volver arriba ↑',
    },
    news: {
      label: 'Noticias',
      intro: 'Consejos concretos para colaborar mejor. Las novedades de AVYOR para avanzar.',
      metaTitle: 'Noticias AVYOR — consejos para Creators y marcas',
      metaDescription:
        'Guías prácticas para preparar una colaboración, crear contenido, elegir un socio y seguir los resultados, y novedades verificadas de la aplicación AVYOR.',
      eyebrow: 'NOTICIAS',
      featured: 'Destacado',
      latestEyebrow: 'NOTICIAS',
      latestTitle: 'Últimas publicaciones',
      latestLink: 'Todas las publicaciones',
      searchLabel: 'Buscar un artículo',
      searchPlaceholder: 'Briefing, portafolio, primera colaboración…',
      submit: 'Buscar',
      audienceLabel: 'Público',
      themeLabel: 'Temática',
      all: 'Todos',
      audiences: { brands: 'Marcas', creators: 'Creators', both: 'Creators y marcas' },
      themes: {
        prepare: 'Preparar una colaboración',
        create: 'Crear contenido',
        choose: 'Elegir un socio',
        measure: 'Seguir los resultados',
      },
      types: { guide: 'Guía práctica', product: 'Novedad de AVYOR', case: 'Caso real' },
      results: (count) =>
        count === 0 ? 'Ningún artículo' : count === 1 ? '1 artículo' : `${count} artículos`,
      empty: 'Ningún artículo coincide con estos criterios por ahora.',
      reset: 'Borrar la búsqueda y los filtros',
      loading: 'Buscando…',
      error: 'No se han podido cargar los artículos. Comprueba tu conexión.',
      retry: 'Reintentar',
      pagination: 'Paginación de artículos',
      previous: 'Página anterior',
      next: 'Página siguiente',
      page: (page, pages) => `Página ${page} de ${pages}`,
      readingTime: (minutes) => `${minutes} min de lectura`,
      published: 'Publicado el',
      updated: 'Actualizado el',
      by: 'Por',
      toc: 'En este artículo',
      sources: 'Fuentes',
      accessed: 'consultada el',
      related: 'Para seguir leyendo',
      sectionLink: 'Enlace a esta sección',
      feed: 'Canal RSS de Noticias AVYOR',
      callouts: { example: 'Ejemplo', checklist: 'Por comprobar', warning: 'Atención' },
      dateLocale: 'es-ES',
    },
    llms: {
      stores: 'Consulta la página de descarga para ver las plataformas disponibles.',
      storesPending:
        'El lanzamiento público está en preparación. No se publica ningún enlace de tienda sin verificar.',
      demo: 'Las capturas contienen datos de demostración.',
      pages: 'Páginas oficiales',
      contact: 'Contacto',
      languages: 'Este sitio se publica en varios idiomas',
    },
    page: {
      breadcrumb: 'Ruta de navegación',
      home: 'Inicio',
      writeTo: 'Escribir a',
    },
    appLink: {
      note: 'Ve esta página porque el enlace se abrió sin la aplicación AVYOR, o desde un ordenador.',
      privateNote:
        'Este contenido es privado. Aquí no se muestra nada: conocer la dirección no da ningún acceso.',
      install: 'Instale la aplicación y vuelva a abrir el enlace: llegará directamente al lugar correcto.',
    },
    notFound: {
      metaLabel: 'Página no encontrada',
      metaTitle: 'Página no encontrada — AVYOR',
      metaDescription:
        'Esta página de AVYOR no existe. Vuelve a los recorridos de Creators y marcas desde la página de inicio.',
      eyebrow: '404 — FUERA DE PLANO',
      title: 'Esta página ya no está en el plano.',
      lead: 'Esta dirección no lleva a ninguna página de AVYOR.',
      leadAt: ['La dirección ', ' no lleva a ninguna página de AVYOR.'],
      suggestion: 'Quizá buscabas',
      back: 'Volver al inicio',
      report: 'Informar de un enlace roto',
      destinationsLabel: 'Páginas principales',
      destinationsEyebrow: 'O EMPIEZA DE NUEVO AQUÍ',
    },
    legal: {
      updated: 'Última actualización:',
      tocLabel: 'En esta página',
      tocTitle: 'EN ESTA PÁGINA',
      noticeTitle: 'Documento en preparación para el lanzamiento.',
      notice: (pending) =>
        `${pending} ${pending > 1 ? 'secciones esperan' : 'sección espera'} una información que el editor debe facilitar. Están señaladas en el texto en lugar de completarse por aproximación.`,
      todoLabel: 'Pendiente antes de la publicación:',
      contactTitle: 'Escríbenos',
      contactLead: 'Para cualquier duda sobre este documento:',
      crosslinks: 'Documentos relacionados',
      translationNotice:
        'Traducción de cortesía. En caso de discrepancia, prevalece la versión francesa.',
    },
  },
};
