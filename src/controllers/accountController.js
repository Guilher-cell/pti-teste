// src/controllers/accountController.js
const CadastroModel = require('../Schemas/cadastroSchema');
const PasswordValidator = require('../models/minhaContaModel'); 

exports.index = (req, res) => {
  res.render('minha_conta', {
    messages: {
      errors: req.flash('errors'),
      success: req.flash('success')
    }
  });
};

exports.alterarSenha = async (req, res) => {
  try {
    const { password, passwordConfirm } = req.body;

  
    const validator = new PasswordValidator(password, passwordConfirm);
    validator.valida();

    if (validator.errors.length > 0) {
      req.flash('errors', validator.errors);
      return req.session.save(() => res.redirect('/minha-conta'));
    }

    const user = await CadastroModel.findById(req.session.user._id);
    if (!user) {
      req.flash('errors', 'Usuário não encontrado.');
      return req.session.save(() => res.redirect('/login'));
    }

    user.password = password;
    await user.save();

    req.flash('success', 'Senha alterada com sucesso!');
    return req.session.save(() => res.redirect('/minha-conta'));
  } catch (err) {
    console.error('Erro ao alterar senha:', err);
    req.flash('errors', 'Erro ao alterar senha.');
    return req.session.save(() => res.redirect('/minha-conta'));
  }
};
