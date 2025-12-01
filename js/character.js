document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  // characters.json / arcList.json / series.json / link.json を読み込む
  Promise.all([
    fetch("data/characters.json").then(r => r.json()),
    fetch("data/arcList.json").then(r => r.json()),
    fetch("data/series.json").then(r => r.json()),
    fetch("data/links.json").then(r => r.json())
  ]).then(([chars, arcList, seriesMap, linkMap]) => {

    // code に一致するキャラ
    const c = chars.find(ch => ch.code === code);
    if (!c) return;

    // 画像パス
    const imgPath = `images/characters/${c.code}.png`;

    // アーク情報
    const exArc = c.arc?.ex ? arcList[c.arc.ex] : null;
    const coreArc = c.arc?.core ? arcList[c.arc.core] : null;

    // シリーズ
    const series = seriesMap[c.series];

    // リンク情報
    const links = linkMap[c.code] || {};
    const yt = links.youtube || "";
    const note = links.note || "";
    const x = links.x || "";

    // リンクブロック生成
    let linkHtml = "";
    if (yt || note || x) {
      linkHtml = `
        <div class="character-links">
          ${yt ? `<a href="${yt}" target="_blank">YouTube</a>` : ""}
          ${note ? `<a href="${note}" target="_blank">note</a>` : ""}
          ${x ? `<a href="${x}" target="_blank">X</a>` : ""}
        </div>
      `;
    }

    const container = document.getElementById("character-content");

    container.innerHTML = `
      <div class="character-layout">

        <img src="${imgPath}" alt="${c.title}" class="char-image">

        <div class="character-info">

          <h1>${c.code} ${c.title}</h1>

          <!-- シリーズ -->
          <div class="character-meta-row">
            <span class="character-meta-label">シリーズ:</span>
            <span>${series ? series.nameJa : ""}</span>
          </div>

          <!-- テーマ -->
          <div class="character-meta-row">
            <span class="character-meta-label">テーマ:</span>
            <span>${c.theme || ""}</span>
          </div>

          <!-- メインカラー -->
          <div class="character-meta-row">
            <span class="character-meta-label">メインカラー:</span>
            <span>${c.mainColorLabel || ""}</span>
          </div>

          <!-- アーク -->
          <section class="arc-section">

            <div class="arc-row">
              <span class="arc-label">エクスアーク:</span>
              ${exArc ? `
                <span class="arc-icon">${exArc.icon}</span>
                <span class="arc-name">${exArc.name}</span>
              ` : `<span class="arc-name">未設定</span>`}
            </div>

            <div class="arc-row">
              <span class="arc-label">コアアーク:</span>
              ${coreArc ? `
                <span class="arc-icon">${coreArc.icon}</span>
                <span class="arc-name">${coreArc.name}</span>
              ` : `<span class="arc-name">未設定</span>`}
            </div>

          </section>

          <!-- SNSリンク -->
          ${linkHtml}

        </div>
      </div>
    `;
  });
});
