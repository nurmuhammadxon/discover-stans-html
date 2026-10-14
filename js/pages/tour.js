/* Tur tafsilotlari: tour.html?slug=... */
(function () {
  "use strict";
  var DS = window.DS;
  var T = function (k) { return DS.t("tours", k); };
  var slug = DS.param("slug");

  DS.init({ page: "tour", ns: ["tours"] }).then(function () {
    var app = document.getElementById("app");
    if (!slug) return notFound();
    app.innerHTML = '<div class="center-load" style="height:80vh">' + DS.icon("loader-circle", "spin") + "</div>";
    Promise.all([DS.getTourBySlug(slug, DS.lang), DS.getUsdRate()]).then(function (r) {
      if (!r[0]) return notFound();
      render(r[0], r[1]);
    }).catch(function (err) {
      if (err && err.status === 404) return notFound();
      app.innerHTML = '<div class="empty-state text-destructive" style="padding-top:10rem">' + DS.esc(err.message || "Xatolik yuz berdi") + "</div>";
    });
  });

  function notFound() { location.replace("404.html"); }

  function render(tour, usdRate) {
    var lng = DS.lang;
    var title = DS.localizedText(tour.title);
    var country = tour.countries && tour.countries[0] ? DS.localizedText(tour.countries[0].name) : "";
    var desc = DS.localizedText(tour.description);
    var highlights = DS.localizedList(tour.highlights);
    var included = DS.localizedList(tour.included);
    var excluded = DS.localizedList(tour.excluded);
    var hasItin = tour.itinerary && tour.itinerary.length > 0;
    var hasInc = included.length > 0 || excluded.length > 0;
    var hasFaq = tour.faqs && tour.faqs.length > 0;
    var images = tour.images && tour.images.length ? tour.images : (tour.cover_image ? [tour.cover_image] : []);

    document.title = title + (country ? " — " + country : "") + " | DiscoverStans";
    var metaDesc = DS.localizedText(tour.short_description || tour.description) || title;
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", metaDesc);

    var quick = [];
    if (tour.duration_days) quick.push({ icon: "clock", label: T("days_short"), value: tour.duration_days + " " + (tour.duration_nights ? "/ " + tour.duration_nights : "") });
    if (typeof tour.technical_level === "number") quick.push({ icon: "shield-check", label: T("technical_level"), value: tour.technical_level + "/5" });
    if (typeof tour.min_age === "number") quick.push({ icon: "user-round", label: T("min_age"), value: tour.min_age + "+" });
    if (typeof tour.fitness_level === "number") quick.push({ icon: "activity", label: T("fitness_level"), value: tour.fitness_level + "/5" });

    var html = '<div class="detail"><div class="container">' +
      '<div class="meta-line">' + (country ? "<span>" + DS.icon("map-pin", "icon-md") + DS.esc(country) + "</span>" : "") + "</div>" +
      "<h1>" + DS.esc(title) + "</h1>" +
      '<div id="gallery"></div>' +
      (quick.length ? '<div class="quick-info">' + quick.map(function (q) {
        return '<div class="qi"><div class="ic">' + DS.icon(q.icon, "icon-md") + '</div><div><p class="l">' + DS.esc(q.label) + '</p><p class="v">' + DS.esc(q.value) + "</p></div></div>";
      }).join("") + "</div>" : "") +
      '<div class="detail-grid"><div>' +
      ((tour.destinations || []).length ? '<div style="margin-bottom:2rem"><h2 class="sub-title">' + DS.esc(T("destinations_title")) + '</h2><div class="chips">' +
        tour.destinations.map(function (d) { return '<span class="badge-outline">' + DS.icon("map-pin", "icon-sm") + DS.esc(DS.localizedText(d.name)) + "</span>"; }).join("") + "</div></div>" : "") +
      // Tablar
      '<div class="tabs-list" id="tabs">' +
      '<button class="tab-btn active" data-tab="overview">' + DS.esc(T("tab_overview")) + "</button>" +
      (hasItin ? '<button class="tab-btn" data-tab="itinerary">' + DS.esc(T("tab_itinerary")) + "</button>" : "") +
      (hasInc ? '<button class="tab-btn" data-tab="included">' + DS.esc(T("tab_included")) + "</button>" : "") +
      (hasFaq ? '<button class="tab-btn" data-tab="faqs">' + DS.esc(T("tab_faqs")) + "</button>" : "") + "</div>" +
      '<div class="tab-panel active stack-8" data-panel="overview"><div><h2 class="h2">' + DS.esc(T("about_tour")) + '</h2><p class="prose-text">' + DS.esc(desc) + "</p></div>" +
      (highlights.length ? '<div><h2 class="h2">' + DS.esc(T("highlights_title")) + '</h2><ul class="check-list">' +
        highlights.map(function (h) { return "<li>" + DS.icon("check") + "<span>" + DS.esc(h) + "</span></li>"; }).join("") + "</ul></div>" : "") + "</div>" +
      (hasItin ? '<div class="tab-panel" data-panel="itinerary">' + itineraryHtml(tour.itinerary) + "</div>" : "") +
      (hasInc ? '<div class="tab-panel" data-panel="included"><div class="two-col">' +
        (included.length ? "<div><h3>" + DS.esc(T("whats_included")) + '</h3><ul class="check-list">' + included.map(function (i) { return "<li>" + DS.icon("check") + "<span>" + DS.esc(i) + "</span></li>"; }).join("") + "</ul></div>" : "") +
        (excluded.length ? "<div><h3>" + DS.esc(T("whats_excluded")) + '</h3><ul class="check-list">' + excluded.map(function (i) { return "<li>" + DS.icon("x", "no") + "<span>" + DS.esc(i) + "</span></li>"; }).join("") + "</ul></div>" : "") +
        "</div></div>" : "") +
      (hasFaq ? '<div class="tab-panel" data-panel="faqs">' + tour.faqs.map(function (f, i) {
        return '<div class="acc-item"><button type="button" class="acc-trigger" data-acc><span>' + DS.esc(DS.localizedText(f.question)) + '</span><span class="chev">' + DS.icon("chevron-down", "icon-md") + '</span></button><div class="acc-content">' + DS.esc(DS.localizedText(f.answer)) + "</div></div>";
      }).join("") + "</div>" : "") +
      (tour.route_points && tour.route_points.length ? '<div style="margin-top:2.5rem">' + routeHtml(tour.route_points) + "</div>" : "") +
      '<div style="margin-top:2.5rem" id="reviews"></div>' +
      '</div><div><div class="sticky-col" id="bookingPanel"></div></div></div>' +
      '<div id="related"></div></div></div>' +
      '<div class="lightbox" id="lightbox"><button class="lb-btn lb-close" id="lbClose" aria-label="Close">' + DS.icon("x", "icon-lg") + '</button><span class="lb-count" id="lbCount"></span>' +
      '<button class="lb-btn lb-prev" id="lbPrev" aria-label="Prev">' + DS.icon("chevron-left", "icon-xl") + '</button><button class="lb-btn lb-next" id="lbNext" aria-label="Next">' + DS.icon("chevron-right", "icon-xl") + '</button><img id="lbImg" alt=""></div>';
    document.getElementById("app").innerHTML = html;

    bindTabs();
    bindAccordions(document);
    renderGallery(images, title);
    renderReviews(tour);
    renderBooking(tour, usdRate);
    loadRelated(tour);
  }

  /* ---------------------------------------------------------- tablar */
  function bindTabs() {
    var tabs = DS.qsa("#tabs .tab-btn");
    tabs.forEach(function (b) {
      b.addEventListener("click", function () {
        var name = b.getAttribute("data-tab");
        tabs.forEach(function (x) { x.classList.toggle("active", x === b); });
        DS.qsa(".tab-panel").forEach(function (p) { p.classList.toggle("active", p.getAttribute("data-panel") === name); });
      });
    });
  }
  function bindAccordions(root) {
    DS.qsa("[data-acc]", root).forEach(function (b) {
      b.addEventListener("click", function () { b.closest(".acc-item").classList.toggle("open"); });
    });
  }

  /* ------------------------------------------------------- Itinerary */
  function itineraryHtml(itin) {
    var L = { what: T("what_to_expect"), meals: T("meals_included"), trans: T("transportation"), acc: T("accommodation"), map: T("view_on_map"), checkin: T("check_in") };
    return itin.map(function (day, i) {
      var body = "";
      if (day.description) body += '<p style="font-size:.875rem;color:var(--muted-foreground)">' + DS.esc(DS.localizedText(day.description)) + "</p>";
      if (day.what_to_expect) body += '<div class="note-box"><p class="h">' + DS.esc(L.what) + '</p><p style="font-size:.875rem;color:var(--muted-foreground)">' + DS.esc(DS.localizedText(day.what_to_expect)) + "</p></div>";
      if (day.meals_included && day.meals_included.length) body += '<p class="small-muted"><b>' + DS.esc(L.meals) + ":</b> " + DS.esc(day.meals_included.join(", ")) + "</p>";
      var tr = day.transportation;
      if (tr && (tr.type || tr.duration)) body += '<div class="small-muted"><b>' + DS.esc(L.trans) + ":</b> " + DS.esc(tr.type || "") + (tr.duration ? " · " + DS.esc(tr.duration) : "") + (tr.distance ? " · " + DS.esc(tr.distance) : "") + "</div>";
      if (day.gallery && day.gallery.length) body += '<div class="thumb-row">' + day.gallery.map(function (g) { return '<img src="' + DS.esc(DS.mediaUrl(g) || g) + '" alt="" loading="lazy">'; }).join("") + "</div>";
      var a = day.accommodation;
      if (a && a.name) {
        body += '<div class="accom"><p class="small-muted" style="font-weight:600">' + DS.esc(L.acc) + '</p><div style="display:flex;align-items:center;gap:.5rem"><p class="n">' + DS.esc(a.name) + "</p>" +
          (a.stars ? '<span class="stars-txt">' + "★".repeat(a.stars) + "</span>" : "") + "</div>" +
          (a.address ? '<p class="small-muted">' + DS.esc(a.address) + (a.map_url ? ' · <a href="' + DS.esc(a.map_url) + '" target="_blank" rel="noopener noreferrer">' + DS.esc(L.map) + "</a>" : "") + "</p>" : "") +
          ((a.check_in || a.room_type) ? '<p class="small-muted">' + (a.check_in ? DS.esc(L.checkin) + ": " + DS.esc(a.check_in) : "") + (a.check_in && a.room_type ? " · " : "") + DS.esc(a.room_type || "") + "</p>" : "") +
          (a.photos && a.photos.length ? '<div class="thumb-row">' + a.photos.map(function (p) { return '<img src="' + DS.esc(DS.mediaUrl(p) || p) + '" alt="" loading="lazy">'; }).join("") + "</div>" : "") + "</div>";
      }
      return '<div class="acc-item ' + (i === 0 ? "open" : "") + '"><button type="button" class="acc-trigger" data-acc><span class="day-trigger"><span class="day-num">' + DS.esc(day.day_number) + '</span><span class="day-title">' + DS.esc(DS.localizedText(day.title)) + '</span></span><span class="chev">' + DS.icon("chevron-down", "icon-md") + '</span></button><div class="acc-content"><div class="day-body">' + body + "</div></div></div>";
    }).join("");
  }

  /* ----------------------------------------------------------- Marshrut */
  function routeHtml(points) {
    var sorted = points.slice().sort(function (a, b) { return a.order - b.order; });
    var ACT = { photo_stop: ["camera", T("photo_stop")], guided_tour: ["users", T("guided_tour")], shopping: ["shopping-bag", T("shopping")] };
    return '<div class="route"><h3>' + DS.esc(T("route_title")) + "</h3>" + sorted.map(function (p, i) {
      var first = i === 0, last = i === sorted.length - 1;
      var act = p.activity_type && ACT[p.activity_type];
      var addr = DS.localizedText(p.address);
      var dot = first ? '<div class="dot accent">' + DS.icon("rotate-ccw", "icon-md") + "</div>" : last ? '<div class="dot accent"></div>' : '<div class="dot primary">' + DS.icon("map-pin", "icon-md") + "</div>";
      var tags = "";
      if (act) tags += '<span class="tag act">' + DS.icon(act[0], "icon-sm") + DS.esc(act[1]) + "</span>";
      if (typeof p.duration_minutes === "number" && p.duration_minutes > 0) tags += '<span class="tag">' + DS.icon("clock", "icon-sm") + p.duration_minutes + " " + DS.esc(T("duration_minutes")) + "</span>";
      if (p.has_extra_fee) tags += '<span class="tag fee">' + DS.esc(T("extra_fee")) + "</span>";
      return '<div class="route-point">' + (!last ? '<span class="line"></span>' : "") + dot + '<div class="txt">' +
        (first ? '<p class="cap">' + DS.esc(T("starting_location")) + "</p>" : "") +
        (last && sorted.length > 1 ? '<p class="cap">' + DS.esc(T("dropoff_location")) + "</p>" : "") +
        '<p class="nm">' + DS.esc(DS.localizedText(p.name)) + "</p>" + (addr ? '<p class="ad">' + DS.esc(addr) + "</p>" : "") +
        (tags ? '<div class="tags">' + tags + "</div>" : "") + "</div></div>";
    }).join("") + "</div>";
  }

  /* ----------------------------------------------------------- Galereya */
  function renderGallery(list, title) {
    var host = document.getElementById("gallery");
    if (!list.length) { host.innerHTML = '<div style="aspect-ratio:16/9;border-radius:1rem;overflow:hidden">' + DS.placeholder() + "</div>"; return; }
    var thumbs = list.slice(1, 5), remaining = list.length - 5;
    function img(src, cls, alt) { var u = DS.mediaUrl(src); return u ? '<img src="' + DS.esc(u) + '" alt="' + DS.esc(alt || "") + '" class="' + (cls || "") + '">' : DS.placeholder(); }
    host.innerHTML = '<div class="gallery"><button type="button" class="g-main" data-i="0">' + img(list[0], "", title) + "</button>" +
      thumbs.map(function (t, i) {
        var overlay = i === thumbs.length - 1 && remaining > 0;
        return '<button type="button" class="g-thumb ' + (overlay ? "more" : "") + '" data-i="' + (i + 1) + '">' + img(t, "", "") +
          (overlay ? '<span class="more-label">' + DS.icon("expand", "icon-md") + "+" + remaining + " Photos</span>" : "") + "</button>";
      }).join("") + "</div>";

    var lb = document.getElementById("lightbox"), lbImg = document.getElementById("lbImg"), idx = 0;
    function show() { lbImg.src = DS.mediaUrl(list[idx]) || ""; document.getElementById("lbCount").textContent = (idx + 1) + " / " + list.length; }
    function open(i) { idx = i; show(); lb.classList.add("open"); document.body.style.overflow = "hidden"; }
    function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }
    function prev() { idx = idx === 0 ? list.length - 1 : idx - 1; show(); }
    function next() { idx = idx === list.length - 1 ? 0 : idx + 1; show(); }
    DS.qsa(".gallery button", host).forEach(function (b) { b.addEventListener("click", function () { open(+b.getAttribute("data-i")); }); });
    document.getElementById("lbClose").addEventListener("click", close);
    document.getElementById("lbPrev").addEventListener("click", prev);
    document.getElementById("lbNext").addEventListener("click", next);
    if (list.length < 2) { document.getElementById("lbPrev").hidden = true; document.getElementById("lbNext").hidden = true; }
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "ArrowLeft") prev(); else if (e.key === "ArrowRight") next(); else if (e.key === "Escape") close();
    });
  }

  /* ------------------------------------------------------------- Sharhlar */
  function renderReviews(tour) {
    var reviews = (tour.reviews || []).slice(), rating = 5;
    var host = document.getElementById("reviews");

    function draw(user) {
      var avg = reviews.length ? (reviews.reduce(function (s, r) { return s + r.rating; }, 0) / reviews.length).toFixed(1) : null;
      host.innerHTML = '<section class="reviews"><div class="reviews-head"><h2>' + DS.esc(T("reviews_title")) + "</h2>" +
        (avg ? '<div class="avg">' + DS.icon("star") + avg + ' <span class="text-muted" style="font-weight:400">(' + reviews.length + ")</span></div>" : "") + "</div>" +
        (reviews.length ? '<div style="margin-bottom:2.5rem">' + reviews.map(function (r) {
          return '<div class="review-card"><div class="top">' + DS.starsHtml(r.rating) + (r.reviewer_country ? '<span class="small-muted">' + DS.esc(r.reviewer_country) + "</span>" : "") + "</div><p>" + DS.esc(r.text) + "</p></div>";
        }).join("") + "</div>" : '<p class="text-muted" style="font-size:.875rem;margin-bottom:2rem">' + DS.esc(T("no_reviews")) + "</p>") +
        '<div class="review-form-box"><h3>' + DS.esc(T("write_review")) + "</h3>" +
        (!user ? '<p class="text-muted" style="font-size:.875rem">' + DS.esc(T("login_prompt")) + ' <a href="login.html" class="text-accent" style="font-weight:600">' + DS.esc(T("login_link")) + "</a></p>" :
          '<form id="reviewForm" class="form-stack"><div><span class="text-muted" style="font-size:.875rem;display:block;margin-bottom:.5rem">' + DS.esc(T("rating_label")) + '</span><div class="star-input" id="starInput">' +
          [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" data-n="' + n + '">' + DS.icon("star", n <= rating ? "on" : "") + "</button>"; }).join("") + "</div></div>" +
          '<textarea class="textarea" id="reviewText" rows="4" required placeholder="' + DS.esc(T("review_placeholder")) + '"></textarea>' +
          '<button type="submit" class="btn btn-primary" id="reviewBtn">' + DS.esc(T("submit_review")) + "</button></form>") + "</div></section>";

      var si = document.getElementById("starInput");
      if (si) {
        var paint = function (n) { DS.qsa("button", si).forEach(function (b, i) { b.firstElementChild.classList.toggle("on", i < n); }); };
        DS.qsa("button", si).forEach(function (b) {
          b.addEventListener("click", function () { rating = +b.getAttribute("data-n"); paint(rating); });
          b.addEventListener("mouseenter", function () { paint(+b.getAttribute("data-n")); });
          b.addEventListener("mouseleave", function () { paint(rating); });
        });
      }
      var form = document.getElementById("reviewForm");
      if (form) form.addEventListener("submit", function (e) {
        e.preventDefault();
        var text = document.getElementById("reviewText").value.trim();
        if (!text) return;
        var btn = document.getElementById("reviewBtn"); btn.disabled = true; btn.textContent = T("submitting");
        DS.createReview({ tour_id: tour.id, rating: rating, text: text, images: [] }).then(function (nr) {
          reviews.unshift(nr); rating = 5; DS.toast.success(T("review_success")); draw(DS.auth.user);
        }).catch(function (err) {
          DS.toast.error(err.message || "Xatolik yuz berdi"); btn.disabled = false; btn.textContent = T("submit_review");
        });
      });
    }
    DS.onAuth(function (u) { draw(u); });
  }

  /* ------------------------------------------------------- Narx + Bron */
  function renderBooking(tour, usdRate) {
    var host = document.getElementById("bookingPanel");
    var options = tour.pricing_options || [];
    var selected = options.length ? options[0] : null;
    var P = { title: T("pricing.title"), from: T("pricing.from"), min: T("pricing.min_people"), max: T("pricing.max_people") };
    var SOM = T("som_currency");

    function draw() {
      var price = selected ? Number(selected.price) : Number(tour.price);
      var currency = selected ? selected.currency : tour.currency;
      host.innerHTML = '<div class="stack">' +
        (options.length ? '<div><h3 class="pricing-title">' + DS.esc(P.title) + '</h3><div class="pricing-grid">' + options.map(function (o) {
          var on = selected && o.id === selected.id;
          return '<button type="button" class="pricing-opt ' + (on ? "selected" : "") + '" data-opt="' + DS.esc(o.id) + '"><span class="tick">' + DS.icon("check", "icon-xs") + "</span>" +
            '<div class="ty">' + DS.icon("users", "icon-sm") + DS.esc(o.type) + '</div><p class="lb">' + DS.esc(DS.localizedText(o.label)) + '</p><p class="pr">' + DS.esc(P.from) + " $" + DS.esc(o.price) + '</p><p class="som">≈ ' + DS.formatSom(Number(o.price), usdRate) + " " + DS.esc(SOM) + "</p>" +
            ((o.min_people || o.max_people) ? '<p class="som" style="margin-top:.25rem">' + (o.min_people ? DS.esc(P.min) + ": " + o.min_people : "") + (o.min_people && o.max_people ? " · " : "") + (o.max_people ? DS.esc(P.max) + ": " + o.max_people : "") + "</p>" : "") + "</button>";
        }).join("") + "</div></div>" : "") +
        '<div class="booking-card"><div class="booking-price"><span class="small-muted">' + DS.esc(T("from")) + '</span><div style="display:flex;align-items:baseline;gap:.25rem"><span class="big">$' + price + '</span><span class="per">/ ' + DS.esc(T("per_person")) + '</span></div><p class="text-muted" style="font-size:.875rem;margin-top:2px">≈ ' + DS.formatSom(price, usdRate) + " " + DS.esc(SOM) + "</p></div>" +
        '<form id="bookForm" class="form-stack" style="margin-top:0">' +
        '<input class="input" id="bName" placeholder="' + DS.esc(T("full_name")) + '" required>' +
        '<input class="input" id="bEmail" type="email" placeholder="' + DS.esc(T("email")) + '" required>' +
        '<input class="input" id="bPhone" type="tel" placeholder="' + DS.esc(T("phone")) + '" required>' +
        '<div class="input-wrap">' + DS.icon("calendar", "lead") + '<input class="input has-lead" id="bDate" type="date" required></div>' +
        '<div class="form-grid-2"><div><label class="mini-label">' + DS.icon("users", "icon-sm") + DS.esc(T("adults")) + '</label><input class="input" id="bAdults" type="number" min="1" value="2"></div>' +
        '<div><label class="mini-label">' + DS.esc(T("children")) + '</label><input class="input" id="bChildren" type="number" min="0" value="0"></div></div>' +
        '<div class="total-row"><span class="text-muted">' + DS.esc(T("total")) + '</span><div class="r"><b id="bTotal"></b><span class="small-muted" id="bTotalSom"></span></div></div>' +
        '<button type="submit" class="btn btn-accent-solid btn-block" id="bBtn">' + DS.esc(T("book_now")) + "</button></form></div></div>";

      function totals() {
        var a = Number(document.getElementById("bAdults").value) || 0, c = Number(document.getElementById("bChildren").value) || 0;
        var total = price * a + price * 0.5 * c;
        document.getElementById("bTotal").textContent = "$" + total.toFixed(0) + " " + currency;
        document.getElementById("bTotalSom").textContent = "≈ " + DS.formatSom(total, usdRate) + " " + SOM;
      }
      totals();
      ["bAdults", "bChildren"].forEach(function (id) {
        var el = document.getElementById(id);
        el.addEventListener("input", totals); el.addEventListener("focus", function () { el.select(); });
      });
      DS.qsa("[data-opt]", host).forEach(function (b) {
        b.addEventListener("click", function () {
          selected = options.filter(function (o) { return o.id === b.getAttribute("data-opt"); })[0] || selected;
          draw();
        });
      });
      document.getElementById("bookForm").addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = document.getElementById("bBtn"); btn.disabled = true; btn.innerHTML = DS.icon("loader-circle", "icon-md spin") + DS.esc(T("booking_in_progress"));
        DS.createBooking({
          tour_id: tour.id,
          full_name: document.getElementById("bName").value,
          email: document.getElementById("bEmail").value,
          phone: document.getElementById("bPhone").value,
          tour_date: document.getElementById("bDate").value,
          num_adults: Number(document.getElementById("bAdults").value) || 0,
          num_children: Number(document.getElementById("bChildren").value) || 0
        }).then(function () {
          DS.toast.success(T("booking_success"));
          ["bName", "bEmail", "bPhone", "bDate"].forEach(function (id) { document.getElementById(id).value = ""; });
        }).catch(function (err) { DS.toast.error(err.message || "Xatolik yuz berdi"); })
          .finally(function () { btn.disabled = false; btn.textContent = T("book_now"); });
      });
    }
    draw();
  }

  /* ---------------------------------------------------------- O'xshash */
  function loadRelated(tour) {
    DS.getTours({ lang: DS.lang, category: tour.category, page_size: 4 }).then(function (res) {
      var items = (res.items || []).filter(function (t) { return t.slug !== tour.slug; }).slice(0, 3);
      if (!items.length) return;
      document.getElementById("related").innerHTML = '<div class="related"><div class="head"><h2>' + DS.esc(T("related_title")) + "</h2><p>" + DS.esc(T("related_subtitle")) + '</p></div><div class="grid-tours">' +
        items.map(function (t) { return DS.tourCard(t, T("view_tour")); }).join("") + "</div></div>";
    }).catch(function () {});
  }
})();
