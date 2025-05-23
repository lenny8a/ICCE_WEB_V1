import React from 'react';

interface SignUpStep2Props {
  formData: { password: string; confirmPassword: string };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validationErrors: { password?: string; confirmPassword?: string };
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, nextFieldName?: string) => void;
  passwordRef: React.RefObject<HTMLInputElement>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  passwordStrength: number;
  getPasswordStrengthText: () => string;
  getPasswordStrengthColor: () => string;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
}

const SignUpStep2: React.FC<SignUpStep2Props> = ({
  formData,
  handleChange,
  validationErrors,
  handleKeyDown,
  passwordRef,
  showPassword,
  setShowPassword,
  passwordStrength,
  getPasswordStrengthText,
  getPasswordStrengthColor,
  showConfirmPassword,
  setShowConfirmPassword,
}) => {
  return (
    <>
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-black dark:text-white">Contraseña</label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <input
            ref={passwordRef}
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Ingrese contraseña"
            className={`w-full rounded-md border ${
              validationErrors.password ? "border-red-500" : "border-stroke"
            } bg-transparent py-2.5 pl-10 pr-10 text-sm text-black outline-none focus:border-warning focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-warning`}
            required
            onKeyDown={(e) => handleKeyDown(e, "confirmPassword")}
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                  clipRule="evenodd"
                />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            )}
          </button>
        </div>
        {validationErrors.password && <p className="mt-1 text-xs text-red-500">{validationErrors.password}</p>}

        {formData.password && (
          <div className="mt-2">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Fortaleza: {getPasswordStrengthText()}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">{passwordStrength}/5</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full dark:bg-gray-700">
              <div
                className={`h-1.5 rounded-full ${getPasswordStrengthColor()}`}
                style={{ width: `${(passwordStrength / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-black dark:text-white">Confirmar Contraseña</label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirme contraseña"
            className={`w-full rounded-md border ${
              validationErrors.confirmPassword ? "border-red-500" : "border-stroke"
            } bg-transparent py-2.5 pl-10 pr-10 text-sm text-black outline-none focus:border-warning focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-warning`}
            required
            onKeyDown={(e) => handleKeyDown(e)}
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                  clipRule="evenodd"
                />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            )}
          </button>
        </div>
        {validationErrors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">{validationErrors.confirmPassword}</p>
        )}
      </div>
    </>
  );
};

export default SignUpStep2;
