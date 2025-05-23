import React from 'react';

interface SignUpStep1Props {
  formData: { username: string; email: string };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validationErrors: { username?: string; email?: string };
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, nextFieldName?: string) => void;
  usernameRef: React.RefObject<HTMLInputElement>;
}

const SignUpStep1: React.FC<SignUpStep1Props> = ({
  formData,
  handleChange,
  validationErrors,
  handleKeyDown,
  usernameRef,
}) => {
  return (
    <>
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-black dark:text-white">Nombre de usuario</label>
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
            ref={usernameRef}
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Ingrese nombre de usuario"
            className={`w-full rounded-md border ${
              validationErrors.username ? "border-red-500" : "border-stroke"
            } bg-transparent py-2.5 pl-10 pr-4 text-sm text-black outline-none focus:border-warning focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-warning`}
            required
            onKeyDown={(e) => handleKeyDown(e, "email")}
          />
        </div>
        {validationErrors.username && <p className="mt-1 text-xs text-red-500">{validationErrors.username}</p>}
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-black dark:text-white">Correo electrónico</label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Ingrese correo electrónico"
            className={`w-full rounded-md border ${
              validationErrors.email ? "border-red-500" : "border-stroke"
            } bg-transparent py-2.5 pl-10 pr-4 text-sm text-black outline-none focus:border-warning focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-warning`}
            required
            onKeyDown={(e) => handleKeyDown(e)}
          />
        </div>
        {validationErrors.email && <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>}
      </div>
    </>
  );
};

export default SignUpStep1;
