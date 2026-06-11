/**
 * i18n.js - Hệ thống đa ngôn ngữ + theme dùng chung cho toàn bộ website
 * Chạy tự động trên MỌI trang khi DOMContentLoaded.
 * Đọc `app-theme` và `app-lang` từ localStorage rồi áp dụng ngay lập tức.
 */

(function () {
  "use strict";

  // ============================================================
  // 1. BỘ TỪ ĐIỂN (Dictionary) — Đã bổ sung full từ ngữ
  // ============================================================
  const dictionary = {
    vi: {
      // --- Nav & Footer chung ---
      navCatalog: "Catalog",
      navDashboard: "Dashboard",
      navLogin: "Đăng nhập",
      navLogout: "Đăng xuất",
      navSetting: "Cài đặt",
      navGreeting: "Xin chào, ",
      footerCopyright: "© 2026 HUST LBC. Chế tác với độ chính xác siêu thực.",

      // --- Index (trang chủ) ---
      heroTitle:
        "Hust <span class='metallic-gold'>LBC</span> Tận Tâm Cho Sinh Viên",
      heroDesc:
        "Dịch vụ cho thuê sách linh hoạt và tiết kiệm, tận tâm giúp sinh viên HUST mở rộng kiến thức.",
      heroExplore: "Khám phá thêm",
      heroCardBadge: "Có giới hạn",
      heroCardTitle: "Sách Đặc Biệt",
      sectionCuratedTag: "Tuyển Chọn",
      sectionCuratedTitle: "Ấn Bản <span class='metallic-gold'>Nổi Bật</span>",
      sectionAuthorTag: "Tác Giả",
      sectionAuthorTitle: "Tác Giả <span class='metallic-gold'>Phổ Biến</span>",
      ctaCommunityTitle:
        "CỘNG ĐỒNG <span class='metallic-gold'>HUST LBC</span>",
      ctaCommunityDesc:
        "Cộng đồng những người yêu sách, cùng chia sẻ kiến thức và nuôi dưỡng tình yêu đọc sách giữa các sinh viên HUST. Tham gia để kết nối, chia sẻ và cùng phát triển.",
      ctaJoin: "Tham gia",
      btnBorrow: "Mượn",
      btnReserve: "Đặt trước",
      statusAvailable: "Có sẵn",
      statusBorrowed: "Đã mượn",
      byAuthor: "Tác giả: ",

      // --- Catalog ---
      pageTitleCatalog: "Danh Mục <span class='metallic-gold'>Sách</span>",
      pageDescCatalog: "Khám phá bộ sưu tập sách phong phú có sẵn để mượn",
      searchPlaceholder: "Tìm kiếm sách, tác giả...",
      filterAllCategories: "Tất cả thể loại",
      filterFiction: "Tiểu thuyết",
      filterClassic: "Kinh điển",
      filterMystery: "Bí ẩn",
      filterFantasy: "Giả tưởng",
      sortNewest: "Mới nhất",
      sortOldest: "Cũ nhất",
      sortTitleAZ: "Tiêu đề (A-Z)",
      sortAuthorAZ: "Tác giả (A-Z)",
      noBooksFound: "Không tìm thấy sách nào phù hợp với tiêu chí của bạn.",

      // --- Dashboard ---
      dashboardTag: "Thống Kê Thư Viện",
      dashboardTitle:
        "Nội Dung <span class='metallic-gold'>Đánh Giá Cao</span>",
      filterEngineering: "Kỹ thuật",
      filterLiterature: "Văn học",
      filterCustomers: "Khách hàng",
      cardTopAuthor: "Tác Giả Hàng Đầu",
      cardTopWork: "Tác Phẩm Hàng Đầu",
      cardPoints: "Điểm",
      lblFavoriteBook: "Sách yêu thích: ",
      dashDescIT: "- Chuyên gia CNTT.",
      dashDescData: "- Tác phẩm được đánh giá cao nhất về độ thực tiễn.",
      dashDescLit: "- Tác giả giàu cảm xúc.",

      // --- Login & Register ---
      tabSignIn: "Đăng Nhập",
      tabCreateAccount: "Tạo Tài Khoản",
      formWelcomeBack: "Chào Mừng Trở Lại",
      formLoginSub: "Nhập thông tin để truy cập thư viện của bạn",
      labelEmail: "Địa chỉ Email",
      placeholderEmail: "VD: sv.2023xxxx@hust.edu.vn",
      labelPassword: "Mật khẩu",
      placeholderPassword: "••••••••",
      labelForgot: "Quên mật khẩu?",
      btnSignIn: "Đăng Nhập",
      formJoinTitle: "Tham Gia HUST LBC",
      formJoinSub: "Bắt đầu hành trình đọc sách của bạn ngay hôm nay",
      labelFullName: "Họ và tên",
      placeholderName: "VD: Nguyen Bao Son",
      labelStudentEmail: "Email sinh viên",
      placeholderCreatePass: "Tạo một mật khẩu mạnh",
      labelConfirmPassword: "Xác nhận mật khẩu",
      placeholderConfirmPass: "Nhập lại mật khẩu của bạn",
      btnCreateAccount: "Tạo Tài Khoản",
      reqLength: "Ít nhất 8 ký tự",
      reqUpper: "Chứa ít nhất 1 chữ in hoa (A-Z)",
      reqNumber: "Chứa ít nhất 1 chữ số (0-9)",
      reqSpecial: "Chứa ít nhất 1 ký tự đặc biệt (@, $, !, %, *, ?, &)",
      modalWelcome: "Chào mừng đến với HUST LBC!",
      modalAccountCreated: "Tạo tài khoản thành công.",
      btnExploreDashboard: "Khám phá Dashboard",

      // --- Setting ---
      sectionTag: "Tùy Chọn Người Dùng",
      sectionTitle: "Cài Đặt <span class='metallic-gold'>Hệ Thống</span>",
      themeLabel: "Giao diện hệ thống",
      themeSub:
        "Chuyển đổi giữa giao diện nền tối sang trọng hoặc nền sáng bảo vệ mắt.",
      themeStatusDark: "Chế độ tối (Mặc định)",
      themeStatusLight: "Chế độ sáng",
      langLabel: "Ngôn ngữ hiển thị",
      langSub:
        "Chọn ngôn ngữ chính để dịch toàn bộ nội dung trên trang thư viện.",
      btnCancel: "Hủy",
      btnSave: "Lưu thay đổi",
      langOptionVI: "Tiếng Việt (Vietnamese)",
      langOptionEN: "English (Tiếng Anh)",
      langOptionJA: "日本語 (Tiếng Nhật)",
      saveSuccess: "Cài đặt đã được lưu thành công!",
    },

    en: {
      navCatalog: "Catalog",
      navDashboard: "Dashboard",
      navLogin: "Login",
      navLogout: "Logout",
      navSetting: "Setting",
      navGreeting: "Hello, ",
      footerCopyright:
        "© 2026 HUST LBC. Crafted with hyperrealistic precision.",

      heroTitle:
        "Hust <span class='metallic-gold'>LBC</span> Dedicated To Students",
      heroDesc:
        "A flexible and budget-friendly book rental service dedicated to helping HUST students expand their knowledge.",
      heroExplore: "Explore More",
      heroCardBadge: "Limited",
      heroCardTitle: "Signature Book",
      sectionCuratedTag: "Curated Selection",
      sectionCuratedTitle:
        "Featured <span class='metallic-gold'>Editions</span>",
      sectionAuthorTag: "Author",
      sectionAuthorTitle: "Popular <span class='metallic-gold'>Authors</span>",
      ctaCommunityTitle:
        "<span class='metallic-gold'>HUST LBC</span> COMMUNITY",
      ctaCommunityDesc:
        "A community of book lovers dedicated to sharing knowledge and fostering a love of reading among HUST students. Join us to connect, share, and grow together.",
      ctaJoin: "Join",
      btnBorrow: "Borrow",
      btnReserve: "Reserve",
      statusAvailable: "Available",
      statusBorrowed: "Borrowed",
      byAuthor: "By Author: ",

      pageTitleCatalog: "Book <span class='metallic-gold'>Catalog</span>",
      pageDescCatalog:
        "Browse our extensive collection of books available for checkout",
      searchPlaceholder: "Search books, authors...",
      filterAllCategories: "All Categories",
      filterFiction: "Fiction",
      filterClassic: "Classic",
      filterMystery: "Mystery",
      filterFantasy: "Fantasy",
      sortNewest: "Sort by Newest",
      sortOldest: "Sort by Oldest",
      sortTitleAZ: "Sort by Title (A-Z)",
      sortAuthorAZ: "Sort by Author (A-Z)",
      noBooksFound: "No books found matching your criteria.",

      dashboardTag: "Library Statistics",
      dashboardTitle: "Top Rated <span class='metallic-gold'>Content</span>",
      filterEngineering: "Engineering",
      filterLiterature: "Literature",
      filterCustomers: "Customers",
      cardTopAuthor: "Top Rated Author",
      cardTopWork: "Top Rated Work",
      cardPoints: "Points",
      lblFavoriteBook: "Favorite book: ",
      dashDescIT: "- IT Expert.",
      dashDescData: "- Highest rated work for practicality.",
      dashDescLit: "- Emotional author.",

      tabSignIn: "Sign In",
      tabCreateAccount: "Create Account",
      formWelcomeBack: "Welcome Back",
      formLoginSub: "Enter your credentials to access your library",
      labelEmail: "Email Address",
      placeholderEmail: "e.g., sv.2023xxxx@hust.edu.vn",
      labelPassword: "Password",
      placeholderPassword: "••••••••",
      labelForgot: "Forgot password?",
      btnSignIn: "Sign In",
      formJoinTitle: "Join HUST LBC",
      formJoinSub: "Start your reading journey today",
      labelFullName: "Full Name",
      placeholderName: "e.g., Nguyen Bao Son",
      labelStudentEmail: "Student Email",
      placeholderCreatePass: "Create a strong password",
      labelConfirmPassword: "Confirm Password",
      placeholderConfirmPass: "Re-enter your password",
      btnCreateAccount: "Create Account",
      reqLength: "At least 8 characters",
      reqUpper: "At least 1 uppercase letter (A-Z)",
      reqNumber: "At least 1 number (0-9)",
      reqSpecial: "At least 1 special character (@, $, !, %, *, ?, &)",
      modalWelcome: "Welcome to HUST LBC!",
      modalAccountCreated: "Account created successfully.",
      btnExploreDashboard: "Explore Dashboard",

      sectionTag: "User Preferences",
      sectionTitle: "System <span class='metallic-gold'>Settings</span>",
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
      langOptionVI: "Tiếng Việt (Vietnamese)",
      langOptionEN: "English (English)",
      langOptionJA: "日本語 (Japanese)",
      saveSuccess: "Settings saved successfully!",
    },

    ja: {
      navCatalog: "カタログ",
      navDashboard: "ダッシュボード",
      navLogin: "ログイン",
      navLogout: "ログアウト",
      navSetting: "設定",
      navGreeting: "こんにちは、",
      footerCopyright: "© 2026 HUST LBC. 超現実的な精度で作られています。",

      heroTitle: "Hust <span class='metallic-gold'>LBC</span> 学生のために",
      heroDesc:
        "HUSTの学生が知識を深めるための、柔軟で予算に優しい書籍レンタルサービスです。",
      heroExplore: "もっと見る",
      heroCardBadge: "限定",
      heroCardTitle: "シグネチャーブック",
      sectionCuratedTag: "厳選",
      sectionCuratedTitle:
        "注目 <span class='metallic-gold'>エディション</span>",
      sectionAuthorTag: "著者",
      sectionAuthorTitle: "人気の <span class='metallic-gold'>著者</span>",
      ctaCommunityTitle:
        "<span class='metallic-gold'>HUST LBC</span> コミュニティ",
      ctaCommunityDesc:
        "HUSTの学生間で知識を共有し、読書への愛を育む、本を愛する人々のコミュニティ。つながり、共有し、共に成長しましょう。",
      ctaJoin: "参加",
      btnBorrow: "借りる",
      btnReserve: "予約",
      statusAvailable: "利用可能",
      statusBorrowed: "貸出中",
      byAuthor: "著者: ",

      pageTitleCatalog: "書籍 <span class='metallic-gold'>カタログ</span>",
      pageDescCatalog: "貸出可能な豊富な蔵書をご覧ください",
      searchPlaceholder: "書籍、著者を検索...",
      filterAllCategories: "すべてのカテゴリー",
      filterFiction: "フィクション",
      filterClassic: "クラシック",
      filterMystery: "ミステリー",
      filterFantasy: "ファンタジー",
      sortNewest: "新着順",
      sortOldest: "古い順",
      sortTitleAZ: "タイトル順 (A-Z)",
      sortAuthorAZ: "著者順 (A-Z)",
      noBooksFound: "条件に一致する書籍が見つかりません。",

      dashboardTag: "図書館統計",
      dashboardTitle: "高評価の <span class='metallic-gold'>コンテンツ</span>",
      filterEngineering: "工学",
      filterLiterature: "文学",
      filterCustomers: "顧客",
      cardTopAuthor: "最高評価の著者",
      cardTopWork: "最高評価の作品",
      cardPoints: "ポイント",
      lblFavoriteBook: "お気に入りの本: ",
      dashDescIT: "- IT専門家。",
      dashDescData: "- 実用性で最高評価の作品。",
      dashDescLit: "- 感情豊かな著者。",

      tabSignIn: "サインイン",
      tabCreateAccount: "アカウント作成",
      formWelcomeBack: "お帰りなさい",
      formLoginSub: "図書館にアクセスするための認証情報を入力してください",
      labelEmail: "メールアドレス",
      placeholderEmail: "例: sv.2023xxxx@hust.edu.vn",
      labelPassword: "パスワード",
      placeholderPassword: "••••••••",
      labelForgot: "パスワードを忘れた？",
      btnSignIn: "サインイン",
      formJoinTitle: "HUST LBC に参加",
      formJoinSub: "今日から読書の旅を始めましょう",
      labelFullName: "氏名",
      placeholderName: "例: Nguyen Bao Son",
      labelStudentEmail: "学生メール",
      placeholderCreatePass: "強力なパスワードを作成する",
      labelConfirmPassword: "パスワードを確認",
      placeholderConfirmPass: "パスワードを再入力",
      btnCreateAccount: "アカウント作成",
      reqLength: "8文字以上",
      reqUpper: "大文字を1つ以上含める (A-Z)",
      reqNumber: "数字を1つ以上含める (0-9)",
      reqSpecial: "特殊文字を1つ以上含める (@, $, !, %, *, ?, &)",
      modalWelcome: "HUST LBC へようこそ！",
      modalAccountCreated: "アカウントが正常に作成されました。",
      btnExploreDashboard: "ダッシュボードを見る",

      sectionTag: "ユーザー設定",
      sectionTitle: "システム <span class='metallic-gold'>設定</span>",
      themeLabel: "システムインターフェース",
      themeSub:
        "高級感のあるダークテーマと目を保護するライトテーマを切り替えます。",
      themeStatusDark: "ダークモード（デフォルト）",
      themeStatusLight: "ライトモード",
      langLabel: "表示言語",
      langSub: "ライブラリサイト全体の翻訳に使用するメイン言語を選択します。",
      btnCancel: "キャンセル",
      btnSave: "変更を保存",
      langOptionVI: "Tiếng Việt (ベトナム語)",
      langOptionEN: "English (英語)",
      langOptionJA: "日本語 (日本語)",
      saveSuccess: "設定が正常に保存されました！",
    },
  };

  // ============================================================
  // 2. HÀM CÔNG KHAI (window.I18N)
  // ============================================================
  const STORAGE_THEME = "app-theme";
  const STORAGE_LANG = "app-lang";

  function applyTheme(theme) {
    if (theme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  }

  function applyLanguage(lang) {
    const data = dictionary[lang] || dictionary.vi;
    document.documentElement.setAttribute("lang", lang);

    // 1) Text thường
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (data[key] !== undefined) el.textContent = data[key];
    });

    // 2) Đọc HTML (có chứa thẻ span/em...)
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (data[key] !== undefined) el.innerHTML = data[key];
    });

    // 3) Placeholder của Form / Search
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (data[key] !== undefined) el.setAttribute("placeholder", data[key]);
    });

    document.dispatchEvent(
      new CustomEvent("i18n:applied", { detail: { lang } }),
    );
  }

  function init() {
    const savedTheme = localStorage.getItem(STORAGE_THEME) || "dark";
    const savedLang = localStorage.getItem(STORAGE_LANG) || "vi";

    applyTheme(savedTheme);
    applyLanguage(savedLang);
  }

  window.I18N = {
    dictionary,
    applyTheme,
    applyLanguage,
    saveTheme(theme) {
      localStorage.setItem(STORAGE_THEME, theme);
      applyTheme(theme);
    },
    saveLanguage(lang) {
      localStorage.setItem(STORAGE_LANG, lang);
      applyLanguage(lang);
    },
    getTheme: () => localStorage.getItem(STORAGE_THEME) || "dark",
    getLang: () => localStorage.getItem(STORAGE_LANG) || "vi",
    preview(theme, lang) {
      if (theme) applyTheme(theme);
      if (lang) applyLanguage(lang);
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
