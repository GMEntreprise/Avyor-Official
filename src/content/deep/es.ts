import type { DeepContent, Section } from '../types';
import legal from '../legal/es.json';

/** Textos largos de página, cargados solo por la página que los muestra. */
const sectionsBySlug: Record<string, Section[]> = {
  creators: [
    {
      title: 'Un portafolio que habla por ti.',
      body: 'Reúne tus proyectos en tu perfil: vídeos UGC, demostraciones de producto, testimonios, unboxings, tutoriales o fotos. Una marca descubre tu estilo antes del primer mensaje.',
      items: [
        'Presenta tu universo, tus nichos y tus plataformas.',
        'Ordena tus trabajos por tipo de contenido.',
        'Mantén tus proyectos accesibles desde tu perfil.',
      ],
    },
    {
      title: 'Crear sin partir de cero.',
      body: 'La aplicación ofrece plantillas de vídeo guiadas, clasificadas por categoría: gancho de producto, testimonio, lifestyle, unboxing, tutorial, antes/después, storytelling. Cada plantilla indica su número de pasos, su duración y su nivel de dificultad. El estudio te acompaña desde la grabación hasta la elección de la portada.',
    },
    {
      title: 'Series e historias.',
      body: 'Un formato que se prolonga se publica como serie, episodio tras episodio. Las historias permiten un contenido más corto y temático. Tus formatos largos y cortos viven en el mismo perfil.',
    },
    {
      title: 'Campañas por explorar.',
      body: 'Recorre las campañas abiertas, ordenadas por relevancia, novedad o popularidad, y fíltralas por categoría, plataforma o formato a distancia. Cada campaña muestra su briefing, sus condiciones y su grado de coincidencia con tu perfil.',
      items: [
        'Tus nichos y tus plataformas alimentan esa coincidencia.',
        'El presupuesto y el plazo se anuncian antes de presentarte.',
        'Tus campañas favoritas siguen accesibles.',
      ],
    },
    {
      title: 'Presentarte y seguir la respuesta.',
      body: 'Una candidatura enviada avanza por etapas visibles: pendiente, en revisión, preseleccionada, aceptada, rechazada o finalizada. Sabes en qué punto estás sin insistir. Una candidatura enviada no se puede retirar desde la aplicación: si cambias de opinión, díselo a la marca en la conversación.',
    },
    {
      title: 'El importe se acuerda en la conversación.',
      body: 'Nada se impone. Tú y la marca acordáis la remuneración en la mensajería, y cualquiera de las partes puede hacer una contraoferta. La colaboración solo empieza cuando se acepta la propuesta.',
    },
    {
      title: 'Un proyecto seguido hasta el entregable.',
      body: 'Una vez aceptada la propuesta, la marca paga y AVYOR retiene el importe hasta la validación de tu entregable. Conversación, etapas y entregables permanecen reunidos en un mismo lugar.',
    },
    {
      title: 'Cobrar tras la validación.',
      body: 'Tu remuneración sale con la validación del entregable, nunca antes. La pantalla de pagos distingue cada etapa: pago de la colaboración, entregable validado, abono en tu saldo de Stripe y transferencia a tu banco. Ese último plazo depende del calendario de tu cuenta de Stripe.',
    },
    {
      title: 'Tu actividad toma forma.',
      body: 'Tu recorrido reúne tu progresión, tus misiones, tus insignias y tu cronología de actividad. Tus estadísticas siguen visualizaciones, me gusta, guardados, seguidores, portafolio y campañas, para entender qué funciona, sin promesa de visibilidad ni de ingresos.',
    },
  ],
  brands: [
    {
      title: 'Empieza por la creación.',
      body: 'El feed de vídeo muestra los estilos, los formatos y los universos. Pasa de un contenido al perfil de su Creator y después a su portafolio, para juzgar por el trabajo y no por una presentación.',
    },
    {
      title: 'Un asistente de campaña en cuatro pasos.',
      body: 'Crear una campaña se hace paso a paso: información, presupuesto, segmentación y revisión antes de publicar. Cada paso se comprueba, lo que evita publicar un briefing incompleto.',
      items: [
        'Información: imagen, título, categoría, descripción, objetivo.',
        'Presupuesto: importe total e importe por Creator.',
        'Segmentación: plataformas, audiencia, plazo.',
        'Revisión: todo el briefing releído antes de publicar.',
      ],
    },
    {
      title: 'Elige tu modelo de remuneración.',
      body: 'Una campaña puede remunerarse de forma fija, por comisión o con un modelo mixto. Tú fijas el importe total y el importe por Creator; la aplicación comprueba que ambos sean coherentes.',
    },
    {
      title: 'Segmenta a quién quieres llegar.',
      body: 'Indica las plataformas objetivo, la franja de edad, el género y el número de seguidores esperado, así como el plazo de la campaña. Estos criterios sirven para proponer tu campaña a los perfiles pertinentes.',
    },
    {
      title: 'Recomendaciones que puedes leer.',
      body: 'La puntuación de compatibilidad se explica. Cada perfil sugerido indica por qué te corresponde: especialización en tu nicho, presencia en tus plataformas objetivo, tasa de interacción, ubicación e idioma compatibles, puntuación de confianza, actividad reciente. La decisión sigue siendo tuya.',
      items: [
        'Se muestran los motivos, no solo la puntuación.',
        'Puedes filtrar y ordenar los perfiles tú misma.',
        'El matching complementa la lectura de un portafolio, no la sustituye.',
      ],
    },
    {
      title: 'Clasificar las candidaturas.',
      body: 'Las candidaturas recibidas se siguen por estado: pendiente, en revisión, preseleccionada, aceptada, rechazada, finalizada. Puedes formar una preselección de los perfiles retenidos antes de decidir.',
    },
    {
      title: 'Acordar el importe.',
      body: 'La remuneración se acuerda con el Creator en la conversación, y cualquiera de las partes puede hacer una contraoferta. Una vez aceptada la propuesta, pagas: AVYOR retiene el importe hasta que valides el entregable.',
    },
    {
      title: 'Seguir la colaboración y validar.',
      body: 'Habla, sigue las etapas y recibe los entregables en el recorrido previsto. El pago al Creator sale con tu validación. Tu panel reúne tus campañas lanzadas, tus colaboraciones y tu actividad.',
    },
  ],
  features: [
    {
      title: 'Descubrir: el feed de vídeo.',
      body: 'La entrada al producto es la propia creación. Los contenidos se recorren en vídeo, y cada uno lleva al perfil de su autor y después a su portafolio.',
    },
    {
      title: 'Descubrir: buscar y filtrar.',
      body: 'Campañas y perfiles se filtran por categoría entre diecinueve nichos, por plataforma, por formato a distancia o por destacado. Las campañas se ordenan por relevancia, novedad o popularidad, y se guardan como favoritas.',
    },
    {
      title: 'Crear: plantillas guiadas y estudio.',
      body: 'Siete familias de plantillas de vídeo acompañan la realización, cada una con sus pasos, su duración y su nivel de dificultad. El estudio cubre la grabación, el montaje sencillo, la elección de la portada y la revisión antes de publicar.',
    },
    {
      title: 'Crear: portafolio, series e historias.',
      body: 'Un portafolio ordena tus trabajos por tipo de contenido. Las series encadenan los episodios de un mismo formato; las historias acogen un contenido más corto. Las fotos alimentan el portafolio sin pasar por el feed.',
    },
    {
      title: 'Colaborar: campañas y candidaturas.',
      body: 'Una campaña reúne el briefing, las condiciones y el plazo. Las candidaturas avanzan por estados visibles por ambas partes, y la marca puede preseleccionar los perfiles que retiene.',
    },
    {
      title: 'Colaborar: mensajería y acuerdo.',
      body: 'La conversación lleva el proyecto: ahí se negocia el importe, contraoferta incluida, y ahí permanece disponible el contexto durante toda la colaboración.',
    },
    {
      title: 'Dirigir: pago y abono.',
      body: 'AVYOR retiene el importe acordado hasta la validación del entregable. El seguimiento distingue el pago, la validación, el abono en el saldo de Stripe y la transferencia bancaria.',
    },
    {
      title: 'Dirigir: progresión y estadísticas.',
      body: 'Misiones, insignias, niveles, proyectos y cronología dan una lectura de tu actividad a lo largo del tiempo. Las estadísticas detallan visualizaciones, me gusta, guardados, seguidores, portafolio y campañas.',
    },
  ],
  'how-it-works': [
    {
      title: 'Creator: crea tu perfil.',
      body: 'Al registrarte eliges tu rol y después indicas tu actividad, tus objetivos, tus nichos, tus plataformas, tu país y tu idioma. Esa información alimenta directamente las campañas que se te propondrán.',
    },
    {
      title: 'Creator: publica tu trabajo.',
      body: 'Graba con una plantilla guiada o desde el estudio, elige tu portada y publica. Tus trabajos se suman a tu perfil y a tu portafolio.',
    },
    {
      title: 'Creator: explora las campañas.',
      body: 'Recorre las campañas abiertas, fíltralas y lee el briefing: contenidos esperados, condiciones, presupuesto, plazo y grado de coincidencia.',
    },
    {
      title: 'Creator: preséntate y acuerda.',
      body: 'Envía tu candidatura, sigue su estado y habla del importe en la conversación. Cualquiera de las partes puede hacer una contraoferta hasta el acuerdo.',
    },
    {
      title: 'Creator: entrega y cobra.',
      body: 'Entrega tu trabajo en el espacio de colaboración. Una vez validado, tu remuneración pasa a tu saldo de Stripe y después a tu banco.',
    },
    {
      title: 'Marca: describe tu actividad.',
      body: 'Al registrarte indicas tu organización, tu sector, tu objetivo, el tipo de Creators que buscas y tu orden de presupuesto.',
    },
    {
      title: 'Marca: crea tu campaña.',
      body: 'El asistente te guía en cuatro pasos: información, presupuesto, segmentación, revisión. Relees todo el briefing antes de publicar.',
    },
    {
      title: 'Marca: descubre y preselecciona.',
      body: 'Explora el feed, filtra los perfiles, lee los motivos de compatibilidad propuestos y forma tu preselección entre las candidaturas recibidas.',
    },
    {
      title: 'Marca: acuerda y financia.',
      body: 'Acuerda el importe en la conversación, contraoferta incluida. Al aceptarse, pagas: AVYOR retiene el importe hasta tu validación.',
    },
    {
      title: 'Marca: valida y paga.',
      body: 'Recibe el entregable, pide un ajuste si hace falta y valida. El pago al Creator se activa en ese momento.',
    },
  ],
  security: [
    {
      title: 'Tu cuenta.',
      body: 'La autenticación y los cambios sensibles pasan por Supabase. Desde los ajustes de seguridad puedes cambiar tu contraseña —con un indicador de robustez—, cambiar tu correo electrónico con verificación por mensaje y consultar tus sesiones abiertas.',
    },
    {
      title: 'Eliminar tu cuenta.',
      body: 'La eliminación se hace desde Ajustes y después Seguridad. La acción es irreversible y pide una confirmación escrita explícita antes de ejecutarse. Termina antes tus colaboraciones en curso: algunos registros vinculados a un pago deben conservarse por motivos legales.',
    },
    {
      title: 'Lo que muestra tu perfil.',
      body: 'Perfil, vídeos y portafolio están pensados para verse: es la función del producto. Las conversaciones, en cambio, solo son visibles para sus destinatarios. Tus preferencias de notificación y de visualización se ajustan en la aplicación.',
    },
    {
      title: 'El pago se retiene hasta la validación.',
      body: 'Una vez aceptada la propuesta, la marca paga y AVYOR retiene el importe. Solo se abona al Creator tras la validación del entregable. Ni el Creator ni la marca disponen de los fondos mientras tanto.',
    },
    {
      title: 'El pago, etapa por etapa.',
      body: 'Se muestran cuatro estados: pago de la colaboración, entregable validado, abono en el saldo de Stripe, transferencia bancaria. El plazo del último depende del calendario de pagos de la cuenta de Stripe del Creator; no se promete ningún plazo.',
    },
    {
      title: 'Denunciar un contenido o una cuenta.',
      body: 'La denuncia está disponible desde un vídeo, una conversación o un perfil, indicando un motivo.',
      items: [
        'Spam, cuenta falsa o suplantación de identidad.',
        'Acoso, violencia, contenido sexual no solicitado.',
        'Fraude o vulneración de derechos de autor.',
        'Otro motivo, con un comentario libre.',
      ],
    },
    {
      title: 'Bloquear a un usuario.',
      body: 'El bloqueo se hace en el mismo sitio que la denuncia e interrumpe la interacción. Sigue siendo reversible desde tus ajustes.',
    },
    {
      title: '¿Un problema durante una colaboración?',
      body: 'Contacta con el soporte indicando el proyecto afectado. No envíes nunca contraseñas ni datos bancarios completos por correo. Para un contenido o un comportamiento abusivo, usa la denuncia en la aplicación: llega directamente al equipo.',
    },
  ],
  download: [
    {
      title: 'Lo que puedes hacer en la app.',
      body: 'AVYOR reúne en una sola aplicación las etapas que van del descubrimiento de un perfil al entregable validado.',
      items: [
        'Descubrir: recorrer el feed de vídeo y los perfiles Creator.',
        'Campañas: publicar un briefing o explorar los abiertos.',
        'Colaboración: seguir las etapas de un proyecto y sus entregables.',
        'Portafolio: reunir tus creaciones en un perfil que te represente.',
        'Mensajes: conservar los intercambios de un proyecto con su contexto.',
      ],
    },
    {
      title: '¿Creator o marca?',
      body: 'El recorrido se adapta a tu actividad: presentar tu trabajo y responder a campañas del lado Creator, describir un proyecto y descubrir perfiles del lado marca. La elección se hace al crear la cuenta y puede modificarse desde tus ajustes.',
    },
    {
      title: '¿En qué dispositivos?',
      body: 'AVYOR es una aplicación móvil, prevista para iOS y Android. Los enlaces oficiales de App Store y Google Play aparecerán en esta página en cuanto se publiquen: no se muestra ningún enlace de descarga antes de verificarlo, y no se distribuye ningún archivo de instalación fuera de las dos tiendas.',
    },
    {
      title: '¿Cuánto cuesta?',
      body: 'Crear una cuenta y descubrir perfiles y campañas no tiene coste. Los movimientos de dinero corresponden a las propias colaboraciones: la marca financia el proyecto y el Creator cobra tras la validación del entregable. Los importes y las comisiones aplicables se presentan en la aplicación antes de cualquier compromiso.',
    },
    {
      title: '¿Una duda antes de empezar?',
      body: 'El equipo puede responder a tus preguntas sobre el producto. Escribe a la dirección de contacto oficial, sin enviar contraseñas ni datos bancarios.',
    },
  ],
  contact: [
    {
      title: 'Para una duda sobre el producto.',
      body: 'Indica si eres Creator o si representas a una marca, y describe después tu necesidad. Así podemos responderte con el contexto adecuado.',
    },
    {
      title: 'Para tu cuenta o tus datos.',
      body: 'Indica la dirección asociada a tu cuenta y la naturaleza de la solicitud. No envíes contraseñas ni datos de tarjeta bancaria.',
    },
    {
      title: 'Para denunciar un contenido.',
      body: 'Un contenido o una cuenta abusiva se denuncia directamente en la aplicación, desde el vídeo, la conversación o el perfil afectado: es la vía más rápida. Escríbenos si la denuncia no es posible.',
    },
  ],
};

export const deep: DeepContent = {
  sectionsBySlug,
  legalDocs: legal as unknown as DeepContent['legalDocs'],
};
