(() => {
  const form      = document.getElementById("form-subcap");
  const fileInput = document.getElementById("file-upload");
  const preview   = document.getElementById("file-preview");
  const btnSalvar = document.getElementById("btn-salvar");
  const btnCancelar = document.getElementById("btn-cancelar");

  if (!form || !fileInput || !preview || !btnSalvar) return;

  function formatKB(bytes) {
    const kb = bytes / 1024;
    return kb < 1024 ? `${Math.max(1, Math.round(kb))} KB` : `${(kb/1024).toFixed(2)} MB`;
  }

  function renderPreview() {
    const files = Array.from(fileInput.files || []);
    preview.innerHTML = "";

    if (!files.length) {
      preview.classList.add("vazio");
      preview.innerHTML = "<em>Nenhum arquivo selecionado.</em>";
      btnSalvar.disabled = true;
      if (btnCancelar) btnCancelar.hidden = true;
      return;
    }

    preview.classList.remove("vazio");
    files.forEach((f) => {
      const row = document.createElement("div");
      row.className = "file-row";
      row.innerHTML = `
        <span class="file-name">${f.name}</span>
        <span class="file-size">${formatKB(f.size)}</span>
        <input type="text" name="aprovadoPor[]" placeholder="Aprovado por...">
      `;
      preview.appendChild(row);
    });

    btnSalvar.disabled = false;
    if (btnCancelar) btnCancelar.hidden = false;
  }

  // QUANDO SELECIONA ARQUIVO
  fileInput.addEventListener("change", () => renderPreview());

  // BOTÃO CANCELAR
  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      fileInput.value = "";
      renderPreview();
    });
  }

  // SUBMIT
  form.addEventListener("submit", () => {
    if (!fileInput.files || !fileInput.files.length) return;
    btnSalvar.disabled = true;
    btnSalvar.innerHTML = "Enviando...";
  });

  // 🔹 Chamada inicial
  renderPreview();
})();
