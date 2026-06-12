document.addEventListener("DOMContentLoaded", () => {
  const inputName = document.getElementById("input-fullname");
  const cardName = document.getElementById("card-holder-name");
  const form = document.getElementById("profile-edit-form");

  // Đồng bộ hóa tên gõ trực tiếp lên mặt thẻ số
  if (inputName && cardName) {
    inputName.addEventListener("input", (e) => {
      cardName.textContent = e.target.value.toUpperCase() || "VIP MEMBER";
    });
  }

  // Cập nhật Profile
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      localStorage.setItem("userName", inputName.value);
      alert("✅ Đã cập nhật Hồ sơ cá nhân và đồng bộ Thẻ Thư Viện Số!");
      window.location.reload();
    });
  }
});
