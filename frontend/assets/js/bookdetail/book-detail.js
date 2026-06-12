document.addEventListener("DOMContentLoaded", () => {
  console.log("🔥 Hệ thống UI Trang Chi Tiết Sách đã khởi động!");

  // ==========================================
  // 1. LOGIC GIỎ HÀNG (OFFCANVAS CART)
  // ==========================================
  const btnAddCart = document.getElementById("btn-add-cart");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartSidebar = document.getElementById("cart-sidebar");
  const btnCloseCart = document.getElementById("btn-close-cart");

  // Mở giỏ hàng
  if (btnAddCart && cartOverlay && cartSidebar) {
    btnAddCart.addEventListener("click", (e) => {
      e.preventDefault(); // Ngăn hành vi mặc định nếu lỡ thẻ này biến thành thẻ <a>
      console.log("Đã click nút thêm vào giỏ!"); // Báo log để check
      cartOverlay.classList.add("active");
      cartSidebar.classList.add("active");
    });
  }

  // Đóng giỏ hàng
  const closeCart = () => {
    if (cartOverlay && cartSidebar) {
      cartOverlay.classList.remove("active");
      cartSidebar.classList.remove("active");
    }
  };

  if (btnCloseCart) btnCloseCart.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

  // Nút xóa item trong giỏ (Xóa div)
  const removeBtns = document.querySelectorAll(".btn-remove-item");
  removeBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      this.parentElement.remove();
    });
  });

  // ==========================================
  // 2. LOGIC MODAL ĐÁNH GIÁ (RATING)
  // ==========================================
  const btnOpenReview = document.getElementById("btn-open-review");
  const btnCloseReview = document.getElementById("btn-close-review");
  const reviewModal = document.getElementById("review-modal");
  const reviewForm = document.getElementById("submit-review-form");
  const stars = document.querySelectorAll(".star-rating-input .star");
  const ratingInput = document.getElementById("selected-rating");

  // Mở / Đóng form Đánh giá
  if (btnOpenReview && reviewModal) {
    btnOpenReview.addEventListener("click", (e) => {
      e.preventDefault();
      reviewModal.classList.add("active");
    });
  }

  if (btnCloseReview && reviewModal) {
    btnCloseReview.addEventListener("click", () => {
      reviewModal.classList.remove("active");
    });
  }

  // Click ra ngoài thì tắt
  window.addEventListener("click", (e) => {
    if (e.target === reviewModal) {
      reviewModal.classList.remove("active");
    }
  });

  // Logic Hover / Click chọn Sao
  if (stars.length > 0) {
    stars.forEach((star, index) => {
      star.addEventListener("mouseover", () => {
        stars.forEach((s, i) => {
          if (i <= index) s.classList.add("hover");
          else s.classList.remove("hover");
        });
      });

      star.addEventListener("mouseout", () => {
        stars.forEach((s) => s.classList.remove("hover"));
      });

      star.addEventListener("click", () => {
        const ratingValue = index + 1;
        if (ratingInput) ratingInput.value = ratingValue;

        stars.forEach((s, i) => {
          if (i < ratingValue) s.classList.add("active");
          else s.classList.remove("active");
        });
      });
    });
  }

  // Submit Đánh Giá
  if (reviewForm) {
    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const score = ratingInput ? ratingInput.value : 0;

      if (score == 0) {
        alert("⚠️ Cậu vui lòng chọn số sao nhé!");
        return;
      }

      alert(`Cảm ơn cậu đã đánh giá ${score} sao!`);

      // Reset & Tắt Modal
      reviewForm.reset();
      stars.forEach((s) => s.classList.remove("active"));
      if (ratingInput) ratingInput.value = 0;
      if (reviewModal) reviewModal.classList.remove("active");
    });
  }
});
