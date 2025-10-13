const UsuarioModel = require('../Schemas/cadastroSchema');
const DadosEmpresaModel = require('../Schemas/dadosEmpresaSchema');

exports.index = async (req, res) => {
  try {
    const usuario = await UsuarioModel.findById(req.session.user._id);
    const dadosEmpresa = await DadosEmpresaModel.findById(req.session.user._id);

    res.render('resumo', {
      user: req.session.user,
      csrfToken: req.csrfToken(),
      usuario: usuario,
      empresa: dadosEmpresa || {} 
    });
  } catch (err) {
    console.error('Erro ao carregar resumo:', err);
    req.flash('errors', 'Erro ao carregar resumo');
    res.redirect('/');
  }
};
