/* ============================================================
   nav.js, Dynamic navigation builder for ZALI Industries
   Reads ZALI_CATALOG from products-data.js (must be loaded first)
   ============================================================ */

window.optImg = function (src, w = 800) {
  if (!src) return src;
  const decoded = decodeURIComponent(src);
  const abs = decoded.startsWith('/') ? decoded : '/' + decoded;
  return abs.split('/').map(encodeURIComponent).join('/');
};

(function () {
  'use strict';

  // ── Current page detection ──────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // ── Nav structure definition ────────────────────────────────
  // Maps category id → display label + anchor used in nav
  const CAT_META = {
    'casual-wear': { label: 'Casual Wear', anchor: '#casual' },
    fightwear: { label: 'Fightwear', anchor: '#fightwear' },
    fitnesswear: { label: 'FitnessWear', anchor: '#fitnesswear' },
    surfwear: { label: 'SurfWear', anchor: '#surfwear' },
    'team-sports': { label: 'Team Sports', anchor: '#team' },
  };

  // For Team Sports, group subcategories under their nav group
  const TEAM_NAV_GROUPS = [
    'Most Popular',
    'Field & Court',
    'Track, Cycling & Combat',
    'Specialty',
  ];

  // ── Helper ──────────────────────────────────────────────────
  function productUrl(prod) {
    return 'product-detail.html?id=' + encodeURIComponent(prod.id);
  }

  function productsPageUrl(catId) {
    const anchors = {
      'casual-wear': '#casual',
      fightwear: '#fightwear',
      fitnesswear: '#fitnesswear',
      surfwear: '#surfwear',
      'team-sports': '#team',
    };
    return 'products.html' + (anchors[catId] || '');
  }

  // ── Build dropdown HTML for each category ───────────────────
  function buildCatDropdown(cat) {
    if (cat.id === 'team-sports') {
      return buildTeamDropdown(cat);
    }

    // Group subcategories into columns (max 12 items per col)
    const subs = cat.subcategories;
    const colCount = Math.min(subs.length, 7);
    let html = `<div class="bb-cols bb-cols-${colCount}">`;

    subs.forEach((sub) => {
      html += `<div class="bb-col">`;
      html += `<h4 class="bb-col-h">${sub.name}</h4>`;
      // Show up to 10 products per subcategory column
      sub.products.slice(0, 10).forEach((p) => {
        html += `<a href="${productUrl(p)}" class="bb-col-link">${p.name}</a>`;
      });
      html += `</div>`;
    });

    html += `</div>`;
    return html;
  }

  function buildTeamDropdown(cat) {
    // Group subcategories by their nav group
    const grouped = {};
    TEAM_NAV_GROUPS.forEach((g) => {
      grouped[g] = [];
    });

    cat.subcategories.forEach((sub) => {
      const grp = sub.group || 'Specialty';
      if (!grouped[grp]) grouped[grp] = [];
      grouped[grp].push(sub);
    });

    const colCount = TEAM_NAV_GROUPS.filter(
      (g) => grouped[g] && grouped[g].length,
    ).length;
    let html = `<div class="bb-cols bb-cols-${colCount}">`;

    TEAM_NAV_GROUPS.forEach((grp) => {
      const subs = grouped[grp];
      if (!subs || !subs.length) return;

      html += `<div class="bb-col">`;
      html += `<h4 class="bb-col-h">${grp}</h4>`;
      subs.forEach((sub) => {
        html += `<a href="products.html#team-${sub.slug}" class="bb-col-link">${sub.name}</a>`;
      });
      html += `</div>`;
    });

    html += `</div>`;
    return html;
  }

  // ── Build full nav HTML ──────────────────────────────────────
  function buildNav() {
    if (!window.ZALI_CATALOG) {
      console.warn('nav.js: ZALI_CATALOG not loaded yet');
      return;
    }

    const navEl = document.querySelector('nav.bb-nav');
    if (!navEl) return;

    // Build category bar left section
    let catLinks = '';
    ZALI_CATALOG.categories.forEach((cat) => {
      const meta = CAT_META[cat.id];
      if (!meta) return;
      catLinks += `
        <div class="bb-cat" data-cat="${cat.id}">
          <a href="products.html${CAT_META[cat.id].anchor}" class="bb-cat-link">${meta.label} <span class="bb-arr">▼</span></a>
          <div class="bb-dropdown" data-dropdown="${cat.id}">
            ${buildCatDropdown(cat)}
          </div>
        </div>`;
    });

    const newNav = `
      <div class="bb-nav-main">
        <a href="index.html" class="bb-nav-logo">
          <img src="logo.svg" alt="ZALI Industries">
        </a>
        <div class="bb-nav-right">
          <a href="contact.html" class="bb-nav-cta">Get a Quote →</a>
          <button class="bb-burger" aria-label="Open menu"><span></span><span></span><span></span></button>
        </div>
      </div>
      <div class="bb-nav-cats">
        <div class="bb-nav-cats-inner">
          <div class="bb-nav-cats-left">
            ${catLinks}
          </div>
          <div class="bb-nav-cats-right">
            <a href="fabrics.html" class="bb-cat-link bb-cat-simple">Fabrics</a>
            <a href="how-it-works.html" class="bb-cat-link bb-cat-simple">How It Works</a>
            <a href="about.html" class="bb-cat-link bb-cat-simple">About</a>
            <a href="contact.html" class="bb-cat-link bb-cat-simple">Contact</a>
          </div>
        </div>
      </div>`;

    navEl.innerHTML = newNav;
  }

  // ── Build Mobile Menu (Dynamic) ──────────────────────────────
  function buildMobileMenu() {
    if (!window.ZALI_CATALOG) return;

    let rootListHtml = '';
    let panelsHtml = '';

    ZALI_CATALOG.categories.forEach((cat) => {
      const meta = CAT_META[cat.id];
      if (!meta) return;

      // Add to root list
      rootListHtml += `
      <button type="button" class="bb-md-item" data-go="cat-${cat.id}">
        <span class="bb-md-item-text">${meta.label}</span>
        <span class="bb-md-item-meta">${cat.subcategories.length}</span>
        <span class="bb-md-arr">›</span>
      </button>`;

      let subListHtml = `
      <a href="products.html${meta.anchor}" class="bb-md-item bb-md-item-all">
        <span class="bb-md-item-text">View All ${meta.label}</span>
        <span class="bb-md-arr">›</span>
      </a>`;

      cat.subcategories.forEach((sub) => {
        // Add to cat list
        subListHtml += `
      <button type="button" class="bb-md-item" data-go="sub-${sub.id}">
        <span class="bb-md-item-text">${sub.name}</span>
        <span class="bb-md-item-meta">${sub.products ? sub.products.length : 0}</span>
        <span class="bb-md-arr">›</span>
      </button>`;

        let prodListHtml = `
      <a href="products.html${meta.anchor}" class="bb-md-item bb-md-item-all">
        <span class="bb-md-item-text">View All ${sub.name}</span>
        <span class="bb-md-arr">›</span>
      </a>`;

        if (sub.products) {
          sub.products.forEach((prod) => {
            prodListHtml += `
      <a href="${productUrl(prod)}" class="bb-md-item">
        <span class="bb-md-item-text">${prod.name}</span>
        <span class="bb-md-arr">›</span>
      </a>`;
          });
        }

        panelsHtml += `
  <div class="bb-md-panel" data-panel="sub-${sub.id}">
    <div class="bb-md-panel-head">
      <button type="button" class="bb-md-back" data-go="cat-${cat.id}">
        <span class="bb-md-back-arr">‹</span><span>${meta.label}</span>
      </button>
      <h3 class="bb-md-panel-title">${sub.name}</h3>
    </div>
    <div class="bb-md-list">${prodListHtml}</div>
  </div>`;
      });

      panelsHtml += `
  <div class="bb-md-panel" data-panel="cat-${cat.id}">
    <div class="bb-md-panel-head">
      <button type="button" class="bb-md-back" data-go="root">
        <span class="bb-md-back-arr">‹</span><span>Back</span>
      </button>
      <h3 class="bb-md-panel-title">${meta.label}</h3>
    </div>
    <div class="bb-md-list">${subListHtml}</div>
  </div>`;
    });

    const menuHtml = `
<div class="bb-md-overlay" id="m-overlay"></div>
<aside class="bb-md-drawer" id="m-drawer" aria-label="Mobile menu">
  <button type="button" class="bb-md-close" id="m-close" aria-label="Close menu">×</button>
  
  <div class="bb-md-panel active" data-panel="root">
    <div class="bb-md-panel-head bb-md-root-head">
      <img src="logo.svg" alt="ZALI Industries" class="bb-md-logo">
    </div>
    <div class="bb-md-list">
      ${rootListHtml}
      <a href="print-methods.html" class="bb-md-item bb-md-item-plain"><span class="bb-md-item-text">Printing Methods</span></a>
      <a href="fabrics.html" class="bb-md-item bb-md-item-plain"><span class="bb-md-item-text">Fabrics</span></a>
      <a href="how-it-works.html" class="bb-md-item bb-md-item-plain"><span class="bb-md-item-text">How It Works</span></a>
      <a href="about.html" class="bb-md-item bb-md-item-plain"><span class="bb-md-item-text">About</span></a>
      <a href="contact.html" class="bb-md-item bb-md-item-plain"><span class="bb-md-item-text">Contact</span></a>
    </div>
    <div class="bb-md-foot">
      <a href="contact.html" class="bb-md-cta">Get a Quote →</a>
    </div>
  </div>
  ${panelsHtml}
</aside>`;

    const div = document.createElement('div');
    div.innerHTML = menuHtml;
    while (div.firstChild) {
      document.body.appendChild(div.firstChild);
    }
  }

  // ── Re-attach dropdown + burger behaviour ───────────────────
  function initNavBehavior(navEl) {
    // Dropdown hover
    navEl.querySelectorAll('.bb-cat').forEach((cat) => {
      const dd = cat.querySelector('.bb-dropdown');
      if (!dd) return;
      cat.addEventListener('mouseenter', () => dd.classList.add('open'));
      cat.addEventListener('mouseleave', () => dd.classList.remove('open'));
    });

    const burgers = document.querySelectorAll('.nav-burger, .bb-burger');
    const drawer = document.getElementById('m-drawer');
    const overlay = document.getElementById('m-overlay');
    const closeBtn = document.getElementById('m-close');

    function resetToRoot() {
      document
        .querySelectorAll('.bb-md-panel')
        .forEach((p) => p.classList.remove('active'));
      const root = document.querySelector('.bb-md-panel[data-panel="root"]');
      if (root) root.classList.add('active');
    }

    function openDrawer() {
      if (!drawer) return;
      drawer.classList.add('open');
      if (overlay) overlay.classList.add('open');
      burgers.forEach((b) => b.classList.add('open'));
      document.body.classList.add('bb-md-locked');
    }

    function closeDrawer() {
      if (!drawer) return;
      drawer.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      burgers.forEach((b) => b.classList.remove('open'));
      document.body.classList.remove('bb-md-locked');
      setTimeout(resetToRoot, 280);
    }

    if (burgers.length && drawer) {
      burgers.forEach((b) => {
        b.addEventListener('click', () => {
          drawer.classList.contains('open') ? closeDrawer() : openDrawer();
        });
      });
      if (overlay) overlay.addEventListener('click', closeDrawer);
      if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    }

    // Panel drilldown navigation (data-go)
    document.querySelectorAll('.bb-md-drawer [data-go]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if (btn.tagName === 'A') return;
        e.preventDefault();
        const target = btn.getAttribute('data-go');
        document
          .querySelectorAll('.bb-md-panel')
          .forEach((p) => p.classList.remove('active'));
        const next = document.querySelector(
          `.bb-md-panel[data-panel="${target}"]`,
        );
        if (next) {
          next.classList.add('active');
          next.scrollTop = 0;
        }
      });
    });

    // Close drawer when any LINK inside it is clicked
    document.querySelectorAll('.bb-md-drawer a').forEach((link) => {
      link.addEventListener('click', closeDrawer);
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!navEl.contains(e.target)) {
        navEl
          .querySelectorAll('.bb-dropdown.open')
          .forEach((d) => d.classList.remove('open'));
      }
    });
  }

  // Generate the desktop menu HTML, then the mobile menu HTML, then bind events
  function initAll() {
    buildNav();
    buildMobileMenu();
    const navEl = document.querySelector('nav.bb-nav');
    if (navEl) initNavBehavior(navEl);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
