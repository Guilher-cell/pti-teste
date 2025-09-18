(() => {
  let pointerDownOnOverlay = false;

  // -----------------------
  // Função para resetar inputs
  // -----------------------
  function resetInputs(modal) {
    if (!modal) return;
    modal.querySelectorAll('input, textarea').forEach(input => input.value = '');
  }

  // -----------------------
  // Abrir modal
  // -----------------------
  function abrirModal(modalId) {
    document.querySelectorAll(".modal").forEach(m => {
      m.style.display = "none";
      m.classList.remove("fechando");
    });

    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.style.display = "flex";
    modal.classList.remove("fechando");
    document.body.style.overflow = "hidden";
  }

  // -----------------------
  // Fechar modal
  // -----------------------
  function fecharModal(modal) {
    if (!modal) return;
    modal.classList.add("fechando");

    modal.addEventListener("animationend", () => {
      if (modal.classList.contains("fechando")) {
        modal.style.display = "none";
        modal.classList.remove("fechando");
        document.body.style.overflow = "";
        resetInputs(modal);
      }
    }, { once: true });
  }

  function fecharTodosModais() {
    document.querySelectorAll(".modal").forEach(m => fecharModal(m));
  }

  // -----------------------
  // Abrir Criar Pasta
  // -----------------------
  const btnCriarPasta = document.getElementById('btn-criar-pasta');
  const modalCriarPasta = document.getElementById('modal-criar-pasta');
  const formCriarPasta = document.getElementById('form-criar-pasta');

  btnCriarPasta.addEventListener('click', () => abrirModal('modal-criar-pasta'));

  // Fechar X
  modalCriarPasta.querySelector('.close').addEventListener('click', () => fecharModal(modalCriarPasta));

  // Fechar clicando fora
  window.addEventListener('pointerdown', e => {
    pointerDownOnOverlay = e.target?.classList?.contains("modal");
  });
  window.addEventListener('pointerup', e => {
    if (pointerDownOnOverlay && e.target?.classList?.contains("modal")) fecharModal(e.target);
    pointerDownOnOverlay = false;
  });

  // Fechar com ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharTodosModais();
  });

  // Submeter formulário
  formCriarPasta.addEventListener('submit', () => {

    fecharModal(modalCriarPasta);
  });

})();