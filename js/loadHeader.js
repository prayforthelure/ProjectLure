// loadHeader.js
document.addEventListener('DOMContentLoaded', () => {
  // ==========
  // 要素取得
  // ==========
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('site-nav');
  const navOverlay = document.getElementById('nav-overlay');
  const navCloseBtn = nav ? nav.querySelector('.nav-close-btn') : null;

  const searchOpenBtn = document.getElementById('search-open');
  const searchOverlay = document.getElementById('search-overlay');
  const searchCloseBtn = searchOverlay ? document.getElementById('search-close') : null;

  const helpOpenBtn = document.getElementById('help-open');
  const helpOverlay = document.getElementById('help-overlay');
  const helpCloseBtn = helpOverlay ? document.getElementById('help-close') : null;

  // ==========
  // サイドナビ開閉
  // ==========
  const openNav = () => {
    if (!nav || !navOverlay) return;
    nav.classList.add('is-open');
    navOverlay.classList.add('is-active');
    nav.setAttribute('aria-hidden', 'false');
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'true');
    }
    document.body.dataset.navOpen = 'true';
  };

  const closeNav = () => {
    if (!nav || !navOverlay) return;
    nav.classList.remove('is-open');
    navOverlay.classList.remove('is-active');
    nav.setAttribute('aria-hidden', 'true');
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false');
    }
    document.body.dataset.navOpen = 'false';
  };

  // ハンバーガーで開く
  if (menuToggle) {
    menuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      // トグル挙動（連打でも壊れないように）
      const isOpen = nav && nav.classList.contains('is-open');
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });
  }

  // ×ボタンで閉じる
  if (navCloseBtn) {
    navCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeNav();
    });
  }

  // オーバーレイクリックで閉じる
  if (navOverlay) {
    navOverlay.addEventListener('click', (e) => {
      // メニュー外のクリックだけを拾う感じで十分なのでそのまま閉じる
      closeNav();
    });
  }

  // Escキーでナビ／モーダルを閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;

    // 優先順位：検索 → ヘルプ → ナビ
    if (searchOverlay && searchOverlay.classList.contains('is-open')) {
      closeSearch();
      return;
    }
    if (helpOverlay && helpOverlay.classList.contains('is-open')) {
      closeHelp();
      return;
    }
    if (nav && nav.classList.contains('is-open')) {
      closeNav();
    }
  });

  // ==========
  // 現在ページに .is-current を付与
  // ==========
  try {
    // 例: /foo/index.html → "index.html"
    let currentPage = window.location.pathname.split('/').pop();
    if (!currentPage || currentPage === '') {
      currentPage = 'index.html';
    }

    // メインメニュー
    const navLinks = document.querySelectorAll('.header-nav-link[href]');
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      // クエリやハッシュは無視して、ファイル名だけ比較
      const linkFile = href.split('/').pop().split('#')[0].split('?')[0];

      if (linkFile === currentPage) {
        link.classList.add('is-current');
      }
    });

    // サブメニュー（ABOUT配下など）
    const subnavLinks = document.querySelectorAll('.header-subnav-link[href]');
    subnavLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkFile = href.split('/').pop().split('#')[0].split('?')[0];

      if (linkFile === currentPage) {
        link.classList.add('is-current');
        // 親 ABOUT を強調したい場合は、親も is-current にしておく
        const aboutParent = document.querySelector('.header-nav-link.nav-about');
        if (aboutParent) {
          aboutParent.classList.add('is-current');
        }
      }
    });
  } catch (err) {
    console.warn('current page 判定でエラー:', err);
  }

  // ==========
  // 検索モーダル
  // ==========
  const openSearch = () => {
    if (!searchOverlay) return;
    searchOverlay.classList.add('is-open');
    const input = document.getElementById('search-input');
    if (input) {
      setTimeout(() => input.focus(), 0);
    }
  };

  const closeSearch = () => {
    if (!searchOverlay) return;
    searchOverlay.classList.remove('is-open');
  };

  if (searchOpenBtn && searchOverlay) {
    searchOpenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openSearch();
    });
  }

  if (searchCloseBtn) {
    searchCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeSearch();
    });
  }

  if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
      // モーダル外（背景）をクリックしたときだけ閉じる
      if (e.target === searchOverlay) {
        closeSearch();
      }
    });
  }

  // ==========
  // ヘルプモーダル
  // ==========
  const openHelp = () => {
    if (!helpOverlay) return;
    helpOverlay.classList.add('is-open');
  };

  const closeHelp = () => {
    if (!helpOverlay) return;
    helpOverlay.classList.remove('is-open');
  };

  if (helpOpenBtn && helpOverlay) {
    helpOpenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openHelp();
    });
  }

  if (helpCloseBtn) {
    helpCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeHelp();
    });
  }

  if (helpOverlay) {
    helpOverlay.addEventListener('click', (e) => {
      if (e.target === helpOverlay) {
        closeHelp();
      }
    });
  }
});