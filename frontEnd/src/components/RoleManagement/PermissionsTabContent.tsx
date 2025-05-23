import React from 'react';
import { Role, Page, Permission, ActionType, actionIcons } from '../../types/roleManagement';
import { Shield, FileCode, Grid, List, Settings, HelpCircle, X } from 'lucide-react';

interface PermissionsTabContentProps {
  selectedRole: Role | null;
  activeRoles: Role[]; // Renombrado de 'roles' para claridad, son los roles activos para la matriz
  activePages: Page[]; // Renombrado de 'pages' para claridad, son las páginas activas para la matriz
  permissionsMap: Record<string, Record<string, ActionType[]>>;
  availableActions: ActionType[];
  togglePermission: (roleId: string, pageId: string, action: ActionType) => void;
  toggleAllPermissions: (roleId: string, pageId: string) => void;
  hasPermission: (roleId: string, pageId: string, action: ActionType) => boolean;
  isMobile: boolean;
  viewMode: "matrix" | "list";
  setViewMode: (mode: "matrix" | "list") => void;
  onShowHelp: () => void;
  onClearSelectedRole: () => void;
  permissionsDataForList: Permission[];
  allRolesForList: Role[]; // Para buscar nombres de roles en la vista de lista
  allPagesForList: Page[]; // Para buscar nombres de páginas en la vista de lista
}

const PermissionsTabContent: React.FC<PermissionsTabContentProps> = ({
  selectedRole,
  activeRoles,
  activePages,
  permissionsMap,
  availableActions,
  togglePermission,
  toggleAllPermissions,
  hasPermission,
  isMobile,
  viewMode,
  setViewMode,
  onShowHelp,
  onClearSelectedRole,
  permissionsDataForList,
  allRolesForList,
  allPagesForList,
}) => {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-black dark:text-white">
            {selectedRole ? `Permisos para: ${selectedRole.name}` : "Matriz de Permisos"}
          </h3>
          {selectedRole && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{selectedRole.description}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onShowHelp}
            className="inline-flex items-center gap-2 rounded-lg border border-stroke px-3 py-1.5 text-sm font-medium text-black transition-all hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
            title="Ayuda sobre permisos"
          >
            <HelpCircle size={16} />
            <span className="hidden xs:inline">Ayuda</span>
          </button>
          {!isMobile && (
            <>
              <button
                onClick={() => setViewMode("matrix")}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  viewMode === "matrix"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-400"
                }`}
              >
                <Grid size={16} />
                <span className="hidden xs:inline">Matriz</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-400"
                }`}
              >
                <List size={16} />
                <span className="hidden xs:inline">Lista</span>
              </button>
            </>
          )}
          {selectedRole && (
            <button
              onClick={onClearSelectedRole}
              className="inline-flex items-center gap-2 rounded-lg border border-stroke px-3 py-1.5 text-sm font-medium text-black transition-all hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
            >
              <X size={16} />
              <span className="hidden xs:inline">Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Matrix View - Only show on desktop */}
      {viewMode === "matrix" && !isMobile && (
        <div className="overflow-x-auto rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="min-w-max">
            <div className="sticky top-0 z-10 grid grid-cols-[200px_repeat(auto-fill,minmax(120px,1fr))] bg-gray-50 dark:bg-meta-4">
              <div className="border-b border-r border-stroke p-4 dark:border-strokedark">
                <p className="font-medium text-black dark:text-white">Páginas / Roles</p>
              </div>
              {(selectedRole ? [selectedRole] : activeRoles).map((role) => (
                <div key={role._id} className="border-b border-r border-stroke p-4 dark:border-strokedark">
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10">
                      <Shield className="text-primary" size={18} />
                    </span>
                    <p className="text-sm font-medium text-black dark:text-white">{role.name}</p>
                  </div>
                </div>
              ))}
            </div>
            {activePages.map((page) => (
              <div key={page._id} className="grid grid-cols-[200px_repeat(auto-fill,minmax(120px,1fr))]">
                <div className="border-b border-r border-stroke p-4 dark:border-strokedark">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10">
                      <FileCode className="text-primary" size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">{page.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{page.path}</p>
                    </div>
                  </div>
                </div>
                {(selectedRole ? [selectedRole] : activeRoles).map((role) => (
                  <div
                    key={`${role._id}-${page._id}`}
                    className="border-b border-r border-stroke p-4 dark:border-strokedark"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <button
                        onClick={() => toggleAllPermissions(role._id, page._id)}
                        className={`mb-2 w-full rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                          permissionsMap[role._id]?.[page._id]?.length === availableActions.length
                            ? "bg-success text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-meta-4 dark:text-gray-300"
                        }`}
                        title="Marcar/Desmarcar todas las acciones"
                      >
                        {permissionsMap[role._id]?.[page._id]?.length === availableActions.length
                          ? "Desmarcar Todo"
                          : "Marcar Todo"}
                      </button>
                      <div className="grid grid-cols-3 gap-2">
                        {availableActions.map((action) => (
                          <button
                            key={action}
                            onClick={() => togglePermission(role._id, page._id, action)}
                            className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${
                              hasPermission(role._id, page._id, action)
                                ? "bg-success text-white"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-400"
                            }`}
                            title={action.charAt(0).toUpperCase() + action.slice(1)}
                          >
                            {actionIcons[action]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View - Default on mobile */}
      {(viewMode === "list" || isMobile) && (
        <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="py-4 px-4 md:px-6 xl:px-7.5">
            <h4 className="text-lg font-semibold text-black dark:text-white">
              {selectedRole ? `Permisos para ${selectedRole.name}` : "Todos los Permisos"}
            </h4>
          </div>
          <div className="hidden border-t border-stroke py-4.5 px-4 dark:border-strokedark md:grid md:grid-cols-7 md:px-6 xl:px-7.5">
            <div className="col-span-2 flex items-center">
              <p className="font-medium text-black dark:text-white">Página</p>
            </div>
            <div className="col-span-2 flex items-center">
              <p className="font-medium text-black dark:text-white">Rol</p>
            </div>
            <div className="col-span-3 flex items-center">
              <p className="font-medium text-black dark:text-white">Acciones Permitidas</p>
            </div>
          </div>
          {permissionsDataForList.length === 0 && (
            <div className="border-t border-stroke py-8 px-4 dark:border-strokedark md:px-6 xl:px-7.5">
                <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="mb-3 h-16 w-16 text-gray-400" />
                    <p className="text-center text-lg font-medium text-black dark:text-white">No se encontraron permisos</p>
                    <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
                        {selectedRole ? `No hay permisos asignados para el rol "${selectedRole.name}"` : "No hay permisos configurados en el sistema"}
                    </p>
                </div>
            </div>
          )}
          {permissionsDataForList.map((permission) => {
            const roleName = typeof permission.role === "string" ? allRolesForList.find((r) => r._id === permission.role)?.name || "Desconocido" : permission.role.name;
            const pageName = typeof permission.page === "string" ? allPagesForList.find((pg) => pg._id === permission.page)?.name || "Desconocida" : permission.page.name;
            const pageId = typeof permission.page === "string" ? permission.page : permission.page._id;
            const roleId = typeof permission.role === "string" ? permission.role : permission.role._id;

            return (
              <div
                key={permission._id}
                className="border-t border-stroke py-4 px-4 hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4 md:grid md:grid-cols-7 md:px-6 xl:px-7.5"
              >
                <div className="flex flex-col gap-3 md:hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary bg-opacity-10"><FileCode className="text-primary" size={16} /></span>
                      <p className="text-sm font-medium text-black dark:text-white">{pageName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary bg-opacity-10"><Shield className="text-primary" size={16} /></span>
                      <p className="text-sm font-medium text-black dark:text-white">{roleName}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => toggleAllPermissions(roleId, pageId)} className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${ permission.actions.length === availableActions.length ? "bg-success text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-meta-4 dark:text-gray-300"}`} title="Marcar/Desmarcar todas las acciones">
                      {permission.actions.length === availableActions.length ? "Desmarcar Todo" : "Marcar Todo"}
                    </button>
                    {availableActions.map((action) => (
                      <button key={action} onClick={() => togglePermission(roleId, pageId, action)} className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${permission.actions.includes(action) ? "bg-success text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-400"}`}>
                        {actionIcons[action]}
                        <span>{action.slice(0, 3).toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 hidden items-center md:flex">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10"><FileCode className="text-primary" size={20} /></span>
                    <p className="text-sm font-medium text-black dark:text-white">{pageName}</p>
                  </div>
                </div>
                <div className="col-span-2 hidden items-center md:flex">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10"><Shield className="text-primary" size={20} /></span>
                    <p className="text-sm font-medium text-black dark:text-white">{roleName}</p>
                  </div>
                </div>
                <div className="col-span-3 hidden flex-wrap items-center gap-2 md:flex">
                  <button onClick={() => toggleAllPermissions(roleId, pageId)} className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${permission.actions.length === availableActions.length ? "bg-success text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-meta-4 dark:text-gray-300"}`} title="Marcar/Desmarcar todas las acciones">
                    {permission.actions.length === availableActions.length ? "Desmarcar Todo" : "Marcar Todo"}
                  </button>
                  {availableActions.map((action) => (
                    <button key={action} onClick={() => togglePermission(roleId, pageId, action)} className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${permission.actions.includes(action) ? "bg-success text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-400"}`}>
                      {actionIcons[action]}
                      <span>{action.slice(0, 3).toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div className="mt-6 rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 className="mb-3 text-sm font-semibold text-black dark:text-white">Leyenda de Acciones</h4>
        <div className="flex flex-wrap gap-4">
          {availableActions.map((action) => (
            <div key={action} className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-success text-white">{actionIcons[action]}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{action.charAt(0).toUpperCase() + action.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PermissionsTabContent;
