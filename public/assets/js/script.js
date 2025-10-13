document.addEventListener("DOMContentLoaded", () => {
  // =======================================================
  // MENUS HEADER (Notificação + Hamburguer)
  // =======================================================
  const notif = document.querySelector(".menu-notificacao");
  const menuHamburguer = document.getElementById("menuHamburguer");
  const submenu = document.querySelector(".submenu-hamburguer");
  const nomeStrong = document.querySelector(".submenu-usuario-texto span strong");

  function ajustarSubmenuLargura() {
    if (!submenu || !nomeStrong) return;
    if (nomeStrong.scrollWidth > nomeStrong.offsetWidth) {
      submenu.classList.add("nome-longo");
    } else {
      submenu.classList.remove("nome-longo");
    }
  }

  window.addEventListener("load", ajustarSubmenuLargura);
  window.addEventListener("resize", ajustarSubmenuLargura);

  // =======================================================
  // MENU DROPDOWN RESPONSIVO ("MENU ▼")
  // =======================================================
  const dropdown = document.querySelector(".menu-dropdown");
  const toggle = document.querySelector(".dropdown-toggle");

  function fecharDropdown() {
    if (dropdown) dropdown.classList.remove("active");
  }

  if (toggle && dropdown) {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("active");
      if (notif) notif.classList.remove("aberto");
      if (menuHamburguer) menuHamburguer.classList.remove("active");
    });
  }

  // =======================================================
  // NOTIFICAÇÃO (Sininho)
  // =======================================================
  if (notif) {
    notif.addEventListener("click", (e) => {
      e.stopPropagation();
      notif.classList.toggle("aberto");
      if (menuHamburguer) menuHamburguer.classList.remove("active");
      fecharDropdown(); // fecha o dropdown se estiver aberto
    });
  }

  // =======================================================
  // MENU HAMBURGUER
  // =======================================================
  if (menuHamburguer) {
    menuHamburguer.addEventListener("click", (e) => {
      e.stopPropagation();
      menuHamburguer.classList.toggle("active");
      if (notif) notif.classList.remove("aberto");
      fecharDropdown(); // fecha o dropdown se aberto
      ajustarSubmenuLargura();
    });
  }

  // =======================================================
  // FECHAR MENUS AO CLICAR FORA
  // =======================================================
  document.addEventListener("click", () => {
    if (notif) notif.classList.remove("aberto");
    if (menuHamburguer) menuHamburguer.classList.remove("active");
    fecharDropdown();
  });

  // =======================================================
  // FECHAR MENUS COM ESC
  // =======================================================
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (notif) notif.classList.remove("aberto");
      if (menuHamburguer) menuHamburguer.classList.remove("active");
      fecharDropdown();
    }
  });

  // =======================================================
  // UPLOAD DE FICHEIROS (Preview + Aprovadores)
  // =======================================================
  const inputFicheiros = document.getElementById("file-upload");
  const previewList = document.getElementById("preview-list");
  const aprovadoresWrapper = document.getElementById("aprovadores-wrapper");

  if (inputFicheiros && previewList && aprovadoresWrapper) {
    inputFicheiros.addEventListener("change", () => {
      previewList.innerHTML = "";
      aprovadoresWrapper.innerHTML = "";

      Array.from(inputFicheiros.files).forEach((file) => {
        // Preview do arquivo
        const li = document.createElement("li");
        li.textContent = `${file.name} — ${(file.size / 1024).toFixed(2)} KB`;
        previewList.appendChild(li);

        // Campo “Aprovado por”
        const row = document.createElement("div");
        row.className = "aprovador-row";
        row.innerHTML = `
          <label>Aprovado por:</label>
          <input type="text" name="aprovadoPor[]" placeholder="Nome de quem aprovou" required>
        `;
        aprovadoresWrapper.appendChild(row);
      });
    });
  }

  // =======================================================
  // MODAIS (Editar / Excluir Pasta / Logout)
  // =======================================================
  const btnEditar = document.getElementById("btn-editar-pasta");
  const btnApagar = document.getElementById("btn-excluir-pasta");
  const modalEditar = document.getElementById("modal-editar-pastas");
  const modalApagar = document.getElementById("modal-excluir-pasta");
  const modalLogout = document.getElementById("modal-logout");

  const abrirModal = (modal) => {
    if (modal) modal.style.display = "flex";
  };

  const fecharModal = (modal) => {
    if (modal) modal.style.display = "none";
  };

  if (btnEditar) btnEditar.addEventListener("click", () => abrirModal(modalEditar));
  if (btnApagar) btnApagar.addEventListener("click", () => abrirModal(modalApagar));

  // Fecha ao clicar no botão X ou “Cancelar”
  document.querySelectorAll(".modal .close, .btn-cancelar, #btn-cancelar-logout").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal, .modal-excluir, .modal-logout");
      fecharModal(modal);
    });
  });

  // Fecha clicando fora do modal
  window.addEventListener("click", (e) => {
    if (
      e.target.classList.contains("modal") ||
      e.target.classList.contains("modal-excluir") ||
      e.target.classList.contains("modal-logout")
    ) {
      fecharModal(e.target);
    }
  });

  // Logout (abre modal)
  document.querySelectorAll(".sair").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModal(modalLogout);
    });
  });
});
