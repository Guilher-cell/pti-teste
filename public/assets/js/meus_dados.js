// Seleciona inputs pelo ID
const inputCNPJ = document.getElementById('cnpj');
const inputCEP = document.getElementById('CEP'); // corrigi para o mesmo id do HTML

// Máscara CNPJ
if (inputCNPJ) {
  inputCNPJ.addEventListener('input', () => {
    let valor = inputCNPJ.value.replace(/\D/g, ""); // apenas dígitos
    valor = valor.replace(/^(\d{2})(\d)/, "$1.$2");
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    valor = valor.replace(/\.(\d{3})(\d)/, ".$1/$2");
    valor = valor.replace(/(\d{4})(\d)/, "$1-$2");
    inputCNPJ.value = valor.substring(0, 18); // máximo 18 caracteres
  });
}

// Máscara CEP
if (inputCEP) {
  inputCEP.addEventListener('input', () => {
    let valor = inputCEP.value.replace(/\D/g, ""); // apenas dígitos
    valor = valor.replace(/^(\d{5})(\d)/, "$1-$2");
    inputCEP.value = valor.substring(0, 9); // máximo 9 caracteres
  });
}


if (inputCEP) {
  inputCEP.addEventListener("input", async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const res = await fetch(`/api/cep/${cep}`);
        if (!res.ok) throw new Error("Erro ao consultar o servidor");

        const data = await res.json();

        const endereco = document.getElementById("Endereco");
        const bairro = document.getElementById("Bairro");
        const cidade = document.getElementById("Cidade");
        const estado = document.getElementById("Estado");

        if (endereco) endereco.value = data.logradouro || '';
        if (bairro) bairro.value = data.bairro || '';
        if (cidade) cidade.value = data.localidade || '';
        if (estado) estado.value = data.uf || '';

      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      }
    }
  });
}

