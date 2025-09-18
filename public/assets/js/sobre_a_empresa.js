// Ativa animação quando imagem aparece na tela
document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target); // anima só 1 vez
            }
        });
    }, { threshold: 0.5 }); // 50% visível já ativa

    document.querySelectorAll('.img-como-plataforma-ajuda').forEach(img => {
        observer.observe(img);
    });
});
