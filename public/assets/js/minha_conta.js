// =============================
// Alternar visibilidade da senha (olhinho)
// =============================
const closedSrc = "Imagem/olho_senha/olho_fechado_tema_escuro.png";
const openSrc   = "Imagem/olho_senha/olho_aberto_azul.png";

document.querySelectorAll('.toggle-senha').forEach(toggle => {
  // Evita que o mousedown foque o input errado
  toggle.addEventListener('mousedown', e => e.preventDefault());

  toggle.addEventListener('click', () => {
    const container = toggle.closest('.input-senha-container');
    if (!container) return;
    const input = container.querySelector('.input-senha');
    if (!input) return;

    const isVisible = input.type === 'text';
    input.type = isVisible ? 'password' : 'text';
    toggle.src = isVisible ? closedSrc : openSrc;

    toggle.classList.toggle('ativo', !isVisible);
  });
});

// =============================
// Requisitos de senha - Minha Conta
// =============================
const senhaMinhaConta = document.querySelector(".senha-minha-conta");
const rulesMinhaConta = document.querySelector("#password-rules-minha-conta");

if (senhaMinhaConta && rulesMinhaConta) {
  const items = Array.from(rulesMinhaConta.querySelectorAll("li"));

  // mostra regras quando foca no campo
  senhaMinhaConta.addEventListener("focus", () => {
    rulesMinhaConta.classList.remove("hidden");

    const handleClickOutside = (e) => {
      if (!senhaMinhaConta.contains(e.target) && !rulesMinhaConta.contains(e.target)) {
        rulesMinhaConta.classList.add("hidden");
        document.removeEventListener("click", handleClickOutside);
      }
    };
    document.addEventListener("click", handleClickOutside);
  });

  // valida requisitos em tempo real
  senhaMinhaConta.addEventListener("input", () => {
    const value = senhaMinhaConta.value;

    const checks = [
      /^.{8,24}$/.test(value),                            // entre 8 e 24 chars
      /[a-z]/.test(value) && /[A-Z]/.test(value),         // maiúscula + minúscula
      /\d/.test(value),                                   // número
      /[!@#$%^&*(),.?":{}|<>_\-]/.test(value)             // caractere especial
    ];

    items.forEach((li, i) => li.classList.toggle("valid", !!checks[i]));
  });
}
