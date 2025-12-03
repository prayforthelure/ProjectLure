// js/about.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== アーク一覧 =====
  const arcContainer = document.getElementById("about-arc-list");
  if (arcContainer) {
    fetch("data/arcList.json")
      .then(res => {
        if (!res.ok) throw new Error("arcList.json の読み込みに失敗しました");
        return res.json();
      })
      .then(arcList => {
        // { B: {...}, F: {...}, ... } を code順に並べたい場合
        const entries = Object.entries(arcList);

        // コード順に並べる（B, F, G... のままで良ければソート不要）
        // entries.sort(([codeA], [codeB]) => codeA.localeCompare(codeB));

        entries.forEach(([code, arc]) => {
          const item = document.createElement("div");
          item.className = "about-arc-item";

          // 絵文字
          const iconSpan = document.createElement("span");
          iconSpan.className = "arc-icon";
          iconSpan.textContent = arc.icon || "";

          // 名前
          const nameSpan = document.createElement("span");
          nameSpan.className = "arc-name";
          nameSpan.textContent = arc.name || code;

          item.appendChild(iconSpan);
          item.appendChild(nameSpan);

          // キーワード（あれば）
          if (Array.isArray(arc.keywords) && arc.keywords.length > 0) {
            const kwSpan = document.createElement("span");
            kwSpan.className = "arc-keywords";
            // 表示形式は「：衝動 / 情熱 / 破壊衝動」みたいな感じ
            kwSpan.textContent = "：" + arc.keywords.join(" / ");
            item.appendChild(kwSpan);
          }

          arcContainer.appendChild(item);
        });
      })
      .catch(err => {
        console.error(err);
        arcContainer.innerHTML = "<p>アーク一覧の読み込みに失敗しました。</p>";
      });
  }

  // ===== シリーズ一覧 =====
  const seriesContainer = document.getElementById("about-series-list");
  if (seriesContainer) {
    fetch("data/series.json")
      .then(res => {
        if (!res.ok) throw new Error("series.json の読み込みに失敗しました");
        return res.json();
      })
      .then(seriesMap => {
        // { "0": {...}, "1": {...} } → 配列化・id順にソート
        const list = Object.values(seriesMap).sort(
          (a, b) => Number(a.id) - Number(b.id)
        );

        list.forEach(series => {
          const item = document.createElement("div");
          item.className = "about-theme-item";

          // 0_Occupation の形式
          const idKey = `${series.id}_${series.key}`;

          item.innerHTML = `
            <h3>
              ${idKey}<br>
              <span class="about-theme-sub">${series.nameJa}</span>
            </h3>
            <p>${series.description || ""}</p>
          `;

          seriesContainer.appendChild(item);
        });
      })
      .catch(err => {
        console.error(err);
        seriesContainer.innerHTML = "<p>シリーズ一覧の読み込みに失敗しました。</p>";
      });
  }
});
