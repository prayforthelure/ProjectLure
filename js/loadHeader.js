document.addEventListener("DOMContentLoaded", () => {
  fetch("components/header.html")
    .then(res => res.text())
    .then(html => {
      const container = document.getElementById("header-container");
      if (!container) return;
      container.innerHTML = html;
    })
    .then(() => {
      // --- ハンバーガー開閉 ---
      const menuBtn = document.getElementById("menu-toggle");
      const nav = document.getElementById("header-nav");

      if (menuBtn && nav) {
        menuBtn.addEventListener("click", () => {
          nav.classList.toggle("is-open");
        });
      }

      // --- 検索ボタンの表示制御 ---
      const searchBtn = document.getElementById("search-open");
      const isIndex = document.body.classList.contains("page-index");

      // index.html 以外では強制で非表示
      if (searchBtn && !isIndex) {
        searchBtn.style.display = "none";
      }
    })
    .catch(err => {
      console.error("ヘッダー読み込みエラー:", err);
    });
});
