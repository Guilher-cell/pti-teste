const Cadastro = require('../models/cadastroModel'); 
const TokenModel = require('../models/tokenModel');
const cadastroModel = require('../Schemas/cadastroSchema'); 
const crypto = require('crypto');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


exports.criar = (req, res) => {
  if (req.session.user) return res.redirect('/');

  res.render('cadastro', { 
    csrfToken: req.csrfToken(),
    dados: req.flash('formdata')[0] || {}, 
    messages: {
      errors: req.flash('errors'),
      success: req.flash('success')
    }
  });
};

exports.register = async (req, res) => {
  try {
    const cadastro = new Cadastro(req.body);
    await cadastro.register();

    if (cadastro.errors.length > 0) {
      
      req.flash('errors', cadastro.errors);
      req.flash('formdata', {
        email: req.body.email,
        user: req.body.user,
        cnpj: req.body.cnpj
      });

      return req.session.save(() => res.redirect('/criar'));
    }

   
    const user = cadastro.user;

    
    const token = crypto.randomBytes(32).toString('hex');
    await TokenModel.create({
      userId: user._id,
      token: token,
    });

   
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
    console.error('Erro no registro:', err);
    req.flash('errors', 'Erro ao criar conta. Tente novamente!');
    return req.session.save(() => res.redirect('/criar'));
  }
};


exports.verificarEmail = async (req, res) => {
  try {
    const tokenDoc = await TokenModel.findOne({ token: req.params.token });
    if (!tokenDoc) {
      req.flash('errors', 'Token inválido ou expirado.');
      return res.redirect('/login');
    }

   
    await cadastroModel.findByIdAndUpdate(tokenDoc.userId, { ativo: true });

    
    await tokenDoc.deleteOne();

    req.flash('success', 'Conta ativada com sucesso! Faça login.');
    return res.redirect('/login');
  } catch (err) {
    console.error('Erro ao verificar email:', err);
    req.flash('errors', 'Erro ao verificar conta.');
    return res.redirect('/login');
  }
};
