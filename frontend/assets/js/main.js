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
// ==========================================================================
// LOGIC KIỂM TRA ĐĂNG NHẬP & ĐĂNG XUẤT (Chạy trên mọi trang)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Kiểm tra xem trong bộ nhớ trình duyệt đã có tên user chưa
  const userName = localStorage.getItem("userName");

  // 2. Định vị 2 nút: Nút Login cũ và Khối Tài Khoản mới
  const loginWrapper = document.getElementById("nav-login-wrapper");
  const userProfile = document.getElementById("nav-user-profile");
  const userDisplayName = document.getElementById("user-display-name");

  // 3. Xử lý Logic ẩn/hiện
  if (userName) {
    // KHI ĐÃ ĐĂNG NHẬP: Ẩn chữ "Login" đi -> Hiện khối "Tài Khoản" ra
    if (loginWrapper) loginWrapper.style.display = "none";
    if (userProfile) userProfile.style.display = "flex";
    if (userDisplayName) userDisplayName.textContent = "Xin chào, " + userName;
  } else {
    // KHI CHƯA ĐĂNG NHẬP: Giữ nguyên chữ "Login" -> Ẩn khối "Tài Khoản"
    if (loginWrapper) loginWrapper.style.display = "inline-block";
    if (userProfile) userProfile.style.display = "none";
  }

  // 4. Xử lý sự kiện khi bấm nút ĐĂNG XUẤT
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Xóa toàn bộ thông tin đăng nhập trong bộ nhớ
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");

      // Load lại trang ngay lập tức để cập nhật Navbar về trạng thái gốc
      window.location.reload();
    });
  }
});
// ==========================================
// 🌟 ÁP DỤNG ĐỒNG BỘ THEME CHO MỌI TRANG
// ==========================================
const currentAppTheme = localStorage.getItem("app-theme");
if (currentAppTheme === "light") {
  document.body.classList.add("light-theme");
} else {
  document.body.classList.remove("light-theme");
}
