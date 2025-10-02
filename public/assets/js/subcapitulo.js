  // Toggle da orientação do documento
  document.querySelectorAll('.subcap-hint-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const body = btn.parentElement.querySelector('.subcap-hint-body');
      body.hidden = expanded;
    });
  });

  // Toggles "Ler mais" de cada item
  document.querySelectorAll('.subcap-checklist .more').forEach(link => {
    link.addEventListener('click', () => {
      const id = link.getAttribute('data-target');
      const body = document.getElementById(id);
      if (!body) return;
      body.hidden = !body.hidden;
      link.textContent = body.hidden ? 'Ler mais' : 'Ocultar';
    });
  });

  // Pré-visualização e campo "Aprovado por"
(function () {
  const form = document.getElementById('form-upload-capitulo');
  if (!form) return;

  const fileInput = document.getElementById('file-upload');
  const preview = document.getElementById('file-preview');
  const btnCarregar = document.getElementById('btn-carregar');
  const aprovadoBatch = document.getElementById('aprovado-por-input');

  function formatKB(bytes) {
    return Math.max(1, Math.round(bytes / 1024)) + ' KB';
  }

  fileInput.addEventListener('change', () => {
    preview.innerHTML = '';
    const files = Array.from(fileInput.files || []);
    if (!files.length) {
      preview.classList.add('vazio');
      preview.innerHTML = '<em>Nenhum arquivo selecionado.</em>';
      btnCarregar.disabled = true;
      return;
    }
    preview.classList.remove('vazio');
    files.forEach((f) => {
      const row = document.createElement('div');
      row.className = 'file-row';
      row.innerHTML = `
        <span class="file-name">${f.name}</span>
        <span class="file-size">${formatKB(f.size)}</span>
      `;
      preview.appendChild(row);
    });
    btnCarregar.disabled = false;
  });

  // Antes de enviar: cria inputs ocultos aprovador
  form.addEventListener('submit', () => {
    form.querySelectorAll('input[name="aprovadoPor[]"]').forEach(el => el.remove());
    const val = (aprovadoBatch.value || '').trim();
    const files = Array.from(fileInput.files || []);
    files.forEach(() => {
      const hid = document.createElement('input');
      hid.type = 'hidden';
      hid.name = 'aprovadoPor[]';
      hid.value = val;
      form.appendChild(hid);
    });
  });
})();
