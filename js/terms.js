// js/terms.js

document.addEventListener('DOMContentLoaded', () => {
  const ARC_JSON_URL = 'data/arcList.json';
  const SERIES_JSON_URL = 'data/series.json';

  const arcListContainer = document.getElementById('arc-list');
  const seriesListContainer = document.getElementById('series-list');

  if (!arcListContainer || !seriesListContainer) return;

  async function fetchJson(url) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // ---- アーク一覧 ----
  function renderArcs(arcData) {
    const keys = Object.keys(arcData);

    const wrap = document.createElement('div');
    wrap.className = 'arc-list-block';

    keys.forEach(key => {
      const arc = arcData[key];
      if (!arc) return;

      const card = document.createElement('div');
      card.className = 'arc-card info-card';

      // ヘッダー部分
      const header = document.createElement('div');
      header.className = 'arc-card-header';

      const icon = document.createElement('span');
      icon.className = 'arc-icon';
      icon.textContent = arc.icon;

      const name = document.createElement('span');
      name.className = 'arc-name';
      name.textContent = `${arc.name}（${arc.eng}）`;

      header.appendChild(icon);
      header.appendChild(name);

      // キーワード部分
      const tagWrap = document.createElement('div');
      tagWrap.className = 'arc-tag-list';

      arc.keywords.forEach(kw => {
        const t = document.createElement('span');
        t.className = 'arc-tag';
        t.textContent = kw;
        tagWrap.appendChild(t);
      });

      card.appendChild(header);
      card.appendChild(tagWrap);
      wrap.appendChild(card);
    });

    arcListContainer.innerHTML = '';
    arcListContainer.appendChild(wrap);
  }

  // ---- シリーズ一覧 ----
  function renderSeries(seriesData) {
    const keys = Object.keys(seriesData).sort((a, b) => Number(a) - Number(b));

    const wrap = document.createElement('div');
    wrap.className = 'series-list-block';

    keys.forEach(id => {
      const s = seriesData[id];
      if (!s) return;

      const card = document.createElement('div');
      card.className = 'series-card info-card';

      const title = document.createElement('h3');
      title.textContent = `${s.id}_${s.key} / ${s.nameJa}`;

      const desc = document.createElement('p');
      desc.className = 'series-desc';
      desc.textContent = s.description;

      card.appendChild(title);
      card.appendChild(desc);
      wrap.appendChild(card);
    });

    seriesListContainer.innerHTML = '';
    seriesListContainer.appendChild(wrap);
  }

  // ---- 読み込み ----
  (async () => {
    const [arcData, seriesData] = await Promise.all([
      fetchJson(ARC_JSON_URL),
      fetchJson(SERIES_JSON_URL)
    ]);

    if (arcData) renderArcs(arcData);
    if (seriesData) renderSeries(seriesData);
  })();
});