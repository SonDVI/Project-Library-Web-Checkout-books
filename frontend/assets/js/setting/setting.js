/**
 * setting.js - Logic riêng cho trang Cài đặt
 * - Đồng bộ với localStorage để main.js và i18n.js ở các trang khác đọc được
 */

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  const themeStatus = document.getElementById("theme-status");
  const selectLanguage = document.querySelector(".select-luxury");
  const btnSave = document.querySelector(".setting-submit-bar .btn-gold");
  const btnCancel = document.querySelector(".setting-submit-bar .btn-outline");

  // 1. Khởi tạo trạng thái từ localStorage
  const savedTheme = window.I18N
    ? window.I18N.getTheme()
    : localStorage.getItem("app-theme") || "dark";
  const savedLang = window.I18N
    ? window.I18N.getLang()
    : localStorage.getItem("app-lang") || "vi";

  if (themeToggle) themeToggle.checked = savedTheme === "light";
  if (selectLanguage) selectLanguage.value = savedLang;

  // Cập nhật text trạng thái theme (Dịch theo ngôn ngữ)
  function updateThemeStatus() {
    if (!themeStatus) return;
    const isLight = themeToggle && themeToggle.checked;
    const lang = selectLanguage ? selectLanguage.value : "vi";
    const key = isLight ? "themeStatusLight" : "themeStatusDark";

    if (window.I18N && window.I18N.dictionary) {
      const data = window.I18N.dictionary[lang];
      if (data && data[key]) themeStatus.textContent = data[key];
    } else {
      themeStatus.textContent = isLight
        ? "Chế độ sáng"
        : "Chế độ tối (Mặc định)";
    }
  }
  updateThemeStatus();

  // 2. Sự kiện PREVIEW (chỉ thay đổi giao diện tạm thời)
  themeToggle?.addEventListener("change", () => {
    const newTheme = themeToggle.checked ? "light" : "dark";
    if (window.I18N)
      window.I18N.preview(
        newTheme,
        selectLanguage ? selectLanguage.value : null,
      );
    updateThemeStatus();
  });

  selectLanguage?.addEventListener("change", () => {
    if (window.I18N) window.I18N.preview(null, selectLanguage.value);
    updateThemeStatus();
  });

  // 3. NÚT SAVE — Đồng bộ toàn hệ thống
  btnSave?.addEventListener("click", () => {
    const newTheme = themeToggle.checked ? "light" : "dark";
    const newLang = selectLanguage.value;

    // Ghi vĩnh viễn vào bộ nhớ trình duyệt
    localStorage.setItem("app-theme", newTheme);
    localStorage.setItem("app-lang", newLang);

    // Lấy câu thông báo chuẩn xác
    let msg = "✅ Cài đặt đã được lưu! Hệ thống đang đồng bộ...";
    if (
      window.I18N &&
      window.I18N.dictionary &&
      window.I18N.dictionary[newLang]
    ) {
      msg = window.I18N.dictionary[newLang].saveSuccess || msg;
    }

    alert(msg);

    // 🌟 ĐIỂM CHỐT UX: Đưa người dùng về Dashboard ngay lập tức để nhìn thấy thành quả đồng bộ
    window.location.href = "dashboard.html";
  });

  // 4. NÚT CANCEL — Hủy thay đổi, khôi phục như cũ
  btnCancel?.addEventListener("click", (e) => {
    e.preventDefault();
    themeToggle.checked = savedTheme === "light";
    selectLanguage.value = savedLang;

    if (window.I18N) window.I18N.preview(savedTheme, savedLang);
    updateThemeStatus();

    window.location.href = "dashboard.html";
  });
});
