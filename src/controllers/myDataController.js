const UsuarioModel = require('../Schemas/cadastroSchema');
const DadosEmpresaModel = require('../Schemas/dadosEmpresaSchema');

exports.index = async (req, res) => {
  try {
    const usuario = await UsuarioModel.findById(req.session.user._id);
    const dadosEmpresa = await DadosEmpresaModel.findById(req.session.user._id);

    res.render("meus_dados", {
      csrfToken: req.csrfToken(),
      user: req.session.user,
      usuario: usuario,
      empresa: dadosEmpresa || {},
      messages: {
        success: req.flash("success"),
        errors: req.flash("errors")
      }
    });
  } catch (err) {
    console.error("❌ Erro ao carregar meus dados:", err);
    req.flash("errors", "Erro ao carregar dados");
    res.redirect("/");
  }
};


exports.salvar = async (req, res) => {
  try {
    await DadosEmpresaModel.findOneAndUpdate(
      { _id: req.session.user._id }, 
      {
        _id: req.session.user._id,
        razaoSocial: req.body.razaoSocial,
        endereco: {
          cep: req.body.cep,
          logradouro: req.body.endereco,
          numero: req.body.numero,
          complemento: req.body.complemento,
          bairro: req.body.bairro,
          cidade: req.body.cidade,
          estado: req.body.estado,
          pais: req.body.pais
        },
        dadosCompletos: true // ✅ marca como salvo
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    req.flash('success', 'Dados atualizados com sucesso!');
    res.redirect('/meus-dados');
  } catch (err) {
    console.error('❌ Erro ao salvar meus dados:', err);
    req.flash('errors', 'Erro ao atualizar dados');
    res.redirect('/meus-dados');
  }
};

