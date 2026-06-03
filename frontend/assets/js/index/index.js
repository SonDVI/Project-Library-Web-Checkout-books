// ==========================================================================
// TRANG CHỦ (INDEX) LOGIC
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Hiệu ứng 3D cho danh sách Sách nổi bật (Featured Editions)
  const productCards = document.querySelectorAll(".product-card");
  if (productCards.length > 0) {
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = "1";
              entry.target.style.transform = "translateY(0) rotateX(0deg)";
            }, index * 120);
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

  // 2. Hiệu ứng cho thẻ Materials (Premium Finishes)
  const materialCards = document.querySelectorAll(".material-card");
  if (materialCards.length > 0) {
    const materialObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = "1";
              entry.target.style.transform = "scale(1)";
            }, index * 100);
          }
        });
      },
      { threshold: 0.2 },
    );

    materialCards.forEach((card) => {
      card.style.opacity = "0";
      card.style.transform = "scale(0.9)";
      card.style.transition =
        "opacity 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
      materialObserver.observe(card);
    });
  }
});
// ==========================================================================
// CAROUSEL LOGIC (Hỗ trợ nhiều slider trên cùng 1 trang)
// ==========================================================================

// Tìm tất cả các vùng chứa slider trên trang
const carousels = document.querySelectorAll(".carousel-container");

// Chạy vòng lặp để gán chức năng cho TỪNG slider một
carousels.forEach((carousel) => {
  // Tìm track và các nút bấm ở BÊN TRONG slider hiện tại
  const track = carousel.querySelector(".carousel-track");
  const prevBtn = carousel.querySelector(".carousel-nav.prev");
  const nextBtn = carousel.querySelector(".carousel-nav.next");
  const cardsInCarousel = Array.from(track.children);

  // Biến index này giờ là của riêng từng slider
  let currentIndex = 0;

  // Hàm cập nhật trạng thái slider
  function updateCarousel() {
    if (!cardsInCarousel.length) return;

    // Lấy độ rộng của 1 card + khoảng cách gap (2rem = 32px)
    const cardWidth = cardsInCarousel[0].getBoundingClientRect().width;
    const gap = 32;

    // Dịch chuyển track
    const moveAmount = (cardWidth + gap) * currentIndex;
    track.style.transform = `translateX(-${moveAmount}px)`;
  }

  // Bắt sự kiện bấm nút Next
  nextBtn.addEventListener("click", () => {
    let visibleItems =
      window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
    const maxIndex = cardsInCarousel.length - visibleItems;

    if (currentIndex < maxIndex) {
      currentIndex++; // Nếu chưa đến cuối thì tiến lên 1
    } else {
      currentIndex = 0; // Nếu đã đến cuối thì quay ngược lại về đầu
    }
    updateCarousel();
  });

  // Bắt sự kiện bấm nút Prev
  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--; // Nếu lớn hơn 0 thì lùi lại 1
    } else {
      // Nếu đang ở vị trí đầu tiên (0), thì nhảy thẳng đến vị trí cuối cùng
      let visibleItems =
        window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
      currentIndex = cardsInCarousel.length - visibleItems;
    }
    updateCarousel();
  });

  // Chạy hàm lần đầu để setup trạng thái hiển thị
  updateCarousel();

  // Tính toán lại vị trí khi người dùng kéo giãn kích thước trình duyệt
  window.addEventListener("resize", () => {
    currentIndex = 0; // Trả về trang đầu tiên để tránh bị lệch CSS
    updateCarousel();
  });
});
