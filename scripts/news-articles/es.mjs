/*
 * Los cuatro artículos de News en español.
 *
 * Traducción de la referencia francesa, no una reescritura: la misma promesa,
 * la misma estructura, las mismas herramientas de decisión. Cambia lo que
 * tiene que cambiar — la redacción, y el hecho de que las reglas jurídicas
 * citadas son francesas, lo que se dice cada vez con claridad.
 *
 * Toda función de AVYOR mencionada ha sido verificada en la aplicación
 * (véase docs/audits/avyor-content-audit.md).
 */
import {
  a,
  b,
  callout,
  doc,
  h2,
  h3,
  i,
  ol,
  p,
  table,
  ul,
  TEAM,
  LOI,
  LOI_8,
  DECRET,
} from './dsl.mjs';

const brief = {
  id: 'briefugces01',
  slug: 'brief-ugc-que-precisar',
  icon: 'context',
  coverAlt:
    'Ilustración AVYOR: una ficha con puntos por marcar y un bocadillo de mensaje, en volumen, sobre fondo azul noche.',
  article: {
    title: 'Brief UGC: qué precisar para evitar las idas y venidas',
    excerpt:
      'Un vídeo cuidado que no da en el clavo suele venir de un brief impreciso. Las cinco decisiones que hay que tomar antes del rodaje, un ejemplo anotado y una lista para verificar.',
    type: 'guide',
    audience: 'brands',
    theme: 'prepare',
    author: TEAM.es,
    featured: true,
    cta: { label: 'Descubrir el recorrido de marca', slug: 'brands' },
    related: ['choixcreaes1'],
    translations: {},
    sources: [LOI],
    seo: {
      title: 'Brief UGC: qué precisar antes del rodaje | AVYOR',
      description:
        'Público, mensaje, entregables, restricciones, validación y derechos de uso: lo que un brief UGC debe fijar para evitar idas y venidas, con un ejemplo anotado.',
    },
    body: doc(
      p(
        'Llega el vídeo. La luz es bonita, el producto está bien filmado, el tono es natural. Y sin embargo no sirve a su campaña: habla de la cualidad equivocada, dura un minuto cuando hacían falta quince segundos, o está rodado en horizontal. Usted pide otra versión, el Creator no entiende qué fallaba, y pasa una semana.',
      ),
      p(
        'A menudo el problema no es el vídeo sino el brief. ',
        b(
          'Un brief evita las idas y venidas cuando fija cinco cosas antes del rodaje: a quién habla el vídeo, el mensaje único, los entregables exactos, lo que es obligatorio y lo que es libre, y cómo se validará y se usará el vídeo.',
        ),
        ' El resto de este artículo detalla cada una de esas decisiones, con un ejemplo de brief anotado y una lista para verificar antes de enviarlo.',
      ),
      callout(
        'example',
        p(
          b('UGC'),
          ' (',
          i('user-generated content'),
          ') designa aquí un contenido creado por un Creator para una marca, que esta publica normalmente en sus propios canales: publicidad, ficha de producto, redes de la marca. Es distinto de una publicación de influencia, difundida por el Creator ante su propia audiencia. Los dos se preparan con un brief, pero no con las mismas expectativas.',
        ),
      ),
      h2('Por qué un brief impreciso cuesta idas y venidas'),
      p(
        'Un Creator que recibe un brief incompleto no se detiene: rellena los huecos con sus propias hipótesis. Elige un ángulo, una duración, un formato, un tono. Esas decisiones suelen ser buenas en sí mismas, pero no son las suyas. Usted descubre la diferencia en la entrega, justo cuando corregirla sale más caro: otro rodaje en lugar de una frase más en el brief.',
      ),
      p(
        'Las consignas más habituales son también las más engañosas. ',
        i('«Un vídeo auténtico que destaque el producto»'),
        ' no dice para quién, ni qué ventaja, ni bajo qué forma. Cualquiera puede reconocerse en ella, y eso es precisamente lo que la vuelve inútil.',
      ),
      h2('Las cinco decisiones que hay que tomar antes de escribir'),
      h3('1. A quién habla el vídeo, y de qué problema'),
      p(
        'Describa a una persona concreta y la situación en la que su producto la ayuda. ',
        i('«Las mujeres de 25 a 35 años»'),
        ' es un objetivo de marketing; ',
        i('«alguien que corre por la mañana y a quien la botella le gotea dentro de la mochila»'),
        ' es una escena que el Creator puede interpretar. Cuanto más concreta sea la situación, más justo será el vídeo sin que usted tenga que escribirlo en su lugar.',
      ),
      h3('2. El mensaje único'),
      p(
        'Un vídeo corto lleva ',
        b('un solo mensaje'),
        '. Si enumera seis ventajas, el Creator elegirá una, o las citará todas tan deprisa que no quedará ninguna. Elija la que importa a la persona descrita antes, y guarde las demás para otros vídeos.',
      ),
      h3('3. Los entregables, hasta el formato'),
      p('Es una parte que se olvida a menudo y, sin embargo, la más sencilla de escribir. Precise:'),
      ul(
        'el número de vídeos y su duración objetivo;',
        'el formato: vertical 9:16, cuadrado, horizontal;',
        'qué espera exactamente: vídeo montado, archivos en bruto, o ambos;',
        'las variantes útiles: varios ganchos para los tres primeros segundos, varios finales;',
        'los subtítulos, la música, el texto en pantalla: quién se encarga.',
      ),
      h3('4. Lo que es obligatorio, lo que es libre'),
      p(
        'Sepárelo en dos listas. Por un lado, ',
        b('los puntos no negociables'),
        ': una mención que debe aparecer, una afirmación prohibida, un gesto de uso que mostrar, una marca competidora que no filmar. Por otro, lo que deja al Creator: el decorado, las palabras, el ritmo. Imponer un guion palabra por palabra suele quitar aquello por lo que lo eligió; dicte solo las frases que deben serlo.',
      ),
      h3('5. La validación y los derechos de uso'),
      p(
        'Diga quién valida, en qué plazo y cuántas rondas de retoques están incluidas. Precise también ',
        b('dónde, cuánto tiempo y en qué países'),
        ' usará el vídeo: en sus redes, en publicidad de pago, en su web. Esos derechos de uso forman parte del acuerdo; dejarlos implícitos es aplazar la conversación al momento en que resulta más delicada.',
      ),
      p(
        'Si el Creator publica además el vídeo en su propia cuenta, la colaboración entra en el terreno de la influencia comercial. En Francia, la ley exige entonces indicar claramente la mención «Publicité» o «Collaboration commerciale» durante toda la promoción (',
        a('ley francesa n.º 2023-451, artículo 5', LOI.url),
        '). Si su campaña se difunde en Francia, vale la pena preverlo en el brief; en otros países, compruebe las reglas que le corresponden.',
      ),
      h2('Ejemplo de brief anotado'),
      callout(
        'example',
        p(
          'Producto y marca ficticios, a modo de ilustración. Cada línea muestra una consigna imprecisa, su versión útil y lo que evita.',
        ),
      ),
      table(
        ['Apartado', 'Brief impreciso', 'Brief útil', 'Lo que evita'],
        [
          'Público',
          '«Los deportistas»',
          '«Alguien que corre antes de trabajar y guarda la botella en la mochila.»',
          'Un ángulo de rendimiento cuando el tema real es la mochila mojada.',
        ],
        [
          'Mensaje',
          '«Mostrar todas las cualidades de la botella»',
          '«No gotea, ni siquiera boca abajo dentro de una mochila.»',
          'Seis ventajas en quince segundos, ninguna recordada.',
        ],
        [
          'Entregables',
          '«Un vídeo dinámico»',
          '«Dos vídeos verticales 9:16 de 15 a 20 s, tres ganchos distintos, archivos en bruto incluidos.»',
          'Un vídeo horizontal de un minuto, imposible de usar en publicidad.',
        ],
        [
          'Obligatorio / libre',
          'Nada precisado',
          '«Mostrar la botella boca abajo sobre una mochila abierta. Libre: lugar, ropa, palabras. Prohibido: hablar de conservación del frío.»',
          'Una afirmación que la marca no puede demostrar.',
        ],
        [
          'Validación y uso',
          'Nada precisado',
          '«Respuesta en 48 h, una ronda de retoques incluida. Uso: redes de la marca y publicidad, 6 meses, Francia.»',
          'Una negociación sobre los derechos después de la entrega.',
        ],
      ),
      h2('Lo que más vale no escribir'),
      ul(
        [
          b('Adjetivos en lugar de decisiones'),
          ': «auténtico», «dinámico», «impactante» no se filman.',
        ],
        [b('Una lista de ventajas sin jerarquía'), ': si todo es prioritario, nada lo es.'],
        [
          b('Un guion completo impuesto'),
          ' cuando solo dos frases son realmente obligatorias.',
        ],
        [
          b('Referencias que el Creator no puede ver'),
          ': «como nuestra última campaña», sin enlace a ella.',
        ],
      ),
      h2('La lista para verificar antes de enviar'),
      callout(
        'checklist',
        ul(
          'La persona a la que se dirige y su situación están descritas en una o dos frases.',
          'Un solo mensaje principal está escrito con todas las letras.',
          'El número de vídeos, su duración, su formato y las variantes están precisados.',
          'Los puntos obligatorios y prohibidos están separados de lo que es libre.',
          'El plazo de validación y el número de rondas de retoques incluidas están indicados.',
          'Los derechos de uso — soportes, duración, países — están escritos.',
          'La mención de transparencia está prevista si el Creator publica en su cuenta.',
        ),
      ),
      h2('En AVYOR'),
      p(
        'El asistente de campaña de AVYOR procede en cuatro pasos: información, presupuesto, segmentación y, por último, revisión del brief completo antes de publicarlo. La segmentación cubre las plataformas, la audiencia y el plazo; la revisión es el buen momento para repasar la lista anterior. Los derechos de uso concedidos sobre un entregable son los definidos en las condiciones de la campaña aceptada: lo que escriba allí es la referencia para ambas partes.',
      ),
    ),
  },
};

/* ================================================================ Article 2 */

const choose = {
  id: 'choixcreaes1',
  slug: 'elegir-un-creator-mas-alla-de-los-seguidores',
  icon: 'discover',
  coverAlt:
    'Ilustración AVYOR: una brújula en volumen, violeta y azul, sobre fondo azul noche.',
  article: {
    title: 'Cómo elegir un Creator más allá del número de seguidores',
    excerpt:
      'Tres propuestas, tres vídeos cuidados: ¿cuál conviene a su marca? Una tabla de comparación ligada al objetivo de su campaña, y las señales que deben alertarle.',
    type: 'guide',
    audience: 'brands',
    theme: 'choose',
    author: TEAM.es,
    featured: false,
    cta: { label: 'Descubrir el recorrido de marca', slug: 'brands' },
    related: ['briefugces01'],
    translations: {},
    sources: [],
    seo: {
      title: 'Elegir un Creator más allá de los seguidores | AVYOR',
      description:
        'Cómo comparar Creators según el objetivo de su campaña: forma de explicar un producto, adecuación al público, entregables, fiabilidad. Tabla lista para usar.',
    },
    body: doc(
      p(
        'Ha recibido tres propuestas de Creators. Los vídeos están cuidados, pero sigue sin saber cuál conviene a su marca. ',
        b(
          'Empiece por comparar su manera de explicar un producto, los entregables que proponen y las condiciones de la colaboración.',
        ),
        ' El número de seguidores no responde por sí solo a esas preguntas — y según su objetivo, puede no contar en absoluto.',
      ),
      p(
        'Este artículo le da un método: partir del objetivo de la campaña, comparar cinco criterios observables y decidir con una tabla que puede usar tal cual.',
      ),
      h2('Primero, su objetivo'),
      p('La primera pregunta no es «¿qué Creator elegir?» sino «¿qué necesito?».'),
      ul(
        [
          b('Contenidos para sus propios canales'),
          ' (publicidad, ficha de producto, redes de la marca): es un encargo UGC. Lo que cuenta es la calidad y la precisión del vídeo. La audiencia del Creator no se usará.',
        ],
        [
          b('Que le vea una audiencia concreta'),
          ': eso es influencia. La audiencia del Creator se convierte en un criterio, pero su composición cuenta más que su tamaño.',
        ],
      ),
      p(
        'Muchas campañas mezclan ambos. Escriba simplemente cuál pesa más: decidirá por usted en caso de duda.',
      ),
      h2('Lo que dice el número de seguidores, y lo que no dice'),
      p(
        'Un número de seguidores indica el tamaño de una audiencia potencial, en un momento dado. No dice quién compone esa audiencia, ni si se parece a sus clientes, ni si el Creator sabe presentar un producto que no ha elegido. Para un encargo UGC no dice casi nada útil: usted compra un vídeo, no una difusión.',
      ),
      h2('Cinco criterios para comparar'),
      h3('Su manera de explicar un producto'),
      p(
        'Mire dos o tres vídeos en los que el Creator presente algo. ¿Se entiende en unos segundos para qué sirve el producto? ¿Muestra un gesto de uso o se limita a sostenerlo ante la cámara? Lo que ve allí se parece a lo que recibirá.',
      ),
      h3('La adecuación con su público'),
      p(
        '¿El tono, el decorado y el ritmo corresponden a las personas a las que se dirige? Un excelente Creator puede ser la elección equivocada si su forma de hablar no se parece a la de sus clientes.',
      ),
      h3('La calidad de ejecución'),
      p(
        'Sonido audible sin música, luz estable, encuadre legible en un teléfono, montaje que va a lo esencial. Estos puntos se comprueban en un minuto y evitan decepciones técnicas.',
      ),
      h3('Los entregables que propone'),
      p(
        'Un Creator que propone variantes de gancho, archivos en bruto o varios formatos le facilita lo que viene después. Compare lo que está incluido, no solo el importe.',
      ),
      h3('La fiabilidad de la colaboración'),
      p(
        '¿Las respuestas son claras? ¿Hace preguntas sobre el brief? ¿Acepta precisar por escrito los plazos, los retoques y los derechos de uso? Una buena pregunta antes del rodaje vale más que una buena excusa después.',
      ),
      h2('La tabla de comparación'),
      p(
        'Puntúe cada criterio de 1 a 3 para cada Creator. La última columna indica qué criterios pesan más según su objetivo.',
      ),
      table(
        ['Criterio', 'Qué mira', 'Dónde verlo', 'Prioridad'],
        [
          'Explicación del producto',
          'El uso se entiende en unos segundos',
          'Portfolio, vídeos de demostración',
          'UGC: alta · Influencia: alta',
        ],
        [
          'Adecuación al público',
          'Tono, decorado y ritmo próximos a sus clientes',
          'Vídeos recientes, perfil',
          'UGC: media · Influencia: alta',
        ],
        [
          'Calidad de ejecución',
          'Sonido, luz, encuadre, montaje',
          'Dos o tres vídeos al azar',
          'UGC: alta · Influencia: media',
        ],
        [
          'Entregables propuestos',
          'Variantes, archivos en bruto, formatos',
          'Propuesta, conversación',
          'UGC: alta · Influencia: media',
        ],
        [
          'Fiabilidad',
          'Respuestas claras, preguntas sobre el brief',
          'Primeros intercambios',
          'UGC: alta · Influencia: alta',
        ],
        [
          'Audiencia',
          'Composición y proximidad con sus clientes',
          'Información facilitada por el Creator',
          'UGC: baja · Influencia: alta',
        ],
      ),
      callout(
        'example',
        p(
          b('Ejemplo ilustrativo.'),
          ' Una marca de cosmética quiere vídeos para su publicidad. El Creator A tiene la mayor audiencia, pero sus vídeos de producto son planos fijos sin demostración. El Creator B tiene una audiencia modesta, muestra siempre el gesto de aplicación y propone tres ganchos. El Creator C está cerca del público objetivo, pero su sonido es inaudible sin música. Para un encargo UGC, la tabla señala a B: la audiencia de A no se usará, y el defecto de C afecta a un criterio prioritario.',
        ),
      ),
      h2('Las señales que deben alertarle'),
      callout(
        'warning',
        ul(
          'Un portfolio que solo muestra un tipo de vídeo, sin demostración de producto.',
          'Cifras de audiencia que el Creator no puede o no quiere explicar.',
          'Una negativa a precisar por escrito los entregables, los plazos o los derechos de uso.',
          'Ninguna pregunta sobre su brief, incluso cuando deja puntos abiertos.',
        ),
      ),
      p(
        'Ninguna de estas señales es descalificante por sí sola. Juntas, anuncian por lo general una colaboración difícil.',
      ),
      h2('En AVYOR'),
      p(
        'Cuando AVYOR sugiere un perfil para su campaña, muestra las razones de la compatibilidad: especialización en su nicho, presencia en sus plataformas objetivo, tasa de interacción, ubicación e idioma, puntuación de confianza, actividad reciente. Esas razones complementan la lectura de un portfolio, no la sustituyen. Después puede formar una preselección entre las candidaturas recibidas antes de decidir; la decisión sigue siendo suya.',
      ),
    ),
  },
};

/* ================================================================ Article 3 */

const portfolio = {
  id: 'portfolioes1',
  slug: 'portfolio-ugc-que-mostrar-al-empezar',
  icon: 'create',
  coverAlt: 'Ilustración AVYOR: una claqueta en volumen, violeta, sobre fondo azul noche.',
  article: {
    title: 'Portfolio UGC: qué mostrar cuando se empieza',
    excerpt:
      '¿Aún sin cliente y con una primera campaña a la vista? Un portfolio muestra ante todo su forma de trabajar. Cinco piezas que preparar, presentadas con honestidad, y lo que conviene quitar.',
    type: 'guide',
    audience: 'creators',
    theme: 'create',
    author: TEAM.es,
    featured: false,
    cta: { label: 'Descubrir el recorrido Creator', slug: 'creators' },
    related: ['premierees01'],
    translations: {},
    sources: [],
    seo: {
      title: 'Portfolio UGC al empezar: qué mostrar | AVYOR',
      description:
        'Sin cliente, un portfolio UGC muestra su forma de trabajar: cinco vídeos que preparar, cómo presentar proyectos personales con honestidad y qué quitar.',
    },
    body: doc(
      p(
        'Quiere presentarse a su primera campaña, pero todavía no ha trabajado para ninguna marca. Su galería contiene vídeos de vacaciones, dos tutoriales y un unboxing grabado hace un año. Duda en dar el paso.',
      ),
      p(
        b(
          'Un portfolio no muestra ante todo para quién ha trabajado: muestra cómo trabaja.',
        ),
        ' Tres a cinco vídeos cortos, realizados para la ocasión y presentados honestamente como proyectos personales, bastan para demostrarlo. Estos son los que conviene preparar, y cómo presentarlos.',
      ),
      h2('Lo que una marca busca en un portfolio'),
      p('Una marca que recorre su portfolio se hace unas cuantas preguntas sencillas:'),
      ul(
        '¿Sabe hacer entender un producto en unos segundos?',
        '¿El sonido, la luz y el encuadre están limpios?',
        '¿El ritmo va a lo esencial?',
        '¿Sabe seguir una consigna sin perder su personalidad?',
      ),
      p(
        'Ninguna de estas preguntas exige haber tenido ya un cliente. Exigen vídeos pensados para responderlas.',
      ),
      h2('Sin cliente: proyectos personales, presentados como tales'),
      p(
        'Filme productos que posea y use de verdad, como si una marca se lo hubiera pedido. Es la forma más directa de mostrar su trabajo. Una regla no admite excepción: ',
        b('presente estos vídeos como proyectos personales'),
        '. No escriba «para la marca X» ni deje creer en una colaboración que no ha existido: una marca que se da cuenta no se lo perdonará, y habrá perdido lo que el portfolio debía demostrar.',
      ),
      callout(
        'example',
        p(
          b('Ejemplo de pie de vídeo honesto: '),
          i(
            '«Proyecto personal, no encargado. Objetivo: mostrar en 15 segundos que estos auriculares aguantan durante la carrera. Restricción que me impuse: ningún texto en pantalla.»',
          ),
        ),
      ),
      h2('Cinco piezas para un primer portfolio'),
      p(
        'Cada una demuestra una competencia distinta. No está obligado a hacerlas todas; tres bien elegidas valen más que cinco hechas deprisa.',
      ),
      table(
        ['Pieza', 'Duración indicativa', 'Lo que demuestra'],
        [
          'Gancho de producto',
          '10 a 15 s',
          'Capta la atención y plantea el problema desde los primeros segundos.',
        ],
        ['Demostración o tutorial', '30 a 45 s', 'Hace entender un uso, paso a paso.'],
        [
          'Testimonio a cámara',
          '20 a 30 s',
          'Habla con naturalidad de un producto, sin leer un texto.',
        ],
        ['Unboxing', '20 a 40 s', 'Pone en valor un objeto y su embalaje, sin tiempos muertos.'],
        [
          'Antes / después o lifestyle',
          '15 a 30 s',
          'Muestra un resultado, o un producto en una escena de vida creíble.',
        ],
      ),
      p(
        'Estas duraciones son referencias para una primera serie, no normas: lea siempre las consignas de la campaña a la que responde.',
      ),
      h2('Tres líneas de contexto bajo cada vídeo'),
      p('Un vídeo sin contexto deja que la marca adivine qué buscaba. Añada bajo cada uno:'),
      ol(
        [b('El objetivo'), ': lo que el vídeo debía hacer entender.'],
        [b('La restricción'), ': la consigna que usted mismo se impuso.'],
        [
          b('Lo que cambiaría'),
          ': una frase que muestra su mirada sobre su propio trabajo.',
        ],
      ),
      p(
        'La tercera línea suele ser la que una marca retiene: demuestra que sabe recibir un comentario.',
      ),
      h2('Lo que conviene quitar'),
      ul(
        'Los vídeos cuyo sonido no es audible sin música.',
        'Los contenidos sin producto ni mensaje, aunque estén logrados: no responden a ninguna pregunta de la marca.',
        'Los duplicados: dos unboxings parecidos dicen lo mismo.',
        'Todo lo que pudiera hacer creer en una colaboración que no existe.',
      ),
      h2('Antes de presentarse'),
      callout(
        'checklist',
        ul(
          'Tres a cinco vídeos, cada uno demostrando una competencia distinta.',
          'Cada proyecto personal está presentado como tal.',
          'Cada vídeo lleva sus tres líneas de contexto.',
          'El sonido es audible sin música en todos los vídeos.',
          'Los formatos pedidos por la campaña a la que aspira están representados.',
        ),
      ),
      h2('En AVYOR'),
      p(
        'El portfolio de un Creator en AVYOR clasifica los trabajos por tipo de contenido, y las fotos pueden alimentarlo sin pasar por el feed. Para preparar sus primeras piezas, las plantillas de vídeo guiadas cubren siete familias de formatos — gancho de producto, testimonio, lifestyle, unboxing, tutorial, antes/después, storytelling —, cada una con sus pasos, su duración y su nivel de dificultad.',
      ),
    ),
  },
};

/* ================================================================ Article 4 */

const firstCollab = {
  id: 'premierees01',
  slug: 'primera-colaboracion-con-una-marca-que-aclarar',
  icon: 'collaborate',
  coverAlt:
    'Ilustración AVYOR: dos bocadillos de conversación en volumen, azul y violeta, sobre fondo azul noche.',
  article: {
    title: 'Primera colaboración con una marca: los puntos que aclarar',
    excerpt:
      'A una marca le gusta su trabajo y le propone una colaboración. Antes de decir que sí, cinco puntos que obtener por escrito, un modelo de mensaje para pedirlos y lo que exige la ley en Francia.',
    type: 'guide',
    audience: 'creators',
    theme: 'prepare',
    author: TEAM.es,
    featured: false,
    cta: { label: 'El recorrido en detalle', slug: 'how-it-works' },
    related: ['portfolioes1'],
    translations: {},
    sources: [LOI, LOI_8, DECRET],
    seo: {
      title: 'Primera colaboración con una marca: qué aclarar | AVYOR',
      description:
        'Entregables, calendario, remuneración, derechos de uso, transparencia: los puntos que obtener por escrito antes de aceptar una primera colaboración.',
    },
    body: doc(
      p(
        'Una marca ha visto su trabajo y le propone una colaboración. Es una buena noticia, y las ganas de responder «sí» de inmediato son naturales. Sin embargo, la mayoría de las dificultades de una primera colaboración vienen de lo que no se dijo al principio: un retoque de más, un pago más tardío de lo previsto, un vídeo usado en un sitio distinto del anunciado.',
      ),
      p(
        b(
          'Antes de aceptar, obtenga por escrito cinco puntos: los entregables, el calendario y los retoques, la remuneración y su momento, los derechos de uso y sus obligaciones de transparencia si publica.',
        ),
        ' Hacer estas preguntas no le hace pasar por alguien difícil: es lo que hacen los Creators con los que las marcas quieren repetir.',
      ),
      h2('1. Los entregables, con precisión'),
      p(
        'Número de vídeos, duración, formato, variantes, archivos en bruto o no: todo lo que no esté escrito corre el riesgo de esperarse igualmente. Si el brief sigue siendo vago, reformúlelo usted y pida una confirmación. Una frase como ',
        i(
          '«Entrego dos vídeos verticales de 20 segundos, montados, con tres ganchos distintos: ¿es así?»',
        ),
        ' evita la mayoría de los malentendidos.',
      ),
      h2('2. El calendario y los retoques'),
      p(
        'Pida la fecha de entrega, el plazo de respuesta de la marca y ',
        b('el número de rondas de retoques incluidas'),
        '. Distinga un retoque — ajustar un plano, acortar una frase — de una nueva petición, como otro ángulo u otro producto. La segunda se discute aparte.',
      ),
      h2('3. La remuneración: importe, forma, momento'),
      p(
        'El importe, por supuesto, pero también su forma: cantidad fija, comisión, productos regalados, o una mezcla. Y sobre todo ',
        b('el momento del pago'),
        ': ¿al encargo, a la entrega, tras la validación? Un producto regalado no es una remuneración neutra: es una ventaja en especie, y la ley francesa la cuenta como tal.',
      ),
      h2('4. Los derechos de uso'),
      p(
        '¿Dónde usará la marca su vídeo, durante cuánto tiempo, en qué países? ¿En sus redes, en publicidad de pago, en su web? Esos derechos tienen un valor. Un uso publicitario de larga duración no se negocia como una publicación única en la cuenta de la marca.',
      ),
      h2('5. Si publica en su cuenta: la transparencia'),
      p(
        'Cuando promociona un producto ante su propia audiencia, se trata de influencia comercial. En Francia, la ley exige entonces la mención «Publicité» o «Collaboration commerciale», ',
        i('clara, legible e identificable'),
        ' durante toda la promoción (',
        a('ley francesa n.º 2023-451, artículo 5', LOI.url),
        ').',
      ),
      p(
        'La misma ley exige un ',
        b('contrato escrito'),
        ', con menciones precisas — identidad de las partes, naturaleza de las misiones, remuneración o valor de las ventajas en especie, derechos y obligaciones de cada uno — cuando las remuneraciones y ventajas abonadas por un mismo anunciante a lo largo de un año, con un mismo objetivo promocional, alcanzan ',
        b('1 000 € sin impuestos'),
        '. Ese umbral fue fijado por el ',
        a('decreto n.º 2025-1137', DECRET.url),
        ', en vigor desde el 1 de enero de 2026.',
      ),
      callout(
        'warning',
        p(
          'Estas reglas se aplican en Francia y evolucionan: la ley ya ha sido modificada desde su aprobación, en particular por la ordenanza n.º 2024-978. Compruebe la versión en vigor en Légifrance en el momento de firmar. Si usted o la marca están establecidos en otro país, las reglas aplicables pueden ser distintas. Este artículo le ayuda a plantear las buenas preguntas; no sustituye a un asesoramiento jurídico para su situación.',
        ),
      ),
      p(
        'Si entrega un vídeo que solo publicará la marca, sin difundirlo usted mismo, la situación es distinta: aclare con ella quién publica, dónde y con qué mención.',
      ),
      h2('Un mensaje para aclarar, listo para adaptar'),
      callout(
        'example',
        p(
          i(
            '«Gracias por su propuesta, su producto me interesa. Antes de confirmar, ¿podría precisarme: el número de vídeos, su duración y su formato; la fecha de entrega y el número de rondas de retoques incluidas; la remuneración y el momento del pago; dónde y durante cuánto tiempo usarán el vídeo; y si esperan una publicación en mi cuenta? En cuanto tenga estos datos, se lo confirmo.»',
          ),
        ),
      ),
      h2('Antes de aceptar'),
      callout(
        'checklist',
        ul(
          'Los entregables están escritos: número, duración, formato, variantes.',
          'La fecha de entrega y el número de rondas de retoques incluidas están fijados.',
          'El importe, su forma y el momento del pago son conocidos.',
          'Los derechos de uso — soportes, duración, países — están precisados.',
          'Sabe si publica en su cuenta, y con qué mención.',
          'Existe un contrato escrito si se alcanza el umbral legal.',
        ),
      ),
      h2('En AVYOR'),
      p(
        'En AVYOR, el importe se discute en la conversación con la marca, y cada parte puede hacer una contraoferta. La colaboración solo empieza una vez aceptada la propuesta; la marca paga entonces, y la cantidad queda conservada por AVYOR hasta que valide su entregable. Un punto que conviene conocer antes de presentarse: ',
        b('una candidatura enviada no puede retirarse desde la aplicación'),
        '. Haga sus preguntas antes, en la conversación.',
      ),
    ),
  },
};

export const articles = [
  { family: 'brief', ...brief },
  { family: 'choose', ...choose },
  { family: 'portfolio', ...portfolio },
  { family: 'first-collab', ...firstCollab },
];
