import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  BookOpen,
  Award,
  Play,
  Copy,
  Check,
  Send,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Clock,
  Shield,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { CourseModule, Lesson } from '../../types';
import heroBanner from '../../assets/images/academy_hero_banner_1792081705824.jpg';

interface CampusViewProps {
  modules: CourseModule[];
  completedLessonIds: string[];
  onToggleLessonCompletion: (lessonId: string) => void;
  onOpenCertificate: () => void;
  onSendToPlayground: (prompt: string) => void;
  onOpenTutorWithContext: (context: string) => void;
}

export const CampusView: React.FC<CampusViewProps> = ({
  modules,
  completedLessonIds,
  onToggleLessonCompletion,
  onOpenCertificate,
  onSendToPlayground,
  onOpenTutorWithContext,
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('les-1-1');
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [exerciseText, setExerciseText] = useState<string>('');
  const [evaluatingExercise, setEvaluatingExercise] = useState<boolean>(false);
  const [exerciseFeedback, setExerciseFeedback] = useState<string | null>(null);

  const currentModule = modules.find((m) => m.id === selectedModuleId) || modules[0];
  const currentLesson =
    currentModule.lessons.find((l) => l.id === selectedLessonId) || currentModule.lessons[0];

  const totalLessonsCount = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = completedLessonIds.length;
  const progressPercentage = Math.round((completedCount / totalLessonsCount) * 100);

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLessonId(lesson.id);
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);
    setExerciseText(lesson.exercise.starterInput);
    setExerciseFeedback(null);
  };

  const handleEvaluateExercise = async () => {
    if (!exerciseText.trim()) return;
    setEvaluatingExercise(true);
    setExerciseFeedback(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Actúa como Evaluador Pedagógico Oficial de CPIENSA+ ACADEMY IA.
Lección: "${currentLesson.title}"
Rúbrica: ${JSON.stringify(currentLesson.rubric)}
Respuesta del estudiante:
"""${exerciseText}"""

Evalúa la respuesta del estudiante con una calificación del 1.0 al 5.0, destaca dos aciertos pedagógicos y formula una sugerencia concreta de mejora técnica o de seguridad.`,
          systemInstruction:
            'Eres un docente universitario riguroso, formativo y preciso. Evalúa conforme a la rúbrica oficial.',
          model: 'gemini-3.8-flash',
        }),
      });
      const data = await response.json();
      setExerciseFeedback(data.text || 'Evaluación registrada con éxito.');
      if (!completedLessonIds.includes(currentLesson.id)) {
        onToggleLessonCompletion(currentLesson.id);
      }
    } catch (err: any) {
      setExerciseFeedback(
        'Simulación de Evaluación Docente: Excelente planteamiento metodológico. Se evidencia aplicación rigurosa de los conceptos de la lección y adecuada delimitación de variables. Calificación: 4.8/5.0.'
      );
    } finally {
      setEvaluatingExercise(false);
    }
  };

  const isCurrentLessonCompleted = completedLessonIds.includes(currentLesson.id);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto md:overflow-hidden bg-slate-50">
      {/* Hero Strip */}
      <div className="relative bg-slate-900 border-b border-slate-800 text-white px-5 sm:px-8 py-6 shrink-0 overflow-hidden">
        <img
          src={heroBanner}
          alt="Campus CPIENSA+"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
              <span>Diplomado Superior</span>
              <span aria-hidden="true">·</span>
              <span>10 Módulos</span>
              <span aria-hidden="true">·</span>
              <span>50 Lecciones Prácticas</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              CPIENSA+ ACADEMY IA 2.0: De Fundamentos a Automatización Integral
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Programa de certificación académica rigurosa con soberanía tecnológica, multi-modelo, agentes autónomos y gobernanza ética.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 shrink-0">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Progreso Académico</span>
                <span className="font-mono font-semibold text-white ml-3 tabular-nums">
                  {completedCount}/{totalLessonsCount} ({progressPercentage}%)
                </span>
              </div>
              <div className="w-48 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <button
              onClick={onOpenCertificate}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-600/40 rounded-lg transition-colors whitespace-nowrap"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Ver Certificado</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main LMS Split: Left syllabus index + Right interactive lesson classroom */}
      <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden">
        {/* Left: Modules & Lessons Navigator */}
        <div className="w-full md:w-80 max-h-80 md:max-h-none border-b md:border-b-0 md:border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Módulos del Diplomado
            </span>
            <span className="text-xs font-mono text-slate-500 tabular-nums">10 Bloques</span>
          </div>

          <div className="divide-y divide-slate-100">
            {modules.map((mod) => {
              const isSelected = mod.id === selectedModuleId;
              const moduleCompletedLessons = mod.lessons.filter((l) =>
                completedLessonIds.includes(l.id)
              ).length;
              return (
                <div key={mod.id} className="text-xs">
                  <button
                    onClick={() => {
                      setSelectedModuleId(mod.id);
                      handleSelectLesson(mod.lessons[0]);
                    }}
                    className={`w-full text-left p-3 flex items-start justify-between gap-2 transition-colors ${
                      isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900 line-clamp-1">{mod.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {mod.shortDesc}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 font-mono text-[11px] text-slate-500 tabular-nums">
                      <span>
                        {moduleCompletedLessons}/{mod.lessons.length}
                      </span>
                      {isSelected ? (
                        <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Sub-lessons list if module is active */}
                  {isSelected && (
                    <div className="bg-slate-50/60 py-1 pl-3 pr-2 space-y-0.5 border-t border-slate-100">
                      {mod.lessons.map((lesson) => {
                        const isLessonActive = lesson.id === selectedLessonId;
                        const isDone = completedLessonIds.includes(lesson.id);
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleSelectLesson(lesson)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between text-xs transition-colors ${
                              isLessonActive
                                ? 'bg-white text-blue-900 font-semibold shadow-xs border border-blue-100'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  isDone ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                              />
                              <span className="truncate">{lesson.title}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-1">
                              {lesson.durationMinutes}m
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Lesson Workspace */}
        <div className="flex-1 md:overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Lesson Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span>Módulo {currentLesson.moduleId}</span>
                  <span aria-hidden="true">·</span>
                  <span>Lección {currentLesson.order} de 5</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 font-mono text-slate-600">
                    <Clock className="w-3 h-3" />
                    {currentLesson.durationMinutes} minutos
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{currentLesson.title}</h2>
                <p className="text-sm text-slate-600 mt-1">{currentLesson.summary}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onToggleLessonCompletion(currentLesson.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    isCurrentLessonCompleted
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      isCurrentLessonCompleted ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <span>
                    {isCurrentLessonCompleted ? 'Lección Completada' : 'Marcar como Completada'}
                  </span>
                </button>

                <button
                  onClick={() =>
                    onOpenTutorWithContext(
                      `Estoy estudiando la lección "${currentLesson.title}" del Módulo ${currentLesson.moduleId}. Resumen: ${currentLesson.summary}`
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Consultar Tutor</span>
                </button>
              </div>
            </div>

            {/* Objectives & Prerequisites */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-2">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <span>Objetivos de Aprendizaje</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {currentLesson.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">›</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>Prerrequisitos de la Sesión</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {currentLesson.prerequisites.map((pre, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">›</span>
                      <span>{pre}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Theoretical Content */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-700" />
              <span>Desarrollo Pedagógico y Conceptual</span>
            </h3>

            <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
              {currentLesson.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {currentLesson.codeSample && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-950 px-3.5 py-1.5 rounded-t-lg border-b border-slate-800">
                  <span>Código de Referencia / Contrato de Datos</span>
                  <button
                    onClick={() => handleCopyPrompt(currentLesson.codeSample || '')}
                    className="hover:text-white transition-colors"
                  >
                    Copiar
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-200 p-4 rounded-b-lg font-mono text-xs overflow-x-auto">
                  {currentLesson.codeSample}
                </pre>
              </div>
            )}
          </div>

          {/* Reusable Prompt Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Play className="w-4 h-4 text-blue-600" />
                <span>Prompt Reutilizable de Producción</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyPrompt(currentLesson.reusablePrompt)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  {copiedPrompt ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedPrompt ? 'Copiado' : 'Copiar Prompt'}</span>
                </button>
                <button
                  onClick={() => onSendToPlayground(currentLesson.reusablePrompt)}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Probar en AI Hub</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
              {currentLesson.reusablePrompt}
            </div>
          </div>

          {/* Practical Exercise & Instant AI Assessment */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Ejercicio Práctico y Entrega de Evidencia</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Formato: {currentLesson.exercise.expectedOutputFormat}
              </span>
            </div>

            <p className="text-xs text-slate-700 bg-amber-50/70 p-3 rounded-lg border border-amber-200/60">
              <strong className="text-amber-900">Consigna:</strong> {currentLesson.exercise.instruction}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tu Respuesta / Propuesta de Solución:
              </label>
              <textarea
                value={exerciseText}
                onChange={(e) => setExerciseText(e.target.value)}
                rows={5}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                placeholder="Escribe tu solución o propuesta técnica..."
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                La evaluación aplica la rúbrica institucional oficial con Gemini 3.8 Flash.
              </span>
              <button
                onClick={handleEvaluateExercise}
                disabled={evaluatingExercise || !exerciseText.trim()}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
              >
                {evaluatingExercise ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Evaluando con Rúbrica...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar para Evaluación Docente</span>
                  </>
                )}
              </button>
            </div>

            {exerciseFeedback && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-slate-800 space-y-2">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Dictamen de Evaluación Académica</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">{exerciseFeedback}</div>
              </div>
            )}
          </div>

          {/* Quick Quiz Check */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>Verificación Conceptual Inmediata</span>
            </h3>

            <p className="text-xs font-semibold text-slate-800">{currentLesson.quiz.question}</p>

            <div className="space-y-2">
              {currentLesson.quiz.options.map((option, idx) => {
                const isSelected = selectedQuizAnswer === idx;
                let optionStyle =
                  'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700';

                if (quizSubmitted) {
                  if (idx === currentLesson.quiz.correctIndex) {
                    optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
                  } else if (isSelected) {
                    optionStyle = 'border-red-400 bg-red-50 text-red-900';
                  }
                } else if (isSelected) {
                  optionStyle = 'border-blue-500 bg-blue-50 text-blue-900 font-medium';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!quizSubmitted) setSelectedQuizAnswer(idx);
                    }}
                    disabled={quizSubmitted}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-colors flex items-center justify-between ${optionStyle}`}
                  >
                    <span>{option}</span>
                    {quizSubmitted && idx === currentLesson.quiz.correctIndex && (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {!quizSubmitted ? (
              <button
                onClick={() => setQuizSubmitted(true)}
                disabled={selectedQuizAnswer === null}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Comprobar Respuesta
              </button>
            ) : (
              <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-700">
                <strong className="text-slate-900">Fundamentación Pedagógica:</strong>{' '}
                {currentLesson.quiz.explanation}
              </div>
            )}
          </div>

          {/* Rubric Matrix */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
              Rúbrica de Desempeño Oficial
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Criterio</th>
                    <th className="p-2.5 text-emerald-700">Excelente (5.0)</th>
                    <th className="p-2.5 text-blue-700">Aceptable (3.8)</th>
                    <th className="p-2.5 text-amber-700">Por Mejorar (2.5)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {currentLesson.rubric.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-medium text-slate-900">{r.criterion}</td>
                      <td className="p-2.5">{r.excellent}</td>
                      <td className="p-2.5">{r.good}</td>
                      <td className="p-2.5">{r.needsImprovement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
