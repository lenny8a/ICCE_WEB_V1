"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import ErrorMessage from "../ErrorMessage" // Assuming ErrorMessage is a shared component
import { Search, Loader2 } from "lucide-react"
import { useDeviceDetect } from "../../hooks/use-device-detect"


export interface ConteoFormValues {
  conteo: string
}

interface ConteoSearchFormProps {
  onSearch: (data: ConteoFormValues) => void
  isSearching: boolean
}

const ConteoSearchForm: React.FC<ConteoSearchFormProps> = ({ onSearch, isSearching }) => {
  const { isHandheld } = useDeviceDetect()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConteoFormValues>({
    defaultValues: { conteo: "" },
  })

  return (
    <div
      className={`bg-white dark:bg-boxdark rounded-md shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md ${isHandheld ? "handheld-container" : ""}`}
    >
      <div className={`p-4 ${isHandheld ? "handheld-p-2" : ""}`}>
        <div className="flex items-center mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={isHandheld ? "16" : "20"}
            height={isHandheld ? "16" : "20"}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary mr-2"
          >
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="m9 14 2 2 4-4" />
          </svg>
          <h2
            className={`text-base font-semibold text-gray-800 dark:text-white ${isHandheld ? "handheld-text-sm" : ""}`}
          >
            Buscar Documento de Inventario
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSearch)} className={isHandheld ? "handheld-compact-form" : ""}>
          <div
            className={`flex ${isHandheld ? "handheld-flex-col handheld-gap-1" : "flex-col sm:flex-row"} items-center`}
          >
            <div className="relative flex-grow w-full mb-2 sm:mb-0">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search 
                    size={isHandheld ? 14 : 16} 
                    className="text-gray-500 dark:text-gray-400" 
                />
              </div>
              <input
                id="conteo" // Keep ID for potential focus management from parent if needed later
                type="text"
                placeholder="Ingrese número de documento de inventario"
                className={`w-full rounded-md ${isHandheld ? "sm:rounded-md handheld-text-sm" : "sm:rounded-l-md sm:rounded-r-none"} border border-gray-200 bg-transparent py-2 pl-10 pr-4 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/30 dark:text-white text-sm`}
                {...register("conteo", { required: "El número de documento de inventario es obligatorio" })}
              />
            </div>
            <button
              type="submit"
              className={`w-full sm:w-auto flex items-center justify-center gap-1 rounded-md ${isHandheld ? "sm:rounded-md handheld-text-xs" : "sm:rounded-l-none sm:rounded-r-md"} bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-md disabled:bg-opacity-70 border border-primary disabled:opacity-75 disabled:cursor-not-allowed`}
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 size={isHandheld ? 14 : 16} className="animate-spin -ml-1 mr-2" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Search size={isHandheld ? 14 : 16}/>
                  <span>Buscar</span>
                </>
              )}
            </button>
          </div>
          {errors.conteo && <ErrorMessage>{errors.conteo.message}</ErrorMessage>}
        </form>
      </div>
    </div>
  );
};

export default ConteoSearchForm;
