/* Bosh sahifa */
(function () {
  "use strict";
  var DS = window.DS;
  var T = function (k) { return DS.t("home", k); };

  DS.init({ page: "home", ns: ["home"] }).then(function () {
    var app = document.getElementById("app");
    app.innerHTML =
      '<section class="hero" id="hero"></section>' +
      '<div class="home-wrap" id="homeData"></div>';
    renderHero();
    loadHomeData();
  });

  /* ---------------------------------------------------------------- Hero */
  function renderHero() {
    var SLIDES = 6, INTERVAL = 4500, index = 0, timer = null;
    var hero = document.getElementById("hero");
    hero.innerHTML =
      '<div class="hero-bg"><img src="images/hero_image.png" alt="Registon maydoni, Samarqand"><div class="shade"></div></div>' +
      '<div class="hero-dots">' +
      '<button type="button" class="hero-arrow" id="slidePrev" aria-label="Previous">' + DS.icon("chevron-up", "icon-md") + "</button>" +
      '<div class="hero-dot-list">' + Array.apply(null, Array(SLIDES)).map(function (_, i) {
        return '<button type="button" class="hero-dot" data-i="' + i + '" aria-label="' + (i + 1) + '"><span></span></button>';
      }).join("") + "</div>" +
      '<button type="button" class="hero-arrow" id="slideNext" aria-label="Next">' + DS.icon("chevron-down", "icon-md") + "</button></div>" +
      '<div class="hero-body"><div class="container">' +
      '<div class="hero-eyebrow">' + DS.icon("map-pin", "icon-md") + DS.esc(T("hero.eyebrow")) + "</div>" +
      '<div id="slideText"></div>' +
      '<div class="hero-cta">' +
      '<a href="tours.html" class="btn btn-accent btn-lg">' + DS.icon("compass", "icon-lg") + DS.esc(T("hero.cta_primary")) + "</a>" +
      '<a href="about.html" class="btn btn-outline-light btn-lg">' + DS.esc(T("hero.cta_secondary")) + "</a>" +
      "</div></div></div>" +
      '<div class="hero-search" id="heroSearch"></div>';

    function show() {
      var box = document.getElementById("slideText");
      box.innerHTML = '<div class="fade-in"><h1>' + DS.esc(T("hero.slide_" + (index + 1) + "_title")) + "</h1><p class=\"sub\">" + DS.esc(T("hero.slide_" + (index + 1) + "_subtitle")) + "</p></div>";
      DS.qsa(".hero-dot", hero).forEach(function (d, i) { d.classList.toggle("active", i === index); });
    }
    function goTo(n) { index = ((n % SLIDES) + SLIDES) % SLIDES; show(); restart(); }
    function restart() { clearInterval(timer); timer = setInterval(function () { index = (index + 1) % SLIDES; show(); }, INTERVAL); }
    document.getElementById("slidePrev").addEventListener("click", function () { goTo(index - 1); });
    document.getElementById("slideNext").addEventListener("click", function () { goTo(index + 1); });
    DS.qsa(".hero-dot", hero).forEach(function (d) { d.addEventListener("click", function () { goTo(+d.getAttribute("data-i")); }); });
    show(); restart();
    initHeroSearch(document.getElementById("heroSearch"));
  }

  /* ---------------------------------------------------------- Hero qidiruv */
  function initHeroSearch(host) {
    var allDest = [], open = false;
    host.innerHTML =
      '<form id="hsForm">' + DS.icon("search", "icon-lg text-muted") +
      '<input type="text" id="hsInput" autocomplete="off" placeholder="' + DS.esc(T("hero.search_placeholder")) + '">' +
      '<button type="submit" aria-label="' + DS.esc(T("hero.search_button")) + '">' + DS.icon("search", "icon-md") + "</button></form>" +
      '<div class="search-results" id="hsResults" hidden></div>';
    var input = document.getElementById("hsInput"), results = document.getElementById("hsResults");

    DS.getDestinations().then(function (d) { allDest = d || []; }).catch(function () { allDest = []; });

    function thumb(url) { return '<div class="thumb">' + (url ? '<img src="' + DS.esc(url) + '" alt="">' : DS.placeholder()) + "</div>"; }

    var doSearch = DS.debounce(function (q) {
      var dests = allDest.filter(function (d) { return DS.localizedText(d.name).toLowerCase().indexOf(q.toLowerCase()) > -1; }).slice(0, 3);
      DS.getTours({ search: q, lang: DS.lang, page_size: 4 }).then(function (res) { paint(dests, res.items || []); })
        .catch(function () { paint(dests, []); });
    }, 350);

    function paint(dests, tours) {
      if (!dests.length && !tours.length) { results.innerHTML = '<p class="search-empty">' + DS.esc(T("hero.search_no_results")) + "</p>"; return; }
      var html = "";
      if (dests.length) {
        html += '<div class="search-group"><p class="label">' + DS.esc(T("hero.search_destinations_label")) + "</p>" +
          dests.map(function (d) {
            return '<a class="search-item" href="tours.html?destination=' + encodeURIComponent(d.slug) + '">' + thumb(DS.mediaUrl(d.cover_image)) +
              '<div><p class="t">' + DS.esc(DS.localizedText(d.name)) + '</p><p class="s" style="display:flex;align-items:center;gap:.25rem">' + DS.icon("map-pin", "icon-xs") + DS.esc(d.description || "") + "</p></div></a>";
          }).join("") + "</div>";
      }
      if (tours.length) {
        html += '<div class="search-group"><p class="label">' + DS.esc(T("hero.search_tours_label")) + "</p>" +
          tours.map(function (tr) {
            return '<a class="search-item" href="tour.html?slug=' + encodeURIComponent(tr.slug) + '">' + thumb(DS.mediaUrl(tr.cover_image)) +
              '<div style="min-width:0"><p class="t" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + DS.esc(DS.localizedText(tr.title)) + '</p><p class="s">' + DS.esc(tr.category) + "</p></div></a>";
          }).join("") + "</div>";
      }
      results.innerHTML = html;
    }

    input.addEventListener("input", function () {
      var q = input.value.trim();
      if (q.length < 2) { results.hidden = true; return; }
      results.hidden = false;
      results.innerHTML = '<div class="search-empty">' + DS.icon("loader-circle", "spin icon-lg") + "</div>";
      doSearch(q);
    });
    input.addEventListener("focus", function () { if (input.value.trim().length >= 2) results.hidden = false; });
    document.addEventListener("mousedown", function (e) { if (!host.contains(e.target)) results.hidden = true; });
    document.getElementById("hsForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value.trim();
      if (q) location.href = "tours.html?search=" + encodeURIComponent(q);
    });
  }

  /* --------------------------------------------------------- Ma'lumotlar */
  function showLoading() {
    var host = document.getElementById("homeData");
    host.innerHTML = '<div class="center-load" style="height:30vh;flex-direction:column;gap:.75rem;text-align:center">' + DS.icon("loader-circle", "spin icon-xl") +
      '<p id="wakeMsg" class="text-muted" style="font-size:.875rem" hidden>Server uyg\'onmoqda, bir oz kuting (30–60 soniya olishi mumkin)...</p></div>';
  }
  function showError(msg) {
    var host = document.getElementById("homeData");
    host.innerHTML = '<div class="empty-state"><p class="text-destructive" style="margin-bottom:1rem">' + DS.esc(msg) + '</p>' +
      '<button type="button" class="btn btn-primary" id="retryBtn">Qayta urinish</button></div>';
    document.getElementById("retryBtn").addEventListener("click", loadHomeData);
  }

  function loadHomeData() {
    var lng = DS.lang;
    showLoading();
    var onRetry = function () { var m = document.getElementById("wakeMsg"); if (m) m.hidden = false; };
    window.addEventListener("ds:retrying", onRetry);
    Promise.allSettled([
      DS.getTours({ lang: lng, page_size: 6 }),
      DS.getCountries(),
      DS.getAllReviews(),
      DS.getSiteStats()
    ]).then(function (r) {
      window.removeEventListener("ds:retrying", onRetry);
      if (r[0].status === "rejected" && r[1].status === "rejected") {
        return showError((r[0].reason && r[0].reason.message) || "Server bilan bog'lanib bo'lmadi");
      }
      var tours = [], total = 0, countries = [], reviews = [], stats = null;
      if (r[0].status === "fulfilled" && r[0].value) { tours = r[0].value.items || []; total = r[0].value.total || 0; } else console.error("getTours:", r[0].reason);
      if (r[2].status === "fulfilled" && Array.isArray(r[2].value)) reviews = r[2].value.slice(0, 8);
      if (r[3].status === "fulfilled" && r[3].value) stats = r[3].value;

      var countryPromise = (r[1].status === "fulfilled" && Array.isArray(r[1].value))
        ? Promise.all(r[1].value.map(function (c) {
            return DS.getTours({ lang: lng, country: c.slug, page_size: 1 })
              .then(function (res) { return Object.assign({}, c, { tourCount: (res && res.total) || 0 }); })
              .catch(function () { return Object.assign({}, c, { tourCount: 0 }); });
          }))
        : Promise.resolve([]);

      countryPromise.then(function (cs) {
        countries = cs;
        var host = document.getElementById("homeData");
        host.outerHTML = '<div id="homeData"></div>';
        host = document.getElementById("homeData");
        // Ketma-ketlik: Popular -> Stats -> Destinations -> Testimonials
        var wrap = document.createElement("div");
        wrap.className = "home-wrap";
        host.appendChild(wrap);
        if (tours.length) renderPopular(wrap, tours);
        renderStats(wrap, total, reviews, stats);
        if (countries.length) renderDestinations(host, wrap, countries);
        if (reviews.length) renderTestimonials(wrap, reviews);
      });
    });
  }

  function section(parent, html) {
    var s = document.createElement("div");
    s.innerHTML = html;
    var el = s.firstElementChild;
    parent.appendChild(el);
    return el;
  }

  /* --------------------------------------------------------- Mashhur turlar */
  function renderPopular(parent, tours) {
    var el = section(parent,
      '<section class="section"><div class="section-head"><div><div class="eyebrow">' + DS.esc(T("popular.eyebrow")) + '</div><h2 class="section-title">' + DS.esc(T("popular.title")) + "</h2></div>" +
      '<div class="scroll-arrows"><button class="round-btn" id="pLeft" aria-label="Left">' + DS.icon("chevron-left", "icon-md") + '</button><button class="round-btn" id="pRight" aria-label="Right">' + DS.icon("chevron-right", "icon-md") + "</button></div></div>" +
      '<div class="h-scroller" id="pScroller">' +
      tours.map(function (tr) { return DS.tourCard(tr, T("popular.view")); }).join("") +
      '<a href="tours.html" class="view-all-card"><span style="font-size:1.125rem;font-weight:700">' + DS.esc(T("popular.view_all")) + '</span><span class="circ">' + DS.icon("arrow-up-right", "icon-md") + "</span></a>" +
      "</div></section>");
    el.classList.add("bleed");
    var sc = el.querySelector("#pScroller");
    el.querySelector("#pLeft").addEventListener("click", function () { sc.scrollBy({ left: -sc.clientWidth * 0.8, behavior: "smooth" }); });
    el.querySelector("#pRight").addEventListener("click", function () { sc.scrollBy({ left: sc.clientWidth * 0.8, behavior: "smooth" }); });
    DS.enableDragScroll(sc);
  }

  /* ------------------------------------------------------------ Statistika */
  function renderStats(parent, totalTours, reviews, siteStats) {
    var fallbackSat = reviews.length ? Math.round(reviews.reduce(function (s, r) { return s + r.rating; }, 0) / reviews.length / 5 * 100) : 95;
    var stats = [
      { key: "years", value: siteStats ? siteStats.years_experience : 12, suffix: "", offset: true },
      { key: "satisfaction", value: siteStats ? siteStats.satisfaction_percent : fallbackSat, suffix: "%", offset: false },
      { key: "adventures", value: siteStats ? siteStats.completed_trips : totalTours, suffix: "+", offset: true },
      { key: "travelers", value: siteStats ? siteStats.happy_travelers : 9431, suffix: "+", offset: false }
    ];
    var el = section(parent,
      '<section class="section"><div class="stats-grid">' +
      stats.map(function (s) {
        return '<div class="stat ' + (s.offset ? "offset" : "") + '" style="display:flex;flex-direction:column;align-items:center"><div class="stat-outer"><div class="stat-inner">' +
          '<span class="stat-num" data-target="' + (+s.value || 0) + '" data-suffix="' + s.suffix + '">0' + s.suffix + '</span><span class="stat-label">' + DS.esc(T("stats." + s.key)) + "</span></div>" +
          '<span class="stat-dot"></span></div></div>';
      }).join("") + "</div></section>");
    var started = false;
    var obs = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting || started) return;
      started = true; obs.disconnect();
      DS.qsa(".stat-num", el).forEach(function (n) {
        var target = +n.getAttribute("data-target"), suffix = n.getAttribute("data-suffix"), t0 = performance.now(), dur = 1500;
        (function tick(now) {
          var p = Math.min((now - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
          n.textContent = Math.round(target * eased).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.4 });
    obs.observe(el);
  }

  /* ------------------------------------------------------------ Yo'nalishlar */
  function renderDestinations(host, wrap, countries) {
    var count = countries.length, active = Math.floor(count / 2), timer = null;
    var sec = document.createElement("div");
    sec.innerHTML =
      '<section class="dest-section"><div class="dest-head"><div class="eyebrow">' + DS.esc(T("destinations.eyebrow")) + '</div><h2 class="section-title">' + DS.esc(T("destinations.title")) + "</h2><p>" + DS.esc(T("destinations.subtitle")) + "</p></div>" +
      '<div class="dest-stage" id="destStage">' +
      countries.map(function (c, i) {
        var name = DS.localizedText(c.name), img = DS.mediaUrl(c.cover_image);
        return '<div class="dest-card" role="button" tabindex="0" data-i="' + i + '" aria-label="' + DS.esc(name) + '">' +
          (img ? '<img src="' + DS.esc(img) + '" alt="' + DS.esc(name) + '" draggable="false">' : DS.placeholder()) +
          '<div class="shade2"></div><div class="info"><h3>' + DS.esc(name) + '</h3><p class="cnt">' + c.tourCount + " " + DS.esc(T("destinations.tours_count")) + "</p>" +
          '<a class="explore" href="tours.html?country=' + encodeURIComponent(c.slug) + '" hidden>' + DS.esc(T("destinations.explore")) + DS.icon("arrow-up-right", "icon-md") + "</a></div></div>";
      }).join("") + "</div>" +
      '<div class="dots" id="destDots">' + countries.map(function (_, i) { return '<button type="button" aria-label="' + (i + 1) + '" data-i="' + i + '"></button>'; }).join("") + "</div>" +
      '<div class="dest-all"><a href="tours.html">' + DS.esc(T("destinations.view_all")) + DS.icon("arrow-up-right", "icon-md") + "</a></div></section>";
    // Bo'lim to'liq kenglikda bo'lishi uchun home-wrap'dan tashqariga qo'yamiz — Popular/Stats'dan keyin
    wrap.appendChild(sec.firstElementChild);
    var section = wrap.lastElementChild;
    section.classList.add("bleed");
    var stage = section.querySelector("#destStage"), cards = DS.qsa(".dest-card", stage), dots = DS.qsa("#destDots button", section);

    function layout() {
      cards.forEach(function (card, i) {
        var offset = i - active;
        if (offset > count / 2) offset -= count;
        if (offset < -count / 2) offset += count;
        var abs = Math.abs(offset), center = offset === 0, visible = abs <= 2;
        var scale = center ? 1 : abs === 1 ? 0.82 : 0.68;
        var opacity = center ? 1 : abs === 1 ? 0.6 : 0.3;
        var blur = center ? 0 : abs === 1 ? 1 : 2;
        card.style.transform = "translate(-50%, -50%) translateX(" + (offset * 190) + "px) scale(" + scale + ")";
        card.style.opacity = visible ? opacity : 0;
        card.style.filter = "blur(" + blur + "px)";
        card.style.zIndex = 30 - abs;
        card.style.pointerEvents = visible ? "" : "none";
        card.tabIndex = visible ? 0 : -1;
        var ex = card.querySelector(".explore"); if (ex) ex.hidden = !center;
      });
      dots.forEach(function (d, i) { d.classList.toggle("active", i === active); });
    }
    function goTo(i) { active = ((i % count) + count) % count; layout(); restart(); }
    function restart() { clearInterval(timer); if (count > 1) timer = setInterval(function () { active = (active + 1) % count; layout(); }, 4000); }

    cards.forEach(function (card, i) {
      card.addEventListener("click", function () { if (i !== active) goTo(i); });
      card.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && i !== active) { e.preventDefault(); goTo(i); } });
      var ex = card.querySelector(".explore"); if (ex) ex.addEventListener("click", function (e) { e.stopPropagation(); });
    });
    dots.forEach(function (d) { d.addEventListener("click", function () { goTo(+d.getAttribute("data-i")); }); });

    var dragging = false, sx = 0, delta = 0;
    stage.addEventListener("pointerdown", function (e) { dragging = true; sx = e.clientX; delta = 0; });
    stage.addEventListener("pointermove", function (e) { if (dragging) delta = e.clientX - sx; });
    function up() { if (!dragging) return; dragging = false; if (delta > 40) goTo(active - 1); else if (delta < -40) goTo(active + 1); delta = 0; }
    stage.addEventListener("pointerup", up); stage.addEventListener("pointerleave", up);
    layout(); restart();
  }

  /* --------------------------------------------------------------- Sharhlar */
  function renderTestimonials(parent, reviews) {
    var COLORS = ["var(--primary)", "var(--accent)", "var(--secondary)"];
    var el = section(parent,
      '<section class="section"><div class="container-6 center" style="margin-bottom:3rem"><div class="eyebrow">' + DS.esc(T("testimonials.eyebrow")) + '</div><h2 class="section-title">' + DS.esc(T("testimonials.title")) + "</h2></div>" +
      '<div class="h-scroller narrow" id="tScroller">' +
      reviews.map(function (r, i) {
        return '<div class="t-card"><div class="t-user"><div class="avatar" style="background:' + COLORS[i % 3] + '">' + DS.esc((r.reviewer_name || "?").charAt(0).toUpperCase()) + "</div><div>" +
          '<div class="t-name">' + DS.esc(r.reviewer_name) + "</div>" + (r.reviewer_country ? '<div class="t-country">' + DS.esc(r.reviewer_country) + "</div>" : "") + "</div></div>" +
          DS.starsHtml(r.rating) + '<p class="t-text">' + DS.esc(r.text) + "</p></div>";
      }).join("") + "</div>" +
      '<div class="dots" id="tDots">' + reviews.map(function (_, i) { return '<button type="button" aria-label="' + (i + 1) + '" data-i="' + i + '"></button>'; }).join("") + "</div></section>");
    el.classList.add("bleed");
    var sc = el.querySelector("#tScroller"), dots = DS.qsa("#tDots button", el), active = 0;
    function mark() {
      var center = sc.scrollLeft + sc.clientWidth / 2, closest = 0, min = Infinity;
      Array.prototype.forEach.call(sc.children, function (c, i) { var d = Math.abs(c.offsetLeft + c.clientWidth / 2 - center); if (d < min) { min = d; closest = i; } });
      active = closest;
      dots.forEach(function (d, i) { d.classList.toggle("active", i === active); });
    }
    function scrollToIndex(i) { var c = sc.children[i]; if (c) sc.scrollTo({ left: c.offsetLeft - sc.offsetLeft, behavior: "smooth" }); }
    sc.addEventListener("scroll", mark, { passive: true });
    dots.forEach(function (d) { d.addEventListener("click", function () { scrollToIndex(+d.getAttribute("data-i")); }); });
    DS.enableDragScroll(sc, function () { requestAnimationFrame(mark); setTimeout(function () { scrollToIndex(active); }, 50); });
    mark();
  }
})();