(() => {
  // Seleciona o input de CNPJ dentro do formulário
  const cnpjInput = document.querySelector('.form-solicite-demonstracao input[placeholder="CNPJ"]');

  if (cnpjInput) {
    cnpjInput.addEventListener('input', () => {
      let value = cnpjInput.value.replace(/\D/g, ''); // remove tudo que não for número
      value = value.slice(0, 14); // limita a 14 dígitos

      // Aplica a máscara: XX.XXX.XXX/XXXX-XX
      value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');

      cnpjInput.value = value;
    });
  }
})();