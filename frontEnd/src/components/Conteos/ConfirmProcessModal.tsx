"use client"

import type React from "react"
import { Loader2 } from "lucide-react"

interface ConfirmProcessModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isProcessing: boolean
  canProcess: boolean // Though primary disable logic might be in parent, it's good for the component to be aware
}

const ConfirmProcessModal: React.FC<ConfirmProcessModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  canProcess,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-2 sm:p-4 pt-16 ml-0 lg:ml-72.5 touch-none">
      <div
        className="fixed inset-0 bg-black/70 transition-opacity touch-none backdrop-blur-sm animate-fadeIn"
        onClick={!isProcessing ? onClose : undefined} // Prevent closing while processing
        style={{ userSelect: "none" }}
      ></div>

      <div className="relative w-full max-w-md modal-dark transform transition-all mx-auto flex flex-col z-[60] animate-scaleIn p-6">
        <div className="shield-icon-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          </svg>
        </div>

        <h3 className="text-xl font-medium text-white text-center mb-2">Confirmar Procesamiento</h3>

        <p className="text-gray-300 text-center mb-6">
          ¿Está seguro que desea procesar este documento?
          <br />
          Esta acción no se puede deshacer.
        </p>

        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-md text-sm transition-all modal-dark-button-cancel"
            disabled={isProcessing}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing || !canProcess}
            title={!canProcess ? "No tiene permisos para procesar" : isProcessing ? "Procesando..." : "Confirmar procesamiento"}
            className="flex-1 py-2.5 px-4 rounded-md text-sm transition-all modal-dark-button-confirm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              "Confirmar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmProcessModal;
