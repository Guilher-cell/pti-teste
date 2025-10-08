function ativar2FA() {
  const card = document.getElementById("card-2fa");
  const status = document.getElementById("status-2fa");
  const texto = document.getElementById("texto-2fa");
  const botao = document.getElementById("btn-habilitar");

  // Atualiza o status
  status.textContent = "✔";
  status.classList.remove("status-nao-ativado");
  status.classList.add("status-ativado");

  // Atualiza o texto
  texto.innerHTML = `
    <p>
      <strong>Ótima notícia! Sua conta está protegida com autenticação de dois fatores (2FA).</strong>  
      Isso significa que, além da sua senha, será necessário um código adicional ao fazer login, garantindo mais segurança contra acessos não autorizados.
    </p>
  `;

  // Remove o botão
  if (botao) botao.remove();

  // Reduz a altura do card
  card.classList.add("habilitado");
}

// Exemplo: quando o backend confirmar que o 2FA foi ativado
// ativar2FA();
