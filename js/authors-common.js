// Funciones reutilizables para gestionar autores (lista y tabla)
// Depende de `fetchApi` (definido en js/api.js)

(function (global) {
  async function loadAuthorsList(targetElement) {
    if (!targetElement) return;
    try {
      const response = await fetchApi("/autores");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error cargando autores");

      targetElement.innerHTML = "";
      data.data.forEach((author) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${author.first_name} ${author.last_name}</span>
          <button class="detail-button" data-id="${author._id}">Ver Detalle (Protegido)</button>
        `;
        targetElement.appendChild(li);
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async function loadAuthorsTable(tableBody) {
    if (!tableBody) return;
    try {
      const response = await fetchApi("/autores");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error cargando autores");

      tableBody.innerHTML = "";
      data.data.forEach((author) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${author.first_name} ${author.last_name}</td>
          <td>${author.biography || "N/A"}</td>
          <td>
            <button class="edit-button" data-id="${author._id}">Editar</button>
            <button class="delete-button" data-id="${author._id}">Eliminar (Protegido)</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async function loadAuthorDetail(authorId, targetElement) {
    if (!targetElement) return;
    try {
      const response = await fetchApi(`/autores/${authorId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error cargando detalle");

      const author = data.data;
      targetElement.innerHTML = `
        <p><strong>ID:</strong> ${author._id}</p>
        <p><strong>Nombre:</strong> ${author.first_name} ${author.last_name}</p>
        <p><strong>Biografía:</strong> ${author.biography || "N/A"}</p>
      `;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // Obtener un autor (devuelve el objeto 'author')
  async function getAuthor(authorId) {
    try {
      const response = await fetchApi(`/autores/${authorId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error cargando autor");
      return data.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // Crear autor (POST /api/autores)
  async function createAuthor(authorData) {
    try {
      const response = await fetchApi(`/autores`, {
        method: "POST",
        body: authorData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al crear autor");
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // Actualizar autor (PUT /api/autores/:id)
  async function updateAuthor(authorId, authorData) {
    try {
      const response = await fetchApi(`/autores/${authorId}`, {
        method: "PUT",
        body: authorData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al actualizar autor");
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async function deleteAuthor(authorId) {
    try {
      const response = await fetchApi(`/autores/${authorId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al eliminar");
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  global.authorsCommon = {
    loadAuthorsList,
    loadAuthorsTable,
    loadAuthorDetail,
    deleteAuthor,
    getAuthor,
    createAuthor,
    updateAuthor,
  };
})(window);
