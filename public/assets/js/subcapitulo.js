(() => {
  const form = document.getElementById("form-subcap");
  const fileInput = document.getElementById("file-upload");
  const preview = document.getElementById("file-preview");
  const btnSalvar = document.getElementById("btn-salvar");
  const btnCancelar = document.getElementById("btn-cancelar");

  if (!form || !fileInput || !preview || !btnSalvar) return;

  // =====================================================
  // 🔹 Formata tamanho dos arquivos
  // =====================================================
  function formatKB(bytes) {
    const kb = bytes / 1024;
    return kb < 1024
      ? `${Math.max(1, Math.round(kb))} KB`
      : `${(kb / 1024).toFixed(2)} MB`;
  }

  // =====================================================
  // 🔹 Renderiza a pré-visualização dos arquivos
  // =====================================================
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

    files.forEach((f, index) => {
      const row = document.createElement("div");
      row.className = "file-row";

      // 🔹 Estrutura do preview
      row.innerHTML = `
        <span class="file-name" id="file-name-${index}">${f.name}</span>
        <span class="file-size">${formatKB(f.size)}</span>
        <input type="text" name="nomesPersonalizados[]" placeholder="Nome do arquivo..." required>
        <input type="text" name="aprovadoPor[]" placeholder="Aprovado por...">
      `;

      const inputNome = row.querySelector('input[name="nomesPersonalizados[]"]');
      const nameSpan = row.querySelector(".file-name");

      // 🔹 Atualiza o nome em tempo real enquanto digita
      inputNome.addEventListener("input", () => {
        const nome = inputNome.value.trim();
        nameSpan.textContent = nome !== "" ? nome : f.name;
      });

      // 🔹 Mantém o input sempre visível, sem esconder
      inputNome.addEventListener("blur", () => {
        const nome = inputNome.value.trim();
        if (nome.length > 0) {
          nameSpan.classList.add("confirmado");
        } else {
          nameSpan.classList.remove("confirmado");
          nameSpan.textContent = f.name;
        }
      });

      preview.appendChild(row);
    });

    btnSalvar.disabled = false;
    if (btnCancelar) btnCancelar.hidden = false;
  }

  // =====================================================
  // 🔹 Eventos principais
  // =====================================================
  fileInput.addEventListener("change", renderPreview);

  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      fileInput.value = "";
      renderPreview();
    });
  }

  form.addEventListener("submit", () => {
    // Calcula total de checklists
    const totalChecks = document.querySelectorAll(".chk-item").length;

    // Cria/atualiza hidden input
    let hidden = form.querySelector('input[name="__total_checks"]');
    if (!hidden) {
      hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = "__total_checks";
      form.appendChild(hidden);
    }
    hidden.value = totalChecks;

    // Feedback visual
    if (!fileInput.files || !fileInput.files.length) return;
    btnSalvar.disabled = true;
    btnSalvar.innerHTML = "Salvando...";
  });

  // Inicializa preview
  renderPreview();

  // =====================================================
  // 🔸 TOGGLES: Orientação e Ler mais
  // =====================================================
  document.querySelectorAll(".subcap-hint-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      const body = btn.parentElement.querySelector(".subcap-hint-body");
      if (body) body.hidden = expanded;
    });
  });

  document.querySelectorAll(".subcap-checklist .more").forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.getAttribute("data-target");
      const body = document.getElementById(id);
      if (!body) return;
      body.hidden = !body.hidden;
      link.textContent = body.hidden ? "Ler mais" : "Ocultar";
    });
  });
})();
