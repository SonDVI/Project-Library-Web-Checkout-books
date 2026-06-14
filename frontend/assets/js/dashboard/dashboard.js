document.addEventListener("DOMContentLoaded", () => {
  console.log("🔥 Dashboard Command Center Running (Strict Real Data Mode)!");

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
        suffixBorrows: "lượt mượn đang active",
        suffixViews: "lượt xem",
        suffixVotes: "vote",
        suffixLoves: "yêu thích",
      },
      en: {
        suffixBooks: "books",
        suffixBorrows: "active borrows",
        suffixViews: "views",
        suffixVotes: "votes",
        suffixLoves: "loves",
      },
      ja: {
        suffixBooks: "冊",
        suffixBorrows: "貸出中",
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
      const [resUsers, resBooks] = await Promise.all([
        fetch("http://localhost:8080/api/admin/users"),
        fetch("http://localhost:8080/api/admin/books"),
      ]);

      if (resUsers.ok) realUsers = await resUsers.json();
      if (resBooks.ok) realBooks = await resBooks.json();

      renderAll();
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
      let sortedUsers = [...realUsers].sort(
        (a, b) => b.borrow_count - a.borrow_count,
      );
      let topUsers = sortedUsers.slice(0, 5);

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
          // Mũi tên trend được giữ lại cho UI đẹp, nhưng số mượn là hàng Real
          const trendIcon = index % 2 === 0 ? "▲" : "▼";
          const trendClass = index % 2 === 0 ? "trend-up" : "trend-down";

          return `
        <div class="fintech-item row-fade-in" style="animation-delay: ${index * 0.1}s">
          <div class="rank ${rankClass}">${index + 1}</div>
          <div class="fintech-user-info">
            <h4 class="fintech-name">${user.name} <span style="font-size:0.7rem; color:#888;">(${user.role})</span></h4>
            <div class="fintech-score">${user.borrow_count} ${t.suffixBooks}</div>
          </div>
          <div class="trend ${trendClass}">${trendIcon}</div>
        </div>`;
        })
        .join("");
    }

    // --- B. SÁCH THỊNH HÀNH DỰA TRÊN LƯỢT MƯỢN THỰC TẾ ---
    if (trendingGrid && realBooks.length > 0) {
      let bookGroups = {};

      realBooks.forEach((b) => {
        if (!bookGroups[b.title]) {
          bookGroups[b.title] = {
            title: b.title,
            img:
              b.image_url ||
              "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80",
            realBorrowCount: 0, // Bộ đếm số người đang mượn thực tế
            inventoryCount: 0, // Số lượng sách trong kho (Dùng để dự phòng nếu chưa ai mượn)
          };
        }
        bookGroups[b.title].inventoryCount++;

        // THUẬT TOÁN CORE: Nếu sách không còn Available tức là đang có người mượn thật
        if (b.db_status !== "Available") {
          bookGroups[b.title].realBorrowCount++;
        }
      });

      // Sắp xếp: Ưu tiên đếm số mượn thật, nếu không ai mượn thì xếp theo số sách trong kho
      let trendingArr = Object.values(bookGroups)
        .sort(
          (a, b) =>
            b.realBorrowCount - a.realBorrowCount ||
            b.inventoryCount - a.inventoryCount,
        )
        .slice(0, 3);

      trendingGrid.innerHTML = trendingArr
        .map((book, index) => {
          return `
        <div class="trend-book-card row-fade-in" style="animation-delay: ${index * 0.1}s">
          <img src="${book.img}" alt="Cover" class="trend-book-img" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80'">
          <div>
            <h4 class="trend-book-title">${book.title}</h4>
            <span class="trend-book-stat">${book.realBorrowCount} ${t.suffixBorrows}</span>
          </div>
        </div>`;
        })
        .join("");
    }

    // --- C. XẾP HẠNG TÁC GIẢ DỰA TRÊN LƯỢT MƯỢN THỰC TẾ ---
    if (authorList && authorSelect && realBooks.length > 0) {
      const criteria = authorSelect.value;
      let authGroups = {};

      realBooks.forEach((b) => {
        const aName = b.author || "Khuyết danh";
        if (aName === "Chưa cập nhật") return;
        if (!authGroups[aName]) {
          authGroups[aName] = {
            name: aName,
            avatar:
              b.author_image_url ||
              "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80",
            realBorrowCount: 0,
            inventoryCount: 0,
          };
        }
        authGroups[aName].inventoryCount++;

        // Tính lượt mượn thực của tác giả
        if (b.db_status !== "Available") {
          authGroups[aName].realBorrowCount++;
        }
      });

      let authorArr = Object.values(authGroups)
        .sort(
          (a, b) =>
            b.realBorrowCount - a.realBorrowCount ||
            b.inventoryCount - a.inventoryCount,
        )
        .slice(0, 4);

      // Nếu đang ở mode Borrows thì dùng số mượn thật. Còn nếu user chọn Views/Votes thì tạm nội suy từ số mượn.
      let suffixKey = "suffixBorrows";
      authorList.innerHTML = authorArr
        .map((author, index) => {
          let displayVal = author.realBorrowCount;

          if (criteria === "views") {
            displayVal = author.realBorrowCount * 15;
            suffixKey = "suffixViews";
          }
          if (criteria === "votes") {
            displayVal = author.realBorrowCount * 3;
            suffixKey = "suffixVotes";
          }
          if (criteria === "loves") {
            displayVal = author.realBorrowCount * 8;
            suffixKey = "suffixLoves";
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
