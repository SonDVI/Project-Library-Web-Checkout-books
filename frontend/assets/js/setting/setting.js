/**
 * setting.js - Logic riêng cho trang Cài đặt
 * - Dùng bộ từ điển + apply theme/lang chung từ window.I18N
 * - Cho phép xem trước (preview) trước khi nhấn Save
 * - Save: ghi localStorage, các trang khác sẽ tự áp dụng khi load
 */

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  const themeStatus = document.getElementById("theme-status");
  const selectLanguage = document.querySelector(".select-luxury");
  const btnSave = document.querySelector(".setting-submit-bar .btn-gold");
  const btnCancel = document.querySelector(".setting-submit-bar .btn-outline");

  // 1. Khởi tạo trạng thái từ localStorage (window.I18N đã apply sẵn)
  const savedTheme = window.I18N.getTheme();
  const savedLang = window.I18N.getLang();

  if (themeToggle) themeToggle.checked = savedTheme === "light";
  if (selectLanguage) selectLanguage.value = savedLang;

  // Cập nhật trạng thái theme label
  function updateThemeStatus() {
    if (!themeStatus) return;
    const isLight = themeToggle && themeToggle.checked;
    const lang = selectLanguage ? selectLanguage.value : "vi";
    const key = isLight ? "themeStatusLight" : "themeStatusDark";
    // Lấy text đã được dịch từ dictionary
    const data = window.I18N.dictionary[lang];
    if (data && data[key]) themeStatus.textContent = data[key];
  }
  updateThemeStatus();

  // 2. Sự kiện PREVIEW (chỉ thay đổi giao diện, CHƯA lưu localStorage)
  themeToggle?.addEventListener("change", () => {
    const newTheme = themeToggle.checked ? "light" : "dark";
    window.I18N.preview(newTheme, selectLanguage ? selectLanguage.value : null);
    updateThemeStatus();
  });

  selectLanguage?.addEventListener("change", () => {
    window.I18N.preview(null, selectLanguage.value);
    updateThemeStatus();
  });

  // 3. NÚT SAVE — ghi vào localStorage để mọi trang áp dụng từ lần sau
  btnSave?.addEventListener("click", () => {
    const newTheme = themeToggle.checked ? "light" : "dark";
    const newLang = selectLanguage.value;

    localStorage.setItem("app-theme", newTheme);
    localStorage.setItem("app-lang", newLang);

    const msg =
      (window.I18N.dictionary[newLang] &&
        window.I18N.dictionary[newLang].saveSuccess) ||
      "Settings saved successfully!";
    alert(msg);
  });

  // 4. NÚT CANCEL — khôi phục theme + lang về giá trị đã lưu
  btnCancel?.addEventListener("click", (e) => {
    e.preventDefault();
    themeToggle.checked = savedTheme === "light";
    selectLanguage.value = savedLang;
    window.I18N.preview(savedTheme, savedLang);
    updateThemeStatus();
  });
});
