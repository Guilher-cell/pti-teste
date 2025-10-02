const crypto = require("crypto");
const nodemailer = require("nodemailer");
const cadastroModel = require("../Schemas/cadastroSchema");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,  // seu e-mail
    pass: process.env.EMAIL_PASS   // senha de app, não a senha normal
  }
});

// ============================
// ATIVAR 2FA (usuário logado)
// ============================
exports.habilitar2FA = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");

    const code = crypto.randomInt(100000, 999999).toString();
    req.session.twoFASetupCode = code;


      await transporter.sendMail({
      from: '"FlowCerti" <no-reply@flowcerti.com>',
      to: req.session.user.email,
      subject: "Ativação 2FA - FlowCerti",
      text: `Seu código de ativação é: ${code}`
    });
    res.render("ativar2fa", {
      csrfToken: req.csrfToken(),
      message: "Enviamos um código para o seu e-mail."
    });
  } catch (err) {
    console.error("❌ Erro ao enviar e-mail 2FA:", err);
    req.flash("errors", "Não foi possível enviar o e-mail de ativação.");
    return req.session.save(() => res.redirect("/meus-dados"));
  }
};

// confirma a 2fa na pagina seguranca em minha
exports.confirmarAtivacao = async (req, res) => {
  const { code } = req.body;

  if (code !== req.session.twoFASetupCode) {
    req.flash("errors", "Código inválido.");
    return req.session.save(() => res.render('ativar2fa'));
  }

  await cadastroModel.findByIdAndUpdate(req.session.user._id, { twoFAEnabled: true });
  req.session.user.twoFAEnabled = true;
  delete req.session.twoFASetupCode;

  req.flash("success", "2FA ativada com sucesso!");
  return req.session.save(() => res.redirect("/meus-dados"));
};

// ============================
// LOGIN COM 2FA
// ============================
exports.enviarCodigoLogin = async (user, req) => {
  // gera código e salva no banco
  const code = crypto.randomInt(100000, 999999).toString();
  user.twoFACode = code;
  user.twoFACodeExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await transporter.sendMail({
    from: '"FlowCerti" <no-reply@flowcerti.com>',
    to: user.email,
    subject: "Login 2FA - FlowCerti",
    text: `Seu código de login é: ${code}`
  });

  req.session.tempUserId = user._id; // guarda usuário temporário
};

// verifica a 2fa no login
exports.verificacaoLogin = (req, res) => {
  if (!req.session.tempUserId) return res.redirect("/login");
  res.render("verificacao2fa", { csrfToken: req.csrfToken(), error: null });
};

//confirma o 2fa
exports.confirmarLogin2FA = async (req, res) => {
  const { code } = req.body;
  const user = await cadastroModel.findById(req.session.tempUserId);

  if (!user || !user.twoFACode || user.twoFACodeExpires < Date.now() || user.twoFACode !== code) {
    return res.render("verificacao2fa", { csrfToken: req.csrfToken(), error: "Código inválido ou expirado." });
  }

  // login completo
  req.session.user = {
    _id: user._id,
    user: user.user,
    email: user.email,
    cnpj: user.cnpj,
    twoFAEnabled: true
  };

  // limpa código do banco
  user.twoFACode = null;
  user.twoFACodeExpires = null;
  await user.save();

  req.session.tempUserId = null;

  res.redirect("/");
};

