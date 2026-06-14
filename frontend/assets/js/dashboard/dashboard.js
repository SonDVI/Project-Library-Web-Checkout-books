document.addEventListener("DOMContentLoaded", () => {
  console.log("🔥 Dashboard Command Center Running (Synced with DB)!");

  const boardContainer = document.getElementById("leaderboard-list");
  const trendingGrid = document.getElementById("trending-books-grid");
  const authorSelect = document.getElementById("author-sort-select");
  const authorList = document.getElementById("author-ranking-list");
  const pillBtns = document.querySelectorAll(".pill-btn");

  let activeTimeframe = "day";
  let realUsers = [];
  let realBooks = [];

  // ==========================================
  // HÀM LẤY TỪ ĐIỂN ĐA NGÔN NGỮ
  // ==========================================
  function getDashboardDictionary() {
    const lang = window.I18N ? window.I18N.getLang() : "vi";
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
  // 1. TẢI DỮ LIỆU THỰC TẾ TỪ C++ BACKEND
  // ==========================================
  async function fetchDatabase() {
    try {
      // Gọi song song 2 API để tối ưu tốc độ load
      const [resUsers, resBooks] = await Promise.all([
        fetch("http://localhost:8080/api/admin/users"),
        fetch("http://localhost:8080/api/admin/books"),
      ]);

      if (resUsers.ok) realUsers = await resUsers.json();
      if (resBooks.ok) realBooks = await resBooks.json();

      renderAll(); // Cấu trúc xong thì ra lệnh vẽ lên UI
    } catch (error) {
      console.error("Lỗi đồng bộ Database:", error);
      if (boardContainer)
        boardContainer.innerHTML =
          "<p style='color:#ff4757;'>⚠️ Mất kết nối tới Server C++!</p>";
    }
  }

  // ==========================================
  // 2. HÀM XỬ LÝ DỮ LIỆU & RENDER LÊN GIAO DIỆN
  // ==========================================
  function renderAll() {
    const t = getDashboardDictionary();

    // --- A. BẢNG XẾP HẠNG ĐỘC GIẢ ---
    if (boardContainer && realUsers.length > 0) {
      // Lọc và Sắp xếp user theo số lượng sách đang mượn (Giảm dần)
      let sortedUsers = [...realUsers].sort(
        (a, b) => b.borrow_count - a.borrow_count,
      );
      let topUsers = sortedUsers.slice(0, 5); // Lấy Top 5

      boardContainer.innerHTML = topUsers
        .map((user, index) => {
          let rankClass =
            index === 0
              ? "rank-1"
              : index === 1
                ? "rank-2"
                : index === 2
                  ? "rank-3"
                  : "rank-other";

          // Thuật toán giả lập Trend (Mũi tên xanh đỏ) để UI đẹp mắt
          const trendIcon = index % 2 === 0 ? "▲" : "▼";
          const trendClass = index % 2 === 0 ? "trend-up" : "trend-down";
          const percent = "+" + (Math.floor(Math.random() * 10) + 1) + "%";

          return `
        <div class="fintech-item row-fade-in" style="animation-delay: ${index * 0.1}s">
          <div class="rank ${rankClass}">${index + 1}</div>
          <div class="fintech-user-info">
            <h4 class="fintech-name">${user.name} <span style="font-size:0.7rem; color:#888;">(${user.role})</span></h4>
            <div class="fintech-score">${user.borrow_count} ${t.suffixBooks}</div>
          </div>
          <div class="trend ${trendClass}">${trendIcon} ${percent}</div>
        </div>`;
        })
        .join("");
    }

    // --- B. SÁCH THỊNH HÀNH (TRENDING) ---
    if (trendingGrid && realBooks.length > 0) {
      // Gom nhóm sách theo tiêu đề để đếm số lượng bản sao / độ phổ biến
      let bookGroups = {};
      realBooks.forEach((b) => {
        if (!bookGroups[b.title]) {
          bookGroups[b.title] = {
            title: b.title,
            img:
              b.image_url ||
              "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80",
            baseCount: 0,
          };
        }
        bookGroups[b.title].baseCount++;
      });

      // Sắp xếp lấy Top 3 sách phổ biến nhất kho
      let trendingArr = Object.values(bookGroups)
        .sort((a, b) => b.baseCount - a.baseCount)
        .slice(0, 3);

      // Hệ số nhân giả lập theo thời gian (Day/Month/Year)
      let multiplier =
        activeTimeframe === "year" ? 150 : activeTimeframe === "month" ? 12 : 1;

      trendingGrid.innerHTML = trendingArr
        .map((book, index) => {
          let displayCount =
            book.baseCount * multiplier + Math.floor(Math.random() * 5);
          return `
        <div class="trend-book-card row-fade-in" style="animation-delay: ${index * 0.1}s">
          <img src="${book.img}" alt="Cover" class="trend-book-img" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80'">
          <div>
            <h4 class="trend-book-title">${book.title}</h4>
            <span class="trend-book-stat">${displayCount.toLocaleString()} ${t.suffixBorrows}</span>
          </div>
        </div>`;
        })
        .join("");
    }

    // --- C. XẾP HẠNG TÁC GIẢ ---
    if (authorList && authorSelect && realBooks.length > 0) {
      const criteria = authorSelect.value;

      // Gom nhóm sách theo Tác giả
      let authGroups = {};
      realBooks.forEach((b) => {
        const aName = b.author || "Khuyết danh";
        if (aName === "Chưa cập nhật") return; // Bỏ qua tác giả rác
        if (!authGroups[aName]) {
          authGroups[aName] = {
            name: aName,
            avatar:
              b.author_image_url ||
              "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80",
            baseScore: 0,
          };
        }
        authGroups[aName].baseScore++;
      });

      // Lấy Top 4 tác giả có nhiều đầu sách nhất
      let authorArr = Object.values(authGroups)
        .sort((a, b) => b.baseScore - a.baseScore)
        .slice(0, 4);

      let suffixKey = "suffixViews";
      let multi = 1000;
      if (criteria === "borrows") {
        suffixKey = "suffixBorrows";
        multi = 15;
      }
      if (criteria === "votes") {
        suffixKey = "suffixVotes";
        multi = 300;
      }
      if (criteria === "loves") {
        suffixKey = "suffixLoves";
        multi = 800;
      }

      authorList.innerHTML = authorArr
        .map((author, index) => {
          let calcScore =
            author.baseScore * multi + Math.floor(Math.random() * multi);
          let displayVal = calcScore.toLocaleString();

          // Format chữ 'K' (Nghìn) nếu số quá to
          if (calcScore > 1000 && criteria !== "borrows") {
            displayVal = (calcScore / 1000).toFixed(1) + "K";
          }

          return `
          <div class="author-card row-fade-in" style="animation-delay: ${index * 0.1}s">
            <img src="${author.avatar}" alt="Avatar" class="author-avatar" onerror="this.src='https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80'">
            <h4 class="author-name">${author.name}</h4>
            <div class="author-metric">${displayVal} ${t[suffixKey]}</div>
          </div>`;
        })
        .join("");
    }
  }

  // ==========================================
  // 3. LẮNG NGHE CÁC SỰ KIỆN NÚT BẤM VÀ NGÔN NGỮ
  // ==========================================
  document.addEventListener("i18n:applied", () => {
    renderAll();
  });

  pillBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      pillBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeTimeframe = btn.getAttribute("data-time");
      renderAll();
    });
  });

  if (authorSelect) {
    authorSelect.addEventListener("change", renderAll);
  }

  // 🚀 KÍCH HOẠT HỆ THỐNG ĐỒNG BỘ
  fetchDatabase();
});
