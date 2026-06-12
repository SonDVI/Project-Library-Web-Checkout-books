document.addEventListener("DOMContentLoaded", () => {
  const gridArea = document.getElementById("books-render-area");
  const searchInput = document.getElementById("catalog-search");
  const searchCategory = document.getElementById("search-category");
  const suggestBox = document.getElementById("suggest-box");

  const pageNumbersContainer = document.getElementById("page-numbers");
  const btnPrev = document.getElementById("prev-page");
  const btnNext = document.getElementById("next-page");

  // =====================================================================
  // KHO SÁCH (MOCK DB)
  // =====================================================================
  const booksDB = [
    {
      id: "B1",
      title: "The Spanish Bride",
      author: "Georgette Heyer",
      cover:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
      status: "ok",
      cat: "lit",
    },
    {
      id: "B2",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      cover:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
      status: "ok",
      cat: "lit",
    },
    {
      id: "B3",
      title: "C++ Programming",
      author: "Bjarne Stroustrup",
      cover:
        "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80",
      status: "out",
      cat: "tech",
    },
    {
      id: "B4",
      title: "YOLOv11 Architecture",
      author: "AI Research",
      cover:
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80",
      status: "ok",
      cat: "tech",
    },
    {
      id: "B5",
      title: "Calisthenics Mastery",
      author: "Frank Medrano",
      cover:
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80",
      status: "ok",
      cat: "fit",
    },
    {
      id: "B6",
      title: "Deep Learning",
      author: "Ian Goodfellow",
      cover:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
      status: "ok",
      cat: "tech",
    },
  ];

  let currentPage = 1;
  const itemsPerPage = 6;
  let currentDisplayData = [...booksDB];

  // =====================================================================
  // HÀM VẼ LƯỚI SÁCH (SỬ DỤNG TỪ ĐIỂN TỪ i18n.js CỦA CẬU)
  // =====================================================================
  function renderGrid() {
    if (!gridArea) return;
    gridArea.innerHTML = "";

    // 🔥 MÓC VÀO BỘ NÃO window.I18N MÀ CẬU ĐÃ TẠO
    const lang = window.I18N ? window.I18N.getLang() : "vi";
    const t =
      window.I18N && window.I18N.dictionary ? window.I18N.dictionary[lang] : {};

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = currentDisplayData.slice(startIndex, endIndex);

    gridArea.innerHTML = paginatedItems
      .map((book) => {
        const isAvailable = book.status === "ok";

        // 🚀 DỊCH TỰ ĐỘNG BẰNG TỪ ĐIỂN CỦA CẬU!
        const statusText = isAvailable
          ? t.statusAvailable || "Available"
          : t.statusBorrowed || "Borrowed";
        const btnText = isAvailable
          ? t.btnBorrow || "Borrow"
          : t.btnReserve || "Reserve";
        const authorPrefix = t.byAuthor || "By: ";

        const btnClass = isAvailable ? "btn-gold" : "btn-outline";
        const priceColor = isAvailable ? "var(--color-gold)" : "#ff4757";

        return `
        <div class="product-card" onclick="window.location.href='book-detail.html'">
          <div class="product-card-inner">
            <div class="product-image">
              <img src="${book.cover}" alt="Book Cover" />
            </div>
            <h3 class="product-title">${book.title}</h3>
            <h2 class="product-title" style="font-family:var(--font-body); font-size:0.85rem; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:1rem;">
              ${authorPrefix} ${book.author}
            </h2>
            <p class="product-price" style="color: ${priceColor}">${statusText}</p>
            <button class="btn ${btnClass} btn-block card-action">${btnText}</button>
          </div>
        </div>
      `;
      })
      .join("");

    renderPaginationControls();
  }

  // LẮNG NGHE SỰ KIỆN: Bất cứ khi nào i18n.js áp dụng ngôn ngữ mới, vẽ lại sách!
  document.addEventListener("i18n:applied", () => {
    // Cập nhật Placeholder thanh tìm kiếm
    const lang = window.I18N.getLang();
    const t = window.I18N.dictionary[lang];
    if (searchInput && t && t.searchPlaceholder) {
      searchInput.placeholder = t.searchPlaceholder;
    }
    renderGrid();
  });

  // =====================================================================
  // HÀM PHÂN TRANG & NÚT BẤM (GIỮ NGUYÊN)
  // =====================================================================
  function renderPaginationControls() {
    const totalPages = Math.ceil(currentDisplayData.length / itemsPerPage);
    if (pageNumbersContainer) {
      pageNumbersContainer.innerHTML = "";
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.className = `page-btn ${i === currentPage ? "active" : ""}`;
        btn.innerText = i;
        btn.addEventListener("click", () => {
          currentPage = i;
          renderGrid();
        });
        pageNumbersContainer.appendChild(btn);
      }
    }
    if (btnPrev) btnPrev.disabled = currentPage === 1;
    if (btnNext)
      btnNext.disabled = currentPage === totalPages || totalPages === 0;
  }

  if (btnPrev)
    btnPrev.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderGrid();
      }
    });
  if (btnNext)
    btnNext.addEventListener("click", () => {
      const totalPages = Math.ceil(currentDisplayData.length / itemsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderGrid();
      }
    });

  renderGrid();

  // =====================================================================
  // HÀM TÌM KIẾM AUTO-SUGGEST
  // =====================================================================
  if (searchInput && suggestBox && searchCategory) {
    searchInput.addEventListener("input", (e) => {
      const keyword = e.target.value.toLowerCase().trim();
      const catFilter = searchCategory.value;

      if (keyword.length === 0) {
        suggestBox.style.display = "none";
        currentDisplayData = [...booksDB];
        currentPage = 1;
        renderGrid();
        return;
      }

      currentDisplayData = booksDB.filter((b) => {
        if (catFilter === "title")
          return b.title.toLowerCase().includes(keyword);
        if (catFilter === "author")
          return b.author.toLowerCase().includes(keyword);
        return (
          b.title.toLowerCase().includes(keyword) ||
          b.author.toLowerCase().includes(keyword)
        );
      });

      currentPage = 1;
      renderGrid();

      if (currentDisplayData.length > 0) {
        suggestBox.style.display = "block";
        suggestBox.innerHTML = currentDisplayData
          .slice(0, 4)
          .map(
            (b) => `
          <div class="suggest-item" data-title="${b.title}">
            <div>
              <div style="color: var(--color-text); font-weight: 500;">${b.title}</div>
              <div style="color: var(--color-text-muted); font-size: 0.8rem;">${b.author}</div>
            </div>
          </div>
        `,
          )
          .join("");
      } else {
        const lang = window.I18N ? window.I18N.getLang() : "vi";
        const t =
          window.I18N && window.I18N.dictionary
            ? window.I18N.dictionary[lang]
            : {};
        const msg = t.noBooksFound || "⚠️ Không tìm thấy kết quả.";

        suggestBox.style.display = "block";
        suggestBox.innerHTML = `<div class="suggest-item" style="color:#ff4757;">${msg}</div>`;
      }
    });

    suggestBox.addEventListener("click", (e) => {
      const item = e.target.closest(".suggest-item");
      if (item && item.getAttribute("data-title")) {
        searchInput.value = item.getAttribute("data-title");
        suggestBox.style.display = "none";
      }
    });

    document.addEventListener("click", (e) => {
      if (
        e.target !== searchInput &&
        e.target !== suggestBox &&
        e.target !== searchCategory
      ) {
        suggestBox.style.display = "none";
      }
    });
  }
});
