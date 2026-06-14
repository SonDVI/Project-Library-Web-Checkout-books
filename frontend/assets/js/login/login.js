// ==========================================================================
// LOGIN & REGISTER LOGIC (ĐÃ TÍCH HỢP GỌI API TỚI BACKEND C++)
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
  // 2. XỬ LÝ SUBMIT FORM ĐĂNG NHẬP (GỌI BACKEND C++)
  // ==========================================
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      try {
        // Gửi data sang C++
        const response = await fetch("http://localhost:8080/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email, password: password }),
        });

        const result = await response.json();

        if (response.ok && result.status === "success") {
          // 🌟 CHỐT CHẶN QUAN TRỌNG: Cất thẻ tên vào ví trước khi chuyển trang
          localStorage.setItem("userName", result.name);
          localStorage.setItem("userRole", result.role);

          // Thành công thì chuyển thẳng sang trang chủ/dashboard
          //mail
          localStorage.setItem("userEmail", email);
          window.location.href = "dashboard.html";
        } else {
          // Sai mật khẩu thì báo lỗi bằng chữ đỏ từ C++
          alert(
            "❌ Đăng nhập thất bại: " +
              (result.error || "Sai tài khoản hoặc mật khẩu"),
          );
        }
      } catch (error) {
        console.error("Lỗi kết nối:", error);
        alert("Server C++ đang tắt hoặc mất kết nối mạng!");
      }
    });
  }

  // ==========================================
  // 3. XỬ LÝ ĐĂNG KÝ (VALIDATION + SUBMIT TỚI C++)
  // ==========================================
  const registerForm = document.getElementById("register-form");
  const regPassword = document.getElementById("reg-password");
  const regConfirmPassword = document.getElementById("reg-confirm-password");
  const matchMsg = document.getElementById("password-match-msg");

  const reqLength = document.getElementById("req-length");
  const reqUpper = document.getElementById("req-upper");
  const reqNumber = document.getElementById("req-number");
  const reqSpecial = document.getElementById("req-special");

  let isPasswordValid = false;
  let isPasswordMatched = false;

  // A. Validate độ mạnh mật khẩu (Giữ nguyên - Rất tốt)
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

      if (regConfirmPassword && regConfirmPassword.value.length > 0) {
        checkMatch();
      }
    });
  }

  // B. Hàm kiểm tra 2 mật khẩu có khớp nhau không (Giữ nguyên)
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

  // C. Submit Form Đăng ký (ĐÃ NÂNG CẤP GỌI C++)
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!isPasswordValid) {
        alert("Please ensure your password meets all 4 security requirements!");
        regPassword.focus();
        return;
      }

      if (!isPasswordMatched) {
        alert("The passwords you entered do not match. Please try again!");
        regConfirmPassword.focus();
        return;
      }

      const name = document.getElementById("reg-name").value;
      const email = document.getElementById("reg-email").value;
      const password = regPassword.value;

      try {
        // GÓI DATA NÉM SANG BACKEND C++
        const response = await fetch("http://localhost:8080/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name,
            email: email,
            password: password,
          }),
        });

        const result = await response.json();

        if (response.ok && result.status === "success") {
          // NẾU C++ BÁO LƯU THÀNH CÔNG -> GỌI MODAL THÀNH CÔNG
          const successModal = document.getElementById("success-modal");
          const successMsg = document.getElementById("success-message");
          const btnToDashboard = document.getElementById("btn-to-dashboard");

          if (!successModal || !successMsg) {
            alert(`Welcome! Account created successfully for ${name}.`);
          } else {
            successMsg.innerHTML = `Your account for <b>${name}</b> has been securely created in the database.`;
            successModal.classList.add("active");

            // Làm sạch form
            registerForm.reset();
            isPasswordValid = false;
            isPasswordMatched = false;
            if (matchMsg) matchMsg.style.display = "none";

            if (btnToDashboard) {
              // Sửa luồng: Đăng ký xong thì tắt modal, tự động chuyển về tab Sign In để khách đăng nhập thật
              btnToDashboard.addEventListener("click", () => {
                successModal.classList.remove("active");
                document.querySelector('[data-target="login-form"]').click();
              });
            }
          }
        } else {
          // NẾU BỊ TRÙNG EMAIL HOẶC LỖI KHÁC
          alert(
            "❌ Đăng ký thất bại: " + (result.error || "Email đã tồn tại!"),
          );
        }
      } catch (error) {
        console.error("Lỗi:", error);
        alert("Mất kết nối! Hãy kiểm tra xem Server C++ đã bật chưa.");
      }
    });
  }
});
