(() => {
  const closedSrc = "Imagem/olho_senha/olho_fechado_tema_escuro.png";
  const openSrc   = "Imagem/olho_senha/olho_aberto_azul.png";

  // Toggle senha
  document.querySelectorAll('.toggle-senha').forEach(toggle => {
    toggle.addEventListener('mousedown', e => e.preventDefault());
    toggle.addEventListener('click', () => {
      const container = toggle.closest('.input-senha-container');
      const input = container?.querySelector('.input-senha');
      if (!input) return;
      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      toggle.src = visible ? closedSrc : openSrc;
    });
  });

  // Máscara CNPJ
  document.querySelectorAll('.input-cnpj').forEach(input => {
    input.addEventListener('input', () => {
      let value = input.value.replace(/\D/g, '').slice(0, 14);
      value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
      input.value = value;
    });
  });

  // Requisitos de senha (apenas criar conta)
  const senhaInput = document.querySelector(".senha-dupla-container .senha-principal");
  const rules = document.querySelector("#password-rules");

  if (senhaInput && rules) {
    const items = Array.from(rules.querySelectorAll("li"));

    // Garante que SEMPRE começa escondido quando a página abre
    window.addEventListener("DOMContentLoaded", () => {
      rules.classList.add("hidden");
    });

    // Mostrar ao focar
    senhaInput.addEventListener("focus", () => {
      rules.classList.remove("hidden");

      // Esconder ao clicar fora do input/rules
      const handleClickOutside = (e) => {
        if (!senhaInput.contains(e.target) && !rules.contains(e.target)) {
          rules.classList.add("hidden");
          document.removeEventListener("click", handleClickOutside);
        }
      };
      document.addEventListener("click", handleClickOutside);
    });

    // Atualizar regras conforme digita
    senhaInput.addEventListener("input", () => {
      const value = senhaInput.value;
      const checks = [
        /.{8,24}/.test(value),
        /[a-z]/.test(value) && /[A-Z]/.test(value),
        /\d/.test(value),
        /[!@#$%^&*(),.?":{}|<>_\-]/.test(value)
      ];
      items.forEach((li, i) => li.classList.toggle("valid", !!checks[i]));
    });
  }

  // Fechar com X
  document.querySelectorAll(".close").forEach(btn => {
    btn.addEventListener("click", () => {
      // Antes de sair, sempre esconde a lista
      if (rules) rules.classList.add("hidden");
      window.location.href = "index.html";
    });
  });

  // Fechar com ESC
  window.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (rules) rules.classList.add("hidden"); // garante escondido
      window.location.href = "index.html";
    }
  });
})();