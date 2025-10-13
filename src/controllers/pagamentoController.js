const { MercadoPagoConfig, Preference } = require("mercadopago");


const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

const PLANOS = {
  mensal:      { title: "Plano Premium Mensal",      price: 500.00 },
  trimestral:  { title: "Plano Premium Trimestral",  price: 1200.00 },
  semestral:   { title: "Plano Premium Semestral",   price: 2100.00 },
  anual:       { title: "Plano Premium Anual",       price: 3600.00 },
};

exports.criarPagamento = async (req, res) => {
  try {
    const plano = (req.params.plano || "").toLowerCase();
    const cfg = PLANOS[plano];
    if (!cfg) return res.status(400).json({ error: "Plano inválido" });

    const preference = new Preference(mpClient);

    const result = await preference.create({
      body: {
        items: [
          {
            title: cfg.title,
            quantity: 1,
            currency_id: "BRL",
            unit_price: Number(cfg.price),
          },
        ],
        back_urls: {
        success: "https://flowcerti.com/pagamento/sucesso",
        failure: "https://flowcerti.com/pagamento/erro",
        pending: "https://flowcerti.com/pagamento/pendente"
},
auto_return: "approved",
      },
    });

    
    const url = result.init_point || result.sandbox_init_point;
    if (!url) return res.status(500).json({ error: "Preferência criada sem URL" });

    return res.json({ init_point: url });
  } catch (err) {
    console.error("Erro ao criar pagamento:", err);
    return res.status(500).json({ error: "Erro ao criar pagamento" });
  }
};

exports.sucesso = async (req, res) => {
  try {
    const plano = req.query.plano; 
    const userId = req.session.user._id;

    let dias = 0;
    if (plano === "mensal") dias = 30;
    if (plano === "trimestral") dias = 90;
    if (plano === "semestral") dias = 180;
    if (plano === "anual") dias = 365;

    await cadastroModel.findByIdAndUpdate(userId, {
      plano: plano,
      planoExpiraEm: new Date(Date.now() + dias*24*60*60*1000)
    });

    req.flash("success", "Pagamento aprovado! Seu plano foi ativado.");
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Erro ao salvar plano pago:", err);
    res.redirect("/planos");
  }
};

exports.erro= (req, res) => res.send("O pagamento falhou. Tente novamente.");
exports.pendente = (req, res) => res.send("Pagamento pendente. Aguardando confirmação.");
