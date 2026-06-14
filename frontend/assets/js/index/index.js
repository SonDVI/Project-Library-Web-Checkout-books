// ==========================================================================
// TRANG CHỦ (INDEX) LOGIC - ĐỒNG BỘ 100% VỚI DATABASE
// ==========================================================================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🔥 Trang Chủ đang đồng bộ với Database C++...");

  const featuredTrack = document.getElementById("featured-books-track");
  const authorsTrack = document.getElementById("popular-authors-track");

  let dbBooks = [];

  // =======================================================
  // 1. TẢI DỮ LIỆU TỪ C++ BACKEND
  // =======================================================
  try {
    const res = await fetch("http://localhost:8080/api/admin/books");
    if (res.ok) {
      dbBooks = await res.json();
    }
  } catch (err) {
    console.error("Lỗi lấy dữ liệu trang chủ:", err);
  }

  // Khởi tạo từ điển để render nút mượn đa ngôn ngữ
  const lang = window.I18N ? window.I18N.getLang() : "vi";
  const t =
    window.I18N && window.I18N.dictionary ? window.I18N.dictionary[lang] : {};

  // =======================================================
  // 2. RENDER BĂNG CHUYỀN SÁCH NỔI BẬT (MỚI NHẤT)
  // =======================================================
  if (featuredTrack && dbBooks.length > 0) {
    // Sắp xếp lấy 8 cuốn mới được add vào Database nhất
    const latestBooks = [...dbBooks]
      .sort((a, b) => b.raw_id - a.raw_id)
      .slice(0, 8);

    featuredTrack.innerHTML = latestBooks
      .map((book) => {
        const isAvailable = book.db_status === "Available";
        const statusText = isAvailable
          ? t.statusAvailable || "Sẵn sàng"
          : t.statusBorrowed || "Đang được mượn";
        const btnText = isAvailable
          ? t.btnBorrow || "Mượn sách"
          : t.btnReserve || "Đặt trước";
        const btnClass = isAvailable ? "btn-gold" : "btn-outline";
        const priceColor = isAvailable ? "var(--color-gold)" : "#ff4757";
        const coverImg =
          book.image_url ||
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80";

        return `
        <div class="product-card" onclick="window.location.href='book-detail.html?id=${book.raw_id}'" style="cursor:pointer">
          <div class="product-card-inner">
            <div class="product-image">
              <img src="${coverImg}" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80'" alt="Book Cover" />
            </div>
            <h3 class="product-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${book.title}</h3>
            <h2 class="product-title" style="font-family:var(--font-body); font-size:0.85rem; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:1rem;">
              By: ${book.author}
            </h2>
            <p class="product-price" style="color: ${priceColor}">${statusText}</p>
            <button class="btn ${btnClass} btn-block card-action" onclick="event.stopPropagation(); window.location.href='book-detail.html?id=${book.raw_id}'">${btnText}</button>
          </div>
        </div>
      `;
      })
      .join("");
  } else if (featuredTrack) {
    featuredTrack.innerHTML = `<p style="color:#888; text-align:center; width:100%;">Đang đồng bộ dữ liệu thư viện...</p>`;
  }

  // =======================================================
  // 3. RENDER BĂNG CHUYỀN TÁC GIẢ THỊNH HÀNH
  // =======================================================
  if (authorsTrack && dbBooks.length > 0) {
    // Gom nhóm sách theo tác giả để tìm ra những người viết nhiều sách nhất
    let authGroups = {};
    dbBooks.forEach((b) => {
      const aName = b.author || "Khuyết danh";
      if (aName === "Chưa cập nhật") return;
      if (!authGroups[aName]) {
        authGroups[aName] = {
          name: aName,
          avatar:
            b.author_image_url ||
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80",
          count: 0,
        };
      }
      authGroups[aName].count++;
    });

    // Sắp xếp giảm dần và lấy Top 8 tác giả
    const topAuthors = Object.values(authGroups)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    authorsTrack.innerHTML = topAuthors
      .map(
        (author) => `
      <div class="product-card" style="cursor: default;">
        <div class="product-card-inner" style="align-items: center; text-align: center; justify-content: center;">
          <div class="product-image" style="border-radius: 50%; width: 140px; height: 140px; margin: 0 auto 1.5rem; background: transparent; box-shadow: none;">
            <img src="${author.avatar}" onerror="this.src='https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80'" alt="Author" style="border-radius: 50%; border: 3px solid rgba(212,175,55,0.3); box-shadow: 0 10px 20px rgba(0,0,0,0.5);" />
          </div>
          <h3 class="product-title">${author.name}</h3>
          <p style="color: var(--color-gold); font-size: 0.9rem; font-family: 'Fira Code', monospace; margin-top:0.5rem;">${author.count} Tác phẩm</p>
        </div>
      </div>
    `,
      )
      .join("");
  }

  // =======================================================
  // 4. KÍCH HOẠT LẠI MÔ TƠ CAROUSEL (Chạy trượt ngang)
  // =======================================================
  const carousels = document.querySelectorAll(".carousel-container");
  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track");
    const prevBtn = carousel.querySelector(".carousel-nav.prev");
    const nextBtn = carousel.querySelector(".carousel-nav.next");
    const cardsInCarousel = Array.from(track.children);
    let currentIndex = 0;

    function updateCarousel() {
      if (!cardsInCarousel.length) return;
      const cardWidth = cardsInCarousel[0].getBoundingClientRect().width;
      const gap = 32; // 2rem
      const moveAmount = (cardWidth + gap) * currentIndex;
      track.style.transform = `translateX(-${moveAmount}px)`;
    }

    nextBtn.addEventListener("click", () => {
      let visibleItems =
        window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
      const maxIndex = Math.max(0, cardsInCarousel.length - visibleItems);

      if (currentIndex < maxIndex) currentIndex++;
      else currentIndex = 0; // Quay về đầu
      updateCarousel();
    });

    prevBtn.addEventListener("click", () => {
      if (currentIndex > 0) currentIndex--;
      else {
        let visibleItems =
          window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
        currentIndex = Math.max(0, cardsInCarousel.length - visibleItems); // Nhảy tới cuối
      }
      updateCarousel();
    });

    updateCarousel(); // Setup vị trí ban đầu
    window.addEventListener("resize", () => {
      currentIndex = 0;
      updateCarousel();
    });
  });

  // =======================================================
  // 5. KÍCH HOẠT LẠI HIỆU ỨNG 3D CHO CÁC THẺ VỪA ĐƯỢC BƠM VÀO
  // =======================================================
  const productCards = document.querySelectorAll(".product-card");
  if (productCards.length > 0) {
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = "1";
              entry.target.style.transform = "translateY(0) rotateX(0deg)";
            }, index * 100);
          }
        });
      },
      { threshold: 0.15 },
    );

    productCards.forEach((card) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(50px) rotateX(10deg)";
      card.style.transition =
        "opacity 0.7s ease, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)";
      cardObserver.observe(card);
    });
  }
  // =======================================================
  // 6. XỬ LÝ LOGIC NÚT "JOIN COMMUNITY" (KIỂM TRA ĐĂNG NHẬP)
  // =======================================================
  const btnJoinCommunity = document.querySelector(".cta-card .btn-gold");

  if (btnJoinCommunity) {
    btnJoinCommunity.addEventListener("click", (e) => {
      const userName = localStorage.getItem("userName");

      // Nếu bộ nhớ trình duyệt đã có tên (tức là đã đăng nhập)
      if (userName) {
        e.preventDefault(); // Phanh gấp! Chặn không cho trình duyệt nhảy sang thẻ a href="login.html"
        alert(
          `🎉 Chào mừng ${userName}! Cậu đã là thành viên chính thức của đại gia đình HUST LBC rồi nhé!`,
        );
      }
      // Nếu userName rỗng (chưa đăng nhập), lệnh e.preventDefault() không chạy
      // -> Trình duyệt tự động thả cho nhảy sang trang login.html bình thường!
    });
  }
});
