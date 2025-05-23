import React from 'react';

interface SignUpStep3Props {
  formData: { firstName: string; lastName: string };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validationErrors: { firstName?: string; lastName?: string };
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, nextFieldName?: string) => void;
  firstNameRef: React.RefObject<HTMLInputElement>;
}

const SignUpStep3: React.FC<SignUpStep3Props> = ({
  formData,
  handleChange,
  validationErrors,
  handleKeyDown,
  firstNameRef,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-black dark:text-white">Nombre</label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <input
            ref={firstNameRef}
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Ingrese nombre"
            className={`w-full rounded-md border ${
              validationErrors.firstName ? "border-red-500" : "border-stroke"
            } bg-transparent py-2.5 pl-10 pr-4 text-sm text-black outline-none focus:border-warning focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-warning`}
            required
            onKeyDown={(e) => handleKeyDown(e, "lastName")}
          />
        </div>
        {validationErrors.firstName && <p className="mt-1 text-xs text-red-500">{validationErrors.firstName}</p>}
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-black dark:text-white">Apellido</label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Ingrese apellido"
            className={`w-full rounded-md border ${
              validationErrors.lastName ? "border-red-500" : "border-stroke"
            } bg-transparent py-2.5 pl-10 pr-4 text-sm text-black outline-none focus:border-warning focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-warning`}
            required
            onKeyDown={(e) => handleKeyDown(e)}
          />
        </div>
        {validationErrors.lastName && <p className="mt-1 text-xs text-red-500">{validationErrors.lastName}</p>}
      </div>
    </div>
  );
};

export default SignUpStep3;
