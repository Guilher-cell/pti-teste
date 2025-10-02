const crypto = require('crypto');
const CadastroModel = require('../Schemas/cadastroSchema');
const TokenModel = require('../models/tokenModel');
const nodemailer = require('nodemailer');

// Config Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,   // seu e-mail
    pass: process.env.EMAIL_PASS    // senha de app
  }
});

// 1. Mostra a página "Esqueci a Senha"
exports.forgotPasswordPage = (req, res) => {
  res.render('esqueciSenha', { csrfToken: req.csrfToken() });
};

// 2. Processa o pedido e envia o e-mail
exports.sendResetToken = async (req, res) => {
  try {
    const user = await CadastroModel.findOne({
      $or: [{ email: req.body.user }, { user: req.body.user }]
    });

    if (!user) {
      req.flash('errors', 'Nenhum utilizador encontrado com este e-mail ou nome de utilizador.');
      return req.session.save(() => res.redirect('/esqueci-senha'));
    }

    // remove token antigo se existir
    let oldToken = await TokenModel.findOne({ userId: user._id });
    if (oldToken) await oldToken.deleteOne();

    // cria novo token
    const resetToken = crypto.randomBytes(32).toString('hex');

    await new TokenModel({
      userId: user._id,
      token: resetToken,
    }).save();

    // link de reset
    const resetURL = `${req.protocol}://${req.get('host')}/redefinir-senha/${resetToken}`;

    // envia email
    await transporter.sendMail({
      from: `"FlowCerti" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'O seu link para redefinição de senha (válido por 10 min)',
      html: `
        <h3>Redefinição de Senha</h3>
        <p>Olá ${user.user},</p>
        <p>Recebemos um pedido para redefinir a sua senha.</p>
        <p>Clique no link abaixo para escolher uma nova senha (válido por 10 minutos):</p>
        <p><a href="${resetURL}" target="_blank">${resetURL}</a></p>
        <br>
        <p>Se não foi você que solicitou, apenas ignore este e-mail.</p>
      `
    });

    req.flash('success', 'Um link de redefinição foi enviado para o seu e-mail!');
    res.redirect('/esqueci-senha');

  } catch (err) {
    console.error('❌ ERRO AO ENVIAR TOKEN:', err);
    req.flash('errors', 'Houve um erro ao enviar o e-mail. Por favor, tente novamente mais tarde.');
    return res.redirect('/esqueci-senha');
  }
};

// 3. Mostra a página para inserir a nova senha
exports.resetPasswordPage = async (req, res) => {
  try {
    const tokenDoc = await TokenModel.findOne({ token: req.params.token });

    if (!tokenDoc) {
      req.flash('errors', 'O token de redefinição é inválido ou expirou.');
      return req.session.save(() => res.redirect('/esqueci-senha'));
    }

    res.render('alterarSenha', { token: req.params.token, csrfToken: req.csrfToken() });

  } catch (err) {
    console.error('❌ ERRO AO VALIDAR TOKEN:', err);
    req.flash('errors', 'Ocorreu um erro. Por favor, tente novamente.');
    return res.redirect('/esqueci-senha');
  }
};

// 4. Processa a alteração da senha
exports.updatePassword = async (req, res) => {
  try {
    const tokenDoc = await TokenModel.findOne({ token: req.params.token });

    if (!tokenDoc) {
      req.flash('errors', 'O token de redefinição é inválido ou expirou. Por favor, solicite um novo.');
      return req.session.save(() => res.redirect('/esqueci-senha'));
    }

    const user = await CadastroModel.findById(tokenDoc.userId);
    if (!user) {
      req.flash('errors', 'Não foi possível encontrar um utilizador associado a este token.');
      return req.session.save(() => res.redirect('/esqueci-senha'));
    }

    if (req.body.password !== req.body.passwordConfirm) {
      req.flash('errors', 'As senhas não coincidem.');
      return req.session.save(() => res.redirect(`/redefinir-senha/${req.params.token}`));
    }

    // altera a senha (argon2 será aplicado pelo pre-save do schema)
    user.password = req.body.password;
    await user.save();

    await tokenDoc.deleteOne();

    req.flash('success', 'A sua senha foi alterada com sucesso!');
    res.redirect('/login');

  } catch (err) {
    console.error('❌ ERRO AO ATUALIZAR SENHA:', err);
    req.flash('errors', 'Ocorreu um erro ao alterar a sua senha. Por favor, tente novamente.');
    return res.redirect('/esqueci-senha');
  }
};
