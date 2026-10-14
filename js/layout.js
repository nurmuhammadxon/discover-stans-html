(function () {
  "use strict";
  var DS = window.DS, CFG = window.DS_CONFIG, SITE = CFG.site;

  var NAV_LINKS = [
    { href: "index.html", key: "nav.home", page: "home" },
    { href: "tours.html", key: "nav.tours", page: "tours" },
    { href: "about.html", key: "nav.about", page: "about" },
    { href: "services.html", key: "nav.service", page: "services" },
    { href: "contact.html", key: "nav.contact", page: "contact" }
  ];
  var LANGUAGES = [
    { code: "en", label: "English" },
    { code: "uz", label: "O'zbekcha" },
    { code: "ru", label: "Русский" }
  ];
  var TRANSPARENT_PAGES = ["home", "about", "contact", "services", "tours", "login"];

  function girih(id) {
    return '<svg class="girih" width="100%" height="6" viewBox="0 0 64 6" preserveAspectRatio="none" aria-hidden="true">' +
      '<pattern id="' + id + '" width="16" height="6" patternUnits="userSpaceOnUse">' +
      '<path d="M0 3 L4 0 L8 3 L4 6 Z M8 3 L12 0 L16 3 L12 6 Z" fill="none" stroke="oklch(0.681 0.13 72.4)" stroke-width="0.75"/></pattern>' +
      '<rect width="100%" height="6" fill="url(#' + id + ')"/></svg>';
  }
  function logoHtml() { return '<span class="logo">' + DS.esc(SITE.logo.name) + "<span>" + DS.esc(SITE.logo.highlight) + "</span></span>"; }

  function langDropdown() {
    return '<div class="dropdown"><button type="button" class="circle-btn" data-dd-toggle aria-label="Language">' + DS.lang + "</button>" +
      '<div class="dropdown-menu">' +
      LANGUAGES.map(function (l) { return '<button type="button" class="dropdown-item" data-lang="' + l.code + '">' + l.label + "</button>"; }).join("") +
      "</div></div>";
  }

  function userSlotHtml(user) {
    var t = function (k) { return DS.t("common", k); };
    if (!user) {
      return '<a href="login.html" class="circle-btn" aria-label="' + DS.esc(t("nav.login")) + '">' + DS.icon("user") + "</a>";
    }
    return '<div class="dropdown"><button type="button" class="circle-btn" data-dd-toggle aria-label="' + DS.esc(user.full_name) + '">' + DS.icon("user") + "</button>" +
      '<div class="dropdown-menu" style="min-width:12rem">' +
      '<div class="dropdown-label"><p>' + DS.esc(user.full_name) + "</p><p>" + DS.esc(user.email) + "</p></div>" +
      '<div class="dropdown-sep"></div>' +
      (DS.isAdminUser(user) ? '<a class="dropdown-item" href="admin.html">' + DS.icon("layout-dashboard", "icon-sm") + DS.esc(t("nav.admin_panel")) + "</a>" : "") +
      '<a class="dropdown-item" href="profile.html">' + DS.icon("clipboard-list", "icon-sm") + DS.esc(t("nav.profile")) + "</a>" +
      '<div class="dropdown-sep"></div>' +
      '<button type="button" class="dropdown-item danger" data-logout>' + DS.icon("log-out", "icon-sm") + DS.esc(t("nav.logout")) + "</button>" +
      "</div></div>";
  }

  function drawerUserHtml(user) {
    var t = function (k) { return DS.t("common", k); };
    if (!user) return '<a href="login.html" class="btn btn-outline btn-block">' + DS.icon("user", "icon-md") + DS.esc(t("nav.login")) + "</a>";
    return '<div><p style="font-size:.875rem;font-weight:500">' + DS.esc(user.full_name) + '</p><p class="small-muted">' + DS.esc(user.email) + "</p></div>" +
      (DS.isAdminUser(user) ? '<a href="admin.html" class="btn btn-outline btn-block">' + DS.icon("layout-dashboard", "icon-md") + DS.esc(t("nav.admin_panel")) + "</a>" : "") +
      '<a href="profile.html" class="btn btn-outline btn-block">' + DS.icon("clipboard-list", "icon-md") + DS.esc(t("nav.profile")) + "</a>" +
      '<button type="button" class="btn btn-outline btn-block text-destructive" data-logout>' + DS.icon("log-out", "icon-md") + DS.esc(t("nav.logout")) + "</button>";
  }

  function renderHeader(page) {
    var host = document.getElementById("site-header");
    if (!host) return;
    var t = function (k) { return DS.t("common", k); };
    var links = NAV_LINKS.map(function (l) {
      return '<li><a href="' + l.href + '" class="' + (l.page === page ? "active" : "") + '">' + DS.esc(t(l.key)) + "</a></li>";
    }).join("");
    var drawerLinks = NAV_LINKS.map(function (l) { return '<li><a href="' + l.href + '">' + DS.esc(t(l.key)) + "</a></li>"; }).join("");

    host.innerHTML =
      '<header class="site-header" id="siteHeader"><nav>' +
      '<a href="index.html" style="display:flex;align-items:center;gap:.5rem;flex-shrink:0">' + logoHtml() + "</a>" +
      '<ul class="nav-links">' + links + "</ul>" +
      '<div class="desktop-only">' + langDropdown() + '<span id="userSlot"></span></div>' +
      '<div class="nav-actions menu-btn">' + langDropdown() +
      '<button type="button" class="circle-btn" id="menuOpen" aria-label="Menu">' + DS.icon("menu", "icon-xl") + "</button></div>" +
      '</nav><div id="headerGirih"></div></header>' +
      '<div class="drawer-overlay" id="drawerOverlay"></div>' +
      '<aside class="drawer" id="drawer"><button type="button" class="drawer-close circle-btn" id="menuClose" aria-label="Close">' + DS.icon("x", "icon-lg") + "</button>" +
      "<ul>" + drawerLinks + '</ul><div class="drawer-actions" id="drawerUser"></div></aside>';

    var header = document.getElementById("siteHeader");
    var canBeTransparent = TRANSPARENT_PAGES.indexOf(page) > -1;
    function onScroll() {
      var transparent = canBeTransparent && window.scrollY <= 40;
      header.classList.toggle("transparent", transparent);
      document.getElementById("headerGirih").innerHTML = transparent ? "" : girih("girih-h");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    function openDrawer(open) {
      document.getElementById("drawer").classList.toggle("open", open);
      document.getElementById("drawerOverlay").classList.toggle("open", open);
    }
    document.getElementById("menuOpen").addEventListener("click", function () { openDrawer(true); });
    document.getElementById("menuClose").addEventListener("click", function () { openDrawer(false); });
    document.getElementById("drawerOverlay").addEventListener("click", function () { openDrawer(false); });

    DS.onAuth(function (user) {
      document.getElementById("userSlot").innerHTML = userSlotHtml(user);
      document.getElementById("drawerUser").innerHTML = drawerUserHtml(user);
    });
  }

  // Delegatsiya: dropdownlar, til, logout
  document.addEventListener("click", function (e) {
    var tgl = e.target.closest("[data-dd-toggle]");
    var openDd = document.querySelectorAll(".dropdown.open");
    if (tgl) {
      var dd = tgl.closest(".dropdown");
      var wasOpen = dd.classList.contains("open");
      openDd.forEach(function (d) { d.classList.remove("open"); });
      if (!wasOpen) dd.classList.add("open");
      return;
    }
    openDd.forEach(function (d) { d.classList.remove("open"); });
    var lg = e.target.closest("[data-lang]");
    if (lg) { DS.setLang(lg.getAttribute("data-lang")); return; }
    var lo = e.target.closest("[data-logout]");
    if (lo) { DS.logout().then(function () { location.href = "index.html"; }); }
  });

  function renderFooter() {
    var host = document.getElementById("site-footer");
    if (!host) return;
    var t = function (k) { return DS.t("common", k); };
    var c = SITE.contact;
    var socials = [["Instagram", SITE.social.instagram], ["Facebook", SITE.social.facebook], ["Telegram", SITE.social.telegram],
      ["YouTube", SITE.social.youtube], ["TikTok", SITE.social.tiktok], ["WhatsApp", SITE.social.whatsapp]]
      .filter(function (s) { return !!s[1]; });
    var tel = function (v) { return "tel:" + v.replace(/\s+/g, ""); };
    var quick = [["index.html", "nav.home"], ["tours.html", "nav.tours"], ["about.html", "nav.about"], ["contact.html", "nav.contact"]];

    host.innerHTML =
      '<footer class="site-footer">' + girih("girih-f") +
      '<div class="footer-grid">' +
      "<div>" + logoHtml() + '<p class="footer-about">' + DS.esc(DS.localizedSite(SITE.description)) + "</p></div>" +
      "<div><h3>" + DS.esc(t("footer.quick_links")) + "</h3><ul>" +
      quick.map(function (q) { return '<li><a href="' + q[0] + '">' + DS.esc(t(q[1])) + "</a></li>"; }).join("") + "</ul></div>" +
      "<div><h3>" + DS.esc(t("footer.contact")) + "</h3><ul>" +
      (c.phone ? '<li><a href="' + tel(c.phone) + '">' + DS.esc(c.phone) + "</a></li>" : "") +
      (c.phoneSecondary ? '<li><a href="' + tel(c.phoneSecondary) + '">' + DS.esc(c.phoneSecondary) + "</a></li>" : "") +
      (c.email ? '<li><a href="mailto:' + DS.esc(c.email) + '">' + DS.esc(c.email) + "</a></li>" : "") +
      "<li>" + DS.esc(DS.localizedSite(c.address)) + "</li></ul></div>" +
      "<div><h3>" + DS.esc(t("footer.follow")) + "</h3><ul>" +
      socials.map(function (s) { return '<li><a href="' + DS.esc(s[1]) + '" target="_blank" rel="noopener noreferrer">' + s[0] + "</a></li>"; }).join("") + "</ul></div>" +
      "</div>" +
      '<div class="footer-bottom"><p>© ' + new Date().getFullYear() + " " + DS.esc(SITE.logo.name + SITE.logo.highlight) + ". " + DS.esc(t("footer.rights")) + "</p>" +
      '<div class="legal-links"><a href="oferta.html">' + DS.esc(t("footer.offer")) + '</a><a href="privacy.html">' + DS.esc(t("footer.privacy")) + "</a></div></div></footer>";
  }

  // Sahifani ishga tushirish: tarjimalarni yuklaydi, header/footer chizadi
  DS.init = function (opts) {
    opts = opts || {};
    var ns = ["common"].concat(opts.ns || []);
    return DS.loadNamespaces(ns).then(function () {
      if (opts.header !== false) renderHeader(opts.page);
      if (opts.footer !== false) renderFooter();
      if (opts.title) document.title = opts.title + " | DiscoverStans";
      if (!DS.apiConfigured) console.warn("DiscoverStans: js/config.js ichida API_URL ko'rsatilmagan.");
    });
  };

  // Sahifalar orasida o'tishda yuqori chiziq (faqat boshqa sahifaga o'tganda; qaytganda yashiriladi)
  function topBar() {
    var bar = document.getElementById("toploader");
    if (!bar) { bar = document.createElement("div"); bar.id = "toploader"; bar.className = "toploader"; document.body.appendChild(bar); }
    return bar;
  }
  function hideBar() {
    var bar = document.getElementById("toploader");
    if (bar) { bar.style.opacity = "0"; bar.style.width = "0"; }
  }
  window.addEventListener("pageshow", hideBar); // orqaga (bfcache) qaytganda qotib qolmasin
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(https?:|mailto:|tel:)/.test(href)) return;
    var url = new URL(href, location.href);
    if (url.pathname === location.pathname && url.search === location.search) return; // shu sahifa
    var bar = topBar();
    bar.style.opacity = "1";
    requestAnimationFrame(function () { bar.style.width = "70%"; });
    setTimeout(hideBar, 8000); // navigatsiya bekor bo'lsa ham yo'qolsin
  });
})();