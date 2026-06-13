document.addEventListener("DOMContentLoaded", () => {
  // ⛔ TƯỜNG LỬA KIỂM TRA QUYỀN TRUY CẬP ⛔
  const currentRole = localStorage.getItem("userRole");
  if (currentRole !== "admin") {
    alert(
      "⛔ CẢNH BÁO BẢO MẬT: Bạn không có quyền truy cập vào Phân hệ Quản trị!",
    );
    window.location.href = "dashboard.html"; // Đá văng người dùng về trang sinh viên
    return; // Dừng lập tức mọi hoạt động vẽ bảng, load dữ liệu phía dưới
  }

  console.log("🔥 Fintech Admin Portal Core Activated!");

  const tableBody = document.getElementById("admin-book-list");
  const userTableBody = document.getElementById("admin-user-list");
  const filterBtns = document.querySelectorAll("[data-filter]");
  const userFilterBtns = document.querySelectorAll("[data-user-filter]");

  let booksData = [];
  let usersData = [];
  const today = new Date();

  // --- LOGIC CHUYỂN PHÂN HỆ TAB ---
  const tabBooks = document.getElementById("tab-books-btn");
  const tabUsers = document.getElementById("tab-users-btn");
  const secBooks = document.getElementById("section-books");
  const secUsers = document.getElementById("section-users");
  const btnAddBookHeader = document.getElementById("btn-add-book");

  tabBooks.addEventListener("click", () => {
    tabBooks.classList.add("active");
    tabUsers.classList.remove("active");
    secBooks.style.display = "block";
    secUsers.style.display = "none";
    btnAddBookHeader.style.display = "block";
  });
  tabUsers.addEventListener("click", () => {
    tabUsers.classList.add("active");
    tabBooks.classList.remove("active");
    secUsers.style.display = "block";
    secBooks.style.display = "none";
    btnAddBookHeader.style.display = "none";
  });

  // ========================================================
  // 1. HÀM KẾT NỐI API
  // ========================================================
  async function fetchAdminData() {
    try {
      const response = await fetch("http://localhost:8080/api/admin/books");
      if (response.ok) {
        booksData = await response.json();
        renderTable("all");
      }
    } catch (error) {
      console.error("Lỗi sập kết nối API Books", error);
    }
  }

  async function fetchUserData() {
    try {
      const response = await fetch("http://localhost:8080/api/admin/users");
      if (response.ok) {
        usersData = await response.json();
        renderUserTable("all");
      }
    } catch (error) {
      console.error("Lỗi sập kết nối API Users", error);
    }
  }

  async function fetchDashboardStats() {
    try {
      const response = await fetch("http://localhost:8080/api/admin/stats");
      if (response.ok) {
        const stats = await response.json();
        document.getElementById("total-users-count").textContent =
          stats.total_users;
        document.getElementById("total-books-count").textContent =
          stats.total_books;
        document.getElementById("borrowed-books-count").textContent =
          stats.borrowed_books;
        document.getElementById("overdue-count").textContent =
          stats.overdue_books;
      }
    } catch (error) {
      console.error("Lỗi kết nối API Stats", error);
    }
  }

  async function startApp() {
    await fetchAdminData();
    await fetchUserData();
    await fetchDashboardStats();
  }
  startApp();

  // ========================================================
  // 2. RENDER BẢNG SÁCH
  // ========================================================
  function renderTable(filterMode) {
    if (!tableBody) return;
    tableBody.innerHTML = "";
    booksData.forEach((book, index) => {
      let isOverdue = book.db_status === "Overdue";
      let displayStatus = "";
      let statusClass = "";
      let dateClass = "date-normal";

      if (book.db_status === "Available") {
        displayStatus = "<div class='dot'></div> Sẵn sàng";
        statusClass = "status-available";
      } else {
        if (isOverdue) {
          displayStatus = "<div class='dot'></div> Quá Hạn";
          statusClass = "status-overdue";
          dateClass = "date-overdue";
        } else {
          displayStatus = "<div class='dot'></div> Đang mượn";
          statusClass = "status-borrowed";
        }
      }

      if (filterMode === "available" && book.db_status !== "Available") return;
      if (
        filterMode === "borrowed" &&
        book.db_status !== "Active" &&
        book.db_status !== "Overdue"
      )
        return;
      if (filterMode === "overdue" && !isOverdue) return;

      const row = document.createElement("tr");
      row.className = "row-fade-in";
      row.style.animationDelay = `${index * 0.03}s`;
      row.innerHTML = `
        <td class="book-id">${book.id}</td>
        <td class="book-title">${book.title}</td>
        <td><span class="status-indicator ${statusClass}">${displayStatus}</span></td>
        <td class="book-borrower">${book.borrower}</td>
        <td class="${dateClass}">${book.dueDate}</td>
        <td>
          <button class="action-btn btn-edit" data-id="${book.raw_id}">✏️</button>
          <button class="action-btn btn-delete" data-id="${book.raw_id}">🗑️</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  // ========================================================
  // 3. RENDER BẢNG USER (CẬP NHẬT MẬT KHẨU & CHI TIẾT SÁCH)
  // ========================================================
  function renderUserTable(filterMode) {
    if (!userTableBody) return;
    userTableBody.innerHTML = "";
    const user_search_val = document
      .getElementById("user-search")
      .value.toLowerCase()
      .trim();

    usersData.forEach((user, index) => {
      if (
        user_search_val &&
        !user.name.toLowerCase().includes(user_search_val) &&
        !user.email.toLowerCase().includes(user_search_val)
      )
        return;
      if (filterMode === "borrowing" && user.borrow_count === 0) return;
      if (filterMode === "overdue" && !user.has_overdue) return;

      let roleStyle = "";
      let roleName = "";
      if (user.role === "admin") {
        roleStyle =
          "background: rgba(255, 71, 87, 0.12); color: #ff4757; border: 1px solid rgba(255, 71, 87, 0.25);";
        roleName = "👑 Admin";
      } else if (user.role === "vip") {
        roleStyle =
          "background: rgba(255, 165, 2, 0.12); color: #ffa502; border: 1px solid rgba(255, 165, 2, 0.25);";
        roleName = "💎 VIP Member";
      } else {
        roleStyle =
          "background: rgba(46, 213, 115, 0.12); color: #2ed573; border: 1px solid rgba(46, 213, 115, 0.25);";
        roleName = "🧑 Student";
      }

      let warningAlert = user.has_overdue
        ? `<span style="color:#ff4757; font-weight:bold; margin-left:6px; animation: pulseBgRed 1.5s infinite;" title="Có sách quá hạn!">⚠️</span>`
        : "";

      const row = document.createElement("tr");
      row.className = "row-fade-in";
      row.innerHTML = `
        <td class="book-id">${user.id}</td>
        <td class="book-title">${user.name} ${warningAlert}</td>
        <td style="font-family: 'Fira Code', monospace; font-size:0.9rem;">${user.email}</td>
        <td style="font-family: 'Fira Code', monospace; min-width: 140px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="pwd-mask" data-pwd="${user.password}" style="color: #888; letter-spacing: 2px;">••••••••</span>
            <button class="action-btn btn-toggle-pwd" title="Hiện/Ẩn">👁️</button>
          </div>
        </td>
        <td><span class="status-indicator" style="${roleStyle}">${roleName}</span></td>
        <td class="book-id" style="text-align:center;">
          <span style="font-weight: 600; font-size: 1.05rem; color: #fff;">${user.borrow_count}</span> quyển<br>
          <span class="btn-view-user" data-email="${user.email}" style="color: #00d2d3; cursor: pointer; font-size: 0.75rem; text-decoration: underline; opacity: 0.8; transition: 0.2s;">Xem chi tiết</span>
        </td>
        <td style="color:#2ed573; font-weight:500;">${user.total_paid.toLocaleString()}đ</td>
        <td>
          <button class="action-btn btn-view-user" data-email="${user.email}" title="Xem chi tiết">👁️</button>
          <button class="action-btn btn-delete-user" data-email="${user.email}" title="Xóa tài khoản">🗑️</button>
        </td>
      `;
      userTableBody.appendChild(row);
    });
  }

  // --- EVENTS LỌC VÀ TÌM KIẾM ---
  filterBtns.forEach((btn) =>
    btn.addEventListener("click", (e) => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      renderTable(e.target.getAttribute("data-filter"));
    }),
  );

  userFilterBtns.forEach((btn) =>
    btn.addEventListener("click", (e) => {
      userFilterBtns.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      renderUserTable(e.target.getAttribute("data-user-filter"));
    }),
  );

  document.getElementById("user-search").addEventListener("input", () => {
    const activeFilter = document
      .querySelector("[data-user-filter].active")
      .getAttribute("data-user-filter");
    renderUserTable(activeFilter);
  });

  document.getElementById("admin-search").addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase().trim();
    tableBody.querySelectorAll("tr").forEach((row) => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(val) ? "" : "none";
    });
  });

  // ========================================================
  // 4. XỬ LÝ EVENT EDIT/DELETE SÁCH
  // ========================================================
  const editModal = document.getElementById("edit-book-modal");
  document
    .getElementById("close-edit-modal")
    .addEventListener("click", () => editModal.classList.remove("active"));

  tableBody.addEventListener("click", async (e) => {
    const delBtn = e.target.closest(".btn-delete");
    const edBtn = e.target.closest(".btn-edit");

    if (delBtn) {
      if (
        confirm(
          "Bạn có chắc chắn muốn xóa vĩnh viễn cuốn sách này khỏi SQLite?",
        )
      ) {
        const id = delBtn.getAttribute("data-id");
        const r = await fetch(`http://localhost:8080/api/admin/books/${id}`, {
          method: "DELETE",
        });
        if (r.ok) await startApp();
      }
    }
    if (edBtn) {
      const id = edBtn.getAttribute("data-id");
      const book = booksData.find((b) => b.raw_id == id);
      if (book) {
        document.getElementById("edit-book-raw-id").value = book.raw_id;
        document.getElementById("edit-book-title").value = book.title;
        document.getElementById("edit-book-author").value = book.author;
        document.getElementById("edit-book-category").value = book.category;
        document.getElementById("edit-book-price").value = book.price;
        document.getElementById("edit-book-image").value = book.image_url;
        document.getElementById("edit-book-auth-image").value =
          book.author_image_url;
        document.getElementById("edit-book-summary").value = book.summary;
        document.getElementById("edit-book-status").value = book.db_status;
        document.getElementById("edit-book-date").value =
          book.dueDate === "—" ? "" : book.dueDate;
        editModal.classList.add("active");
      }
    }
  });

  document
    .getElementById("submit-edit-book")
    .addEventListener("click", async () => {
      const id = document.getElementById("edit-book-raw-id").value;
      const res = await fetch(`http://localhost:8080/api/admin/books/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: document.getElementById("edit-book-title").value,
          author: document.getElementById("edit-book-author").value,
          category: document.getElementById("edit-book-category").value,
          price: document.getElementById("edit-book-price").value,
          image_url: document.getElementById("edit-book-image").value,
          author_image_url: document.getElementById("edit-book-auth-image")
            .value,
          summary: document.getElementById("edit-book-summary").value,
          status: document.getElementById("edit-book-status").value,
          date: document.getElementById("edit-book-date").value,
        }),
      });
      if (res.ok) {
        editModal.classList.remove("active");
        await startApp();
      }
    });

  // ========================================================
  // 5. ỦY QUYỀN SỰ KIỆN QUẢN TRỊ USER (MẬT KHẨU & CHI TIẾT SÁCH)
  // ========================================================
  const userDetailModal = document.getElementById("user-detail-modal");
  document
    .getElementById("close-user-detail-modal")
    .addEventListener("click", () =>
      userDetailModal.classList.remove("active"),
    );

  userTableBody.addEventListener("click", async (e) => {
    const viewBtn = e.target.closest(".btn-view-user");
    const delUserBtn = e.target.closest(".btn-delete-user");
    const togglePwdBtn = e.target.closest(".btn-toggle-pwd"); // Lắng nghe nút con mắt

    // SỰ KIỆN: Ẩn/Hiện mật khẩu
    if (togglePwdBtn) {
      const pwdSpan = togglePwdBtn.previousElementSibling;
      const realPwd = pwdSpan.getAttribute("data-pwd");
      if (pwdSpan.textContent === "••••••••") {
        pwdSpan.textContent = realPwd;
        pwdSpan.style.color = "#fbc531"; // Chữ màu vàng nổi bật
        pwdSpan.style.letterSpacing = "0px";
        togglePwdBtn.textContent = "🙈"; // Đổi icon nhắm mắt
      } else {
        pwdSpan.textContent = "••••••••";
        pwdSpan.style.color = "#888";
        pwdSpan.style.letterSpacing = "2px";
        togglePwdBtn.textContent = "👁️"; // Trả lại icon mở mắt
      }
      return; // Dừng tại đây để không kích hoạt nhầm nút khác
    }

    // SỰ KIỆN: Xem chi tiết danh sách cuốn sách đang giữ
    if (viewBtn) {
      const email = viewBtn.getAttribute("data-email");
      const user = usersData.find((u) => u.email === email);
      if (user) {
        document.getElementById("dt-user-name").textContent =
          `Sách Mượn: ${user.name}`;
        document.getElementById("dt-user-email").textContent = user.email;

        const listContainer = document.getElementById("dt-book-list");
        listContainer.innerHTML = "";

        if (user.borrowed_books.length === 0) {
          listContainer.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#888;">Tài khoản này hiện chưa mượn cuốn sách nào.</td></tr>`;
        } else {
          user.borrowed_books.forEach((b) => {
            const r = document.createElement("tr");
            r.innerHTML = `
              <td style="font-weight:500;">${b.title}</td>
              <td style="color:#2ed573;">${b.price.toLocaleString()}đ</td>
              <td style="font-family:'Fira Code';">${b.dueDate}</td>
            `;
            listContainer.appendChild(r);
          });
        }
        userDetailModal.classList.add("active"); // Kéo cửa sổ chi tiết ra
      }
    }

    // SỰ KIỆN: Trảm quyết vĩnh viễn tài khoản
    if (delUserBtn) {
      const email = delUserBtn.getAttribute("data-email");
      if (
        confirm(
          `⚠️ BIỆN PHÁP MẠNH: Bạn có chắc muốn xóa vĩnh viễn tài khoản [ ${email} ]? Toàn bộ hồ sơ thành viên sẽ bị hủy bỏ!`,
        )
      ) {
        const res = await fetch(
          "http://localhost:8080/api/admin/users/delete",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email }),
          },
        );
        if (res.ok) await startApp();
        else alert("Lỗi hệ thống, không thể xóa tài khoản này!");
      }
    }
  });

  // --- MODAL THÊM SÁCH MỚI GỐC ---
  const modal = document.getElementById("book-modal");
  const btnCloseModal = document.getElementById("close-book-modal");
  const btnSubmitNewBook = document.getElementById("submit-new-book");

  if (btnAddBookHeader)
    btnAddBookHeader.addEventListener("click", () =>
      modal.classList.add("active"),
    );
  if (btnCloseModal)
    btnCloseModal.addEventListener("click", () => {
      modal.classList.remove("active");
    });

  if (btnSubmitNewBook) {
    btnSubmitNewBook.addEventListener("click", async () => {
      const res = await fetch("http://localhost:8080/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: document.getElementById("new-book-title").value.trim(),
          author: document.getElementById("new-book-author").value.trim(),
          category: document.getElementById("new-book-category").value.trim(),
          price: document.getElementById("new-book-price").value.trim(),
          image_url: document.getElementById("new-book-image").value.trim(),
          author_image_url: document
            .getElementById("new-book-auth-image")
            .value.trim(),
          summary: document.getElementById("new-book-summary").value.trim(),
        }),
      });
      if (res.ok) {
        modal.classList.remove("active");
        document.getElementById("new-book-title").value = "";
        await startApp();
      }
    });
  }
});
