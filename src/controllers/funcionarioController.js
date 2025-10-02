// src/controllers/funcionarioController.js
const Funcionario = require('../Schemas/funcionarioSchema');
const argon2 = require('argon2');
const Log = require("../Schemas/logSchema");
exports.index = async (req, res) => {
  try {
    const funcionarios = await Funcionario.find({ empresaId: req.session.user._id });
    return res.render('cadastrar_funcionarios', {
      csrfToken: req.csrfToken(),
      funcionarios,
    });
  } catch (err) {
    console.error('Erro ao carregar funcionários:', err);
    req.flash('errors', 'Erro ao carregar funcionários.');
    return req.session.save(() => res.redirect('/'));
  }
};

exports.salvar = async (req, res) => {
  try {
    const { nome, usuario, cargo, senha } = req.body;

    // Permissões podem vir como objeto (permissoes[dashboardISO]) OU como chaves "soltas"
    const p = req.body.permissoes || {};
    const dashboardISO =
      p.dashboardISO === 'true' || p.dashboardISO === 'on' || req.body['permissoes[dashboardISO]'] === 'true';
    const documentosGerais =
      p.documentosGerais === 'true' || p.documentosGerais === 'on' || req.body['permissoes[documentosGerais]'] === 'true';

    // hash de senha (mantendo a lógica aqui, já que seu schema atual não tem pre('save'))
    const hash = await argon2.hash(senha);

    const funcionario = new Funcionario({
      empresaId: req.session.user._id,
      nome,
      usuario,
      cargo,
      senha: hash,
      role: 'funcionario',
      permissoes: {
        dashboardISO,
        documentosGerais,
      },
    });

    await funcionario.save();

    await Log.create({
  usuarioId: req.session.user._id,
  empresaId: req.session.user._id,
  usuarioNome: req.session.user.user,
  acao: "Criou funcionário",
  modulo: "Funcionários",
  nomeDocumento: nome,        
  nomeArquivo: cargo,           
  aprovadoPor: JSON.stringify({  
    dashboardISO: funcionario.permissoes.dashboardISO,
    documentosGerais: funcionario.permissoes.documentosGerais
  })
});

    req.flash('success', 'Funcionário cadastrado com sucesso!');
    return req.session.save(() => res.redirect('/cadastrar-funcionario'));
  } catch (err) {
    // trata duplicidade de usuário
    if (err && err.code === 11000) {
      req.flash('errors', 'Já existe um funcionário com esse usuário.');
      return req.session.save(() => res.redirect('/cadastrar-funcionario'));
    }
    console.error('❌ Erro ao cadastrar funcionário:', err);
    req.flash('errors', 'Erro ao cadastrar funcionário.');
    return req.session.save(() => res.redirect('/cadastrar-funcionario'));
  }
};

exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, usuario, cargo, senha } = req.body;

    // permissões podem vir como permissoes[dashboardISO]/[documentosGerais]
    const p = req.body.permissoes || {};
    const dashboardISO =
      p.dashboardISO === 'true' || p.dashboardISO === 'on' || req.body['permissoes[dashboardISO]'] === 'true';
    const documentosGerais =
      p.documentosGerais === 'true' || p.documentosGerais === 'on' || req.body['permissoes[documentosGerais]'] === 'true';

    const update = {
      nome,
      usuario,
      cargo,
      permissoes: { dashboardISO, documentosGerais },
    };

    // se o usuário digitou uma nova senha, re-hash
    if (senha && senha.trim()) {
      update.senha = await argon2.hash(senha.trim());
    }

    const doc = await Funcionario.findOneAndUpdate(
      { _id: id, empresaId: req.session.user._id }, // protege por empresa
      { $set: update },
      { new: true }
    );

    if (!doc) {
      req.flash('errors', 'Funcionário não encontrado.');
      return req.session.save(() => res.redirect('/cadastrar-funcionario'));
    }

    req.flash('success', 'Funcionário atualizado com sucesso!');
    return req.session.save(() => res.redirect('/cadastrar-funcionario'));
  } catch (err) {
    // trata duplicidade de usuário
    if (err && err.code === 11000) {
      req.flash('errors', 'Já existe um funcionário com esse usuário.');
      return req.session.save(() => res.redirect('/cadastrar-funcionario'));
    }
    console.error('❌ Erro ao atualizar funcionário:', err);
    req.flash('errors', 'Erro ao atualizar funcionário.');
    return req.session.save(() => res.redirect('/cadastrar-funcionario'));
  }
};

exports.remover = async (req, res) => {
  try {
    const { id } = req.params;

    const deletado = await Funcionario.findOneAndDelete({
      _id: id,
      empresaId: req.session.user._id, // protege por empresa
    });

    if (!deletado) {
      req.flash('errors', 'Funcionário não encontrado.');
      return req.session.save(() => res.redirect('/cadastrar-funcionario'));
    }

    req.flash('success', 'Funcionário removido com sucesso!');
    return req.session.save(() => res.redirect('/cadastrar-funcionario'));
  } catch (err) {
    console.error('❌ Erro ao remover funcionário:', err);
    req.flash('errors', 'Erro ao remover funcionário.');
    return req.session.save(() => res.redirect('/cadastrar-funcionario'));
  }
};