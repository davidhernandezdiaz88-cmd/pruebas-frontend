// Esperar a que todo el HTML esté cargado
document.addEventListener("DOMContentLoaded", () => {
  // --- 1. OBTENER REFERENCIAS DEL DOM ---

  // Vistas (Pantallas)
  const loginView = document.getElementById("login-view");
  const contentView = document.getElementById("content-view");

  // Formulario de Login
  const loginForm = document.getElementById("login-form");
  const loginEmail = document.getElementById("login-email");
  const loginPassword = document.getElementById("login-password");

  // Contenido
  const authorsList = document.getElementById("authors-list");
  const authorDetailResult = document.getElementById("author-detail-result");
  const logoutButton = document.getElementById("logout-button");

  // Mensajes
  const messageArea = document.getElementById("message-area");

  // --- 2. FUNCIONES DE LA APLICACIÓN ---

  /**
   * Muestra u oculta las vistas de login/contenido
   * @param {boolean} isLoggedIn - True si el usuario está logueado
   */
  function toggleViews(isLoggedIn) {
    if (isLoggedIn) {
      loginView.classList.add("hidden");
      contentView.classList.remove("hidden");
    } else {
      loginView.classList.remove("hidden");
      contentView.classList.add("hidden");
    }
  }

  /**
   * Muestra un mensaje de éxito o error
   * @param {string} text - El mensaje a mostrar
   * @param {boolean} isError - True si es un error
   */
  function showMessage(text, isError = false) {
    messageArea.textContent = text;
    messageArea.className = isError ? "message-error" : "message-success";

    // Borrar el mensaje después de 3 segundos
    setTimeout(() => {
      messageArea.textContent = "";
      messageArea.className = "";
    }, 3000);
  }

  /**
   * (ENDPOINT: POST /api/usuarios/login)
   * Maneja el envío del formulario de login
   */
  async function handleLogin(event) {
    event.preventDefault(); // Evitar que la página se recargue

    const email = loginEmail.value;
    const password = loginPassword.value;

    try {
      // Usamos nuestro 'fetchApi' helper
      const response = await fetchApi("/usuarios/login", {
        method: "POST",
        body: {
          email: email,
          password: password,
        },
      });

      const data = await response.json();

      if (!response.ok || data.status === false) {
        throw new Error(data.msg || "Error al iniciar sesión");
      }

      // ¡ÉXITO!
      // 1. Guardar el token en localStorage
      localStorage.setItem("token", data.token);

      // 2. Mostrar mensaje de bienvenida
      showMessage(`¡Bienvenido ${data.user.first_name}!`);

      // 3. Cambiar de vista y cargar autores
      toggleViews(true);
      loadAuthors();
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  /**
   * (ENDPOINT: GET /api/autores)
   * Carga y muestra la lista de autores (Ruta Pública)
   */
  async function loadAuthors() {
    // Seguridad: si el DOM no tiene el contenedor, salir sin error
    if (!authorsList) return;

    try {
      await authorsCommon.loadAuthorsList(authorsList);
    } catch (error) {
      showMessage(error.message || "Error inesperado", true);
    }
  }

  /**
   * (ENDPOINT: GET /api/autores/:id)
   * Carga los detalles de un autor (Ruta Protegida)
   */
  async function loadAuthorDetail(authorId) {
    // Seguridad: si no existe el contenedor de detalle, no intentar renderizar
    if (!authorDetailResult) return;

    try {
      authorDetailResult.innerHTML = "Cargando...";
      await authorsCommon.loadAuthorDetail(authorId, authorDetailResult);
      showMessage("Detalle de ruta protegida cargado con éxito.", false);
    } catch (error) {
      authorDetailResult.innerHTML = "";
      showMessage(error.message || "Error inesperado", true);
    }
  }

  /**
   * Maneja los clics en la lista de autores (Delegación de eventos)
   */
  function handleAuthorListClick(event) {
    // Verificar si se hizo clic en un botón de "detalle"
    if (event.target.classList.contains("detail-button")) {
      const authorId = event.target.dataset.id;
      loadAuthorDetail(authorId);
    }
  }

  /**
   * Maneja el clic en "Cerrar Sesión"
   */
  function handleLogout() {
    // 1. Borrar el token
    localStorage.removeItem("token");
    // 2. Cambiar a la vista de login
    toggleViews(false);
    // 3. Limpiar el contenido
    authorsList.innerHTML = "";
    authorDetailResult.innerHTML = "";
    showMessage("Sesión cerrada con éxito.");
  }

  // --- 3. INICIALIZACIÓN Y EVENT LISTENERS ---

  // Asignar los manejadores de eventos
  loginForm.addEventListener("submit", handleLogin);
  logoutButton.addEventListener("click", handleLogout);
  if (authorsList) {
    authorsList.addEventListener("click", handleAuthorListClick);
  }

  // Función de arranque
  function init() {
    const token = localStorage.getItem("token");
    if (token) {
      // Si hay un token, asumimos que está logueado
      toggleViews(true);
      // E intentamos cargar los autores
      loadAuthors();
    } else {
      // Si no hay token, mostramos el login
      toggleViews(false);
    }
  }

  // ¡Arrancar la aplicación!
  init();
});
