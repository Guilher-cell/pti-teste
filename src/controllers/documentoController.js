const DocumentoModel = require('../Schemas/documentoSchema');
const FicheiroModel = require('../Schemas/ficheiroSchema');

// ===============================
// MOSTRA A PÁGINA PRINCIPAL COM TODAS AS PASTAS
// ===============================
exports.index = async (req, res) => {
  try {
    const documentos = await DocumentoModel
      .find({ owner: req.session.user._id })
      .sort({ createdAt: -1 });

    res.render('documentos', { documentos: documentos });
  } catch (e) {
    console.log('ERRO AO BUSCAR DOCUMENTOS:', e);
    req.flash('errors', 'Ocorreu um erro ao carregar os seus documentos.');
    return req.session.save(() => res.redirect('/'));
  }
};

// ===============================
// PROCESSA A CRIAÇÃO DE UMA NOVA PASTA
// ===============================
exports.criar = async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      req.flash('errors', 'O nome do documento é obrigatório.');
      return req.session.save(() => res.redirect('/documentos'));
    }

    await DocumentoModel.create({
      nome: nome,
      descricao: descricao,
      owner: req.session.user._id
    });

    req.flash('success', `A pasta "${nome}" foi criada com sucesso!`);
    return req.session.save(() => res.redirect('/documentos'));
  } catch (e) {
    console.log('ERRO AO CRIAR DOCUMENTO:', e);
    req.flash('errors', 'Ocorreu um erro no sistema ao tentar criar o documento.');
    return req.session.save(() => res.redirect('/documentos'));
  }
};

// ===============================
// MOSTRA A PÁGINA DE DETALHES DE UMA PASTA (E SEUS FICHEIROS)
// ===============================
exports.detalhe = async (req, res) => {
  try {
    const documento = await DocumentoModel.findOne({
      _id: req.params.id,
      owner: req.session.user._id
    }).populate('ficheiros'); // Busca os ficheiros completos

    if (!documento) {
      req.flash('errors', 'Documento não encontrado ou você não tem permissão para acedê-lo.');
      return req.session.save(() => res.redirect('/documentos'));
    }

    console.log("Render documentoDetalhe:", documento._id);
    res.render('documentoDetalhe', { documento: documento });
  } catch (e) {
    console.log('ERRO AO BUSCAR DETALHE DO DOCUMENTO:', e);
    req.flash('errors', 'Ocorreu um erro ao carregar o documento.');
    return req.session.save(() => res.redirect('/documentos'));
  }
};

// ===============================
// PROCESSA A EDIÇÃO DE UMA PASTA
// ===============================
exports.editar = async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      req.flash('errors', 'O nome do documento não pode ficar em branco.');
      return req.session.save(() => res.redirect(`/documentos/${req.params.id}`));
    }

    const documento = await DocumentoModel.findOneAndUpdate(
      { _id: req.params.id, owner: req.session.user._id },
      { nome: nome, descricao: descricao },
      { new: true, runValidators: true }
    );

    if (!documento) {
      req.flash('errors', 'Documento não encontrado ou você não tem permissão para editá-lo.');
      return req.session.save(() => res.redirect('/documentos'));
    }

    req.flash('success', 'Pasta atualizada com sucesso!');
    return req.session.save(() => res.redirect(`/documentos/${req.params.id}`));
  } catch (e) {
    console.log('ERRO AO EDITAR DOCUMENTO:', e);
    req.flash('errors', 'Ocorreu um erro no sistema ao tentar editar a pasta.');
    return req.session.save(() => res.redirect(`/documentos/${req.params.id}`));
  }
};

// ===============================
// PROCESSA A EXCLUSÃO DE UMA PASTA
// ===============================
exports.apagar = async (req, res) => {
  try {
    const documento = await DocumentoModel.findOne({
      _id: req.params.id,
      owner: req.session.user._id
    });

    if (!documento) {
      req.flash('errors', 'Documento não encontrado ou você não tem permissão para apagá-lo.');
      return req.session.save(() => res.redirect('/documentos'));
    }

    // Apaga todos os ficheiros associados (Mongo)
    await FicheiroModel.deleteMany({ documento: documento._id });

    // Apaga o documento em si
    await documento.deleteOne();

    req.flash('success', `A pasta "${documento.nome}" foi apagada com sucesso.`);
    return req.session.save(() => res.redirect('/documentos'));
  } catch (e) {
    console.log('ERRO AO APAGAR DOCUMENTO:', e);
    req.flash('errors', 'Ocorreu um erro no sistema ao tentar apagar a pasta.');
    return req.session.save(() => res.redirect('/documentos'));
  }
};
