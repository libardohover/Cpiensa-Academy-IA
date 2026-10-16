/**
 * Ejes transversales del Diplomado CPIENSA+ ACADEMY IA 2.0
 *
 *  1. Valores y principios cristianos: orientan el uso de la inteligencia
 *     artificial al servicio de la persona y del bien común.
 *  2. Enfoque etnoeducativo: reconoce la diversidad étnica y cultural de
 *     Colombia (pueblos indígenas, comunidades negras, afrocolombianas,
 *     raizales, palenqueras y pueblo Rrom) en cada módulo.
 *
 * Los textos son editables por la coordinación académica sin tocar las lecciones.
 */

export type ValorCristiano = {
  id: string;
  nombre: string;
  /** Referencia bíblica (sin transcribir el texto, para que cada lector use su versión). */
  referencia: string;
  /** Idea central del pasaje, en palabras propias. */
  fundamento: string;
  /** Qué significa este valor al usar IA. */
  enIA: string;
};

export const VALORES_CRISTIANOS: ValorCristiano[] = [
  {
    id: 'dignidad',
    nombre: 'Dignidad humana',
    referencia: 'Génesis 1:27',
    fundamento: 'Toda persona fue creada a imagen de Dios y tiene un valor que no depende de su utilidad.',
    enIA: 'La IA sirve a las personas y nunca las reemplaza en su valor; se protegen sus datos, su imagen y su voz.',
  },
  {
    id: 'verdad',
    nombre: 'Verdad e integridad',
    referencia: 'Juan 8:32 · Efesios 4:25',
    fundamento: 'La verdad hace libres a las personas y la comunidad se edifica cuando se habla con verdad.',
    enIA: 'Verificar lo que produce la IA, declarar cuándo se usó y no presentar como propio lo que no lo es.',
  },
  {
    id: 'servicio',
    nombre: 'Amor y servicio al prójimo',
    referencia: 'Mateo 22:39 · Gálatas 5:13',
    fundamento: 'Amar al prójimo como a uno mismo y usar la libertad para servir a los demás.',
    enIA: 'Cada automatización y cada mensaje se evalúa por el bien que hace a quien lo recibe.',
  },
  {
    id: 'justicia',
    nombre: 'Justicia y equidad',
    referencia: 'Miqueas 6:8',
    fundamento: 'Hacer justicia, amar la misericordia y caminar con humildad.',
    enIA: 'Detectar y corregir sesgos; que ninguna persona o comunidad quede excluida o perjudicada por un sistema.',
  },
  {
    id: 'mayordomia',
    nombre: 'Mayordomía responsable',
    referencia: 'Génesis 2:15 · 1 Pedro 4:10',
    fundamento: 'Somos administradores de la creación y de los dones recibidos, no sus dueños absolutos.',
    enIA: 'Usar con responsabilidad los datos, el tiempo, el dinero y la energía que consumen los modelos.',
  },
  {
    id: 'sabiduria',
    nombre: 'Sabiduría y discernimiento',
    referencia: 'Proverbios 2:6 · Santiago 1:5',
    fundamento: 'La sabiduría viene de Dios y se pide con humildad para decidir bien.',
    enIA: 'La decisión final es humana: supervisar a los agentes y ejercer criterio ético antes de actuar.',
  },
  {
    id: 'comunidad',
    nombre: 'Comunidad y fraternidad',
    referencia: '1 Corintios 12:12-27',
    fundamento: 'Somos un solo cuerpo con muchos miembros; cada uno es necesario.',
    enIA: 'Construir con otros, compartir el conocimiento y reconocer el aporte de cada persona y pueblo.',
  },
  {
    id: 'excelencia',
    nombre: 'Trabajo con excelencia',
    referencia: 'Colosenses 3:23',
    fundamento: 'Hacer el trabajo de corazón, como para el Señor.',
    enIA: 'Entregar productos cuidados, revisados y útiles, no solo rápidos.',
  },
];

/** Principios de la etnoeducación (Decreto 804 de 1995, artículo 2). */
export const PRINCIPIOS_ETNOEDUCACION: { nombre: string; descripcion: string }[] = [
  { nombre: 'Integralidad', descripcion: 'Concepción global de cada pueblo y de su relación con la naturaleza, la sociedad y lo trascendente.' },
  { nombre: 'Diversidad lingüística', descripcion: 'Las lenguas de los pueblos se valoran y se usan en los procesos educativos.' },
  { nombre: 'Autonomía', descripcion: 'Derecho de los grupos étnicos a desarrollar sus procesos educativos.' },
  { nombre: 'Participación comunitaria', descripcion: 'La comunidad orienta, desarrolla y evalúa sus procesos etnoeducativos.' },
  { nombre: 'Interculturalidad', descripcion: 'Conocer la propia cultura y otras culturas, y enriquecerse en el diálogo entre ellas.' },
  { nombre: 'Flexibilidad', descripcion: 'Procesos educativos que se ajustan a los valores y a las particularidades de cada pueblo.' },
  { nombre: 'Progresividad', descripcion: 'Los procesos avanzan según la dinámica de la comunidad y de la investigación.' },
  { nombre: 'Solidaridad', descripcion: 'Cohesión de los grupos sociales para afianzar la vida comunitaria.' },
];

/** Marco normativo colombiano que respalda el enfoque etnoeducativo. */
export const MARCO_NORMATIVO_ETNO: { norma: string; tema: string }[] = [
  { norma: 'Constitución Política de 1991, arts. 7, 10 y 68', tema: 'Diversidad étnica y cultural; educación que respeta y desarrolla la identidad cultural' },
  { norma: 'Ley 21 de 1991 (Convenio 169 de la OIT)', tema: 'Pueblos indígenas y tribales; consulta previa' },
  { norma: 'Ley 70 de 1993', tema: 'Derechos de las comunidades negras; etnoeducación afrocolombiana' },
  { norma: 'Ley 115 de 1994, arts. 55 a 63', tema: 'Educación para grupos étnicos' },
  { norma: 'Decreto 804 de 1995', tema: 'Atención educativa para grupos étnicos y principios de la etnoeducación' },
  { norma: 'Decreto 1122 de 1998', tema: 'Cátedra de Estudios Afrocolombianos' },
];

export type EjeModulo = {
  /** Ids de VALORES_CRISTIANOS que orientan el módulo. */
  valores: string[];
  /** Cómo se viven esos valores en los temas del módulo. */
  reflexion: string;
  /** Compromiso práctico del estudiante. */
  practica: string;
  etno: {
    /** Cómo se aplica la etnoeducación a los temas del módulo. */
    enfoque: string;
    /** Principio del Decreto 804 que más se trabaja. */
    principio: string;
    /** Actividad etnoeducativa sugerida. */
    actividad: string;
  };
};

export const EJES_POR_MODULO: Record<number, EjeModulo> = {
  1: {
    valores: ['dignidad', 'mayordomia'],
    reflexion:
      'Proteger la información de las personas es una forma de reconocer su dignidad. Los datos no son solo un recurso técnico: detrás de cada registro hay una vida.',
    practica: 'Antes de cargar un archivo a un modelo, preguntarse: ¿la persona dueña de estos datos estaría de acuerdo?',
    etno: {
      enfoque:
        'Soberanía de los datos de los pueblos: la información de comunidades indígenas, afrocolombianas, raizales, palenqueras y Rrom (territorio, saberes, lenguas, plantas medicinales) es colectiva y requiere consentimiento libre, previo e informado de sus autoridades.',
      principio: 'Autonomía',
      actividad:
        'Redactar una cláusula de uso de IA que proteja los saberes ancestrales de una comunidad de tu región y defina quién autoriza su uso (cabildo, consejo comunitario o autoridad propia).',
    },
  },
  2: {
    valores: ['verdad', 'justicia'],
    reflexion:
      'Un prompt también comunica valores: lo que pedimos, cómo lo pedimos y a quién representamos. Pedir con veracidad y sin prejuicios es parte de la integridad.',
    practica: 'Revisar cada prompt para eliminar estereotipos y pedir al modelo que declare lo que no sabe.',
    etno: {
      enfoque:
        'Prompts con contexto territorial y cultural: incluir el territorio, la lengua y la cosmovisión del grupo con el que se trabaja, y pedir al modelo que no generalice ni folclorice a los pueblos étnicos.',
      principio: 'Interculturalidad',
      actividad:
        'Comparar la respuesta de un modelo a un mismo prompt con y sin contexto étnico-territorial (p. ej., una comunidad del Pacífico o del pueblo Wayuu) e identificar estereotipos en la versión sin contexto.',
    },
  },
  3: {
    valores: ['servicio', 'verdad'],
    reflexion:
      'Comunicar es servir: un correo, un informe o un comunicado deben edificar, decir la verdad con respeto y cuidar a quien los lee, sobre todo en momentos de crisis.',
    practica: 'Leer cada texto generado poniéndose en el lugar de quien lo recibe antes de enviarlo.',
    etno: {
      enfoque:
        'Comunicación intercultural y bilingüe: respetar la oralidad, los protocolos de palabra de cada pueblo y las lenguas nativas y criollas (palenquero, creole sanandresano, wayuunaiki, nasa yuwe, entre otras). Las traducciones hechas con IA se validan con hablantes de la comunidad.',
      principio: 'Diversidad lingüística',
      actividad:
        'Adaptar un comunicado institucional para una comunidad étnica: lenguaje claro, saludo según sus protocolos y una versión para lectura en voz alta o radio comunitaria.',
    },
  },
  4: {
    valores: ['verdad', 'sabiduria'],
    reflexion:
      'Investigar es buscar la verdad con humildad: contrastar fuentes, reconocer errores y no aceptar sin examen lo que dice una máquina.',
    practica: 'Verificar cada dato con al menos una fuente primaria y citar a todos los autores, también a los no académicos.',
    etno: {
      enfoque:
        'Diálogo de saberes: los conocimientos ancestrales, la tradición oral y la memoria de sabedoras y sabedores son fuentes legítimas. Se investiga con las comunidades y no sobre ellas (Investigación Acción Participativa), y los resultados se devuelven al territorio.',
      principio: 'Participación comunitaria',
      actividad:
        'Elaborar un estado del arte que combine fuentes académicas con relatos orales de la comunidad, citando a las personas sabedoras con su autorización.',
    },
  },
  5: {
    valores: ['excelencia', 'servicio'],
    reflexion:
      'Crear recursos educativos es una vocación de servicio: el material debe ser cuidado, accesible y pensado para que otros crezcan.',
    practica: 'Probar cada recurso con al menos una persona del público al que va dirigido antes de publicarlo.',
    etno: {
      enfoque:
        'Materiales etnoeducativos pertinentes: recursos que nacen de los Proyectos Educativos Comunitarios (PEC), apoyan la Cátedra de Estudios Afrocolombianos e incluyen la historia, la música, la gastronomía y los oficios de los pueblos, con imágenes que los representen con respeto.',
      principio: 'Integralidad',
      actividad:
        'Diseñar con IA una secuencia didáctica de la Cátedra de Estudios Afrocolombianos (o de la historia de un pueblo indígena) con objetivos según la taxonomía de Bloom y validarla con un docente etnoeducador.',
    },
  },
  6: {
    valores: ['justicia', 'mayordomia'],
    reflexion:
      'Automatizar debe liberar tiempo para lo humano, no excluir a quienes tienen menos acceso. La eficiencia se pone al servicio de la equidad.',
    practica: 'Diseñar cada flujo con una alternativa para quien no tiene internet, correo o celular inteligente.',
    etno: {
      enfoque:
        'Automatización para territorios con baja conectividad: flujos que funcionen por SMS, radio comunitaria o WhatsApp, pensados para consejos comunitarios, cabildos y organizaciones de base, sin depender de servicios costosos.',
      principio: 'Flexibilidad',
      actividad:
        'Modelar un flujo que avise a las familias de una comunidad rural sobre una jornada educativa, con aprobación humana y canal alterno sin internet.',
    },
  },
  7: {
    valores: ['comunidad', 'servicio'],
    reflexion:
      'Las mejores herramientas se construyen en comunidad: escuchar a los usuarios, reconocer sus dones y diseñar con ellos.',
    practica: 'Incluir a por lo menos un usuario real en el diseño y la prueba de la herramienta.',
    etno: {
      enfoque:
        'Co-diseño con las comunidades: aplicaciones no-code que respondan a necesidades definidas por la propia comunidad (inventario de saberes, calendario propio, directorio de emprendimientos étnicos), con interfaces en su lengua cuando sea posible.',
      principio: 'Participación comunitaria',
      actividad:
        'Prototipar una micro-herramienta para un emprendimiento o una organización étnica de tu región, a partir de una entrevista con sus integrantes.',
    },
  },
  8: {
    valores: ['mayordomia', 'excelencia'],
    reflexion:
      'El tiempo es un don que se administra. La productividad sana incluye el descanso, la familia y la vida espiritual (Eclesiastés 3:1).',
    practica: 'Reservar en la agenda tiempos protegidos de descanso y de encuentro que ningún asistente puede ocupar.',
    etno: {
      enfoque:
        'Ritmos y formas propias de organizar el trabajo: reconocer los calendarios agrícolas, festivos y rituales de las comunidades y las prácticas de trabajo colectivo como la minga o la mano cambiada.',
      principio: 'Solidaridad',
      actividad:
        'Configurar un asistente de agenda que respete el calendario propio de una comunidad (fiestas, siembra, cosecha) al programar reuniones con ella.',
    },
  },
  9: {
    valores: ['sabiduria', 'justicia'],
    reflexion:
      'Delegar en agentes exige discernimiento: un agente puede ejecutar, pero la responsabilidad moral de sus decisiones sigue siendo humana.',
    practica: 'Definir qué decisiones nunca toma un agente sin aprobación humana y dejarlo escrito.',
    etno: {
      enfoque:
        'Criterios interculturales en las decisiones automatizadas: evaluar si un agente perjudica a grupos étnicos (sesgos en datos, idioma, ubicación) y respetar la consulta previa cuando un proyecto afecta a una comunidad.',
      principio: 'Interculturalidad',
      actividad:
        'Agregar a la matriz multicriterio de un agente un criterio de impacto en comunidades étnicas y una regla que exija revisión humana cuando ese impacto sea alto.',
    },
  },
  10: {
    valores: ['servicio', 'comunidad', 'excelencia'],
    reflexion:
      'El proyecto final es una ofrenda de servicio: integrar lo aprendido para resolver un problema real de personas reales, con excelencia y con esperanza.',
    practica: 'Presentar el proyecto con un apartado de impacto humano y ético, además del técnico.',
    etno: {
      enfoque:
        'Proyecto con pertinencia étnica y territorial: se recomienda resolver una necesidad de una comunidad étnica o de un territorio diverso, con validación comunitaria y devolución de resultados.',
      principio: 'Progresividad',
      actividad:
        'Incluir en el proyecto final una sección de pertinencia etnoeducativa: comunidad beneficiaria, cómo participó, qué principio del Decreto 804 se aplica y cómo se devuelven los resultados.',
    },
  },
};

export const valorPorId = (id: string): ValorCristiano | undefined => VALORES_CRISTIANOS.find((v) => v.id === id);

/** Texto breve para incluir en las instrucciones del Tutor y del evaluador. */
export function contextoEjes(moduloId: number): string {
  const eje = EJES_POR_MODULO[moduloId];
  if (!eje) return '';
  const valores = eje.valores
    .map((id) => valorPorId(id))
    .filter(Boolean)
    .map((v) => `${v!.nombre} (${v!.referencia})`)
    .join(', ');
  return `Ejes transversales del módulo: valores cristianos — ${valores}: ${eje.reflexion} Enfoque etnoeducativo (principio de ${eje.etno.principio}): ${eje.etno.enfoque}`;
}
