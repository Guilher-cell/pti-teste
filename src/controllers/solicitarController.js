const Solicitacao = require('../models/solicitacaoModel'); // sua classe
const nodemailer = require('nodemailer');

// Configura o transporte do Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

exports.index = (req, res) => {
    res.render('solicitarDemo'); 
};


exports.enviar = async (req, res) => {
  try {
    const solicitacao = new Solicitacao(req.body);
    solicitacao.valida();

    if (solicitacao.errors.length > 0) {
      req.flash("errors", solicitacao.errors);
      return req.session.save(() => res.redirect("/solicitar"));
    }

    // Monta o email
    await transporter.sendMail({
      from: `"FlowCerti" <${process.env.EMAIL_USER}>`,
      to: "seuemail@flowcerti.com", // <- seu e-mail que recebe as solicitações
      subject: "Nova solicitação de demonstração",
      html: `
        <h3>Nova solicitação recebida:</h3>
        <p><strong>Responsável:</strong> ${req.body.nomeResponsavel}</p>
        <p><strong>Razão Social:</strong> ${req.body.razaoSocial}</p>
        <p><strong>Email:</strong> ${req.body.email}</p>
        <p><strong>CNPJ:</strong> ${req.body.cnpj}</p>
        <p><strong>Ramo:</strong> ${req.body.ramoEmpresa}</p>
        <p><strong>Mensagem:</strong> ${req.body.mensagem}</p>
      `
    });

    // (Opcional) Resposta automática para o cliente
    await transporter.sendMail({
      from: `"FlowCerti" <${process.env.EMAIL_USER}>`,
      to: req.body.email,
      subject: "Recebemos sua solicitação",
      text: `Olá ${req.body.nomeResponsavel}, recebemos sua solicitação de demonstração. Em breve entraremos em contato!`
    });

    req.flash("success", "Solicitação enviada com sucesso!");
    return req.session.save(() => res.redirect("/solicitar"));

  } catch (err) {
    console.error("❌ Erro ao enviar solicitação:", err);
    req.flash("errors", "Não foi possível enviar sua solicitação.");
    return req.session.save(() => res.redirect("/solicitar"));
  }
};