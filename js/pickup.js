// js/pickup.js

document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.classList.contains('page-index')) return;

  const main = document.querySelector('.l-main');
  if (!main) return;

  const CHAR_JSON_URL   = 'data/characters.json';
  const SERIES_JSON_URL = 'data/series.json';
  const SYN_JSON_URL    = 'data/synopsis.json';

  const AUTO_SLIDE_MS = 7000;
  let autoTimer = null;
  let autoEnabled = true;
  let autoIndex = 0;

  async function fetchJson(url) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error('pickup fetch error:', url, e);
      return null;
    }
  }

  function pickRandomN(arr, n) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
  }

  function wrapQuote(text) {
    const t = String(text || '').replace(/[〝〟]/g, '').trim();
    return t ? `〝${t}〟` : '';
  }

  // 画像の存在チェック（png を実際に読み込んで判定）
  function imageExists(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  (async () => {
    const [chars, seriesMap, synopsisMapRaw] = await Promise.all([
      fetchJson(CHAR_JSON_URL),
      fetchJson(SERIES_JSON_URL),
      fetchJson(SYN_JSON_URL).catch(() => null)
    ]);

    const synopsisMap = synopsisMapRaw || {};
    if (!Array.isArray(chars) || !seriesMap) return;

    // 「紹介文を出せるキャラ」を優先（ただし最終的に画像ありに絞る）
    const withText = chars.filter(c => {
      if (c.catchcopy && String(c.catchcopy).trim() !== '') return true;
      const syn = synopsisMap[c.code];
      return syn && syn.summary && String(syn.summary).trim() !== '';
    });

    const poolBase = withText.length ? withText : chars;
    if (!poolBase.length) return;

    // 先にある程度多めに候補を取り、画像ありだけに絞る（最大3枚確保のため）
    const prePicks = pickRandomN(poolBase, Math.min(12, poolBase.length));

    // 画像あり判定
    const checks = await Promise.all(
      prePicks.map(async c => {
        const src = `images/characters/${c.code}.png`;
        const ok = await imageExists(src);
        return ok ? c : null;
      })
    );

    const poolWithImage = checks.filter(Boolean);
    const picks = poolWithImage.slice(0, 3);

    // 0件ならPICKUP自体を作らない
    if (!picks.length) return;

    function buildCardHtml(c) {
      const series = seriesMap[c.series];

      let summary = '';
      if (c.catchcopy && String(c.catchcopy).trim() !== '') {
        summary = String(c.catchcopy).trim();
      } else {
        const syn = synopsisMap[c.code];
        if (syn && syn.summary) summary = String(syn.summary).split('\n')[0].trim();
      }

      const summaryForDisplay = wrapQuote(summary);
      const detailUrl = `character.html?code=${encodeURIComponent(c.code)}`;
      const thumbPath = `images/characters/${c.code}.png`;

      return `
        <div class="pickup-card">
          <a href="${detailUrl}" class="pickup-card-link">
            <div class="pickup-inner">
              <div class="pickup-thumb">
                <img src="${thumbPath}" alt="${c.title}" class="pickup-thumb-img">
              </div>
              <div class="pickup-main">
                <div class="pickup-title-row">
                  <span class="pickup-title">${c.title}</span>
                </div>
                <div class="pickup-meta">
                  ${series ? `<span class="pickup-series">シリーズ：${series.nameJa}</span>` : ''}
                  ${c.theme ? `<span class="pickup-theme">テーマ：${c.theme}</span>` : ''}
                </div>
                ${summaryForDisplay ? `<p class="pickup-summary">${summaryForDisplay}</p>` : ''}
              </div>
            </div>
          </a>
        </div>
      `;
    }

    const cardsHtml = picks.map(buildCardHtml).join('');

    const dotsHtml = `
      <div class="pickup-dots">
        ${picks.map((_c, i) =>
          `<button type="button" class="pickup-dot" data-index="${i}" aria-label="ピックアップ ${i + 1}"></button>`
        ).join('')}
      </div>
    `;

    const pickupHtml = `
<section class="section-card pickup-section" id="pickup-section">
  <button type="button" class="pickup-close-btn" aria-label="ピックアップを閉じる">×</button>
  <div class="pickup-label">PICKUP</div>
  <div class="pickup-track">
    ${cardsHtml}
  </div>
  ${dotsHtml}
</section>
`;

    main.insertAdjacentHTML('afterbegin', pickupHtml);

    const section = document.getElementById('pickup-section');
    const track   = section.querySelector('.pickup-track');
    const cards   = Array.from(section.querySelectorAll('.pickup-card'));
    const dots    = Array.from(section.querySelectorAll('.pickup-dot'));

    if (!track || !cards.length) return;

    function setActive(index) {
      cards.forEach((card, i) => card.classList.toggle('is-active', i === index));
      dots.forEach((dot, i)  => dot.classList.toggle('is-active', i === index));
    }

    function scrollToIndex(index, behavior = 'smooth') {
      if (!cards[index]) return;

      const trackRect = track.getBoundingClientRect();
      const cardRect  = cards[index].getBoundingClientRect();

      const trackCenter = trackRect.left + trackRect.width / 2;
      const cardCenter  = cardRect.left + cardRect.width / 2;
      const delta = cardCenter - trackCenter;

      try {
        track.scrollTo({ left: track.scrollLeft + delta, behavior });
      } catch (_e) {
        track.scrollLeft += delta;
      }

      setActive(index);
    }

    function updateActiveByScroll() {
      const trackRect = track.getBoundingClientRect();
      const centerX = trackRect.left + trackRect.width / 2;

      let closestIndex = 0;
      let minDist = Infinity;

      cards.forEach((card, idx) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const dist = Math.abs(cardCenter - centerX);
        if (dist < minDist) {
          minDist = dist;
          closestIndex = idx;
        }
      });

      autoIndex = closestIndex;
      setActive(closestIndex);
    }

    function startAutoSlide() {
      stopAutoSlide(false);
      if (cards.length <= 1) return;
      autoEnabled = true;

      autoTimer = setInterval(() => {
        if (!autoEnabled) return;
        autoIndex = (autoIndex + 1) % cards.length;
        scrollToIndex(autoIndex, 'smooth');
      }, AUTO_SLIDE_MS);
    }

    function stopAutoSlide(stopHard = true) {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
      if (stopHard) autoEnabled = false;
    }

    const stopByUser = () => stopAutoSlide(true);

    // 初期：1枚目
    const initialIndex = 0;
    autoIndex = initialIndex;
    setActive(initialIndex);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToIndex(initialIndex, 'auto');
        updateActiveByScroll();
        section.classList.add('pickup-ready');
        startAutoSlide();
      });
    });

    let scrollTimer = null;
    track.addEventListener('scroll', () => {
      stopByUser();
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateActiveByScroll, 80);
    }, { passive: true });

    dots.forEach(dot => {
      const idx = Number(dot.dataset.index || '0') || 0;
      dot.addEventListener('click', () => {
        stopByUser();
        scrollToIndex(idx, 'smooth');
      });
    });

    section.addEventListener('pointerdown', () => {
      stopByUser();
    }, { passive: true });

    const closeBtn = section.querySelector('.pickup-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        stopAutoSlide(true);
        section.remove();
      });
    }
  })();
});
