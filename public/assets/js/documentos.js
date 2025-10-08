/* ========= PARTE 1: Helpers Globais (Abrir / Fechar Modais) ========= */
(() => {
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

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal, .modal-excluir").forEach(m => fecharModal(m));
    }
  });

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
      if (e.target === modal) {
        fecharModal(modal);
      }
    });
  }

  window.__docHelpers = { abrirModal, fecharModal, setupModal };
})();

/* ========= PARTE 2: Detalhe Documento (Upload) ========= */
(() => {
  const { setupModal } = window.__docHelpers;

  // Menu 3 pontinhos
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

  // Modais
  setupModal("btn-criar-pasta",  "modal-criar-pasta");
  setupModal("btn-editar-pasta", "modal-editar-pastas", { closeMenu: () => detalheOpcoes?.classList.remove("ativo") });
  setupModal("btn-excluir-pasta","modal-excluir-pasta", { closeMenu: () => detalheOpcoes?.classList.remove("ativo") });

  /* ===== Upload de Arquivos ===== */
 (() => {
  const form     = document.getElementById("form-subcap");
  const fileInput= document.getElementById("file-upload");
  const preview  = document.getElementById("file-preview");

  if (!form || !fileInput || !preview) return;

  function formatKB(bytes) {
    return Math.max(1, Math.round(bytes / 1024)) + " KB";
  }

  fileInput.addEventListener("change", () => {
    // 🔹 só mexe no preview, não mexe em mais nada do DOM
    preview.innerHTML = "";

    const files = Array.from(fileInput.files || []);
    if (!files.length) {
      preview.classList.add("vazio");
      preview.innerHTML = "<em>Nenhum arquivo selecionado.</em>";
      return;
    }

    preview.classList.remove("vazio");
    files.forEach(f => {
      const row = document.createElement("div");
      row.className = "file-row";
      row.innerHTML = `
        <span class="file-name">${f.name}</span>
        <span class="file-size">${formatKB(f.size)}</span>
        <input type="text" name="aprovadoPor[]" placeholder="Aprovado por...">
      `;
      preview.appendChild(row);
    });
  });

  // 🔹 Importante: NÃO tem preventDefault → deixa o form enviar normal
})();
})();
