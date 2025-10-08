const { MercadoPagoConfig, Preference } = require("mercadopago");

// use sua credencial do .env
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

    // SDK nova retorna direto as props no objeto
    const url = result.init_point || result.sandbox_init_point;
    if (!url) return res.status(500).json({ error: "Preferência criada sem URL" });

    return res.json({ init_point: url });
  } catch (err) {
    console.error("❌ Erro ao criar pagamento:", err);
    return res.status(500).json({ error: "Erro ao criar pagamento" });
  }
};

exports.sucesso  = (req, res) => res.send("✅ Pagamento aprovado! Obrigado.");
exports.erro     = (req, res) => res.send("❌ O pagamento falhou. Tente novamente.");
exports.pendente = (req, res) => res.send("⏳ Pagamento pendente. Aguardando confirmação.");
