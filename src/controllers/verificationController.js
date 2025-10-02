const UsuarioModel = require('../Schemas/cadastroSchema');
const DadosEmpresaModel = require('../Schemas/dadosEmpresaSchema');

exports.index = async (req, res) => {
  try {
    const usuario = await UsuarioModel.findById(req.session.user._id);
    const dadosEmpresa = await DadosEmpresaModel.findById(req.session.user._id);

    res.render('verificacao', {
      csrfToken: req.csrfToken(),
      user: req.session.user,
      usuario: usuario,
      empresa: dadosEmpresa || {}   // 🔑 agora a view vai ter acesso ao "empresa"
    });
  } catch (err) {
    console.error('❌ Erro ao carregar verificação:', err);
    req.flash('errors', 'Erro ao carregar dados de verificação');
    res.redirect('/');
  }
};
