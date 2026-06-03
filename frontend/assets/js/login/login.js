// ==========================================================================
// LOGIN & REGISTER LOGIC (ĐÃ FIX LỖI VÀ TÍCH HỢP MODAL 3D)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. XỬ LÝ CHUYỂN ĐỔI TAB (SIGN IN / SIGN UP)
  // ==========================================
  const tabBtns = document.querySelectorAll(".tab-btn");
  const forms = document.querySelectorAll(".auth-form");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      forms.forEach((f) => f.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-target");
      document.getElementById(targetId).classList.add("active");
    });
  });

  // ==========================================
  // 2. XỬ LÝ SUBMIT FORM ĐĂNG NHẬP
  // ==========================================
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      console.log("Login attempt:", email);
      alert("Giao diện Đăng nhập hoạt động tốt! Sẵn sàng nối với Backend C++.");
    });
  }

  // ==========================================
  // 3. XỬ LÝ ĐĂNG KÝ (VALIDATION + SUBMIT)
  // ==========================================
  const registerForm = document.getElementById("register-form");
  const regPassword = document.getElementById("reg-password");
  const regConfirmPassword = document.getElementById("reg-confirm-password");
  const matchMsg = document.getElementById("password-match-msg");

  // Các phần tử list điều kiện mật khẩu
  const reqLength = document.getElementById("req-length");
  const reqUpper = document.getElementById("req-upper");
  const reqNumber = document.getElementById("req-number");
  const reqSpecial = document.getElementById("req-special");

  // Biến cờ (flags) để kiểm soát trạng thái
  let isPasswordValid = false;
  let isPasswordMatched = false;

  // A. Validate độ mạnh mật khẩu (Real-time)
  if (regPassword) {
    regPassword.addEventListener("input", (e) => {
      const val = e.target.value;

      const validLength = val.length >= 8;
      const validUpper = /[A-Z]/.test(val);
      const validNumber = /[0-9]/.test(val);
      const validSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(val);

      reqLength.className = validLength ? "valid" : "invalid";
      reqUpper.className = validUpper ? "valid" : "invalid";
      reqNumber.className = validNumber ? "valid" : "invalid";
      reqSpecial.className = validSpecial ? "valid" : "invalid";

      isPasswordValid =
        validLength && validUpper && validNumber && validSpecial;

      // Cập nhật lại trạng thái khớp nếu đang gõ lại mật khẩu gốc
      if (regConfirmPassword && regConfirmPassword.value.length > 0) {
        checkMatch();
      }
    });
  }

  // B. Hàm kiểm tra 2 mật khẩu có khớp nhau không
  const checkMatch = () => {
    if (!regPassword || !regConfirmPassword) return;

    const pass = regPassword.value;
    const confirmPass = regConfirmPassword.value;

    if (confirmPass.length === 0) {
      matchMsg.style.display = "none";
      isPasswordMatched = false;
      return;
    }

    matchMsg.style.display = "block";
    if (pass === confirmPass) {
      matchMsg.textContent = "✓ Passwords match perfectly";
      matchMsg.style.color = "var(--color-gold)";
      isPasswordMatched = true;
    } else {
      matchMsg.textContent = "✗ Passwords do not match";
      matchMsg.style.color = "#ff4757";
      isPasswordMatched = false;
    }
  };

  if (regConfirmPassword) {
    regConfirmPassword.addEventListener("input", checkMatch);
  }

  // C. Submit Form Đăng ký và gọi Modal Thành công
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Kiểm tra độ mạnh mật khẩu
      if (!isPasswordValid) {
        alert("Please ensure your password meets all 4 security requirements!");
        regPassword.focus();
        return;
      }

      // Kiểm tra khớp mật khẩu
      if (!isPasswordMatched) {
        alert("The passwords you entered do not match. Please try again!");
        regConfirmPassword.focus();
        return;
      }

      // Lấy thông tin user
      const name = document.getElementById("reg-name").value;
      const email = document.getElementById("reg-email").value;
      console.log("New User Registered:", name, email);

      // Gọi Modal Thành công
      const successModal = document.getElementById("success-modal");
      const successMsg = document.getElementById("success-message");
      const btnToDashboard = document.getElementById("btn-to-dashboard");

      // Nếu bạn quên chưa dán HTML của Modal thì báo lỗi JS và dùng alert tạm
      if (!successModal || !successMsg) {
        alert(`Welcome to HUST LBC! Account created successfully for ${name}.`);
        return;
      }

      // Gắn tên user vào HTML của Modal
      successMsg.innerHTML = `Your account for <b>${name}</b> has been created successfully. You can now start exploring.`;

      // Hiển thị Modal
      successModal.classList.add("active");

      // Bắt sự kiện chuyển trang khi bấm nút Explore Dashboard
      if (btnToDashboard) {
        btnToDashboard.addEventListener("click", () => {
          window.location.href = "dashboard.html";
        });
      }
    });
  }
});
