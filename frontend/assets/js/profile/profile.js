document.addEventListener("DOMContentLoaded", async () => {
  const userName = localStorage.getItem("userName");
  if (!userName) {
    alert("Vui lòng đăng nhập để xem hồ sơ cá nhân!");
    window.location.href = "login.html";
    return;
  }

  const inputName = document.getElementById("input-fullname");
  const inputEmail = document.getElementById("input-email");
  const inputClassname = document.getElementById("input-classname");

  const inputCurrentPass = document.getElementById("input-current-pass");
  const inputNewPass = document.getElementById("input-new-pass");
  const inputConfirmPass = document.getElementById("input-confirm-pass");

  const cardName = document.getElementById("card-holder-name");
  const cardType = document.getElementById("card-type");
  const form = document.getElementById("profile-edit-form");
  const btnSubmit = document.getElementById("btn-submit-profile");

  const tierName = document.getElementById("tier-name");
  const borrowCountText = document.getElementById("borrow-count-text");
  const vipProgressFill = document.getElementById("vip-progress-fill");
  const vipPerkText = document.getElementById("vip-perk-text");

  let realPassword = ""; // 🌟 Biến lưu mật khẩu gốc từ Database để đối chiếu

  // 1. ĐỒNG BỘ GÕ PHÍM LÊN THẺ (Real-time)
  if (inputName && cardName) {
    inputName.addEventListener("input", (e) => {
      cardName.textContent = e.target.value.toUpperCase() || "MEMBER";
    });
  }

  // 2. TẢI DỮ LIỆU TỪ C++ VÀ TÍNH TOÁN VIP
  try {
    const res = await fetch("http://localhost:8080/api/admin/users");
    if (res.ok) {
      const users = await res.json();
      const myProfile = users.find((u) => u.name === userName);

      if (myProfile) {
        realPassword = myProfile.password; // Cất mật khẩu thật từ DB vào đây

        if (inputName) inputName.value = myProfile.name;
        if (inputEmail) inputEmail.value = myProfile.email;
        if (cardName) cardName.textContent = myProfile.name.toUpperCase();

        if (inputClassname && myProfile.classname) {
          inputClassname.value = myProfile.classname;
        }

        const borrowCount = myProfile.borrow_count || 0;
        const target = 100;
        let progress = (borrowCount / target) * 100;
        if (progress > 100) progress = 100;

        let currentTier = "STUDENT";
        if (myProfile.role === "admin") {
          currentTier = "ADMIN";
          progress = 100;
          vipPerkText.innerHTML =
            "Quyền lực tối cao - Không bị giới hạn thư viện!";
          borrowCountText.textContent = `∞ Sách`;
        } else if (myProfile.role === "vip" || borrowCount >= target) {
          currentTier = "VIP MEMBER";
          progress = 100;
          vipPerkText.innerHTML =
            "🎉 Cậu là VIP! Tận hưởng ưu đãi <strong>-5%</strong> phí thuê sách.";
          borrowCountText.textContent = `${borrowCount} Sách`;
        } else {
          currentTier = "STUDENT";
          vipPerkText.innerHTML = `Mượn thêm <strong style="color: #ffd700">${target - borrowCount}</strong> cuốn sách nữa để lên VIP (-5% phí).`;
          borrowCountText.textContent = `${borrowCount} / ${target}`;
        }

        if (cardType) cardType.textContent = currentTier;
        if (tierName) tierName.textContent = currentTier;
        setTimeout(() => {
          if (vipProgressFill) vipProgressFill.style.width = `${progress}%`;
        }, 500);

        // ========================================================
        // 🌟 TÍNH TOÁN & RENDER TỦ SÁCH CÁ NHÂN (BORROWED HISTORY)
        // (Đã được đưa vào ĐÚNG vị trí an toàn bên trong myProfile)
        // ========================================================
        const borrowedContainer = document.getElementById("my-borrowed-books");

        if (borrowedContainer) {
          if (
            !myProfile.borrowed_books ||
            myProfile.borrowed_books.length === 0
          ) {
            borrowedContainer.innerHTML = `
                  <div class="empty-library">
                    <div style="font-size: 3.5rem; margin-bottom: 1rem; opacity: 0.6;">📚</div>
                    <p style="color: #8e9bb0; margin-bottom: 1.5rem; font-size: 1.1rem;">Tủ sách của cậu hiện đang trống. Đi dạo vài vòng thư viện nhé!</p>
                    <a href="catalog.html" class="btn btn-gold" style="padding: 0.8rem 2rem;">Khám Phá Sách</a>
                  </div>
                `;
          } else {
            // Lấy ngày hôm nay chuẩn (Loại bỏ Giờ/Phút/Giây để so sánh chính xác)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            borrowedContainer.innerHTML = myProfile.borrowed_books
              .map((bk) => {
                let isOverdue = false;

                // Thuật toán bóc tách ngày tháng chuẩn VN (DD/MM/YYYY)
                if (bk.dueDate && bk.dueDate !== "—") {
                  const parts = bk.dueDate.split("/");
                  if (parts.length === 3) {
                    // Lưu ý trong JS: Tháng bắt đầu từ số 0 (Tháng 1 là 0)
                    const due = new Date(parts[2], parts[1] - 1, parts[0]);
                    if (due < today) isOverdue = true;
                  }
                }

                const statusClass = isOverdue ? "overdue" : "active";
                const statusText = isOverdue
                  ? "⚠️ Quá hạn trả sách"
                  : "🟢 Trong thời hạn";
                const cardClass = isOverdue
                  ? "borrowed-card overdue"
                  : "borrowed-card";

                return `
                    <div class="${cardClass}">
                      <div class="bc-status ${statusClass}">${statusText}</div>
                      <div class="bc-title">${bk.title}</div>
                      <div class="bc-meta">
                        <span>Phí mượn:<br><strong style="color: #ffd700; font-size: 1rem;">${Number(bk.price).toLocaleString()}đ</strong></span>
                        <span style="text-align: right;">Hạn trả:<br><strong style="color: #fff; font-size: 1rem;">${bk.dueDate}</strong></span>
                      </div>
                    </div>
                  `;
              })
              .join("");
          }
        } // Kết thúc if (borrowedContainer)
      } // Kết thúc if (myProfile)
    } // Kết thúc if (res.ok)
  } catch (error) {
    console.error("Lỗi lấy dữ liệu!", error);
  }

  // 3. XỬ LÝ NÚT LƯU & GỬI DỮ LIỆU ĐÃ CHỈNH SỬA XUỐNG DATABASE C++
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const currentPass = inputCurrentPass ? inputCurrentPass.value : "";
      const newPass = inputNewPass ? inputNewPass.value : "";
      const confirmPass = inputConfirmPass ? inputConfirmPass.value : "";

      // ========================================================
      // 🌟 GIẢI QUYẾT TRIỆT ĐỂ LỖI LOGIC MẬT KHẨU
      // ========================================================

      // Tình huống 1: Người dùng có gõ Mật khẩu mới (Muốn đổi pass)
      if (newPass || confirmPass) {
        if (!currentPass) {
          alert(
            "❌ BẢO MẬT: Vui lòng nhập 'Mật khẩu hiện tại' để hệ thống cho phép đổi mật khẩu mới!",
          );
          if (inputCurrentPass) inputCurrentPass.focus();
          return;
        }
        if (currentPass !== realPassword) {
          alert("❌ Mật khẩu hiện tại không chính xác!");
          if (inputCurrentPass) inputCurrentPass.focus();
          return;
        }
        if (newPass !== confirmPass) {
          alert("❌ Xác nhận mật khẩu mới không khớp!");
          if (inputConfirmPass) inputConfirmPass.focus();
          return;
        }
      }
      // Tình huống 2: KHÔNG đổi pass, nhưng do thói quen cẩn thận nên gõ thử mật khẩu cũ
      else if (currentPass) {
        if (currentPass !== realPassword) {
          alert(
            "❌ Mật khẩu hiện tại không chính xác! Không thể lưu thay đổi.",
          );
          if (inputCurrentPass) inputCurrentPass.focus();
          return;
        }
      }
      // Tình huống 3: Bỏ trống sạch cả 3 ô mật khẩu -> Vượt qua dễ dàng, chỉ lưu Tên & Lớp!

      btnSubmit.textContent = "Đang đồng bộ...";
      btnSubmit.disabled = true;

      try {
        const response = await fetch("http://localhost:8080/api/users/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: inputEmail.value,
            name: inputName.value,
            classname: inputClassname.value,
            password: newPass, // Gửi chuỗi trống nếu không đổi pass, C++ sẽ tự hiểu để bỏ qua
          }),
        });

        if (response.ok) {
          // Lưu tên mới vào bộ nhớ trình duyệt nếu có đổi
          localStorage.setItem("userName", inputName.value);

          // Cập nhật lại pass thật ngay lập tức để không bị lệch nếu user ấn lưu nhiều lần
          if (newPass) realPassword = newPass;

          // Xóa sạch 3 ô mật khẩu cho gọn gàng (Giữ nguyên trang để mang lại cảm giác mượt mà)
          if (inputCurrentPass) inputCurrentPass.value = "";
          if (inputNewPass) inputNewPass.value = "";
          if (inputConfirmPass) inputConfirmPass.value = "";

          alert("✅ Cập nhật Hồ sơ và lưu vào Database thành công!");

          // Lên góc phải cập nhật chữ "Xin chào, Tên mới" ngay lập tức
          document.getElementById("user-display-name").textContent =
            "Xin chào, " + inputName.value;
        } else {
          alert("❌ Cập nhật thất bại từ phía Server.");
        }
      } catch (err) {
        alert("Lỗi kết nối Server C++!");
      } finally {
        btnSubmit.textContent = "Lưu & Đồng Bộ Dữ Liệu";
        btnSubmit.disabled = false;
      }
    });
  }
});
