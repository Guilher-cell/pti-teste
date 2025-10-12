(() => {
  const closedSrc = "/Imagem/olho_senha/olho_fechado_tema_escuro.png";
  const openSrc   = "/Imagem/olho_senha/olho_aberto_azul.png";

  // =========================
  // 1) Toggle de senha (mostrar/ocultar)
  // ========================= 
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

  // =========================
  // 2) Máscara CNPJ
  // =========================
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

  // =========================
  // 3) Helpers de validação
  // =========================
  function validarEmail(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  }
  function validarCNPJ(valor) {
    return /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(valor);
  }
  function validarUsuarioSimples(valor) {
    return /^[a-zA-Z0-9]+$/.test(valor);
  }

  // =========================
  // 4) Regras de senha (Criar Conta)
  // =========================
  const senhaInput = document.querySelector(".senha-dupla-container .senha-principal");
  const rules = document.querySelector("#password-rules");
  if (senhaInput && rules) {
    const items = Array.from(rules.querySelectorAll("li"));
    rules.classList.add("hidden");
    senhaInput.addEventListener("focus", () => {
      rules.classList.remove("hidden");
      const handleClickOutside = (e) => {
        if (!senhaInput.contains(e.target) && !rules.contains(e.target)) {
          rules.classList.add("hidden");
          document.removeEventListener("click", handleClickOutside);
        }
      };
      document.addEventListener("click", handleClickOutside);
    });
    senhaInput.addEventListener("input", () => {
      const value = senhaInput.value;
      const checks = [
        /^.{8,24}$/.test(value),
        /[a-z]/.test(value) && /[A-Z]/.test(value),
        /\d/.test(value),
        /[!@#$%^&*(),.?":{}|<>_\-]/.test(value)
      ];
      items.forEach((li, i) => li.classList.toggle("valid", !!checks[i]));
    });
  }

  // =========================
  // 5) Validação Criar Conta
  // =========================
  const formCriar = document.querySelector(".criar-conta");
  if (formCriar) {
    const inputs = formCriar.querySelectorAll("input[required]");
    const emailInput = formCriar.querySelector("input[type='email']");
    const cnpjInput = formCriar.querySelector(".input-cnpj");
    const checkbox = formCriar.querySelector(".checkbox-cadastrar input[type='checkbox']");
    const btnCadastrar = document.getElementById("btn-cadastrar");

    function validarCampos() {
      let valido = true;

      // Todos os campos obrigatórios devem ter valor
      inputs.forEach(input => {
        if (!input.value.trim()) valido = false;
      });

      // E-mail e CNPJ válidos
      if (!validarEmail(emailInput.value.trim())) valido = false;
      if (!validarCNPJ(cnpjInput.value.trim())) valido = false;

      // Checkbox marcado
      if (!checkbox.checked) valido = false;

      // Habilita ou desabilita o botão
      if (btnCadastrar) btnCadastrar.disabled = !valido;
    }

    // Atualiza em tempo real
    inputs.forEach(input => input.addEventListener("input", validarCampos));
    checkbox.addEventListener("change", validarCampos);

    // Chamada inicial
    validarCampos();
  }

  // =========================
  // 6) Validação Esqueci Minha Senha
  // =========================
  const inputRecuperar = document.getElementById("recuperar-input");
  const btnRecuperar = document.getElementById("btn-recuperar");
  if (inputRecuperar && btnRecuperar) {
    function validarCampoRecuperar() {
      const valor = inputRecuperar.value.trim();
      const valido = validarEmail(valor) || validarUsuarioSimples(valor);
      btnRecuperar.disabled = !valido;
    }
    inputRecuperar.addEventListener("input", validarCampoRecuperar);
    validarCampoRecuperar();
  }

  // =========================
  // 7) Regras de senha (Alterar Senha)
  // =========================
  const senhaAlterar = document.querySelector(".form-alterar-senha .senha-alterar");
  const rulesAlterar = document.querySelector("#password-rules-alterar");
  if (senhaAlterar && rulesAlterar) {
    const items = Array.from(rulesAlterar.querySelectorAll("li"));
    rulesAlterar.classList.add("hidden");
    senhaAlterar.addEventListener("focus", () => {
      rulesAlterar.classList.remove("hidden");
      const handleClickOutside = (e) => {
        if (!senhaAlterar.contains(e.target) && !rulesAlterar.contains(e.target)) {
          rulesAlterar.classList.add("hidden");
          document.removeEventListener("click", handleClickOutside);
        }
      };
      document.addEventListener("click", handleClickOutside);
    });
    senhaAlterar.addEventListener("input", () => {
      const value = senhaAlterar.value;
      const checks = [
        /^.{8,24}$/.test(value),
        /[a-z]/.test(value) && /[A-Z]/.test(value),
        /\d/.test(value),
        /[!@#$%^&*(),.?":{}|<>_\-]/.test(value)
      ];
      items.forEach((li, i) => li.classList.toggle("valid", !!checks[i]));
    });
  }

  // =========================
  // 8) Fechar com X e ESC
  // =========================
  document.querySelectorAll(".close").forEach(btn => {
    btn.addEventListener("click", () => {
      if (rules) rules.classList.add("hidden");
      if (rulesAlterar) rulesAlterar.classList.add("hidden");
      window.location.href = "/";
    });
  });
  window.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (rules) rules.classList.add("hidden");
      if (rulesAlterar) rulesAlterar.classList.add("hidden");
      window.location.href = "/";
    }
  });

  // =========================
  // 9) Verificação em Duas Etapas (2FA)
  // =========================
  const inputs2FA = Array.from(document.querySelectorAll('.codigo-2fa'));
  const btn2FA = document.getElementById('btn-2fa');
  const hiddenCode = document.getElementById('codigo-final'); // 🔑 input hidden

  function atualizarCodigoFinal() {
    if (hiddenCode) {
      hiddenCode.value = inputs2FA.map(inp => inp.value).join('');
    }
  }

  function validar2FA() {
    const valido = inputs2FA.every(inp => inp.value.trim().length === 1);
    if (btn2FA) btn2FA.disabled = !valido;
    atualizarCodigoFinal();
  }

  function distribuirCodigo(digits, startIndex = 0) {
    const nums = digits.replace(/\D/g, '').slice(0, inputs2FA.length);
    if (!nums) return;
    let i = startIndex;
    for (const d of nums) {
      if (i >= inputs2FA.length) break;
      inputs2FA[i].value = d;
      i++;
    }
    const nextEmpty = inputs2FA.findIndex(inp => !inp.value);
    const focusIndex = nextEmpty === -1 ? inputs2FA.length - 1 : nextEmpty;
    inputs2FA[focusIndex].focus();
    validar2FA();
  }

  if (inputs2FA.length) {
    inputs2FA.forEach((input, idx) => {
      input.addEventListener('focus', () => setTimeout(() => input.select(), 0));
      input.addEventListener('beforeinput', (e) => {
        if (e.data && /\D/.test(e.data)) e.preventDefault();
      });
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(0, 1);
        if (input.value && idx < inputs2FA.length - 1) {
          inputs2FA[idx + 1].focus();
          inputs2FA[idx + 1].select();
        }
        validar2FA();
      });
      input.addEventListener('keydown', (e) => {
        const key = e.key;
        if (key === 'Backspace' && !input.value && idx > 0) {
          inputs2FA[idx - 1].focus();
          inputs2FA[idx - 1].select();
        } else if (key === 'ArrowLeft' && idx > 0) {
          e.preventDefault();
          inputs2FA[idx - 1].focus();
          inputs2FA[idx - 1].select();
        } else if (key === 'ArrowRight' && idx < inputs2FA.length - 1) {
          e.preventDefault();
          inputs2FA[idx + 1].focus();
          inputs2FA[idx + 1].select();
        }
      });
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text') || '';
        distribuirCodigo(text, idx);
      });
    });

    const cont = document.querySelector('.codigo-2fa-container');
    if (cont) {
      cont.addEventListener('paste', (e) => {
        if (!(e.target instanceof HTMLInputElement)) {
          e.preventDefault();
          const text = (e.clipboardData || window.clipboardData).getData('text') || '';
          distribuirCodigo(text, 0);
        }
      });
    }
  }

  // =========================
  // 10) Botão Reenviar Código (2FA)
  // =========================
  const btnReenviar = document.getElementById("btn-reenviar");
  if (btnReenviar) {
    btnReenviar.addEventListener("click", () => {
      let segundos = 30;
      btnReenviar.disabled = true;
      btnReenviar.textContent = `Reenviar em ${segundos}s…`;

      const intervalo = setInterval(() => {
        segundos--;
        btnReenviar.textContent = `Reenviar em ${segundos}s…`;
        if (segundos <= 0) {
          clearInterval(intervalo);
          btnReenviar.disabled = false;
          btnReenviar.textContent = "Reenviar código";
        }
      }, 1000);
    });
  }
})();
