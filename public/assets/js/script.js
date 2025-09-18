document.addEventListener("DOMContentLoaded", () => {
  // =======================================================
  // MENUS HEADER
  // =======================================================
  const notif = document.querySelector(".menu-notificacao");
  const menuHamburguer = document.getElementById("menuHamburguer");

  if (notif) {
    notif.addEventListener("click", (e) => {
      e.stopPropagation();
      const estavaAberto = notif.classList.contains("aberto");
      notif.classList.remove("aberto");
      if (menuHamburguer) menuHamburguer.classList.remove("active");
      if (!estavaAberto) notif.classList.add("aberto");
    });
  }

  if (menuHamburguer) {
    menuHamburguer.addEventListener("click", function (e) {
      e.stopPropagation();
      const estavaAberto = this.classList.contains("active");
      if (notif) notif.classList.remove("aberto");
      this.classList.remove("active");
      if (!estavaAberto) this.classList.add("active");
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
  // UPLOAD DE FICHEIROS
  // =======================================================
  const form = document.querySelector(".form-upload");
  const inputFicheiro = document.querySelector(".input-ficheiro");
  const listaFicheiros = document.querySelector(".lista-ficheiros");
  const mensagemErro = document.querySelector(".mensagem-erro");
  const progressBar = document.querySelector(".progress-bar");
  const progressContainer = document.querySelector(".progress-container");

  const getDocumentoIdFromUrl = () => {
    const pathSegments = window.location.pathname.split("/");
    const documentoIndex = pathSegments.indexOf("documentos");
    if (documentoIndex !== -1 && pathSegments.length > documentoIndex + 1) {
      return pathSegments[documentoIndex + 1];
    }
    return null;
  };

  const documentoId = getDocumentoIdFromUrl();

  if (!documentoId) {
    console.error("Erro Crítico: O ID do documento não foi encontrado na URL.");
    if (form) form.style.display = "none";
    if (mensagemErro) {
      mensagemErro.textContent =
        "Não foi possível carregar o formulário de upload. O ID do documento está ausente na URL.";
      mensagemErro.style.color = "red";
    }
  }

  if (form && documentoId) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const ficheiro = inputFicheiro.files[0];
      if (!ficheiro) {
        mensagemErro.textContent = "Por favor, selecione um ficheiro para enviar.";
        mensagemErro.style.color = "orange";
        return;
      }

      const formData = new FormData();
      formData.append("file", ficheiro);

      if (progressContainer) progressContainer.style.display = "block";
      if (progressBar) progressBar.style.width = "0%";
      if (mensagemErro) {
        mensagemErro.textContent = `A carregar ${ficheiro.name}...`;
        mensagemErro.style.color = "#333";
      }

      try {
        const response = await fetch(`/documentos/${documentoId}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage =
            errorData?.error ||
            `Erro do servidor: ${response.statusText} (código: ${response.status})`;
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log("Upload bem-sucedido:", data);

        if (listaFicheiros) {
          const novoFicheiroDiv = document.createElement("div");
          novoFicheiroDiv.className =
            "ficheiro-item d-flex justify-content-between align-items-center border-bottom py-2";
          novoFicheiroDiv.innerHTML = `
            <span>
              <a href="${data.ficheiro.url}" target="_blank" rel="noopener noreferrer">
                ${data.ficheiro.nomeOriginal}
              </a>
              (${(data.ficheiro.size / 1024).toFixed(2)} KB)
            </span>
            <button class="btn btn-danger btn-sm btn-apagar-ficheiro" data-file-id="${data.ficheiro._id}">Apagar</button>
          `;
          listaFicheiros.appendChild(novoFicheiroDiv);
          novoFicheiroDiv
            .querySelector(".btn-apagar-ficheiro")
            .addEventListener("click", handleApagarClick);
        }

        mensagemErro.textContent = "Upload concluído com sucesso!";
        mensagemErro.style.color = "green";
        if (inputFicheiro) inputFicheiro.value = "";
      } catch (error) {
        console.error("Erro durante o upload:", error);
        if (mensagemErro) {
          mensagemErro.textContent = `Falha no upload: ${error.message}`;
          mensagemErro.style.color = "red";
        }
      } finally {
        setTimeout(() => {
          if (progressContainer) progressContainer.style.display = "none";
        }, 3000);
      }
    });
  }

  const handleApagarClick = async (e) => {
    const botao = e.target;
    const fileId = botao.dataset.fileId;

    if (!fileId || !documentoId) {
      console.error("Erro: ID do ficheiro ou do documento ausente para apagar.");
      return;
    }

    if (!confirm("Tem a certeza que deseja apagar este ficheiro?")) return;

    try {
      const response = await fetch(`/documentos/${documentoId}/file/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || "Falha ao apagar o ficheiro.";
        throw new Error(errorMessage);
      }

      console.log("Ficheiro apagado com sucesso.");
      botao.closest(".ficheiro-item").remove();
    } catch (error) {
      console.error("Erro ao apagar ficheiro:", error);
      if (mensagemErro) {
        mensagemErro.textContent = `Erro ao apagar: ${error.message}`;
        mensagemErro.style.color = "red";
      }
    }
  };

  document.querySelectorAll(".btn-apagar-ficheiro").forEach((botao) => {
    botao.addEventListener("click", handleApagarClick);
  });

  // =======================================================
  // MODAIS (EDITAR / APAGAR PASTA)
  // =======================================================
  const btnEditar = document.getElementById("btn-editar-pasta");
  const btnApagar = document.getElementById("btn-apagar-pasta");

  const modalEditar = document.getElementById("modal-editar-pasta");
  const modalApagar = document.getElementById("modal-apagar-pasta");

  const closeButtons = document.querySelectorAll(".modal .close");
  const cancelarButtons = document.querySelectorAll(".btn-cancelar");

  const abrirModal = (modal) => {
    if (modal) modal.style.display = "block";
  };

  const fecharModal = (modal) => {
    if (modal) modal.style.display = "none";
  };

  if (btnEditar) btnEditar.addEventListener("click", () => abrirModal(modalEditar));
  if (btnApagar) btnApagar.addEventListener("click", () => abrirModal(modalApagar));

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal");
      fecharModal(modal);
    });
  });

  cancelarButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal");
      fecharModal(modal);
    });
  });

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      fecharModal(e.target);
    }
  });
});
