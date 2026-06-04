/**
 * setting.js - Xử lý logic riêng cho trang Cài đặt
 */

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  const themeStatus = document.getElementById("theme-status");
  const selectLanguage = document.querySelector(".select-luxury");
  const btnSave = document.querySelector(".setting-submit-bar .btn-gold");

  // 1. Dữ liệu ngôn ngữ (Bạn có thể chuyển bộ này sang common.js sau này)
  const dictionary = {
    vi: {
      sectionTag: "User Preferences",
      sectionTitle: "Settings",
      themeLabel: "Giao diện hệ thống",
      themeSub:
        "Chuyển đổi giữa giao diện nền tối sang trọng hoặc nền sáng bảo vệ mắt.",
      themeStatusDark: "Chế độ tối (Mặc định)",
      themeStatusLight: "Light Mode (Chế độ sáng)",
      langLabel: "Ngôn ngữ hiển thị",
      langSub:
        "Chọn ngôn ngữ chính để dịch toàn bộ nội dung trên trang thư viện.",
      btnCancel: "Cancel",
      btnSave: "Save Changes",
    },
    en: {
      sectionTag: "User Preferences",
      sectionTitle: "Settings",
      themeLabel: "System Interface",
      themeSub:
        "Switch between luxurious dark theme or eye-protection light theme.",
      themeStatusDark: "Dark Mode (Default)",
      themeStatusLight: "Light Mode",
      langLabel: "Display Language",
      langSub:
        "Select the primary language to translate all content on the library site.",
      btnCancel: "Cancel",
      btnSave: "Save Changes",
    },
    ja: {
      sectionTag: "ユーザー設定",
      sectionTitle: "設定",
      themeLabel: "システムインターフェース",
      themeSub:
        "高級感のあるダークテーマと目を保護するライトテーマを切り替えます。",
      themeStatusDark: "ダークモード（デフォルト）",
      themeStatusLight: "ライトモード",
      langLabel: "表示言語",
      langSub:
        "ライブラリサイトの全コンテンツを翻訳するメイン言語を選択します。",
      btnCancel: "キャンセル",
      btnSave: "変更を保存",
    },
  };

  // 2. Khởi tạo trạng thái ban đầu từ localStorage
  const savedTheme = localStorage.getItem("app-theme") || "dark";
  const savedLang = localStorage.getItem("app-lang") || "vi";

  if (themeToggle) themeToggle.checked = savedTheme === "light";
  if (selectLanguage) selectLanguage.value = savedLang;

  // Áp dụng theme ban đầu
  if (savedTheme === "light") document.body.classList.add("light-theme");
  translatePage(savedLang);

  // 3. Sự kiện thay đổi (Preview)
  themeToggle?.addEventListener("change", () => {
    document.body.classList.toggle("light-theme", themeToggle.checked);
    translatePage(selectLanguage.value);
  });

  selectLanguage?.addEventListener("change", () =>
    translatePage(selectLanguage.value),
  );

  // 4. Hàm dịch giao diện
  function translatePage(lang) {
    const data = dictionary[lang];
    if (!data) return;
    document.querySelector(".section-tag").textContent = data.sectionTag;
    document.querySelector(".section-title").innerHTML =
      `System <span class="metallic-gold">${data.sectionTitle}</span>`;

    // Cập nhật các label
    const labels = document.querySelectorAll(".setting-label-luxury");
    const subs = document.querySelectorAll(".setting-sub-text");
    labels[0].textContent = data.themeLabel;
    subs[0].textContent = data.themeSub;
    themeStatus.textContent = themeToggle.checked
      ? data.themeStatusLight
      : data.themeStatusDark;

    labels[1].textContent = data.langLabel;
    subs[1].textContent = data.langSub;

    document.querySelector(".btn-gold").textContent = data.btnSave;
  }

  // 5. Lưu cấu hình
  btnSave?.addEventListener("click", () => {
    localStorage.setItem("app-theme", themeToggle.checked ? "light" : "dark");
    localStorage.setItem("app-lang", selectLanguage.value);
    alert("Cài đặt đã được lưu thành công!");
  });
});
