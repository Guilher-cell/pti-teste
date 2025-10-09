document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal-novo-bug");
  const btnNovoBug = document.getElementById("btn-novo-bug");
  const spanClose = modal.querySelector(".close");

  // Abre o modal
  btnNovoBug.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  // Fecha ao clicar no X
  spanClose.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Fecha ao clicar fora do modal
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});
