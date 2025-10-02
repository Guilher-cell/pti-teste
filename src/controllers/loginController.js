const Cadastro = require('../Schemas/cadastroSchema'); 
const Funcionario = require('../Schemas/funcionarioSchema');
const nodemailer = require('nodemailer');

// =============================
// Configuração do Nodemailer
// =============================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =============================
// Página de login
// =============================
exports.index = (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('login', { csrfToken: req.csrfToken() });
};

// =============================
// LOGIN (admin, master, funcionario)
// =============================
exports.login = async function (req, res) {
  try {
    const { user, password } = req.body;

    // 1) Tenta login no Cadastro (admin ou master)
    let cadastro = await Cadastro.findOne({ user }).select('+password');
    if (cadastro && await cadastro.isCorrectPassword(password)) {

      if (!cadastro.ativo) {
        req.flash('errors', 'Conta ainda não confirmada. Verifique seu e-mail!');
        return req.session.save(() => res.redirect('/login'));
      }

      // 🔑 Sessão
      req.session.user = {
        _id: cadastro._id,
        user: cadastro.user,
        email: cadastro.email,
        cnpj: cadastro.cnpj,
        role: cadastro.role,        // "admin" ou "master"
        empresaId: cadastro._id,    // master/admin = eles mesmos
        permissoes: cadastro.permissoes || {},
        twoFAEnabled: cadastro.twoFAEnabled || false,
      };

      // Se tiver 2FA ativado
      if (cadastro.twoFAEnabled) {
        req.session.tempUser = req.session.user;

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        req.session.temp2FACode = code;

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: cadastro.email,
          subject: 'Seu código de verificação (2FA)',
          text: `Seu código de login é: ${code}`,
        });

        req.flash('success', 'Código enviado para seu e-mail.');
        return req.session.save(() => res.redirect('/login/2fa'));
      }

      req.flash('success', `Login realizado como ${cadastro.role}!`);
      return req.session.save(() => res.redirect('/'));
    }

    // 2) Se não achou no Cadastro, tenta funcionário
    const funcionario = await Funcionario.findOne({ usuario: user }).select('+senha');
    if (funcionario && await funcionario.isCorrectPassword(password)) {
      req.session.user = {
        _id: funcionario._id,
        user: funcionario.usuario,
        nome: funcionario.nome,
        cargo: funcionario.cargo,
        role: 'funcionario',
        empresaId: funcionario.empresaId,
        permissoes: funcionario.permissoes || {},
      };

      req.flash('success', 'Login de funcionário realizado com sucesso!');
      return req.session.save(() => res.redirect('/'));
    }

    // 3) Se não achou em nenhum dos dois
    req.flash('errors', 'Usuário ou senha inválidos.');
    return req.session.save(() => res.redirect('/login'));

  } catch (e) {
    console.error('--- ERRO CRÍTICO NO LOGIN CONTROLLER ---', e);
    req.flash('errors', 'Ocorreu um erro interno no sistema.');
    return req.session.save(() => res.redirect('/login'));
  }
};


// =============================
// PÁGINA DE VERIFICAÇÃO 2FA
// =============================
exports.login2FA = (req, res) => {
  if (!req.session.tempUser) return res.redirect('/login');
  res.render('verificacao2fa', { csrfToken: req.csrfToken() });
};

// =============================
// CONFIRMAÇÃO DO CÓDIGO 2FA
// =============================
exports.confirm2FA = async (req, res) => {
  const { code } = req.body;

  if (code === req.session.temp2FACode) {
    req.session.user = req.session.tempUser;
    req.session.tempUser = null;
    req.session.temp2FACode = null;

    req.flash('success', 'Login com 2FA realizado com sucesso!');
    return req.session.save(() => res.redirect('/'));
  }

  req.flash('errors', 'Código inválido. Tente novamente.');
  return req.session.save(() => res.redirect('/login/2fa'));
};

// =============================
// LOGOUT
// =============================
exports.logout = function (req, res) {
  req.session.destroy(err => {
    if (err) {
      console.error('Erro ao destruir a sessão:', err);
      return res.redirect('/'); // fallback
    }
    res.clearCookie('connect.sid'); 
    return res.redirect('/'); // manda para tela de login
  });
};