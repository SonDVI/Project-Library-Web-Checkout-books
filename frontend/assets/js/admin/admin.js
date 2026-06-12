document.addEventListener("DOMContentLoaded", () => {
  console.log("🔥 Fintech Admin Portal Activated!");

  const tableBody = document.getElementById("admin-book-list");
  const filterBtns = document.querySelectorAll(".pill-btn");
  const overdueCountEl = document.getElementById("overdue-count");

  // DỮ LIỆU GIẢ LẬP ĐỂ TEST
  const booksData = [
    {
      id: "TX-9021",
      title: "The Spanish Bride",
      status: "borrowed",
      borrower: "Nguyễn Bảo Sơn",
      dueDate: "2026-06-10",
    },
    {
      id: "TX-9022",
      title: "The Great Gatsby",
      status: "available",
      borrower: "—",
      dueDate: "—",
    },
    {
      id: "TX-9023",
      title: "C++ Programming Concepts",
      status: "borrowed",
      borrower: "Hoàng Anh Trần",
      dueDate: "2026-06-25",
    },
    {
      id: "TX-9024",
      title: "Human Anatomy Vol 2",
      status: "available",
      borrower: "—",
      dueDate: "—",
    },
    {
      id: "TX-9025",
      title: "YOLOv11 Architecture",
      status: "borrowed",
      borrower: "Đỗ Hoàng Phúc",
      dueDate: "2026-06-05",
    },
    {
      id: "TX-9026",
      title: "Python for Data Analysis",
      status: "borrowed",
      borrower: "Ngô Anh Minh",
      dueDate: "2026-06-08",
    },
  ];

  const today = new Date();

  // Hàm Render Bảng với Animation
  function renderTable(filterMode) {
    if (!tableBody) return;

    // Tạo hiệu ứng fade-out trước khi đổi dữ liệu
    tableBody.style.opacity = "0";

    setTimeout(() => {
      tableBody.innerHTML = "";
      let overdueCounter = 0;

      booksData.forEach((book, index) => {
        let isOverdue = false;
        let displayStatus = "";
        let statusClass = "";
        let dateClass = "date-normal";

        if (book.status === "available") {
          displayStatus = "<div class='dot'></div> Sẵn sàng";
          statusClass = "status-available";
        } else if (book.status === "borrowed") {
          const dueDateObj = new Date(book.dueDate);

          if (dueDateObj < today) {
            isOverdue = true;
            overdueCounter++; // Đếm số sách quá hạn
            displayStatus = "<div class='dot'></div> Quá Hạn";
            statusClass = "status-overdue";
            dateClass = "date-overdue";
          } else {
            displayStatus = "<div class='dot'></div> Đang mượn";
            statusClass = "status-borrowed";
          }
        }

        // Cập nhật số liệu lên Summary Card góc trên cùng
        if (filterMode === "all" && overdueCountEl) {
          overdueCountEl.textContent = overdueCounter;
        }

        // Lọc dữ liệu
        if (filterMode === "available" && book.status !== "available") return;
        if (filterMode === "borrowed" && book.status !== "borrowed") return;
        if (filterMode === "overdue" && !isOverdue) return;

        // Tạo dòng HTML
        const row = document.createElement("tr");
        row.className = "row-fade-in"; // Thêm class animation
        row.style.animationDelay = `${index * 0.05}s`; // Stagger effect (hiện dần từng dòng)

        row.innerHTML = `
          <td class="book-id">${book.id}</td>
          <td class="book-title">${book.title}</td>
          <td><span class="status-indicator ${statusClass}">${displayStatus}</span></td>
          <td class="book-borrower">${book.borrower}</td>
          <td class="${dateClass}">${book.dueDate}</td>
          <td>
            <button class="action-btn btn-edit" title="Chỉnh sửa">✏️</button>
            <button class="action-btn btn-delete" title="Xóa">🗑️</button>
          </td>
        `;
        tableBody.appendChild(row);
      });

      // Bật lại opacity để hiển thị
      tableBody.style.opacity = "1";
    }, 200); // Đợi 200ms cho màn mờ đi rồi mới vẽ lại
  }

  // Khởi chạy lần đầu
  renderTable("all");

  // Xử lý nút Filter với hiệu ứng Active
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");

      const mode = e.target.getAttribute("data-filter");
      renderTable(mode);
    });
  });

  // Xử lý Modal Thêm Sách
  const btnAdd = document.getElementById("btn-add-book");
  const modal = document.getElementById("book-modal");
  const btnCloseModal = document.getElementById("close-book-modal");

  if (btnAdd)
    btnAdd.addEventListener("click", () => modal.classList.add("active"));
  if (btnCloseModal)
    btnCloseModal.addEventListener("click", () =>
      modal.classList.remove("active"),
    );
});
