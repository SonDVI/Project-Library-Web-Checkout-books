// ==========================================================================
// GLOBAL LOGIC (Chạy trên mọi trang)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Hiệu ứng cuộn hiện ra (Dùng chung cho Footer, Header, hoặc bất kỳ text nào)
  const revealElements = document.querySelectorAll(".reveal, .reveal-3d");

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  // (Sau này bạn có thể thêm logic Navbar cuộn, hay Darkmode vào đây)
});
