document.addEventListener("DOMContentLoaded", () => {
  console.log("🔥 Dashboard Command Center Running!");

  const boardContainer = document.getElementById("leaderboard-list");
  const trendingGrid = document.getElementById("trending-books-grid");
  const authorSelect = document.getElementById("author-sort-select");
  const authorList = document.getElementById("author-ranking-list");
  const pillBtns = document.querySelectorAll(".pill-btn");

  // ==========================================
  // HÀM LẤY TỪ ĐIỂN ĐA NGÔN NGỮ TỪ i18n.js CỦA CẬU
  // ==========================================
  function getDashboardDictionary() {
    const lang = window.I18N ? window.I18N.getLang() : "vi";

    // Từ điển động bổ trợ cho các hậu tố dữ liệu tài chính/thư viện
    const localDict = {
      vi: {
        suffixBooks: "cuốn sách",
        suffixBorrows: "lượt mượn",
        suffixViews: "lượt xem",
        suffixVotes: "vote",
        suffixLoves: "yêu thích",
      },
      en: {
        suffixBooks: "books",
        suffixBorrows: "borrows",
        suffixViews: "views",
        suffixVotes: "votes",
        suffixLoves: "loves",
      },
      ja: {
        suffixBooks: "冊",
        suffixBorrows: "貸出",
        suffixViews: "閲覧",
        suffixVotes: "評価",
        suffixLoves: "お気に入り",
      },
    };
    return localDict[lang] || localDict["vi"];
  }

  // ==========================================
  // 1. DATA MOCKUP CHUẨN
  // ==========================================
  const leaderboardData = [
    { name: "Nguyễn Bảo Sơn", score: 145, trend: "up", percent: "+12%" },
    { name: "Hoàng Anh Trần", score: 120, trend: "up", percent: "+5%" },
    { name: "Nguyễn Huy Dũng", score: 98, trend: "down", percent: "-2%" },
    { name: "Trần Tú Linh", score: 85, trend: "up", percent: "+8%" },
    { name: "Đỗ Hoàng Phúc", score: 60, trend: "down", percent: "-1%" },
  ];

  const trendingBooksData = {
    day: [
      {
        img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80",
        title: "The Spanish Bride",
        count: 15,
      },
      {
        img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&q=80",
        title: "The Great Gatsby",
        count: 12,
      },
      {
        img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200&q=80",
        title: "The Secret Garden",
        count: 9,
      },
    ],
    month: [
      {
        img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80",
        title: "The Spanish Bride",
        count: 420,
      },
      {
        img: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&q=80",
        title: "Human Anatomy",
        count: 315,
      },
      {
        img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&q=80",
        title: "The Great Gatsby",
        count: 280,
      },
    ],
    year: [
      {
        img: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&q=80",
        title: "Human Anatomy",
        count: 3500,
      },
      {
        img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80",
        title: "The Spanish Bride",
        count: 2100,
      },
      {
        img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200&q=80",
        title: "The Secret Garden",
        count: 1800,
      },
    ],
  };

  const authorsData = {
    views: [
      {
        name: "Georgette Heyer",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80",
        value: "84K",
      },
      {
        name: "J.K. Rowling",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
        value: "72K",
      },
      {
        name: "George R.R. Martin",
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80",
        value: "65K",
      },
      {
        name: "Agatha Christie",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
        value: "50K",
      },
    ],
    borrows: [
      {
        name: "George R.R. Martin",
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80",
        value: "450",
      },
      {
        name: "Agatha Christie",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
        value: "412",
      },
      {
        name: "J.K. Rowling",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
        value: "380",
      },
      {
        name: "Georgette Heyer",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80",
        value: "290",
      },
    ],
    votes: [
      {
        name: "J.K. Rowling",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
        value: "12K",
      },
      {
        name: "Georgette Heyer",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80",
        value: "11K",
      },
      {
        name: "Agatha Christie",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
        value: "9K",
      },
      {
        name: "George R.R. Martin",
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80",
        value: "8K",
      },
    ],
    loves: [
      {
        name: "Agatha Christie",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
        value: "9.8K",
      },
      {
        name: "George R.R. Martin",
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80",
        value: "8.5K",
      },
      {
        name: "Georgette Heyer",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80",
        value: "7.2K",
      },
      {
        name: "J.K. Rowling",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
        value: "6.9K",
      },
    ],
  };

  // ==========================================
  // HÀM RENDER CÁC COMPONENT DỮ LIỆU ĐỘNG
  // ==========================================
  let activeTimeframe = "day";

  function renderAll() {
    const t = getDashboardDictionary();

    // 1. Vẽ Leaderboard (Thêm row-fade-in)
    if (boardContainer) {
      boardContainer.innerHTML = leaderboardData
        .map((user, index) => {
          let rankClass =
            index === 0
              ? "rank-1"
              : index === 1
                ? "rank-2"
                : index === 2
                  ? "rank-3"
                  : "rank-other";
          const trendIcon = user.trend === "up" ? "▲" : "▼";
          const trendClass = user.trend === "up" ? "trend-up" : "trend-down";

          return `
          <div class="fintech-item row-fade-in" style="animation-delay: ${index * 0.1}s">
            <div class="rank ${rankClass}">${index + 1}</div>
            <div class="fintech-user-info">
              <h4 class="fintech-name">${user.name}</h4>
              <div class="fintech-score">${user.score} ${t.suffixBooks}</div>
            </div>
            <div class="trend ${trendClass}">${trendIcon} ${user.percent}</div>
          </div>`;
        })
        .join("");
    }

    // 2. Vẽ Sách Thịnh Hành (Thêm row-fade-in)
    if (trendingGrid) {
      const data = trendingBooksData[activeTimeframe];
      trendingGrid.innerHTML = data
        .map(
          (book, index) => `
        <div class="trend-book-card row-fade-in" style="animation-delay: ${index * 0.1}s">
          <img src="${book.img}" alt="Cover" class="trend-book-img">
          <div>
            <h4 class="trend-book-title">${book.title}</h4>
            <span class="trend-book-stat">${book.count.toLocaleString()} ${t.suffixBorrows}</span>
          </div>
        </div>`,
        )
        .join("");
    }

    // 3. Vẽ Tác giả Xếp hạng (Thêm row-fade-in)
    if (authorList && authorSelect) {
      const criteria = authorSelect.value;
      const data = authorsData[criteria];

      let suffixKey = "suffixViews";
      if (criteria === "borrows") suffixKey = "suffixBorrows";
      if (criteria === "votes") suffixKey = "suffixVotes";
      if (criteria === "loves") suffixKey = "suffixLoves";

      authorList.innerHTML = data
        .map(
          (author, index) => `
        <div class="author-card row-fade-in" style="animation-delay: ${index * 0.1}s">
          <img src="${author.avatar}" alt="Avatar" class="author-avatar">
          <h4 class="author-name">${author.name}</h4>
          <div class="author-metric">${author.value} ${t[suffixKey]}</div>
        </div>`,
        )
        .join("");
    }
  }

  // ==========================================
  // LẮNG NGHE SỰ KIỆN CHUYỂN ĐỔI NGÔN NGỮ TỪ i18n.js
  // ==========================================
  document.addEventListener("i18n:applied", () => {
    console.log("🔄 i18n:applied captured! Re-rendering Dashboard content...");
    renderAll();
  });

  // Bắt sự kiện chuyển Tab Sách thịnh hành
  pillBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      pillBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeTimeframe = btn.getAttribute("data-time");
      renderAll();
    });
  });

  // Bắt sự kiện Dropdown tiêu chí Tác giả
  if (authorSelect) {
    authorSelect.addEventListener("change", renderAll);
  }

  // Chạy kết xuất lần đầu tiên
  renderAll();
});
