import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  Key,
  FileCheck,
  Lock,
  Plus,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { TenantOrg, UserRole } from '../../types';

interface AdminViewProps {
  /** Rol activo: el OrgAdmin no gestiona otras instituciones ni asigna SuperAdmin. */
  rolActual: UserRole;
  organizations: TenantOrg[];
  currentOrg: TenantOrg;
  onSelectOrg: (org: TenantOrg) => void;
  onAddOrg: (org: TenantOrg) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  rolActual,
  organizations,
  currentOrg,
  onSelectOrg,
  onAddOrg,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'organizations' | 'compliance' | 'plans'>(
    'users'
  );
  const esSuperAdmin = rolActual === 'SuperAdmin';
  // Si se baja de SuperAdmin estando en la pestaña de instituciones, volver a Usuarios
  useEffect(() => {
    if (!esSuperAdmin && activeTab === 'organizations') setActiveTab('users');
  }, [esSuperAdmin, activeTab]);

  // Mock users list in the active org
  const [usersList, setUsersList] = useState([
    {
      id: 'usr-1',
      name: 'Ana María Restrepo',
      email: 'ana.restrepo@cpiensa.edu.co',
      role: 'Estudiante',
      mfa: true,
      lastLogin: '2026-10-15 08:30',
      status: 'Activo',
    },
    {
      id: 'usr-2',
      name: 'Dr. Alejandro Posada',
      email: 'a.posada@cpiensa.edu.co',
      role: 'Profesor/Tutor',
      mfa: true,
      lastLogin: '2026-10-15 09:10',
      status: 'Activo',
    },
    {
      id: 'usr-3',
      name: 'Claudia Gómez',
      email: 'admin.sede@cpiensa.edu.co',
      role: 'OrgAdmin',
      mfa: true,
      lastLogin: '2026-10-14 17:40',
      status: 'Activo',
    },
    {
      id: 'usr-4',
      name: 'Soporte CPIENSA+ Master',
      email: 'security@cpiensa.com',
      role: 'SuperAdmin',
      mfa: true,
      lastLogin: '2026-10-15 09:25',
      status: 'Activo',
    },
  ]);

  // Audit Logs
  const auditLogs = [
    {
      timestamp: '2026-10-15 09:25:12',
      event: 'CERTIFICATE_VERIFIED',
      actor: 'security@cpiensa.com',
      details: 'Consulta pública exitosa de certificado CPI-2026-9481.',
      status: 'success',
    },
    {
      timestamp: '2026-10-15 08:42:10',
      event: 'WORKFLOW_AUTO_DISPATCH',
      actor: 'Engine-n8n-System',
      details: 'Envío de correo transaccional vía conector Gmail autorizado.',
      status: 'success',
    },
    {
      timestamp: '2026-10-15 07:15:00',
      event: 'MFA_CHALLENGE_SUCCESS',
      actor: 'ana.restrepo@cpiensa.edu.co',
      details: 'Autenticación con doble factor TOTP exitosa.',
      status: 'success',
    },
    {
      timestamp: '2026-10-14 22:30:11',
      event: 'ROLE_ELEVATION_CHECK',
      actor: 'admin.sede@cpiensa.edu.co',
      details: 'Verificación de privilegios de tutor completada sin anomalías.',
      status: 'success',
    },
  ];

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>Subsistema I</span>
            <span aria-hidden="true">·</span>
            <span>Gobernanza Institucional & Superadministración</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Administración Central: Multi-Tenant, RBAC y Auditoría Ley 1581
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aislamiento de organizaciones, gestión de permisos granulares, trazabilidad inmutable y planes comerciales.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Usuarios & Roles
          </button>
          {esSuperAdmin && (
          <button
            onClick={() => setActiveTab('organizations')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'organizations'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Instituciones Multi-Tenant
          </button>
          )}
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'compliance'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Auditoría & Privacidad
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        {activeTab === 'users' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Directorio de Usuarios de {currentOrg.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Control de Acceso Basado en Roles (RBAC): SuperAdmin, OrgAdmin, Profesor/Tutor, Estudiante.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {usersList.length} cuentas registradas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Nombre & Correo</th>
                    <th className="p-3">Rol Asignado</th>
                    <th className="p-3">Seguridad MFA</th>
                    <th className="p-3">Último Acceso</th>
                    <th className="p-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </td>
                      <td className="p-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-900 font-semibold"
                        >
                          <option value="Estudiante">Estudiante</option>
                          <option value="Profesor/Tutor">Profesor/Tutor</option>
                          <option value="OrgAdmin">OrgAdmin</option>
                          <option value="SuperAdmin" disabled={!esSuperAdmin}>
                            SuperAdmin
                          </option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Habilitado (TOTP)</span>
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{u.lastLogin}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'organizations' && esSuperAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {organizations.map((org) => {
              const isSelected = org.id === currentOrg.id;
              return (
                <div
                  key={org.id}
                  className={`bg-white p-6 rounded-xl border shadow-xs space-y-4 flex flex-col justify-between ${
                    isSelected ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono uppercase font-bold text-blue-700">
                        {org.logoPlaceholder}
                      </span>
                      <span className="font-mono">{org.country}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{org.name}</h3>
                    <p className="text-xs text-slate-500">Slug: /{org.slug}</p>
                    <div className="pt-2 border-t border-slate-100 text-xs font-mono space-y-1 text-slate-600">
                      <div>Plan: <strong className="text-slate-900">{org.activePlan}</strong></div>
                      <div>Usuarios Matriculados: <strong className="text-slate-900">{org.studentCount}</strong></div>
                      <div>Base de Datos: <span className="text-emerald-700 font-semibold">Tenant Aislado (pg_schema)</span></div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    {isSelected ? (
                      <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Organización Activa</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => onSelectOrg(org)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        Cambiar a este Tenant
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-6">
            {/* Colombian Ley 1581 Checklist */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Cumplimiento Normativo Ley 1581 de 2012 (Habeas Data Colombia)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-1">
                  <div className="font-bold text-emerald-900">Principio de Finalidad</div>
                  <p className="text-emerald-800">
                    Consentimiento expreso e informado de estudiantes previo al procesamiento con modelos de lenguaje.
                  </p>
                </div>
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-1">
                  <div className="font-bold text-emerald-900">Anonimización & PII Masking</div>
                  <p className="text-emerald-800">
                    Sustitución algorítmica de números de identificación y teléfonos antes del despacho a endpoints de inferencia.
                  </p>
                </div>
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-1">
                  <div className="font-bold text-emerald-900">Retención Cero y Cifrado</div>
                  <p className="text-emerald-800">
                    Cifrado en reposo (AES-256) y en tránsito (TLS 1.3). No re-entrenamiento con datos del cliente.
                  </p>
                </div>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Bitácora Inmutable de Auditoría del Sistema
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Marca de Tiempo</th>
                      <th className="p-3">Evento</th>
                      <th className="p-3">Actor / Usuario</th>
                      <th className="p-3">Detalle Operacional</th>
                      <th className="p-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
                    {auditLogs.map((log, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-500">{log.timestamp}</td>
                        <td className="p-3 font-bold text-slate-900">{log.event}</td>
                        <td className="p-3 text-blue-700">{log.actor}</td>
                        <td className="p-3 text-slate-600 font-sans">{log.details}</td>
                        <td className="p-3">
                          <span className="text-emerald-700 font-bold">VERIFICADO</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
