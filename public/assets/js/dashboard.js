/*document.addEventListener("DOMContentLoaded", () => {
  const iso9001Card = document.getElementById("iso9001-card");
  const iso9001Btn = document.getElementById("iso9001-btn");
  const iso9001Status = document.getElementById("iso9001-status");

  iso9001Btn.addEventListener("click", () => {
    // se já está ativo, só deixa seguir para a página
    if (!iso9001Card.classList.contains("ativo")) {
      // adiciona classe ativo
      iso9001Card.classList.add("ativo");

      // muda status visual
      iso9001Status.textContent = "Ativo";
      iso9001Status.className = "status-badge ativo";

      // muda descrição do card
      const desc = iso9001Card.querySelector("p");
      desc.textContent = "Gestão da qualidade em andamento.";
    }

    // daqui ele segue o link normalmente para gerenciar.html
  });
});
*/