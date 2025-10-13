/* ========= SCRIPT ORIGINAL ========= */
(() => {
  let pointerDownOnOverlay = false;

  /* ========= PARTE 1: Helpers Globais (Abrir / Fechar Modais) ========= */
  function resetInputs(modal) {
    if (!modal) return;
    modal.querySelectorAll("input, textarea").forEach(i => (i.value = ""));
  }

  function abrirModal(modalId) {
    document.querySelectorAll(".modal, .modal-excluir").forEach(m => {
      m.style.display = "none";
      m.classList.remove("fechando");
    });

    const modal = document.getElementById(modalId);
    if (!modal) return;

    const content = modal.querySelector(".modal-content, .modal-excluir-content");
    modal.style.display = "flex";
    modal.classList.remove("fechando");

    if (content) {
      content.style.animation = "none";
      content.offsetHeight;
      content.style.animation = "aparecer 0.6s ease forwards";
    }

    document.body.style.overflow = "hidden";
  }

  function fecharModal(modal) {
    if (!modal) return;
    const content = modal.querySelector(".modal-content, .modal-excluir-content");
    modal.classList.add("fechando");

    if (content) {
      content.style.animation = "none";
      content.offsetHeight;
      content.style.animation = "desaparecer 0.4s ease forwards";

      content.addEventListener(
        "animationend",
        () => {
          if (modal.classList.contains("fechando")) {
            modal.style.display = "none";
            modal.classList.remove("fechando");
            content.style.animation = "";
            document.body.style.overflow = "";
            resetInputs(modal);
          }
        },
        { once: true }
      );
    } else {
      modal.style.display = "none";
      modal.classList.remove("fechando");
      document.body.style.overflow = "";
      resetInputs(modal);
    }
  }

  function fecharTodosModais() {
    document.querySelectorAll(".modal, .modal-excluir").forEach(m => fecharModal(m));
  }

  // Fecha com ESC
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fecharTodosModais();
  });

  // Fecha clicando fora
  window.addEventListener("pointerdown", e => {
    pointerDownOnOverlay = e.target?.classList?.contains("modal");
  });
  window.addEventListener("pointerup", e => {
    if (pointerDownOnOverlay && e.target?.classList?.contains("modal")) fecharModal(e.target);
    pointerDownOnOverlay = false;
  });

  /* ========= PARTE 2: Configuração de Modais ========= */
  const btnCriarPasta = document.getElementById("btn-criar-pasta");
  const modalCriarPasta = document.getElementById("modal-criar-pasta");
  const formCriarPasta = document.getElementById("form-criar-pasta");

  if (btnCriarPasta && modalCriarPasta && formCriarPasta) {
    btnCriarPasta.addEventListener("click", () => abrirModal("modal-criar-pasta"));

    const closeBtn = modalCriarPasta.querySelector(".close");
    if (closeBtn) closeBtn.addEventListener("click", () => fecharModal(modalCriarPasta));

    formCriarPasta.addEventListener("submit", () => fecharModal(modalCriarPasta));
  }

  /* ========= PARTE 3: Upload de Documentos (com nome dinâmico) ========= */
  function configurarUpload(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    const fileInput = form.querySelector("#file-upload");
    const preview = form.querySelector("#file-preview");
    const btnSalvar = form.querySelector("#btn-salvar");
    const btnCancelar = form.querySelector("#btn-cancelar");

    if (!fileInput || !preview || !btnSalvar) return;

    function formatKB(bytes) {
      const kb = bytes / 1024;
      return kb < 1024
        ? `${Math.max(1, Math.round(kb))} KB`
        : `${(kb / 1024).toFixed(2)} MB`;
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

      files.forEach((f, index) => {
        const row = document.createElement("div");
        row.className = "file-row";
        row.innerHTML = `
          <span class="file-name" id="file-name-${index}">${f.name}</span>
          <span class="file-size">${formatKB(f.size)}</span>
          <input type="text" name="nomesPersonalizados[]" placeholder="Nome do arquivo..." required>
          <input type="text" name="aprovadoPor[]" placeholder="Aprovado por...">
        `;

        const inputNome = row.querySelector('input[name="nomesPersonalizados[]"]');
        const nameSpan = row.querySelector(".file-name");

        // Atualiza o nome do arquivo dinamicamente conforme digita
        inputNome.addEventListener("input", () => {
          const nome = inputNome.value.trim();
          nameSpan.textContent = nome !== "" ? nome : f.name;
        });

        preview.appendChild(row);
      });

      btnSalvar.disabled = false;
      if (btnCancelar) btnCancelar.hidden = false;
    }

    fileInput.addEventListener("change", renderPreview);

    if (btnCancelar) {
      btnCancelar.addEventListener("click", () => {
        fileInput.value = "";
        renderPreview();
      });
    }

    form.addEventListener("submit", () => {
      if (!fileInput.files || !fileInput.files.length) return;
      btnSalvar.disabled = true;
      btnSalvar.textContent = "Salvando...";
    });

    renderPreview();
  }

  // Aplica à página de Documentos Gerais
  configurarUpload("form-documentos");
})();

/* ========= SCRIPT NOVO (integrado sem sobrescrever o anterior) ========= */
(() => {
  // Reusa funções globais se existirem
  const abrirModal = window.abrirModal || function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "flex";
  };

  const fecharModal = window.fecharModal || function(modal) {
    if (modal) modal.style.display = "none";
  };

  // Exporta helpers
  window.__docHelpers = { abrirModal, fecharModal, setupModal };

  function setupModal(triggerId, modalId, options = {}) {
    const trigger = document.getElementById(triggerId);
    const modal   = document.getElementById(modalId);
    if (!trigger || !modal) return;

    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModal(modalId);
      if (options.closeMenu) options.closeMenu();
    });

    const closeBtn = modal.querySelector(".close");
    if (closeBtn) closeBtn.addEventListener("click", () => fecharModal(modal));

    const cancelBtn = modal.querySelector(".btn-cancelar, .cancelar");
    if (cancelBtn) cancelBtn.addEventListener("click", () => fecharModal(modal));

    const form = modal.querySelector("form");
    if (form) form.addEventListener("submit", () => fecharModal(modal));

    window.addEventListener("click", (e) => {
      if (e.target === modal) fecharModal(modal);
    });
  }

  /* ========= MENU DE OPÇÕES DETALHE DOCUMENTO ========= */
  const detalheOpcoes = document.querySelector(".detalhe-header .pasta-opcoes");
  if (detalheOpcoes) {
    const btnOpcoes = detalheOpcoes.querySelector(".btn-opcoes");
    if (btnOpcoes) {
      btnOpcoes.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        detalheOpcoes.classList.toggle("ativo");
      });
      document.addEventListener("click", (e) => {
        if (!detalheOpcoes.contains(e.target)) {
          detalheOpcoes.classList.remove("ativo");
        }
      });
    }
  }

  // Configura modais de pasta
  setupModal("btn-criar-pasta",  "modal-criar-pasta");
  setupModal("btn-editar-pasta", "modal-editar-pasta", { closeMenu: () => detalheOpcoes?.classList.remove("ativo") });
  setupModal("btn-excluir-pasta","modal-excluir-pasta", { closeMenu: () => detalheOpcoes?.classList.remove("ativo") });

  /* ========= UPLOADS ADICIONAIS (Subcapítulos) ========= */
  function configurarUploadExtra(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    const fileInput = form.querySelector("#file-upload");
    const preview = form.querySelector("#file-preview");
    const btnSalvar = form.querySelector("#btn-salvar");
    const btnCancelar = form.querySelector("#btn-cancelar");
    if (!fileInput || !preview) return;

    fileInput.addEventListener("change", () => {
      const files = Array.from(fileInput.files);
      preview.innerHTML = "";
      if (!files.length) {
        preview.innerHTML = "<em>Nenhum arquivo selecionado.</em>";
        return;
      }
      files.forEach(f => {
        const row = document.createElement("div");
        row.className = "file-row";
        row.innerHTML = `<span class="file-name">${f.name}</span><span class="file-size">${(f.size/1024).toFixed(1)} KB</span>`;
        preview.appendChild(row);
      });
      btnSalvar.disabled = false;
      if (btnCancelar) btnCancelar.hidden = false;
    });
  }

  configurarUploadExtra("form-subcap");
})();
