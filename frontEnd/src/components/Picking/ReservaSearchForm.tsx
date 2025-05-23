"use client"

import { useForm } from "react-hook-form"
import ErrorMessage from "../ErrorMessage"

interface ReservaForm {
  reserva: string
}

interface ReservaSearchFormProps {
  onSearch: (data: ReservaForm) => void
  isSearching: boolean
  isProcessingComplete: boolean
}

const ReservaSearchForm = ({ onSearch, isSearching, isProcessingComplete }: ReservaSearchFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReservaForm>()

  return (
    <div className="bg-white dark:bg-boxdark rounded-md shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-500 hover:shadow-lg animate-in slide-in-from-top-8">
      <div className="p-4">
        <div className="flex items-center mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary mr-2"
          >
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
            <path d="M18 14h-8"></path>
            <path d="M15 18h-5"></path>
            <path d="M10 6h8v4h-8V6Z"></path>
          </svg>
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">Buscar Documento</h2>
        </div>

        <form onSubmit={handleSubmit(onSearch)}>
          <div className="flex items-center">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500 dark:text-gray-400"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
              <input
                id="reserva"
                type="text"
                placeholder="Ingrese número de reserva u orden"
                className="w-full rounded-l-md border border-gray-200 bg-transparent py-2 pl-10 pr-4 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/30 dark:text-white dark:focus:border-primary text-sm"
                {...register("reserva", { required: "El número de documento es obligatorio" })}
                disabled={isProcessingComplete || isSearching}
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-1 rounded-r-md bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-md disabled:bg-opacity-70 border border-primary"
              disabled={isProcessingComplete || isSearching}
            >
              {isSearching ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                  <span>Buscar</span>
                </>
              )}
            </button>
          </div>
          {errors.reserva && <ErrorMessage>{errors.reserva.message}</ErrorMessage>}
        </form>
      </div>
    </div>
  )
}

export default ReservaSearchForm
