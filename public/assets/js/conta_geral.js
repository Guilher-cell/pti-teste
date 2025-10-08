(() => {
  const modal = document.getElementById("modal-logout");
  if (!modal) return;

  const content = modal.querySelector(".modal-logout-content");

  let closing = false;
  let onEnd   = null;

  function lockScroll(lock) {
    document.body.style.overflow = lock ? "hidden" : "";
  }

  function abrirModalLogout() {
    if (closing) return;
    modal.style.display = "flex";
    modal.classList.remove("fechando");

    // força animação de aparecer
    content.style.animation = "none";
    // reflow
    // eslint-disable-next-line no-unused-expressions
    content.offsetHeight;
    content.style.animation = "aparecer 0.6s ease forwards";

    lockScroll(true);
  }

  function fecharModalLogout() {
    if (closing || modal.style.display !== "flex") return;
    closing = true;

    if (onEnd) {
      content.removeEventListener("animationend", onEnd);
      onEnd = null;
    }

    modal.classList.add("fechando");

    // força animação de desaparecer
    content.style.animation = "none";
    content.offsetHeight;
    content.style.animation = "desaparecer 0.4s ease forwards";

    onEnd = (e) => {
      if (e.animationName !== "desaparecer") return;
      content.removeEventListener("animationend", onEnd);
      onEnd = null;

      modal.style.display = "none";
      modal.classList.remove("fechando");
      content.style.animation = "";
      lockScroll(false);
      closing = false;
    };
    content.addEventListener("animationend", onEnd);
  }

  // Fechar SOMENTE com ESC
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fecharModalLogout();
  });

  // Expor para abrir/fechar programaticamente
  window.abrirModalLogout  = abrirModalLogout;
  window.fecharModalLogout = fecharModalLogout;
})();
