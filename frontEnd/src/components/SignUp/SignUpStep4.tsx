import React from 'react';

interface Role {
  _id: string;
  name: string;
  description: string;
}

interface SignUpStep4Props {
  formDataRoles: string[];
  roles: Role[];
  fetchingRoles: boolean;
  searchRole: string;
  setSearchRole: (value: string) => void;
  filteredRoles: Role[];
  handleRoleToggle: (roleId: string) => void;
  validationErrorRoles?: string;
  searchRoleRef: React.RefObject<HTMLInputElement>;
}

const SignUpStep4: React.FC<SignUpStep4Props> = ({
  formDataRoles,
  roles, // Este prop es para tener la lista completa de roles para el mapeo de roles seleccionados
  fetchingRoles,
  searchRole,
  setSearchRole,
  filteredRoles,
  handleRoleToggle,
  validationErrorRoles,
  searchRoleRef,
}) => {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm font-medium text-black dark:text-white">Roles</label>
      {validationErrorRoles && <p className="mt-1 mb-2 text-xs text-red-500">{validationErrorRoles}</p>}

      <div className="mb-3 relative">
        <input
          ref={searchRoleRef}
          type="text"
          value={searchRole}
          onChange={(e) => setSearchRole(e.target.value)}
          placeholder="Buscar roles..."
          className="w-full rounded-md border border-stroke bg-transparent py-2.5 pl-4 pr-4 text-sm text-black outline-none focus:border-warning focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-warning"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        />
        {searchRole && (
          <button
            type="button"
            onClick={() => setSearchRole("")}
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {fetchingRoles ? (
        <div className="flex justify-center items-center py-4">
          <svg
            className="animate-spin h-5 w-5 text-warning"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">Cargando roles...</span>
        </div>
      ) : filteredRoles.length > 0 ? (
        <div className="max-h-60 overflow-y-auto pr-1 space-y-2">
          {filteredRoles.map((role) => (
            <div
              key={role._id}
              className={`p-2 rounded-md border cursor-pointer transition-all ${
                formDataRoles.includes(role._id)
                  ? "border-warning bg-warning/10 dark:bg-warning/20"
                  : "border-stroke dark:border-strokedark hover:border-warning/50"
              }`}
              onClick={() => handleRoleToggle(role._id)}
            >
              <div className="flex items-center">
                <div
                  className={`w-4 h-4 rounded-sm border flex items-center justify-center mr-2 ${
                    formDataRoles.includes(role._id)
                      ? "border-warning bg-warning text-white"
                      : "border-gray-400 dark:border-gray-600"
                  }`}
                >
                  {formDataRoles.includes(role._id) && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-black dark:text-white">{role.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{role.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 rounded-md border border-stroke dark:border-strokedark text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">No hay roles disponibles</p>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        <p>Roles seleccionados: {formDataRoles.length}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {formDataRoles.map((roleId) => {
            const role = roles.find((r) => r._id === roleId); // Usar la lista completa de roles aquí
            return role ? (
              <span
                key={roleId}
                className="inline-flex items-center px-2 py-1 rounded-md bg-warning/10 text-warning text-xs"
              >
                {role.name}
                <button
                  type="button"
                  onClick={() => handleRoleToggle(roleId)}
                  className="ml-1 text-warning hover:text-warning/80"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
};

export default SignUpStep4;
