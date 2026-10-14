/* Turlar ro'yxati */
(function () {
  "use strict";
  var DS = window.DS;
  var T = function (k) { return DS.t("tours", k); };
  var CATEGORIES = [{ value: "day_trip", label: "Day trip" }, { value: "multi_day", label: "Multi-day" }];

  // Joriy filtr holati (URL query bilan sinxron)
  var state = { search: "", category: "", countries: [], destination: "" };
  var countries = [], destinations = [], listsLoaded = false, total = 0, loading = false;
  var draftCountries = [], draftDestination = null;

  DS.init({ page: "tours", ns: ["tours"] }).then(function () {
    document.title = DS.metaT("tours", "meta_title", "title");
    readParams();

    document.getElementById("app").innerHTML =
      '<div class="tours-page">' +
      '<div class="page-hero short"><div class="page-hero-bg"><img src="images/tours_image.png" alt="' + DS.esc(T("title")) + '"><div class="shade"></div></div>' +
      '<div class="page-hero-body"><h1>' + DS.esc(T("title")) + '</h1><p class="lead">' + DS.esc(T("subtitle")) + "</p></div></div>" +
      '<div class="container"><div id="filters" class="filters"></div><div id="toursGrid"></div></div></div>' +
      '<div class="modal-overlay" id="filterModal"><div class="modal" role="dialog" aria-modal="true">' +
      "<h2>" + DS.esc(T("filter_button")) + '</h2><div class="modal-body" id="modalBody"></div>' +
      '<div class="modal-actions"><button type="button" class="btn btn-outline btn-rect" id="clearBtn">' + DS.esc(T("clear_filters")) + '</button><button type="button" class="btn btn-primary btn-rect" id="applyBtn">' + DS.esc(T("show")) + "</button></div></div></div>";

    renderFilters();
    bindModal();
    loadLists();
    loadTours();
    window.addEventListener("popstate", function () { readParams(); renderFilters(); loadTours(); });
  });

  function readParams() {
    state.search = DS.param("search") || "";
    state.category = DS.param("category") || "";
    state.countries = (DS.param("country") || "").split(",").filter(Boolean);
    state.destination = DS.param("destination") || "";
  }

  function pushState() {
    var sp = new URLSearchParams();
    if (state.search) sp.set("search", state.search);
    if (state.category) sp.set("category", state.category);
    if (state.countries.length) sp.set("country", state.countries.join(","));
    if (state.destination) sp.set("destination", state.destination);
    var q = sp.toString();
    history.pushState(null, "", location.pathname + (q ? "?" + q : ""));
    renderFilters();
    loadTours();
  }

  function activeFilterCount() { return (state.countries.length ? 1 : 0) + (state.category ? 1 : 0) + (state.destination ? 1 : 0); }

  function renderFilters() {
    var n = activeFilterCount();
    var host = document.getElementById("filters");
    host.innerHTML =
      '<form id="searchForm" class="input-wrap" style="max-width:28rem">' + DS.icon("search", "lead") +
      '<input class="input has-lead" id="searchInput" placeholder="' + DS.esc(T("search_placeholder")) + '" value="' + DS.esc(state.search) + '"></form>' +
      '<div class="filter-row">' +
      '<button type="button" class="filter-btn" id="openFilter">' + DS.icon("sliders-horizontal", "icon-sm") + DS.esc(T("filter_button")) + (n > 0 ? '<span class="filter-badge">' + n + "</span>" : "") + "</button>" +
      '<button type="button" class="chip ' + (!state.category ? "active" : "") + '" data-cat="">' + DS.esc(T("all_categories")) + "</button>" +
      CATEGORIES.map(function (c) { return '<button type="button" class="chip ' + (state.category === c.value ? "active" : "") + '" data-cat="' + c.value + '">' + c.label + "</button>"; }).join("") +
      '<span class="result-count"><span id="spin" hidden>' + DS.icon("loader-circle", "icon-md spin text-primary") + '</span><span id="countTxt">' + (loading ? "" : total + " " + DS.esc(T("tours_word"))) + "</span></span></div>";

    document.getElementById("searchForm").addEventListener("submit", function (e) {
      e.preventDefault();
      state.search = document.getElementById("searchInput").value.trim();
      pushState();
    });
    DS.qsa("[data-cat]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-cat");
        state.category = (v && state.category === v) ? "" : v;
        pushState();
      });
    });
    document.getElementById("openFilter").addEventListener("click", openModal);
  }

  function loadTours() {
    loading = true;
    var spin = document.getElementById("spin"); if (spin) spin.hidden = false;
    var grid = document.getElementById("toursGrid");
    if (!grid.innerHTML) grid.innerHTML = '<div class="center-load" style="height:30vh">' + DS.icon("loader-circle", "spin") + "</div>";

    DS.getTours({
      lang: DS.lang,
      search: state.search || undefined,
      category: state.category || undefined,
      country: state.countries.length ? state.countries.join(",") : undefined,
      destination: state.destination || undefined,
      page_size: 24
    }).then(function (res) {
      total = res.total || 0;
      var items = res.items || [];
      grid.innerHTML = items.length
        ? '<div class="grid-tours">' + items.map(function (tr) { return DS.tourCard(tr, T("view_tour")); }).join("") + "</div>"
        : '<div class="empty-state">' + DS.esc(T("no_results")) + "</div>";
    }).catch(function (err) {
      total = 0;
      grid.innerHTML = '<div class="empty-state text-destructive">' + DS.esc(err.message || "Xatolik yuz berdi") + "</div>";
    }).finally(function () {
      loading = false;
      var sp = document.getElementById("spin"); if (sp) sp.hidden = true;
      var ct = document.getElementById("countTxt"); if (ct) ct.textContent = total + " " + T("tours_word");
    });
  }

  function loadLists() {
    Promise.all([DS.getCountries(), DS.getDestinations()]).then(function (r) {
      countries = r[0] || []; destinations = r[1] || [];
    }).catch(function () { countries = []; destinations = []; }).finally(function () {
      listsLoaded = true;
      if (document.getElementById("filterModal").classList.contains("open")) renderModal();
    });
  }

  /* ----------------------------------------------------------- modal */
  function bindModal() {
    var overlay = document.getElementById("filterModal");
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
    document.getElementById("applyBtn").addEventListener("click", function () {
      var ids = selectedCountryIds();
      var valid = draftDestination && visibleDestinations(ids).some(function (d) { return d.slug === draftDestination; });
      state.countries = draftCountries.slice();
      state.destination = valid ? draftDestination : "";
      closeModal(); pushState();
    });
    document.getElementById("clearBtn").addEventListener("click", function () {
      draftCountries = []; draftDestination = null; state.countries = []; state.destination = "";
      closeModal(); pushState();
    });
  }
  function openModal() {
    draftCountries = state.countries.slice();
    draftDestination = state.destination || null;
    document.getElementById("filterModal").classList.add("open");
    renderModal();
  }
  function closeModal() { document.getElementById("filterModal").classList.remove("open"); }

  function selectedCountryIds() {
    return countries.filter(function (c) { return draftCountries.indexOf(c.slug) > -1; }).map(function (c) { return c.id; });
  }
  function visibleDestinations(ids) {
    return draftCountries.length ? destinations.filter(function (d) { return ids.indexOf(d.country_id) > -1; }) : destinations;
  }
  function cb(on) { return '<span class="checkbox ' + (on ? "on" : "") + '">' + DS.icon("check") + "</span>"; }
  function skeletons(n) { return Array.apply(null, Array(n)).map(function () { return '<div class="skeleton"></div>'; }).join(""); }

  function renderModal() {
    var body = document.getElementById("modalBody");
    var ids = selectedCountryIds();
    body.innerHTML =
      '<div class="grp"><h4>' + DS.esc(T("country_label")) + "</h4>" +
      (!listsLoaded ? skeletons(4) : countries.map(function (c) {
        var on = draftCountries.indexOf(c.slug) > -1;
        return '<button type="button" class="check-row" data-country="' + DS.esc(c.slug) + '" aria-pressed="' + on + '"><span class="left">' + cb(on) + DS.esc(DS.localizedText(c.name)) + '</span><span class="count-pill">' + (c.tour_count != null ? c.tour_count : "—") + "</span></button>";
      }).join("")) + "</div>" +
      '<div class="grp"><h4>' + DS.esc(T("destination_label")) + "</h4>" +
      (!listsLoaded ? skeletons(6) : visibleDestinations(ids).map(function (d) {
        var on = draftDestination === d.slug;
        return '<button type="button" class="check-row" data-dest="' + DS.esc(d.slug) + '" aria-pressed="' + on + '"><span class="left">' + cb(on) + DS.esc(DS.localizedText(d.name)) + "</span></button>";
      }).join("")) + "</div>";

    DS.qsa("[data-country]", body).forEach(function (b) {
      b.addEventListener("click", function () {
        var s = b.getAttribute("data-country"), i = draftCountries.indexOf(s);
        if (i > -1) draftCountries.splice(i, 1); else draftCountries.push(s);
        renderModal();
      });
    });
    DS.qsa("[data-dest]", body).forEach(function (b) {
      b.addEventListener("click", function () {
        var s = b.getAttribute("data-dest");
        draftDestination = draftDestination === s ? null : s;
        renderModal();
      });
    });
  }
})();
