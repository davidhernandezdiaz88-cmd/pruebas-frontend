// Esperar a que todo el HTML esté cargado
document.addEventListener("DOMContentLoaded", () => {
  // --- 1. GUARDIA DE RUTA (¡MUY IMPORTANTE!) ---
  // Esta es la lógica de "Ruta Protegida" en Vanilla JS
  const token = localStorage.getItem("token");
  if (!token) {
    // Si no hay token, no deberías estar aquí.
    // Redirigir al usuario a la página de login.
    alert("Acceso denegado. Debes iniciar sesión.");
    window.location.href = "index.html"; // Redirige a la página de login
    return; // Detiene la ejecución del script
  }

  // --- 2. OBTENER REFERENCIAS DEL DOM ---
  const tableBody = document.getElementById("authors-table-body");
  const messageArea = document.getElementById("message-area");
  const authorForm = document.getElementById("author-form");
  const authorIdInput = document.getElementById("author-id");
  const authorFirst = document.getElementById("author-first");
  const authorLast = document.getElementById("author-last");
  const authorBio = document.getElementById("author-bio");
  const authorImage = document.getElementById("author-image");
  const formTitle = document.getElementById("form-title");
  const authorSubmit = document.getElementById("author-submit");
  const authorCancel = document.getElementById("author-cancel");

  // --- 3. FUNCIONES DE LA APLICACIÓN ---

  /**
   * Muestra un mensaje de éxito o error
   */
  function showMessage(text, isError = false) {
    messageArea.textContent = text;
    messageArea.className = isError ? "message-error" : "message-success";
    setTimeout(() => {
      messageArea.textContent = "";
      messageArea.className = "";
    }, 3000);
  }

  /**
   * (ENDPOINT: GET /api/autores)
   * Carga y muestra la lista de autores en la tabla
   */
  async function loadAuthors() {
    try {
      // Usar la función compartida
      await authorsCommon.loadAuthorsTable(tableBody);
    } catch (error) {
      showMessage(error.message || "Error inesperado", true);
    }
  }

  /**
   * (ENDPOINT: DELETE /api/autores/:id)
   * Elimina un autor usando la ruta protegida
   */
  async function deleteAuthor(authorId) {
    try {
      await authorsCommon.deleteAuthor(authorId);
      showMessage("Autor eliminado correctamente.", false);
      // Refrescar la lista de autores
      loadAuthors();
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  /**
   * Manejador de clics en la tabla (Delegación de eventos)
   */
  function handleTableClick(event) {
    // Verificar si se hizo clic en un botón de "eliminar"
    if (event.target.classList.contains("delete-button")) {
      const authorId = event.target.dataset.id;

      // Pedir confirmación
      if (
        confirm(
          `¿Estás seguro de que deseas eliminar al autor con ID: ${authorId}?`
        )
      ) {
        deleteAuthor(authorId);
      }
    }

    // Editar
    if (event.target.classList.contains("edit-button")) {
      const authorId = event.target.dataset.id;
      populateFormForEdit(authorId);
    }
  }

  // Poblamos el formulario con los datos del autor para editar
  async function populateFormForEdit(authorId) {
    try {
      const author = await authorsCommon.getAuthor(authorId);
      if (!authorForm) return;
      authorIdInput.value = author._id;
      authorFirst.value = author.first_name || "";
      authorLast.value = author.last_name || "";
      authorBio.value = author.biography || "";
      if (authorImage) authorImage.value = author.image || "";
      if (formTitle) formTitle.textContent = "Editar Autor";
      if (authorSubmit) authorSubmit.textContent = "Actualizar";
      if (authorCancel) authorCancel.classList.remove("hidden");
    } catch (err) {
      showMessage(err.message || "Error cargando autor", true);
    }
  }

  function resetForm() {
    if (!authorForm) return;
    authorForm.reset();
    if (authorIdInput) authorIdInput.value = "";
    if (authorImage) authorImage.value = "";
    if (formTitle) formTitle.textContent = "Crear Autor";
    if (authorSubmit) authorSubmit.textContent = "Crear";
    if (authorCancel) authorCancel.classList.add("hidden");
  }

  // Manejar envío del formulario para crear o actualizar
  async function handleAuthorFormSubmit(event) {
    event.preventDefault();
    if (!authorForm) return;
    const id = authorIdInput ? authorIdInput.value : "";
    const payload = {
      first_name: authorFirst ? authorFirst.value : "",
      last_name: authorLast ? authorLast.value : "",
      biography: authorBio ? authorBio.value : "",
      image: authorImage ? authorImage.value : "",
    };

    try {
      if (id) {
        await authorsCommon.updateAuthor(id, payload);
        showMessage("Autor actualizado correctamente.", false);
      } else {
        await authorsCommon.createAuthor(payload);
        showMessage("Autor creado correctamente.", false);
      }
      resetForm();
      loadAuthors();
    } catch (err) {
      showMessage(err.message || "Error al guardar autor", true);
    }
  }

  function handleCancelEdit() {
    resetForm();
  }

  // --- 4. INICIALIZACIÓN Y EVENT LISTENERS ---

  // Asignar el manejador de eventos a la tabla
  if (tableBody) tableBody.addEventListener("click", handleTableClick);

  if (authorForm) authorForm.addEventListener("submit", handleAuthorFormSubmit);
  if (authorCancel) authorCancel.addEventListener("click", handleCancelEdit);

  // Cargar los autores al iniciar la página
  loadAuthors();
});
