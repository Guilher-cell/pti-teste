document.addEventListener("DOMContentLoaded", () => {
  const progresses = document.querySelectorAll(".capitulos-progress");

  progresses.forEach(progress => {
    const value = parseInt(progress.textContent.replace("%", "").trim());

    // Remove classes antigas
    progress.classList.remove("zero", "in-progress", "complete");

    // Define cor conforme valor
    if (value === 0) {
      progress.classList.add("zero");
    } else if (value > 0 && value < 100) {
      progress.classList.add("in-progress");
    } else if (value === 100) {
      progress.classList.add("complete");
    }
  });
});