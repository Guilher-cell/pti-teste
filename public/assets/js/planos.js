document.addEventListener("DOMContentLoaded", () => {
  const boxes = document.querySelectorAll(".plano-box");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate");
        observer.unobserve(entry.target); // anima só uma vez
      }
    });
  }, { threshold: 0.3 }); // 30% visível já ativa

  boxes.forEach(box => observer.observe(box));
});
