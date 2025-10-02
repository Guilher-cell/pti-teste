// src/controllers/accountController.js
const CadastroModel = require('../Schemas/cadastroSchema');

exports.index = (req,res)=>{
    res.render('minha_conta')
}

exports.alterarSenha = async (req, res) => {
  try {
    const { password, passwordConfirm } = req.body;

    if (!password || !passwordConfirm) {
      req.flash('errors', 'Preencha todos os campos.');
      return req.session.save(() => res.redirect('/minha-conta'));
    }

    if (password !== passwordConfirm) {
      req.flash('errors', 'As senhas não coincidem.');
      return req.session.save(() => res.redirect('/minha-conta'));
    }

    const user = await CadastroModel.findById(req.session.user._id);
    if (!user) {
      req.flash('errors', 'Usuário não encontrado.');
      return req.session.save(() => res.redirect('/login'));
    }

    // O hook pre-save do seu Schema já deve criptografar (argon2/bcrypt)
    user.password = password;
    await user.save();

    req.flash('success', 'Senha alterada com sucesso!');
    return req.session.save(() => res.redirect('/minha-conta'));
  } catch (err) {
    console.error('❌ Erro ao alterar senha:', err);
    req.flash('errors', 'Erro ao alterar senha.');
    return req.session.save(() => res.redirect('/minha-conta'));
  }
};
