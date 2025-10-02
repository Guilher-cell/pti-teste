const User = require('../Schemas/cadastroSchema');
const TokenModel = require('../models/tokenModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Config Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Página de cadastro
exports.criar = (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('cadastro', { csrfToken: req.csrfToken() });
};

// =============================
// REGISTRO DE USUÁRIO
// =============================
exports.register = async (req, res) => {
  try {
    const user = await User.create(req.body);

    // gera token de verificação
    const token = crypto.randomBytes(32).toString('hex');
    await TokenModel.create({
      userId: user._id,
      token: token,
    });

    // link para o usuário confirmar
    const link = `${req.protocol}://${req.get('host')}/verificar-email/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Confirme seu cadastro - FlowCerti',
      html: `
        <p>Olá ${user.user},</p>
        <p>Obrigado por se cadastrar! Clique no link abaixo para confirmar sua conta:</p>
        <a href="${link}">${link}</a>
        <p>⚠️ Esse link expira em 5 minutos.</p>
      `,
    });

    req.flash('success', 'Conta criada! Confirme seu e-mail para ativar!');
    return req.session.save(() => res.redirect('/login'));

  } catch (err) {
    console.error('❌ Erro no registro:', err);
    req.flash('errors', 'Erro ao criar conta. Tente novamente!');
    return req.session.save(() => res.redirect('/criar'));
  }
};

// =============================
// VERIFICAÇÃO DE EMAIL
// =============================
exports.verificarEmail = async (req, res) => {
  try {
    const tokenDoc = await TokenModel.findOne({ token: req.params.token });
    if (!tokenDoc) {
      req.flash('errors', 'Token inválido ou expirado.');
      return res.redirect('/login');
    }

    // ativa a conta
    await User.findByIdAndUpdate(tokenDoc.userId, { ativo: true });

    // apaga o token
    await tokenDoc.deleteOne();

    req.flash('success', 'Conta ativada com sucesso! Faça login.');
    return res.redirect('/login');
  } catch (err) {
    console.error('❌ Erro ao verificar email:', err);
    req.flash('errors', 'Erro ao verificar conta.');
    return res.redirect('/login');
  }
};
