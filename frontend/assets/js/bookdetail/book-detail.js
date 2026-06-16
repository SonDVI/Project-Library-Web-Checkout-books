document.addEventListener("DOMContentLoaded", async () => {
  console.log("🔥 Hệ thống UI Trang Chi Tiết Sách & Review đã khởi động!");

  // 1. KIỂM TRA ID SÁCH TỪ URL
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");

  //  BẢO VỆ UX: Nếu user mở thẳng trang chi tiết mà không có ID sách, đá về Catalog ngay!
  if (!bookId) {
    alert(
      "⚠️ Cậu chưa chọn cuốn sách nào cả! Đang chuyển hướng về Danh mục...",
    );
    window.location.href = "catalog.html";
    return;
  }

  const currentBookId = parseInt(bookId);
  let currentBookData = null;
  let allBooksData = [];

  // =======================================================
  // 2. TẢI DỮ LIỆU SÁCH CHÍNH & RENDER SÁCH GỢI Ý
  // =======================================================
  try {
    const res = await fetch("http://localhost:8080/api/admin/books");
    if (res.ok) {
      allBooksData = await res.json();
      currentBookData = allBooksData.find((b) => b.raw_id === currentBookId);

      if (currentBookData) {
        // Bơm dữ liệu lên UI Chi Tiết
        document.getElementById("detail-title").innerHTML =
          currentBookData.title;
        document.getElementById("detail-author").textContent =
          currentBookData.author;
        document.getElementById("detail-category").textContent =
          currentBookData.category.toUpperCase();
        document.getElementById("detail-desc").textContent =
          currentBookData.summary ||
          "Cuốn sách này chưa có nội dung tóm tắt chi tiết.";

        const coverUrl =
          currentBookData.image_url ||
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80";
        document.getElementById("detail-img").src = coverUrl;

        // Xử lý trạng thái đèn LED báo hiệu
        const statusEl = document.getElementById("detail-status");
        const dotEl = statusEl.previousElementSibling;
        if (currentBookData.db_status === "Available") {
          statusEl.textContent = "Sẵn sàng mượn";
          dotEl.className = "pulse-dot available";
        } else {
          statusEl.textContent = "Đang được mượn";
          dotEl.className = "pulse-dot unavailable";
          document.getElementById("btn-add-cart").textContent =
            "Đặt trước sách (Reserve)";
          document.getElementById("btn-add-cart").className =
            "btn btn-outline btn-large";
        }

        // Bơm dữ liệu vào Giỏ hàng chờ sẵn
        document.querySelector(".cart-item-title").textContent =
          currentBookData.title;
        document.querySelector(".cart-item-author").textContent =
          currentBookData.author;
        document.querySelector(".cart-item-price").textContent =
          `Phí: ${Number(currentBookData.price).toLocaleString()}đ/ngày`;
        document.querySelector(".cart-item-img").src = coverUrl;
        document.getElementById("cart-total-price").textContent =
          `${Number(currentBookData.price).toLocaleString()}đ/ngày`;

        // RENDER SÁCH GỢI Ý
        const recommendContainer = document.getElementById(
          "recommend-container",
        );
        const otherBooks = allBooksData
          .filter((b) => b.raw_id !== currentBookId)
          .slice(0, 4);

        if (recommendContainer) {
          recommendContainer.innerHTML = otherBooks
            .map(
              (b) => `
            <div class="product-card" onclick="window.location.href='book-detail.html?id=${b.raw_id}'" style="cursor: pointer;">
              <div class="product-card-inner">
                <div class="product-image">
                  <img src="${b.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80"}" alt="Book Cover" />
                </div>
                <h3 class="product-title">${b.title}</h3>
                <h2 class="product-title" style="font-family:var(--font-body); font-size:0.85rem; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:1rem;">
                  Bởi: ${b.author}
                </h2>
                <p class="product-price" style="color: ${b.db_status === "Available" ? "var(--color-gold)" : "#ff4757"}">${b.db_status === "Available" ? "Sẵn sàng" : "Đang mượn"}</p>
                <button class="btn ${b.db_status === "Available" ? "btn-gold" : "btn-outline"} btn-block" onclick="event.stopPropagation(); window.location.href='book-detail.html?id=${b.raw_id}'">Xem chi tiết</button>
              </div>
            </div>
          `,
            )
            .join("");
        }

        // Gọi hàm lấy Review ngay sau khi có currentBookId
        fetchAndRenderReviews();
      }
    }
  } catch (err) {
    console.error("Lỗi lấy dữ liệu sách chi tiết:", err);
  }

  // =======================================================
  // 3. LOGIC ĐÁNH GIÁ (TÍNH TRUNG BÌNH & LOAD TỪ DATABASE)
  // =======================================================
  async function fetchAndRenderReviews() {
    try {
      const res = await fetch(
        `http://localhost:8080/api/reviews/${currentBookId}`,
      );
      if (res.ok) {
        const reviews = await res.json();
        let avgScore = 0.0;
        let htmlStars = "☆☆☆☆☆";

        if (reviews.length > 0) {
          const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
          avgScore = (sum / reviews.length).toFixed(1);
          const filledStars = Math.round(avgScore);
          htmlStars = "★".repeat(filledStars) + "☆".repeat(5 - filledStars);
        }

        document.querySelector(".rating-header .score").textContent =
          reviews.length > 0 ? avgScore : "0.0";
        document.querySelector(".rating-header .stars").textContent = htmlStars;
        document.querySelector(".rating-header .count").textContent =
          `${reviews.length} Đánh giá`;

        const reviewContainer = document.querySelector(".review-scroll-area");
        if (reviews.length === 0) {
          reviewContainer.innerHTML = `<p style="text-align:center; color:#888; margin-top:2rem;">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>`;
        } else {
          reviewContainer.innerHTML = reviews
            .map(
              (r) => `
            <div class="review-card">
              <div class="reviewer-info">
                <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--color-gold); color: #000; display: flex; align-items:center; justify-content:center; font-weight:bold;">
                  ${r.user_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 class="name">${r.user_name} <span style="font-size: 0.7rem; color:#888; font-weight:normal; margin-left:5px">${r.created_at}</span></h4>
                  <span class="star-rating">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
                </div>
              </div>
              <p class="comment">${r.comment}</p>
            </div>
          `,
            )
            .join("");
        }
      }
    } catch (error) {
      console.error("Lỗi tải Review:", error);
    }
  }

  // ==========================================
  // 4. LOGIC MODAL ĐÁNH GIÁ (POST API)
  // ==========================================
  const btnOpenReview = document.getElementById("btn-open-review");
  const btnCloseReview = document.getElementById("btn-close-review");
  const reviewModal = document.getElementById("review-modal");
  const reviewForm = document.getElementById("submit-review-form");
  const stars = document.querySelectorAll(".star-rating-input .star");
  const ratingInput = document.getElementById("selected-rating");

  if (btnOpenReview) {
    btnOpenReview.addEventListener("click", (e) => {
      e.preventDefault();
      if (!localStorage.getItem("userName")) {
        alert("⚠️ Bạn cần đăng nhập để có thể viết đánh giá!");
        window.location.href = "login.html";
        return;
      }
      reviewModal.classList.add("active");
    });
  }

  if (btnCloseReview)
    btnCloseReview.addEventListener("click", () =>
      reviewModal.classList.remove("active"),
    );
  window.addEventListener("click", (e) => {
    if (e.target === reviewModal) reviewModal.classList.remove("active");
  });

  if (stars.length > 0) {
    stars.forEach((star, index) => {
      star.addEventListener("mouseover", () => {
        stars.forEach((s, i) => {
          if (i <= index) s.classList.add("hover");
          else s.classList.remove("hover");
        });
      });
      star.addEventListener("mouseout", () =>
        stars.forEach((s) => s.classList.remove("hover")),
      );
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

  if (reviewForm) {
    reviewForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const score = ratingInput ? parseInt(ratingInput.value) : 0;
      const commentTxt = document.getElementById("review-text").value;
      const userName = localStorage.getItem("userName");

      if (score === 0) {
        alert("⚠️ Cậu vui lòng chọn số sao nhé!");
        return;
      }

      const submitBtn = reviewForm.querySelector("button[type='submit']");
      submitBtn.textContent = "Đang gửi...";
      submitBtn.disabled = true;

      try {
        const res = await fetch("http://localhost:8080/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            book_id: currentBookId,
            user_name: userName,
            rating: score,
            comment: commentTxt,
          }),
        });

        if (res.ok) {
          alert("✅ Đánh giá của cậu đã được lưu vĩnh viễn vào hệ thống!");
          reviewForm.reset();
          stars.forEach((s) => s.classList.remove("active"));
          if (ratingInput) ratingInput.value = 0;
          reviewModal.classList.remove("active");
          fetchAndRenderReviews();
        }
      } catch (err) {
        alert("Lỗi kết nối Server C++!");
      } finally {
        submitBtn.textContent = "Gửi Đánh Giá";
        submitBtn.disabled = false;
      }
    });
  }

  // ==========================================
  // 5. LOGIC MỞ GIỎ HÀNG & MƯỢN SÁCH (CHECKOUT)
  // ==========================================
  const btnAddCart = document.getElementById("btn-add-cart");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartSidebar = document.getElementById("cart-sidebar");
  const btnCloseCart = document.getElementById("btn-close-cart");

  if (btnAddCart && cartOverlay && cartSidebar) {
    btnAddCart.addEventListener("click", (e) => {
      e.preventDefault();
      cartOverlay.classList.add("active");
      cartSidebar.classList.add("active");
    });
  }

  const closeCart = () => {
    if (cartOverlay && cartSidebar) {
      cartOverlay.classList.remove("active");
      cartSidebar.classList.remove("active");
    }
  };

  if (btnCloseCart) btnCloseCart.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

  const btnCheckout = document.getElementById("btn-checkout");
  if (btnCheckout) {
    btnCheckout.addEventListener("click", async () => {
      const userEmail = localStorage.getItem("userEmail");

      if (!userEmail) {
        alert("⚠️ Cậu cần đăng nhập để có thể mượn sách nhé!");
        window.location.href = "login.html";
        return;
      }

      const today = new Date();
      today.setDate(today.getDate() + 14);
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      const dueDateStr = `${dd}/${mm}/${yyyy}`;

      btnCheckout.textContent = "Đang xử lý...";
      btnCheckout.disabled = true;

      try {
        const res = await fetch("http://localhost:8080/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            book_id: currentBookId,
            email: userEmail,
            due_date: dueDateStr,
          }),
        });

        if (res.ok) {
          alert(
            `🎉 KENG! Mượn sách thành công! \n\nHạn trả của cậu là: ${dueDateStr}.`,
          );
          window.location.reload();
        } else {
          alert(
            "❌ Rất tiếc, cuốn sách này vừa bị ai đó nhanh tay mượn mất rồi!",
          );
        }
      } catch (error) {
        alert("Lỗi kết nối đến Server C++!");
      } finally {
        btnCheckout.textContent = "Xác Nhận Mượn";
        btnCheckout.disabled = false;
      }
    });
  }

  // =====================================================================
  // 6. LOGIC THẢ TIM TRONG TRANG CHI TIẾT SÁCH
  // =====================================================================
  const btnHeartDetail = document.getElementById("btn-heart-detail");
  const userEmail = localStorage.getItem("userEmail");

  if (btnHeartDetail && currentBookId) {
    // Gọi tải tim
    if (userEmail) {
      fetch(`http://localhost:8080/api/favorites?email=${userEmail}`)
        .then((res) => res.json())
        .then((myFavorites) => {
          if (myFavorites.includes(currentBookId)) {
            btnHeartDetail.classList.add("loved");
          }
        })
        .catch((err) => console.error("Lỗi đồng bộ Tim từ C++:", err));
    }

    // Toggle tim
    btnHeartDetail.addEventListener("click", async () => {
      if (!userEmail) {
        alert("⚠️ Cậu cần đăng nhập để thêm sách vào mục Yêu thích nhé!");
        window.location.href = "login.html";
        return;
      }

      btnHeartDetail.style.transform = "scale(0.8)";
      try {
        const res = await fetch("http://localhost:8080/api/favorites/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, book_id: currentBookId }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.is_loved) {
            btnHeartDetail.classList.add("loved");
          } else {
            btnHeartDetail.classList.remove("loved");
          }
          setTimeout(() => (btnHeartDetail.style.transform = "scale(1)"), 100);
        }
      } catch (err) {
        console.error(err);
        alert("Lỗi mất kết nối đến Server C++!");
      }
    });
  }
});
