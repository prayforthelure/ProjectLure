document.addEventListener("DOMContentLoaded", () => {
  // ====== 検索モーダルの要素 ======
  const overlay  = document.getElementById("search-overlay");
  const openBtn  = document.getElementById("search-open");
  const closeBtn = document.getElementById("search-close");

  const cardContainer = document.getElementById("card-list");

  let chars = [];
  let seriesMap = {};
  let arcMap = {};

  let originalOrder = [];
  let currentList   = [];
  let sortMode      = "code"; // "code" or "title"

  // 一覧描画
  function renderList(list) {
    if (!cardContainer) return;
    cardContainer.innerHTML = "";

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
            <div class="card-title">${c.title}</div>
          </div>
        </div>
      `;
      cardContainer.appendChild(a);
    });
  }

  // ===== データ読み込み =====
  Promise.all([
    fetch("data/characters.json").then(r => r.json()),
    fetch("data/series.json").then(r => r.json()),
    fetch("data/arcList.json").then(r => r.json())
  ])
    .then(([characters, series, arcs]) => {
      chars      = characters;
      seriesMap  = series;
      arcMap     = arcs;

      originalOrder = [...chars];
      currentList   = [...originalOrder];

      renderList(currentList);
      setupSort();
      setupSearchUI();
    })
    .catch(e => {
      console.error("データ読み込みエラー:", e);
    });

  // ===== ソートボタンの設定 =====
  function setupSort() {
    const sortToggleBtn = document.getElementById("sort-open");
    if (!sortToggleBtn) return;

    // 初期ラベル
    sortToggleBtn.textContent = "タイトル順";

    sortToggleBtn.addEventListener("click", () => {
      if (sortMode === "code") {
        // タイトル読みでソート
        currentList = [...originalOrder].sort((a, b) => {
          const ay = (a.titleYomi || a.title || "").toString();
          const by = (b.titleYomi || b.title || "").toString();
          return ay.localeCompare(by, "ja");
        });
        sortMode = "title";
        sortToggleBtn.textContent = "コード順";
      } else {
        // コード順（元の順番）
        currentList = [...originalOrder];
        sortMode = "code";
        sortToggleBtn.textContent = "タイトル順";
      }
      renderList(currentList);
    });
  }

  // ===== 検索UIの設定 =====
  function setupSearchUI() {
    if (!overlay) return;

    const searchInput = document.getElementById("search-input");
    const seriesGroup = document.getElementById("filter-series-group");
    const arcGroup    = document.getElementById("filter-arc-group");
    const decideBtn   = document.getElementById("search-decide");
    const resetBtn    = document.getElementById("search-reset");

    // --- シリーズのチップ生成 ---
    if (seriesGroup) {
      seriesGroup.innerHTML = "";
      Object.values(seriesMap).forEach(s => {
        const label = document.createElement("label");
        label.className = "filter-chip";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = s.id;          // "0"〜"9"

        const span = document.createElement("span");
        span.textContent = s.nameJa; // 日本語名

        input.addEventListener("change", () => {
          label.classList.toggle("checked", input.checked);
        });

        label.appendChild(input);
        label.appendChild(span);
        seriesGroup.appendChild(label);
      });
    }

    // --- アークのチップ生成 ---
    if (arcGroup) {
      arcGroup.innerHTML = "";
      Object.entries(arcMap).forEach(([key, arc]) => {
        const label = document.createElement("label");
        label.className = "filter-chip";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = key; // "B" / "F" / "G" ... etc

        const span = document.createElement("span");
        const icon = arc.icon || "";
        const name = arc.name || "";
        span.textContent = `${icon} ${name}`.trim();

        input.addEventListener("change", () => {
          label.classList.toggle("checked", input.checked);
        });

        label.appendChild(input);
        label.appendChild(span);
        arcGroup.appendChild(label);
      });
    }

    // --- フィルタ適用 ---
    function applyFilter() {
      const text = (searchInput?.value || "").trim().toLowerCase();

      const selectedSeries = seriesGroup
        ? Array.from(
            seriesGroup.querySelectorAll('input[type="checkbox"]:checked')
          ).map(cb => cb.value)
        : [];

      const selectedArcs = arcGroup
        ? Array.from(
            arcGroup.querySelectorAll('input[type="checkbox"]:checked')
          ).map(cb => cb.value)
        : [];

      currentList = originalOrder.filter(c => {
        // テキスト検索：コード / タイトル / 読み
        // テキスト検索：コード / タイトル / 読み / 色名
        if (text) {
          const base = (
            (c.code || "") + " " +
            (c.title || "") + " " +
            (c.titleYomi || "") + " " +
            (c.mainColorLabel || "")
          ).toString().toLowerCase();

          if (!base.includes(text)) return false;
        }

        // シリーズ：1つでも選ばれていれば、その中に含まれるものだけ
        if (selectedSeries.length > 0 && !selectedSeries.includes(c.series)) {
          return false;
        }

        // アーク：エクス or コア のどちらかが一致すればOK
        if (selectedArcs.length > 0) {
          const ex   = c.arc?.ex || "";
          const core = c.arc?.core || "";
          if (!selectedArcs.includes(ex) && !selectedArcs.includes(core)) {
            return false;
          }
        }

        return true;
      });

      renderList(currentList);
      overlay.classList.remove("is-open");
    }

    // --- フィルタリセット ---
    function resetFilter() {
      if (searchInput) searchInput.value = "";

      if (seriesGroup) {
        seriesGroup
          .querySelectorAll('input[type="checkbox"]')
          .forEach(cb => {
            cb.checked = false;
            cb.parentElement?.classList.remove("checked");
          });
      }

      if (arcGroup) {
        arcGroup
          .querySelectorAll('input[type="checkbox"]')
          .forEach(cb => {
            cb.checked = false;
            cb.parentElement?.classList.remove("checked");
          });
      }

      currentList = [...originalOrder];
      renderList(currentList);
    }

    // ボタンイベント
    if (decideBtn) decideBtn.addEventListener("click", applyFilter);
    if (resetBtn)  resetBtn.addEventListener("click", resetFilter);

    // モーダル開閉
    if (openBtn) {
      openBtn.addEventListener("click", () => {
        overlay.classList.add("is-open");
        if (searchInput) {
          setTimeout(() => searchInput.focus(), 50);
        }
      });
    }

    if (closeBtn) {
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
  }
});
