// Script para inicializar y garantizar el funcionamiento del sidebar en móviles
export const initializeSidebar = () => {
    console.log("Inicializando sidebar para dispositivos móviles")
  
    // Función para configurar el botón de menú
    const setupMenuButton = () => {
      const menuButton = document.getElementById("sidebar-toggle-button")
      if (!menuButton) {
        console.log("Botón de menú no encontrado, reintentando...")
        setTimeout(setupMenuButton, 500)
        return
      }
  
      console.log("Botón de menú encontrado, configurando eventos")
  
      // Verificar si ya tiene el atributo data-initialized para evitar duplicación
      if (menuButton.getAttribute("data-initialized") === "true") {
        console.log("El botón ya está inicializado, omitiendo...")
        return
      }
  
      // Marcar el botón como inicializado
      menuButton.setAttribute("data-initialized", "true")
  
      // Reemplazar el evento de clic con uno más directo
      menuButton.addEventListener(
        "click",
        (e) => {
          e.preventDefault()
          e.stopPropagation()
  
          // Obtener el sidebar
          const sidebar = document.querySelector("aside")
          if (!sidebar) {
            console.error("Sidebar no encontrado")
            return
          }
  
          // Verificar si el sidebar está visible
          const isVisible = !sidebar.classList.contains("-translate-x-full")
  
          console.log("Toggle sidebar:", isVisible ? "cerrando" : "abriendo")
  
          // Cambiar la clase del sidebar
          if (isVisible) {
            sidebar.classList.add("-translate-x-full")
            document.body.classList.remove("overflow-hidden")
  
            // Eliminar overlay si existe
            const overlay = document.querySelector(".sidebar-overlay")
            if (overlay) {
              overlay.remove()
            }
          } else {
            sidebar.classList.remove("-translate-x-full")
            document.body.classList.add("overflow-hidden")
  
            // Crear overlay si no existe
            if (!document.querySelector(".sidebar-overlay")) {
              const overlay = document.createElement("div")
              overlay.className = "sidebar-overlay fixed inset-0 z-[998] bg-black bg-opacity-50 lg:hidden"
              overlay.onclick = () => {
                sidebar.classList.add("-translate-x-full")
                document.body.classList.remove("overflow-hidden")
                overlay.remove()
              }
              document.body.appendChild(overlay)
            }
          }
        },
        { capture: true },
      )
  
      console.log("Configuración del botón de menú completada")
    }
  
    // Iniciar la configuración
    setupMenuButton()
  
    // Configurar también para cuando cambie el DOM (por ejemplo, después de una navegación)
    const observer = new MutationObserver(() => {
      if (!document.getElementById("sidebar-toggle-button")) {
        setupMenuButton()
      }
    })
  
    observer.observe(document.body, { childList: true, subtree: true })
  
    return () => observer.disconnect()
  }
  