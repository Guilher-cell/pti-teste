document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // 1) Animação de entrada (Intersection Observer)
  // =========================
  const boxes = document.querySelectorAll(".plano-box, .plano-card"); 
  // suporta tanto .plano-box quanto .plano-card

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate");
        observer.unobserve(entry.target); // só anima uma vez
      }
    });
  }, { threshold: 0.2 });

  boxes.forEach(box => observer.observe(box));

  // =========================
  // 2) Lógica de pagamento (Mercado Pago)
  // =========================
  async function assinarPlano(plano) {
    try {
      const res = await fetch(`/pagamento/${encodeURIComponent(plano)}`, {
        method: "GET",
        headers: { "Accept": "application/json" },
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        console.error("❌ Erro no backend:", res.status, t);
        alert("Erro ao iniciar pagamento. Tente novamente.");
        return;
      }

      const data = await res.json();
      if (data && data.init_point) {
        console.log("🔗 Redirecionando para:", data.init_point);
        window.location.href = data.init_point;
      } else {
        console.error("❌ Resposta inesperada:", data);
        alert("Resposta inválida do servidor de pagamento.");
      }
    } catch (e) {
      console.error("❌ Falha ao chamar /pagamento:", e);
      alert("Não foi possível iniciar o pagamento.");
    }
  }

  // =========================
  // 3) Vincula botões com data-plano
  // =========================
  const botoes = document.querySelectorAll(".btn-plano");
  botoes.forEach(btn => {
    btn.addEventListener("click", () => {
      const plano = btn.dataset.plano;
      if (plano) assinarPlano(plano);
    });
  });

  console.log("✅ planos.js carregado com animações + pagamentos");

  // ======================================================
  // 4) Modal do Plano Básico (30 dias grátis)
  // ======================================================
  const btnAbrir = document.getElementById("btn-obter-plano");
  const modal = document.getElementById("modal-plano-basico");
  const close = document.getElementById("close-plano-basico");
  const cancelar = document.getElementById("cancelar-plano-basico");
  const confirmar = document.getElementById("btn-confirmar-plano");

  if (btnAbrir && modal) {
    // Abrir modal
    btnAbrir.addEventListener("click", (e) => {
      e.preventDefault();
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });

    // Fechar modal
    [close, cancelar].forEach(btn => {
      if (btn) {
        btn.addEventListener("click", () => {
          modal.style.display = "none";
          document.body.style.overflow = "";
        });
      }
    });

    // Fechar clicando fora
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
        document.body.style.overflow = "";
      }
    });

    // Confirmação (ativar plano)
    if (confirmar) {
      confirmar.addEventListener("click", () => {
        modal.style.display = "none";
        document.body.style.overflow = "";
        alert("Seu plano básico foi ativado com sucesso! Aproveite seus 30 dias grátis."); 
      });
    }
  }
});
 