import axios from "axios"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb"
import ErrorMessage from "../components/ErrorMessage"
import type { viewEmbalForm } from "../types"
// Removed Modal import since we're integrating it directly

const Reubica = () => {
  const initialState = {
    embal: "",
    zubic: "",
  }

  interface Data {
    EMBAL: string
    MBLNR: string
    POSNR: string
    MATNR: string
    MAKTX: string
    MENGE: string
    ERFME: string
    ZUBIC: string
  }

  const data1: Data = {
    EMBAL: "",
    MBLNR: "",
    POSNR: "",
    MATNR: "",
    MAKTX: "",
    MENGE: "",
    ERFME: "",
    ZUBIC: "",
  }

  const form1 = useForm({ defaultValues: initialState })
  const form2 = useForm({ defaultValues: initialState })

  const [isModalOpen, setIsModalOpen] = useState(false)

  //const { register, handleSubmit, setFocus, reset, formState: { errors } } = useForm({ defaultValues: initialState });
  const {
    register: registerForm1,
    handleSubmit: handleSubmitForm1,
    setFocus,
    reset: resetForm1,
    formState: { errors: errorsForm1 },
  } = form1
  const {
    register: registerForm2,
    handleSubmit: handleSubmitForm2,
    reset: resetForm2,
    formState: { errors: errorsForm2 },
  } = form2

  const [count, setCount] = useState(data1)

  useEffect(() => {
    setFocus("embal")
  }, [setFocus])

  async function handleview(formData: viewEmbalForm) {
    try {
      resetForm2()
      resetForm1()
      setCount({ ...data1 })
      const Response = await axios.post("http://localhost:4000/entr/view", formData)
      setCount(Response.data.EMBALAJE)
    } catch (error) {
      resetForm1()
    }
  }

  async function handleReubica(formData: viewEmbalForm) {
    try {
      formData.embal = count.EMBAL
      // setCount({ ...data1 });

      const Response = await axios.post("http://localhost:4000/entr/reubica", formData)
      // setCount(Response.data.EMBALAJE);

      console.log(Response.data.EMBALAJE)

      setFocus("embal")
    } catch (error) {
      resetForm2()
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Breadcrumb pageName="Ubicar Embalaje" />

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div className="flex flex-col gap-9">
          {/* <!-- Contact Form --> */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <form id="form1" onSubmit={handleSubmitForm1(handleview)}>
              <div className="p-6.5">
                <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">Escanear embalaje</label>
                    <input
                      id="embal"
                      type="text"
                      placeholder="Numero de embalaje"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      {...registerForm1("embal", { required: "El número de embalaje es obligatorio" })}
                    />
                    {errorsForm1.embal && <ErrorMessage>{errorsForm1.embal.message}</ErrorMessage>}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {count?.EMBAL && (
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
          <div className="flex flex-col gap-9">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <form id="form2" onSubmit={handleSubmitForm2(handleReubica)}>
                <div className="p-6.5">
                  <div className="grid grid-cols-2 gap-y-3">
                    {/* Campos existentes */}
                    <p className="text-black dark:text-white font-medium">Embalaje:</p>
                    <p className="text-black dark:text-white">{count.EMBAL}</p>

                    <p className="text-black dark:text-white font-medium">Material:</p>
                    <p className="text-black dark:text-white">{count.MATNR}</p>

                    <p className="text-black dark:text-white font-medium">Descripción:</p>
                    <p className="text-black dark:text-white">{count.MAKTX}</p>

                    <p className="text-black dark:text-white font-medium">Uni. Medida:</p>
                    <p className="text-black dark:text-white">{count.ERFME}</p>

                    <p className="text-black dark:text-white font-medium">Cantidad:</p>
                    <p className="text-black dark:text-white">{count.MENGE}</p>

                    <p className="text-black dark:text-white font-medium">ubicación actual:</p>
                    <p className="text-black dark:text-white">{count.ZUBIC}</p>
                  </div>

                  <div className="col-span-2 mt-4 space-y-2">
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">
                      Ubicación Destino:
                    </label>
                    <input
                      type="text"
                      id="ubi"
                      autoFocus
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      placeholder="Ingresar ubicación"
                      {...registerForm2("zubic", { required: "Ubicación es requerida" })}
                    />
                    {errorsForm2.zubic && <ErrorMessage>{errorsForm2.zubic.message}</ErrorMessage>}
                  </div>

                  <div className="flex gap-3 justify-center w-full mt-6">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-primary text-white rounded hover:bg-primary-dark text-sm w-full sm:w-auto"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      className="px-6 py-2.5 bg-danger text-white rounded hover:bg-danger-dark text-sm w-full sm:w-auto"
                      onClick={(e) => {
                        e.preventDefault()
                        setIsModalOpen(true)
                      }}
                    >
                      Excepción
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal integrado directamente en el componente */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="w-full max-w-3xl bg-white dark:bg-boxdark rounded shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-stroke dark:border-strokedark">
              <h2 className="text-xl font-bold text-black dark:text-white">
                Excepción embalaje: {count.EMBAL }
              </h2>
              <button onClick={closeModal} className="text-2xl text-black dark:text-white">
                &times;
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Material:</span>
                  <p className="mt-1 text-base text-black dark:text-white">{count.MATNR || "N/A"}</p>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción:</span>
                  <p className="mt-1 text-base text-black dark:text-white">{count.MAKTX || "N/A"}</p>
                </div>
              </div>

              {/* Sección de Códigos de Excepción */}
              <div className="border rounded bg-white dark:bg-boxdark shadow-sm">
                <div className="px-6 py-4 border-b border-stroke dark:border-strokedark">
                  <h3 className="text-lg font-semibold text-black dark:text-white">Códigos de Excepción</h3>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-stroke dark:border-strokedark flex justify-end">
              <button type="button" onClick={closeModal} className="bg-primary text-white px-6 py-2 rounded">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Reubica

