document.addEventListener('DOMContentLoaded', () => {
  let editandoId = null;
  const form = document.getElementById('form-funcionario');
  const titulo = document.getElementById('form-titulo');
  const btnForm = document.getElementById('btn-form');
  const btnCancelar = document.getElementById('btn-cancelar');
  const tbody = document.querySelector('.tabela-funcionarios tbody');

  if (!form) return;

  const nomeInput = document.getElementById('nome');
  const usuarioInput = document.getElementById('usuario');
  const cargoInput = document.getElementById('cargo');
  const senhaInput = document.getElementById('senha');
  const permDash = document.getElementById('perm-dashboard');
  const permDocs = document.getElementById('perm-docs');

  const defaultAction = '/funcionarios/adicionar';
  form.action = defaultAction;

  // Editar funcionário
  if (tbody) {
    tbody.addEventListener('click', e => {
      const link = e.target.closest('a.editar');
      if (!link) return;
      e.preventDefault();

      const tr = link.closest('tr');
      editandoId = tr.dataset.id;

      nomeInput.value = tr.dataset.nome;
      usuarioInput.value = tr.dataset.usuario;
      cargoInput.value = tr.dataset.cargo;

      // 🔹 Corrigido: respeita atributos data-perm-dashboard e data-perm-docs
      permDash.checked = (tr.dataset.permDashboard === 'true');
      permDocs.checked = (tr.dataset.permDocs === 'true');

      // senha opcional na edição
      senhaInput.value = '';
      senhaInput.placeholder = "Digite uma nova senha (opcional)";
      senhaInput.removeAttribute('required');

      // 🔹 Bloqueia o campo "Usuário" na edição
      usuarioInput.disabled = true;

      titulo.textContent = 'Editar Funcionário';
      btnForm.textContent = 'Salvar alterações';
      btnForm.classList.add('salvar');
      btnCancelar.style.display = 'inline-block';

      form.action = `/funcionarios/${editandoId}/atualizar`;
    });
  }

  // Cancelar edição
  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => resetarFormulario());
  }

  function resetarFormulario() {
    editandoId = null;
    form.reset();
    form.action = defaultAction;
    titulo.textContent = 'Novo Funcionário';
    btnForm.textContent = 'Cadastrar';
    btnForm.classList.remove('salvar');
    btnCancelar.style.display = 'none';

    senhaInput.type = "password";
    senhaInput.placeholder = "Digite a senha de acesso";
    senhaInput.setAttribute('required', 'required');

    // 🔹 Reativa o campo "Usuário" no modo cadastro
    usuarioInput.disabled = false;
  }

  // Toggle senha (olhinho)
  const closedSrc = "Imagem/olho_senha/olho_fechado_tema_escuro.png";
  const openSrc   = "Imagem/olho_senha/olho_aberto_azul.png";

  document.querySelectorAll('.toggle-senha').forEach(toggle => {
    toggle.addEventListener('mousedown', e => e.preventDefault());
    toggle.addEventListener('click', () => {
      const container = toggle.closest('.input-senha-container');
      const input = container.querySelector('.input-senha');
      if (!input) return;
      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      toggle.src = visible ? closedSrc : openSrc;
    });
  });
});
