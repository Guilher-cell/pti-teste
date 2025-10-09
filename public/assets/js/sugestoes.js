// assets/js/sugestoes.js
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal-nova-sugestao");
  const btn = document.getElementById("btn-nova-sugestao");
  const close = modal.querySelector(".close");

  btn.addEventListener("click", () => modal.style.display = "flex");
  close.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
});
