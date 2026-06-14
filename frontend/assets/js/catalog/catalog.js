document.addEventListener("DOMContentLoaded", () => {
  const gridArea = document.getElementById("books-render-area");
  const searchInput = document.getElementById("catalog-search");
  const searchCategory = document.getElementById("search-category");
  const suggestBox = document.getElementById("suggest-box");

  const pageNumbersContainer = document.getElementById("page-numbers");
  const btnPrev = document.getElementById("prev-page");
  const btnNext = document.getElementById("next-page");

  const filterAvailable = document.getElementById("filter-available");
  const radioCats = document.querySelectorAll('input[name="cat"]');
  const sortSelect = document.getElementById("sort-select");

  let booksDB = [];
  let currentDisplayData = [];
  let currentPage = 1;
  const itemsPerPage = 6;

  // 1. TẢI DỮ LIỆU SÁCH TỪ DATABASE C++
  async function loadBooksFromDB() {
    try {
      const res = await fetch("http://localhost:8080/api/admin/books");
      if (res.ok) {
        const data = await res.json();
        booksDB = data.map((b) => ({
          raw_id: b.raw_id,
          id: b.id,
          title: b.title,
          author: b.author,
          category: b.category,
          cover:
            b.image_url ||
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
          status: b.db_status === "Available" ? "ok" : "out",
          price: b.price,
        }));
        applyFilters();
      }
    } catch (err) {
      console.error("Lỗi lấy dữ liệu sách từ Backend:", err);
      gridArea.innerHTML = `<div class="empty-catalog fade-in-up"><p style="color:#ff4757; font-size: 1.2rem;">⚠️ Lỗi: Không thể kết nối với máy chủ C++!</p></div>`;
    }
  }

  // 2. BỘ LỌC TỔNG HỢP
  function applyFilters() {
    const keyword = searchInput.value.toLowerCase().trim();
    const searchType = searchCategory.value;
    const mustBeAvailable = filterAvailable ? filterAvailable.checked : false;
    const catFilter = document.querySelector('input[name="cat"]:checked').value;

    currentDisplayData = booksDB.filter((b) => {
      if (mustBeAvailable && b.status !== "ok") return false;

      const catLower = b.category.toLowerCase();
      if (
        catFilter === "lit" &&
        !catLower.includes("văn") &&
        !catLower.includes("tiểu thuyết")
      )
        return false;
      if (
        catFilter === "tech" &&
        !catLower.includes("kỹ thuật") &&
        !catLower.includes("công nghệ") &&
        !catLower.includes("it")
      )
        return false;

      if (keyword.length > 0) {
        if (searchType === "title")
          return b.title.toLowerCase().includes(keyword);
        if (searchType === "author")
          return b.author.toLowerCase().includes(keyword);
        return (
          b.title.toLowerCase().includes(keyword) ||
          b.author.toLowerCase().includes(keyword)
        );
      }
      return true;
    });

    if (sortSelect) {
      const sortVal = sortSelect.value;
      if (sortVal.includes("Mới nhất"))
        currentDisplayData.sort((a, b) => b.raw_id - a.raw_id);
      if (sortVal.includes("Tiêu đề"))
        currentDisplayData.sort((a, b) => a.title.localeCompare(b.title));
      if (sortVal.includes("Tác giả"))
        currentDisplayData.sort((a, b) => a.author.localeCompare(b.author));
    }

    currentPage = 1;
    renderGrid();
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (searchCategory) searchCategory.addEventListener("change", applyFilters);
  if (filterAvailable) filterAvailable.addEventListener("change", applyFilters);
  if (sortSelect) sortSelect.addEventListener("change", applyFilters);
  radioCats.forEach((radio) => radio.addEventListener("change", applyFilters));

  // =====================================================================
  // 3. HÀM VẼ LƯỚI SÁCH VỚI HIỆU ỨNG TRƯỢT NỐI TIẾP VÀ ẢNH CHỐNG LỖI
  // =====================================================================
  function renderGrid() {
    if (!gridArea) return;
    gridArea.innerHTML = "";

    const lang = window.I18N ? window.I18N.getLang() : "vi";
    const t =
      window.I18N && window.I18N.dictionary ? window.I18N.dictionary[lang] : {};

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = currentDisplayData.slice(startIndex, endIndex);

    if (paginatedItems.length === 0) {
      // 🌟 NÂNG CẤP: Empty State đồ họa đẹp mắt
      gridArea.innerHTML = `
        <div class="empty-catalog fade-in-up">
          <div style="font-size: 3.5rem; margin-bottom: 1rem; opacity: 0.6;">🔍</div>
          <p style="color: #8e9bb0; font-size: 1.1rem; line-height: 1.5;">
            Không tìm thấy cuốn sách nào phù hợp với bộ lọc của cậu.<br>
            Hãy thử tìm với một từ khóa khác nhé!
          </p>
        </div>`;
    } else {
      gridArea.innerHTML = paginatedItems
        .map((book, index) => {
          const isAvailable = book.status === "ok";
          const statusText = isAvailable
            ? t.statusAvailable || "Sẵn sàng"
            : t.statusBorrowed || "Đang được mượn";
          const btnText = isAvailable
            ? t.btnBorrow || "Mượn sách"
            : t.btnReserve || "Đặt trước";
          const btnClass = isAvailable ? "btn-gold" : "btn-outline";
          const priceColor = isAvailable ? "var(--color-gold)" : "#ff4757";

          // Thuật toán Stagger: Độ trễ tăng dần 0.05s cho từng cuốn sách
          const delay = index * 0.05;

          // 🌟 NÂNG CẤP: onerror trong <img> giúp tự động tải ảnh mặc định nếu link chết
          return `
          <div class="product-card fade-in-up" onclick="window.location.href='book-detail.html?id=${book.raw_id}'" style="cursor: pointer; animation-delay: ${delay}s;">
            <div class="product-card-inner">
              <div class="product-image">
                <img src="${book.cover}" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80'" alt="Book Cover" />
              </div>
              <h3 class="product-title">${book.title}</h3>
              <h2 class="product-title" style="font-family:var(--font-body); font-size:0.85rem; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:1rem;">
                Bởi: ${book.author}
              </h2>
              <p class="product-price" style="color: ${priceColor}">${statusText}</p>
              <button class="btn ${btnClass} btn-block card-action" onclick="event.stopPropagation(); window.location.href='book-detail.html?id=${book.raw_id}'">${btnText}</button>
            </div>
          </div>
        `;
        })
        .join("");
    }

    renderPaginationControls();
  }

  // 4. PHÂN TRANG
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
          renderGrid(); // Khi click chuyển trang, renderGrid chạy lại -> Hiệu ứng lướt lặp lại!
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
      const max = Math.ceil(currentDisplayData.length / itemsPerPage);
      if (currentPage < max) {
        currentPage++;
        renderGrid();
      }
    });

  loadBooksFromDB();
});
