/**
 * Control de acceso basado en roles (RBAC) de CPIENSA+ ACADEMY IA.
 * Para cambiar qué ve cada rol, edita SECCIONES_POR_ROL.
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
  | 'admin';

const BASICAS: Seccion[] = ['inicio', 'campus', 'aihub', 'promptlab', 'agentstudio', 'knowledge', 'nocode', 'marketplace'];
const DOCENTE: Seccion[] = [...BASICAS, 'automation', 'analytics'];
const ADMINISTRACION: Seccion[] = [...DOCENTE, 'integrations', 'admin'];

export const SECCIONES_POR_ROL: Record<UserRole, Seccion[]> = {
  Estudiante: BASICAS,
  'Profesor/Tutor': DOCENTE,
  OrgAdmin: ADMINISTRACION,
  SuperAdmin: ADMINISTRACION,
};

export const ORDEN_ROLES: UserRole[] = ['Estudiante', 'Profesor/Tutor', 'OrgAdmin', 'SuperAdmin'];

export const NOMBRE_ROL: Record<UserRole, string> = {
  Estudiante: 'Estudiante',
  'Profesor/Tutor': 'Profesor / Tutor',
  OrgAdmin: 'Administrador Institucional',
  SuperAdmin: 'SuperAdmin CPIENSA+',
};

export const DESCRIPCION_ROL: Record<UserRole, string> = {
  Estudiante: 'Cursa el diplomado y practica con las herramientas de IA.',
  'Profesor/Tutor': 'Además diseña automatizaciones y consulta la analítica de sus grupos.',
  OrgAdmin: 'Además administra usuarios, conectores y cumplimiento de su institución.',
  SuperAdmin: 'Acceso total, incluida la gestión de todas las instituciones.',
};

export function puedeAcceder(rol: UserRole, seccion: string): boolean {
  return SECCIONES_POR_ROL[rol].includes(seccion as Seccion);
}

/** Rol mínimo que habilita una sección (para explicar por qué está bloqueada). */
export function rolMinimo(seccion: string): UserRole {
  return ORDEN_ROLES.find(r => puedeAcceder(r, seccion)) ?? 'SuperAdmin';
}

/** Solo el SuperAdmin cambia de institución y gestiona el multi-tenant. */
export const puedeCambiarInstitucion = (rol: UserRole) => rol === 'SuperAdmin';
