/** Instituciones de la plataforma (las usan el navegador y el servidor). */
import type { TenantOrg } from '../types';

export const INSTITUCIONES: TenantOrg[] = [
  {
    id: 'org-cpiensa-central',
    name: 'Corporación CPIENSA+ Sede Central',
    slug: 'cpiensa-central',
    country: 'Colombia',
    studentCount: 1420,
    activePlan: 'Institución Enterprise',
    logoPlaceholder: 'CPI+',
  },
  {
    id: 'org-upb-aliada',
    name: 'Universidad Aliada de Innovación',
    slug: 'universidad-aliada',
    country: 'Colombia',
    studentCount: 860,
    activePlan: 'Universidad Campus',
    logoPlaceholder: 'UAI',
  },
  {
    id: 'org-techcorp-latam',
    name: 'TechCorp Latam Solutions',
    slug: 'techcorp-latam',
    country: 'Regional',
    studentCount: 310,
    activePlan: 'Corporativo Pro',
    logoPlaceholder: 'TCL',
  },
];

export const institucionPorId = (id: string) => INSTITUCIONES.find((i) => i.id === id);
