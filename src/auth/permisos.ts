/**
 * Control de acceso basado en roles (RBAC) de CPIENSA+ ACADEMY IA.
 *
 * Este archivo lo usan el navegador (qué se muestra) y el servidor (qué se
 * permite). El servidor es quien decide: cada operación protegida vuelve a
 * comprobar el rol de la sesión con estas mismas tablas.
 */
import type { UserRole } from '../types';

export type Seccion =
  | 'inicio'
  | 'campus'
  | 'aihub'
  | 'promptlab'
  | 'agentstudio'
  | 'automation'
  | 'knowledge'
  | 'nocode'
  | 'analytics'
  | 'marketplace'
  | 'integrations'
  | 'solicitudes'
  | 'admin';

const ESTUDIANTE: Seccion[] = ['inicio', 'campus', 'aihub', 'promptlab', 'agentstudio', 'knowledge', 'nocode', 'marketplace'];
const INSTRUCTOR: Seccion[] = [...ESTUDIANTE, 'automation', 'analytics'];
const ADMINISTRACION: Seccion[] = [...INSTRUCTOR, 'integrations', 'solicitudes', 'admin'];

export const SECCIONES_POR_ROL: Record<UserRole, Seccion[]> = {
  Invitado: ['inicio', 'campus'],
  Estudiante: ESTUDIANTE,
  'Profesor/Tutor': INSTRUCTOR,
  Coordinador: ['inicio', 'campus', 'knowledge', 'analytics', 'marketplace'],
  CreadorIA: ['inicio', 'campus', 'aihub', 'promptlab', 'agentstudio', 'knowledge', 'nocode', 'automation', 'marketplace'],
  Auditor: ['inicio', 'analytics', 'solicitudes'],
  OrgAdmin: ADMINISTRACION,
  SuperAdmin: ADMINISTRACION,
};

/** Orden de presentación de los roles (de menor a mayor alcance). */
export const ORDEN_ROLES: UserRole[] = [
  'Invitado',
  'Estudiante',
  'Profesor/Tutor',
  'Coordinador',
  'CreadorIA',
  'Auditor',
  'OrgAdmin',
  'SuperAdmin',
];

export const NOMBRE_ROL: Record<UserRole, string> = {
  Invitado: 'Invitado autorizado',
  Estudiante: 'Estudiante',
  'Profesor/Tutor': 'Instructor / Evaluador',
  Coordinador: 'Coordinador',
  CreadorIA: 'Creador IA',
  Auditor: 'Auditor',
  OrgAdmin: 'Administrador Institucional',
  SuperAdmin: 'SuperAdmin CPIENSA+',
};

export const DESCRIPCION_ROL: Record<UserRole, string> = {
  Invitado: 'Consulta los contenidos expresamente habilitados.',
  Estudiante: 'Aula, cursos, progreso, proyectos y constancias.',
  'Profesor/Tutor': 'Cursos asignados, evidencias, retroalimentación y analítica de sus grupos.',
  Coordinador: 'Seguimiento académico, cohortes e indicadores.',
  CreadorIA: 'Laboratorios de IA, agentes, automatizaciones y recursos autorizados.',
  Auditor: 'Consulta de registros y solicitudes en modo de solo lectura.',
  OrgAdmin: 'Gestión de usuarios, solicitudes y conectores de su institución.',
  SuperAdmin: 'Configuración general y gestión de todas las instituciones.',
};

/** Roles que una persona puede pedir al solicitar acceso (el administrador decide el definitivo). */
export const ROLES_SOLICITABLES: UserRole[] = ['Estudiante', 'Profesor/Tutor', 'Coordinador', 'CreadorIA', 'Invitado'];

/** Roles con funciones administrativas: exigen un código adicional al ingresar. */
export const ROLES_ADMINISTRATIVOS: UserRole[] = ['OrgAdmin', 'SuperAdmin', 'Auditor'];

/** Quién puede decidir solicitudes y gestionar cuentas. */
export const ROLES_GESTORES: UserRole[] = ['OrgAdmin', 'SuperAdmin'];

export const esRol = (valor: unknown): valor is UserRole =>
  typeof valor === 'string' && (ORDEN_ROLES as string[]).includes(valor);

export function puedeAcceder(rol: UserRole, seccion: string): boolean {
  return SECCIONES_POR_ROL[rol]?.includes(seccion as Seccion) ?? false;
}

/** Roles que tienen acceso a una sección (para explicar por qué está bloqueada). */
export function rolesConAcceso(seccion: string): UserRole[] {
  return ORDEN_ROLES.filter((r) => puedeAcceder(r, seccion));
}

/** @deprecated Usa rolesConAcceso. Se conserva por compatibilidad. */
export function rolMinimo(seccion: string): UserRole {
  return rolesConAcceso(seccion)[0] ?? 'SuperAdmin';
}

/** Solo el SuperAdmin cambia de institución y gestiona el multi-tenant. */
export const puedeCambiarInstitucion = (rol: UserRole) => rol === 'SuperAdmin';

/** Roles que un gestor puede asignar al aprobar (el OrgAdmin no crea SuperAdmin). */
export function rolesAsignables(gestor: UserRole): UserRole[] {
  if (gestor === 'SuperAdmin') return ORDEN_ROLES;
  if (gestor === 'OrgAdmin') return ORDEN_ROLES.filter((r) => r !== 'SuperAdmin');
  return [];
}

/**
 * Servicios de la plataforma: actúan con permisos propios, sin cuenta humana,
 * correo ni contraseña, y siempre en nombre de un usuario con sesión válida.
 */
export const SERVICIOS = [
  {
    id: 'servicio:tutor-ia',
    nombre: 'Tutor IA',
    permisos: ['ai:generar', 'conocimiento:consultar'],
    supervision: 'Sus solicitudes se registran en la auditoría con el usuario que las originó.',
  },
] as const;
