// ==========================================================================
// CATALOG DATA & LOGIC
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Dữ liệu giả (Mock Data)
  const booksDB = [
    {
      id: 1,
      title: "The Spanish Bride",
      author: "Georgette Heyer",
      category: "Fiction",
      status: "Available",
      date: "2023-10-01",
      img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
    },
    {
      id: 2,
      title: "The Big Clock",
      author: "Kenneth Fearing",
      category: "Mystery",
      status: "Borrowed",
      date: "2023-09-15",
      img: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80",
    },
    {
      id: 3,
      title: "The Secret Garden",
      author: "Frances Hodgson Burnett",
      category: "Classic",
      status: "Available",
      date: "2024-01-20",
      img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80",
    },
    {
      id: 4,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      category: "Classic",
      status: "Available",
      date: "2023-11-05",
      img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
    },
    {
      id: 5,
      title: "Huckleberry Finn",
      author: "Mark Twain",
      category: "Classic",
      status: "Available",
      date: "2022-05-10",
      img: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80",
    },
    {
      id: 6,
      title: "Dune",
      author: "Frank Herbert",
      category: "Fantasy",
      status: "Available",
      date: "2024-02-01",
      img: "https://images.unsplash.com/photo-1524995997946-a1c9e3154a63?w=600&q=80",
    },
    {
      id: 7,
      title: "1984",
      author: "George Orwell",
      category: "Fiction",
      status: "Reserved",
      date: "2023-12-12",
      img: "https://images.unsplash.com/photo-1543002589-bfa54ab09368?w=600&q=80",
    },
    {
      id: 8,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      category: "Fiction",
      status: "Available",
      date: "2023-08-22",
      img: "https://images.unsplash.com/photo-1554080353-ff56c2e61dc6?w=600&q=80",
    },
    {
      id: 9,
      title: "Sherlock Holmes",
      author: "Arthur Conan Doyle",
      category: "Mystery",
      status: "Available",
      date: "2021-06-15",
      img: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80",
    },
  ];

  // 2. Lấy các phần tử HTML
  const container = document.getElementById("catalog-container");
  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");
  const sortFilter = document.getElementById("sort-filter");

  if (!container) return; // Dừng lại nếu không ở trang Catalog

  // 3. Hàm tạo khối HTML sách (Đã thêm hiệu ứng Staggered Animation)
  function renderCatalog(books) {
    container.innerHTML = "";

    if (books.length === 0) {
      container.innerHTML = `<h3 style="text-align:center; color: var(--color-text-muted); padding: 4rem; animation: fadeInUp 0.5s ease both;">No books found matching your criteria.</h3>`;
      return;
    }

    // Gộp sách theo category
    const groupedBooks = books.reduce((acc, book) => {
      if (!acc[book.category]) acc[book.category] = [];
      acc[book.category].push(book);
      return acc;
    }, {});

    let rowIndex = 0; // Biến đếm số hàng để tạo độ trễ

    // Tạo các Row (Hàng ngang)
    for (const [category, categoryBooks] of Object.entries(groupedBooks)) {
      // Thêm (book, index) vào vòng lặp map để tính độ trễ cho từng thẻ sách
      let cardsHTML = categoryBooks
        .map(
          (book, index) => `
        <div class="product-card" style="animation-delay: ${index * 80}ms">
          <div class="product-card-inner">
            <div class="product-image">
              <img src="${book.img}" alt="${book.title}" />
            </div>
            <h3 class="product-title">${book.title}</h3>
            <p class="product-author">By: ${book.author}</p>
            <p class="product-price" style="color: ${book.status === "Available" ? "var(--color-gold)" : "var(--color-text-muted)"}">${book.status}</p>
            <button class="btn ${book.status === "Available" ? "btn-gold" : "btn-outline"} btn-block card-action">
              ${book.status === "Available" ? "Borrow" : "Reserve"}
            </button>
          </div>
        </div>
      `,
        )
        .join("");

      // Thêm inline style animation-delay cho cả hàng ngang (row)
      const rowHTML = `
        <div class="category-row" style="animation-delay: ${rowIndex * 150}ms">
          <h2 class="category-title">${category}</h2>
          <div class="carousel-container">
            <button class="carousel-nav prev">❮</button>
            <div class="carousel-viewport">
              <div class="carousel-track">
                ${cardsHTML}
              </div>
            </div>
            <button class="carousel-nav next">❯</button>
          </div>
        </div>
      `;
      container.insertAdjacentHTML("beforeend", rowHTML);

      rowIndex++; // Tăng biến đếm hàng lên
    }

    // Kích hoạt lại slider cho các hàng sách vừa tạo
    initCarousels();
  }

  // 4. Khởi tạo Slider cho mọi hàng ngang
  function initCarousels() {
    const carousels = document.querySelectorAll(".carousel-container");

    carousels.forEach((carousel) => {
      const track = carousel.querySelector(".carousel-track");
      const prevBtn = carousel.querySelector(".carousel-nav.prev");
      const nextBtn = carousel.querySelector(".carousel-nav.next");
      const cards = Array.from(track.children);

      let currentIndex = 0;

      // Tính số lượng thẻ sách nhìn thấy trên màn hình
      function getVisibleItems() {
        if (window.innerWidth <= 480) return 1;
        if (window.innerWidth <= 768) return 2;
        if (window.innerWidth <= 1024) return 3;
        return 4;
      }

      // Ẩn nút mũi tên nếu sách quá ít không đủ để trượt
      if (cards.length <= getVisibleItems()) {
        prevBtn.style.display = "none";
        nextBtn.style.display = "none";
      } else {
        prevBtn.style.display = "flex";
        nextBtn.style.display = "flex";
      }

      function updateCarousel() {
        if (!cards.length) return;
        const cardWidth = cards[0].getBoundingClientRect().width;
        const gap = 24; // 1.5rem
        const moveAmount = (cardWidth + gap) * currentIndex;
        track.style.transform = `translateX(-${moveAmount}px)`;
      }

      nextBtn.addEventListener("click", () => {
        const maxIndex = cards.length - getVisibleItems();
        if (maxIndex <= 0) return;

        if (currentIndex < maxIndex) {
          currentIndex++;
        } else {
          currentIndex = 0; // Vòng lặp về đầu
        }
        updateCarousel();
      });

      prevBtn.addEventListener("click", () => {
        const maxIndex = cards.length - getVisibleItems();
        if (maxIndex <= 0) return;

        if (currentIndex > 0) {
          currentIndex--;
        } else {
          currentIndex = maxIndex; // Vòng lặp xuống cuối
        }
        updateCarousel();
      });

      window.addEventListener("resize", () => {
        currentIndex = 0;
        updateCarousel();
      });
    });
  }

  // 5. Logic Tìm kiếm và Lọc
  function handleFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const sort = sortFilter.value;

    // Lọc theo search box và dropdown danh mục
    let filtered = booksDB.filter((book) => {
      const matchSearch =
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm);
      const matchCategory = category === "all" || book.category === category;
      return matchSearch && matchCategory;
    });

    // Sắp xếp
    filtered.sort((a, b) => {
      if (sort === "newest") return new Date(b.date) - new Date(a.date);
      if (sort === "oldest") return new Date(a.date) - new Date(b.date);
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "author") return a.author.localeCompare(b.author);
      return 0;
    });

    renderCatalog(filtered);
  }

  // 6. Kích hoạt bộ lọc khi người dùng gõ phím hoặc chọn select
  searchInput.addEventListener("input", handleFilters);
  categoryFilter.addEventListener("change", handleFilters);
  sortFilter.addEventListener("change", handleFilters);

  // Khởi chạy khi load trang
  renderCatalog(booksDB);
});
