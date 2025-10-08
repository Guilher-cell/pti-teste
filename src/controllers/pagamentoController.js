// src/controllers/pagamentoController.js
const mercadopago = require("mercadopago");

// configuração segura (espera MP_ACCESS_TOKEN no .env)
if (!process.env.MP_ACCESS_TOKEN) {
  console.warn("⚠️ MP_ACCESS_TOKEN não definido no .env");
} else if (typeof mercadopago.configure === "function") {
  mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });
} else if (mercadopago.Client) {
  // fallback para versões mais novas do SDK (se houver)
  // não sobrescreve globalmente, apenas mantém aviso
  console.warn("⚠️ mercadopago SDK parece ter interface diferente. Verifique a versão do pacote.");
}

const PLANOS = {
  mensal:     { title: "Plano Premium Mensal", price: 500.00 },
  trimestral: { title: "Plano Premium Trimestral", price: 1200.00 },
  semestral:  { title: "Plano Premium Semestral", price: 2100.00 },
  anual:      { title: "Plano Premium Anual", price: 3600.00 },
};

function getBaseUrl(req) {
  return process.env.BASE_URL || `${req.protocol}://${req.get("host")}` || "http://localhost:4000";
}

exports.criarPagamento = async (req, res) => {
  try {
    const plano = (req.params.plano || "").toLowerCase();
    const cfg = PLANOS[plano];
    if (!cfg) {
      console.warn("Plano inválido recebido:", req.params.plano);
      return res.status(400).json({ error: "Plano inválido" });
    }

    const baseUrl = getBaseUrl(req);
    const preference = {
      items: [{
        title: cfg.title,
        quantity: 1,
        currency_id: "BRL",
        unit_price: Number(cfg.price)
      }],
      back_urls: {
        success: `${baseUrl}/pagamento/sucesso`,
        failure: `${baseUrl}/pagamento/falha`,
        pending: `${baseUrl}/pagamento/pendente`
      },
      auto_return: "approved"
    };

    console.log("Criando preference MP:", JSON.stringify(preference));

    // chamada ao SDK (suporte a variações de SDK)
    let response;
    if (mercadopago.preferences && typeof mercadopago.preferences.create === "function") {
      response = await mercadopago.preferences.create(preference);
      console.log("Resposta MP (body):", JSON.stringify(response.body || response, null, 2));
    } else if (mercadopago.payment && typeof mercadopago.payment.create === "function") {
      // fallback improvável — apenas em caso de SDK diferente
      response = await mercadopago.payment.create(preference);
      console.log("Resposta alternativa MP:", response);
    } else {
      console.error("SDK do mercadopago não expõe preferences.create — verifique versão do pacote.");
      return res.status(500).json({ error: "Erro no provedor de pagamento" });
    }

    // escolher url correta (sandbox vs production)
    const mpMode = (process.env.MP_MODE || "sandbox").toLowerCase();
    const checkoutUrl = mpMode === "production"
      ? (response.body && response.body.init_point) || response.init_point
      : (response.body && (response.body.sandbox_init_point || response.body.init_point)) || response.sandbox_init_point;

    if (!checkoutUrl) {
      console.error("Nenhum init_point retornado pelo MP:", response);
      return res.status(500).json({ error: "Resposta inválida do Mercado Pago" });
    }

    return res.json({ init_point: checkoutUrl });
  } catch (err) {
    console.error("❌ Erro ao criar pagamento:", err && (err.response || err));
    // se MP retornou error com body, tenta logar corpo
    if (err && err.cause) console.error("cause:", err.cause);
    return res.status(500).json({ error: "Erro ao criar pagamento" });
  }
};
