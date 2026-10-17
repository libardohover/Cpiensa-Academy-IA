import React, { useMemo } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  Cpu,
  Terminal,
  Bot,
  Workflow,
  Library,
  Layout,
  BarChart3,
  ShoppingBag,
  Layers,
  ShieldCheck,
  Cross,
  Users,
  Target,
  Globe,
  MessageSquare,
  Search,
  CheckSquare,
} from 'lucide-react';
import type { CourseModule, Lesson, TenantOrg, UserProfile, UserRole } from '../../types';
import { NOMBRE_ROL, puedeAcceder } from '../../auth/permisos';
import { VALORES_CRISTIANOS, PRINCIPIOS_ETNOEDUCACION } from '../../data/ejesTransversales';
import simboloCpiensa from '../../assets/images/cpiensa-simbolo.png';

interface InicioViewProps {
  user: UserProfile;
  rol: UserRole;
  organizacion: TenantOrg;
  modulos: CourseModule[];
  leccionesCompletadas: string[];
  onIrASeccion: (seccion: string) => void;
  onAbrirLeccion: (leccionId: string) => void;
  onAbrirTutor: () => void;
  onAbrirCertificado: () => void;
}

/** Meta semanal de estudio, en minutos. */
const META_SEMANAL_MIN = 4 * 60;
const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const ICONO_MODULO: Record<string, React.ElementType> = {
  Cpu, Terminal, MessageSquare, Search, Sparkles, Workflow, Layout, CheckSquare, Bot, ShieldCheck,
};

const ETIQUETA_MODULO: Record<number, string> = {
  1: 'Fundamentos',
  2: 'Habilidades IA',
  3: 'Comunicación',
  4: 'Investigación',
  5: 'Contenidos',
  6: 'Automatización',
  7: 'No-Code',
  8: 'Productividad',
  9: 'Agentes',
  10: 'Proyecto final',
};

function formatoDuracion(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`;
}

/** Actividades de muestra: se calculan a partir de hoy para que siempre sean próximas. */
function proximosEventos(hoy: Date) {
  const base = [
    { dias: 6, titulo: 'De un prompt a una solución', detalle: 'Encuentro de práctica · 4:00 p. m.' },
    { dias: 13, titulo: 'IA y saberes de nuestros pueblos', detalle: 'Conversatorio etnoeducativo · 3:00 p. m.' },
    { dias: 20, titulo: 'Ética cristiana y tecnología', detalle: 'Taller de valores · 5:00 p. m.' },
  ];
  return base.map((e) => {
    const f = new Date(hoy);
    f.setDate(f.getDate() + e.dias);
    return {
      ...e,
      mes: f.toLocaleDateString('es-CO', { month: 'short' }).replace('.', ''),
      dia: f.getDate(),
    };
  });
}

const ACCESOS: { id: string; titulo: string; texto: string; icono: React.ElementType }[] = [
  { id: 'campus', titulo: 'Campus LMS', texto: 'Diplomado de 10 módulos', icono: BookOpen },
  { id: 'aihub', titulo: 'AI Hub', texto: 'Prueba modelos de IA', icono: Cpu },
  { id: 'promptlab', titulo: 'Prompt Lab', texto: 'Diseña y evalúa prompts', icono: Terminal },
  { id: 'agentstudio', titulo: 'Agent Studio', texto: 'Crea agentes con herramientas', icono: Bot },
  { id: 'knowledge', titulo: 'Knowledge Hub', texto: 'Consulta con citas', icono: Library },
  { id: 'nocode', titulo: 'No-Code Builder', texto: 'Micro-herramientas', icono: Layout },
  { id: 'automation', titulo: 'Automatizaciones', texto: 'Flujos con aprobación', icono: Workflow },
  { id: 'analytics', titulo: 'Analítica', texto: 'Indicadores de tus grupos', icono: BarChart3 },
  { id: 'marketplace', titulo: 'Marketplace', texto: 'Recursos certificados', icono: ShoppingBag },
  { id: 'integrations', titulo: 'Conectores', texto: 'Google, Microsoft, WhatsApp', icono: Layers },
  { id: 'admin', titulo: 'Administración', texto: 'Usuarios y roles', icono: ShieldCheck },
];

function semanaDelAnio(fecha: Date): number {
  const inicio = new Date(fecha.getFullYear(), 0, 1);
  return Math.floor((fecha.getTime() - inicio.getTime()) / (7 * 24 * 3600 * 1000));
}

function saludo(hora: number): string {
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export const InicioView: React.FC<InicioViewProps> = ({
  user,
  rol,
  organizacion,
  modulos,
  leccionesCompletadas,
  onIrASeccion,
  onAbrirLeccion,
  onAbrirTutor,
  onAbrirCertificado,
}) => {
  const hoy = new Date();
  const nombre = user.name.split(' ')[0];

  const datos = useMemo(() => {
    const todas: Lesson[] = modulos.flatMap((m) => m.lessons);
    const hechas = todas.filter((l) => leccionesCompletadas.includes(l.id));
    const minutos = hechas.reduce((s, l) => s + l.durationMinutes, 0);
    const enCurso = modulos.filter((m) => {
      const n = m.lessons.filter((l) => leccionesCompletadas.includes(l.id)).length;
      return n > 0 && n < m.lessons.length;
    });
    // Siguientes lecciones: primero las de módulos ya iniciados, luego en orden.
    const pendientesIniciados = enCurso.flatMap((m) => m.lessons.filter((l) => !leccionesCompletadas.includes(l.id)));
    const pendientes = todas.filter((l) => !leccionesCompletadas.includes(l.id));
    const siguientes = [...new Set([...pendientesIniciados, ...pendientes])].slice(0, 3);
    return { total: todas.length, hechas: hechas.length, minutos, enCurso: enCurso.length, siguientes };
  }, [modulos, leccionesCompletadas]);

  const porcentaje = Math.round((datos.hechas / Math.max(1, datos.total)) * 100);
  // Demostración: el tiempo de esta semana es el acumulado, hasta la meta.
  const minutosSemana = Math.min(datos.minutos, META_SEMANAL_MIN);
  const avanceMeta = minutosSemana / META_SEMANAL_MIN;
  const diaHoy = (hoy.getDay() + 6) % 7; // lunes = 0
  const valor = VALORES_CRISTIANOS[semanaDelAnio(hoy) % VALORES_CRISTIANOS.length];
  const principio = PRINCIPIOS_ETNOEDUCACION[semanaDelAnio(hoy) % PRINCIPIOS_ETNOEDUCACION.length];
  const siguiente = datos.siguientes[0];
  const moduloDe = (l: Lesson) => modulos.find((m) => m.id === l.moduleId);
  const accesos = ACCESOS.filter((a) => puedeAcceder(rol, a.id));
  const eventos = proximosEventos(hoy);
  // Módulos para seguir: primero los iniciados; si no hay, el siguiente sin empezar.
  const pendientesDe = (m: CourseModule) => m.lessons.filter((l) => !leccionesCompletadas.includes(l.id)).length;
  const iniciados = modulos.filter((m) => pendientesDe(m) > 0 && pendientesDe(m) < m.lessons.length);
  const sinEmpezar = modulos.filter((m) => pendientesDe(m) === m.lessons.length);
  const modulosParaSeguir = [...iniciados, ...sinEmpezar].slice(0, 3);

  const radio = 52;
  const circ = 2 * Math.PI * radio;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        {/* Saludo */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              {hoy.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              {saludo(hoy.getHours())}, {nombre}
            </h1>
            <p className="text-sm text-slate-600 mt-1">Cada lección te acerca a tu próxima gran idea.</p>
          </div>
          <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700">
            {NOMBRE_ROL[rol]} · {organizacion.name}
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Mensaje principal */}
          <section className="xl:col-span-2 relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 sm:p-8">
            <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-blue-500/25" aria-hidden="true" />
            <div className="absolute right-10 -bottom-24 w-56 h-56 rounded-full bg-blue-500/15" aria-hidden="true" />
            <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">
                  Tu talento + inteligencia artificial
                </p>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">
                  Aprende con propósito,
                  <br />
                  <span className="text-blue-400">crea con IA.</span>
                </h2>
                <p className="mt-3 text-sm text-slate-300 max-w-lg">
                  Desarrolla habilidades para crear soluciones reales, con valores cristianos y respeto por la
                  diversidad de nuestros pueblos.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {siguiente ? (
                    <button
                      onClick={() => onAbrirLeccion(siguiente.id)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold shadow-sm transition-colors"
                    >
                      Retomar mi aprendizaje
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={onAbrirCertificado}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold"
                    >
                      Ver mi certificado
                      <Award className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={onAbrirTutor}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-semibold transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Preguntar al tutor
                  </button>
                </div>
              </div>
              <div className="hidden md:flex w-40 h-40 rounded-3xl bg-white items-center justify-center shadow-xl rotate-3">
                <img src={simboloCpiensa} alt="" className="w-28 h-auto -rotate-3" />
              </div>
            </div>
          </section>

          {/* Meta semanal */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6" aria-label="Meta semanal">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Tu meta semanal</h2>
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex justify-center my-4">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r={radio} fill="none" className="stroke-slate-100" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r={radio}
                    fill="none"
                    className="stroke-blue-500 transition-all duration-500"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={circ * (1 - avanceMeta)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                    {(minutosSemana / 60).toLocaleString('es-CO', { maximumFractionDigits: 1 })}
                    <span className="text-sm font-semibold text-slate-400"> / 4 h</span>
                  </span>
                  <span className="text-[11px] text-slate-500">{Math.round(avanceMeta * 100)}% de la meta</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {DIAS.map((d, i) => {
                const hecho = i < diaHoy && i < Math.ceil(avanceMeta * 7);
                const esHoy = i === diaHoy;
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        esHoy
                          ? 'bg-blue-500 text-white'
                          : hecho
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-50 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {hecho ? <CheckCircle2 className="w-4 h-4" /> : d}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
              Aprender también es un hábito. Reserva hoy un momento para tu siguiente lección.
            </p>
          </section>
        </div>

        {/* Indicadores */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { titulo: 'Módulos en curso', valor: String(datos.enCurso), extra: 'de 10', nota: 'Tu ruta sigue creciendo', icono: BookOpen },
            { titulo: 'Lecciones completadas', valor: String(datos.hechas), extra: `/ ${datos.total}`, nota: `${porcentaje}% del diplomado`, icono: CheckCircle2 },
            {
              titulo: 'Tiempo de aprendizaje',
              valor: (datos.minutos / 60).toLocaleString('es-CO', { maximumFractionDigits: 1 }),
              extra: 'h',
              nota: 'Según la duración de cada lección',
              icono: Clock,
            },
            { titulo: 'Constancia', valor: `${porcentaje}%`, extra: '', nota: porcentaje === 100 ? 'Listo para descargar' : 'Avance hacia tu constancia', icono: Award },
          ].map((k) => {
            const Icono = k.icono;
            return (
              <div key={k.titulo} className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500">{k.titulo}</span>
                  <Icono className="w-4 h-4 text-blue-600 shrink-0" />
                </div>
                <p className="mt-3 text-3xl font-extrabold text-slate-900 tabular-nums">
                  {k.valor}
                  {k.extra && <span className="text-sm font-semibold text-slate-400"> {k.extra}</span>}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">{k.nota}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {/* Continúa donde lo dejaste */}
            <section>
              <div className="flex items-end justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Continúa donde lo dejaste</h2>
                  <p className="text-xs text-slate-500">Tu próxima idea te está esperando.</p>
                </div>
                <button
                  onClick={() => onIrASeccion('campus')}
                  className="text-sm font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  Ver mi aula <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {modulosParaSeguir.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-600">
                  ¡Completaste todas las lecciones del diplomado! Ya puedes ver tu certificado.
                </div>
              ) : (
                <div className="space-y-3">
                  {modulosParaSeguir.map((m) => {
                    const hechas = m.lessons.filter((x) => leccionesCompletadas.includes(x.id)).length;
                    const pct = Math.round((hechas / m.lessons.length) * 100);
                    const minutos = m.lessons.reduce((s, l) => s + l.durationMinutes, 0);
                    const proxima = m.lessons.find((l) => !leccionesCompletadas.includes(l.id))!;
                    const Icono = ICONO_MODULO[m.iconName] ?? BookOpen;
                    return (
                      <article
                        key={m.id}
                        className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                      >
                        <div className="relative hidden sm:flex w-24 h-20 rounded-xl bg-blue-50 border border-blue-100 items-center justify-center shrink-0 overflow-hidden">
                          <span className="absolute -right-5 -bottom-6 w-16 h-16 rounded-full border border-blue-200" aria-hidden="true" />
                          <Icono className="w-7 h-7 text-blue-600 relative" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {ETIQUETA_MODULO[m.id] ?? 'Diplomado'}
                          </span>
                          <h3 className="mt-1.5 text-base font-bold text-slate-900 truncate">
                            {m.title.replace(/^\d+\.\s*/, '')}
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Módulo {String(m.id).padStart(2, '0')} · {m.lessons.length} lecciones · {formatoDuracion(minutos)}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex-1 max-w-xs h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[11px] text-slate-500 tabular-nums">{pct}%</span>
                          </div>
                          <p className="mt-1.5 text-[11px] text-slate-500 truncate">Sigue: {proxima.title}</p>
                        </div>
                        <button
                          onClick={() => onAbrirLeccion(proxima.id)}
                          className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-sm font-semibold text-slate-800 transition-colors"
                        >
                          {hechas === 0 ? 'Empezar' : 'Continuar'} <ArrowRight className="w-4 h-4" />
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* AI Hub */}
            <div className="border border-dashed border-slate-300 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 bg-white/60">
              <Globe className="w-7 h-7 text-blue-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Una academia. Múltiples posibilidades.</p>
                <p className="text-xs text-slate-500">Aprende y compara modelos de IA desde un mismo lugar.</p>
              </div>
              <button
                onClick={() => onIrASeccion('aihub')}
                className="self-start sm:self-auto text-sm font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
              >
                Conoce el AI Hub <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Impacto */}
            <section>
              <h2 className="text-lg font-bold text-slate-900">Hecho para crear impacto</h2>
              <p className="text-xs text-slate-500 mb-3">Tu aprendizaje se convierte en un producto práctico.</p>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <Layers className="w-6 h-6 text-slate-700 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">10 módulos · 10 productos para tu portafolio</p>
                  <p className="text-xs text-slate-500">
                    Del primer prompt a tu propio ecosistema de IA, con valores y pertinencia para tu territorio.
                  </p>
                </div>
                <button
                  onClick={() => onIrASeccion('campus')}
                  className="self-start sm:self-auto text-sm font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  Explorar <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            {/* Tutor */}
            <section className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5">
              <span className="w-10 h-10 rounded-xl bg-white border border-emerald-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-700" />
              </span>
              <h2 className="mt-3 text-base font-bold text-slate-900">Tu curiosidad tiene compañía</h2>
              <p className="mt-1 text-xs text-slate-600">Pregunta, practica y descubre otra forma de aprender con tu tutor IA.</p>
              <button
                onClick={onAbrirTutor}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 text-sm font-semibold text-slate-800 transition-colors"
              >
                Conversar con mi tutor <Sparkles className="w-4 h-4 text-blue-500" />
              </button>
            </section>

            {/* En tu horizonte */}
            <section className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">En tu horizonte</h2>
                <span className="text-[10px] font-bold tracking-wider px-2 py-1 rounded-md bg-slate-100 text-slate-500">DEMO</span>
              </div>
              <ul className="mt-4 space-y-4">
                {eventos.map((e) => (
                  <li key={e.titulo} className="flex items-center gap-3">
                    <div className="w-12 shrink-0 rounded-lg border border-slate-200 text-center py-1">
                      <div className="text-[10px] font-semibold uppercase text-blue-600">{e.mes}</div>
                      <div className="text-lg font-extrabold text-slate-900 leading-none tabular-nums">{e.dia}</div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{e.titulo}</p>
                      <p className="text-[11px] text-slate-500">{e.detalle}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Ejes de la semana */}
            <section className="bg-white border border-slate-200 border-l-4 border-l-blue-500 rounded-2xl p-5" aria-label="Valor de la semana">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-blue-700">
                <Cross className="w-4 h-4" /> Valor de la semana
              </div>
              <h3 className="mt-2 text-base font-bold text-slate-900">{valor.nombre}</h3>
              <p className="text-xs font-mono text-blue-700">{valor.referencia}</p>
              <p className="mt-2 text-sm text-slate-700 italic">{valor.fundamento}</p>
              <p className="mt-2 text-xs text-slate-600">
                <strong>En la IA: </strong>
                {valor.enIA}
              </p>
            </section>
            <section className="bg-white border border-slate-200 border-l-4 border-l-emerald-500 rounded-2xl p-5" aria-label="Principio etnoeducativo">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                <Users className="w-4 h-4" /> Principio etnoeducativo
              </div>
              <h3 className="mt-2 text-base font-bold text-slate-900">{principio.nombre}</h3>
              <p className="mt-1 text-sm text-slate-700">{principio.descripcion}</p>
              <p className="mt-2 text-[11px] text-slate-500">Decreto 804 de 1995</p>
            </section>
          </aside>
        </div>
        {/* Accesos rápidos según el rol */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">Crea y conecta</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-3">
            {accesos.map((a) => {
              const Icono = a.icono;
              return (
                <button
                  key={a.id}
                  onClick={() => onIrASeccion(a.id)}
                  className="text-left bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 rounded-xl p-4 transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Icono className="w-4.5 h-4.5 text-blue-600" />
                  </span>
                  <span className="block mt-3 text-sm font-bold text-slate-900">{a.titulo}</span>
                  <span className="block text-[11px] text-slate-500">{a.texto}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
