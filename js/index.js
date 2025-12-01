document.addEventListener("DOMContentLoaded", () => {
  // ===== キャラクターデータ読み込み（テスト用：series抜き） =====
  fetch("characters.json")
    .then(r => r.json())
    .then(chars => {
      console.log("chars loaded:", chars);   // デバッグ

      const container = document.getElementById("card-list");

      const originalOrder = [...chars];
      let currentList = [...originalOrder];

      function renderList(list) {
        container.innerHTML = "";

        list.forEach(c => {
          const imgPath = `images/characters/${c.code}.png`;

          const a = document.createElement("a");
          a.href = `character.html?code=${c.code}`;
          a.className = "card";
          a.innerHTML = `
            <div class="card-inner">
              <div class="card-image">
                <img src="${imgPath}" alt="${c.title}">
              </div>
              <div class="card-meta">
                <div class="card-code">${c.code}</div>
                <div class="card-title">${c.title}</div>
              </div>
            </div>
          `;
          container.appendChild(a);
        });
      }

      renderList(currentList);
    })
    .catch(e => {
      console.error("読み込みエラー(単体テスト):", e);
    });

  // ===== 検索ポップアップ用（そのまま） =====
  const overlay = document.getElementById("search-overlay");
  const openBtn = document.getElementById("search-open");
  const closeBtn = document.getElementById("search-close");

  if (openBtn && overlay) {
    openBtn.addEventListener("click", () => {
      overlay.classList.add("is-open");
    });
  }

  if (closeBtn && overlay) {
    closeBtn.addEventListener("click", () => {
      overlay.classList.remove("is-open");
    });
  }

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("is-open");
      }
    });
  }
});
