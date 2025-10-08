document.addEventListener("DOMContentLoaded", () => {
  // =======================================================
  // MENUS HEADER
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

  if (notif) {
    notif.addEventListener("click", (e) => {
      e.stopPropagation();
      notif.classList.toggle("aberto");
      if (menuHamburguer) menuHamburguer.classList.remove("active");
    });
  }

  if (menuHamburguer) {
    menuHamburguer.addEventListener("click", (e) => {
      e.stopPropagation();
      menuHamburguer.classList.toggle("active");
      if (notif) notif.classList.remove("aberto");
      ajustarSubmenuLargura();
    });
  }

  document.addEventListener("click", () => {
    if (notif) notif.classList.remove("aberto");
    if (menuHamburguer) menuHamburguer.classList.remove("active");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (notif) notif.classList.remove("aberto");
      if (menuHamburguer) menuHamburguer.classList.remove("active");
    }
  });

  // =======================================================
  // UPLOAD DE FICHEIROS (preview + aprovadores)
  // =======================================================
  const inputFicheiros = document.getElementById("file-upload"); // seu input
  const previewList = document.getElementById("preview-list");
  const aprovadoresWrapper = document.getElementById("aprovadores-wrapper");

  if (inputFicheiros && previewList && aprovadoresWrapper) {
    inputFicheiros.addEventListener("change", () => {
      previewList.innerHTML = "";
      aprovadoresWrapper.innerHTML = "";

      Array.from(inputFicheiros.files).forEach((file) => {
        // preview do arquivo
        const li = document.createElement("li");
        li.textContent = `${file.name} — ${(file.size / 1024).toFixed(2)} KB`;
        previewList.appendChild(li);

        // input "Aprovado por"
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

  const abrirModal = (modal) => { if (modal) modal.style.display = "flex"; };
  const fecharModal = (modal) => { if (modal) modal.style.display = "none"; };

  if (btnEditar) btnEditar.addEventListener("click", () => abrirModal(modalEditar));
  if (btnApagar) btnApagar.addEventListener("click", () => abrirModal(modalApagar));

  document.querySelectorAll(".modal .close, .btn-cancelar, #btn-cancelar-logout").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal, .modal-excluir, .modal-logout");
      fecharModal(modal);
    });
  });

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal") ||
        e.target.classList.contains("modal-excluir") ||
        e.target.classList.contains("modal-logout")) {
      fecharModal(e.target);
    }
  });

  // Logout (links com classe sair)
  document.querySelectorAll(".sair").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModal(modalLogout);
    });
  });
});
