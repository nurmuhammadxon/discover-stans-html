/* DiscoverStans — admin sahifalari: dashboard, bookings, messages, reviews, users, settings, geography */
(function () {
  "use strict";
  var DS = window.DS, A = DS.Admin, esc = A.esc, T = A.t;

  function sortBy(arr, fn) { return arr.slice().sort(function (a, b) { return fn(b) - fn(a); }); }
  function ts(v) { var n = new Date(v).getTime(); return isNaN(n) ? 0 : n; }

  /* ================================================================ dashboard */
  A.page("", "dashboard", function (ctx) {
    A.load(ctx, function () {
      return Promise.all([
        DS.api.get("/tours", { page: 1, page_size: 1 }),
        DS.api.get("/bookings"), DS.api.get("/users"), DS.api.get("/reviews")
      ]);
    }, function (r) {
      var toursTotal = Array.isArray(r[0]) ? r[0].length : (r[0] && r[0].total) || 0;
      var bookings = A.list(r[1]), users = A.list(r[2]), reviews = A.list(r[3]);
      var cur = (bookings.filter(function (b) { return b.currency; })[0] || {}).currency || "USD";
      var g = { total: [0, 0], paid: [0, 0], pending: [0, 0], cancelled: [0, 0] };
      var pend = 0;
      bookings.forEach(function (b) {
        var amt = Number(b.total_price) || 0, k = null;
        g.total[0]++; g.total[1] += amt;
        if (b.status === "confirmed" || b.status === "completed") k = "paid";
        else if (b.status === "pending") { k = "pending"; pend++; }
        else if (b.status === "cancelled") k = "cancelled";
        if (k) { g[k][0]++; g[k][1] += amt; }
      });
      var cards = [
        ["map-pin", T("sidebar.tours", "Turlar"), toursTotal],
        ["calendar-check", T("sidebar.bookings", "Bronlar"), bookings.length],
        ["users", T("sidebar.users", "Foydalanuvchilar"), users.length],
        ["star", T("sidebar.reviews", "Sharhlar"), reviews.length],
        ["badge-check", T("dashboard.status.pending", "Kutilmoqda"), pend]
      ];
      var rev = [["total", "total", ""], ["paid", "paid", "ok"], ["pending", "pending", "warn"], ["cancelled", "cancelled", "bad"]];
      var recent = sortBy(bookings, function (b) { return ts(b.tour_date); }).slice(0, 5);
      ctx.el.innerHTML =
        A.head(T("sidebar.dashboard", "Dashboard"), esc(T("dashboard.welcome", ""))) +
        '<div class="adm-stats">' + cards.map(function (c) {
          return '<div class="adm-stat"><div class="adm-stat-ic">' + A.ic(c[0], 20) + '</div><div><div class="adm-stat-n">' + c[2] + '</div><div class="adm-stat-l">' + esc(c[1]) + "</div></div></div>";
        }).join("") + "</div>" +
        '<div class="card-box adm-card"><h3 class="adm-h3">' + esc(T("dashboard.revenue.title", "Daromad")) + '</h3><div class="adm-rev">' +
        rev.map(function (x) {
          return '<div class="adm-rev-item ' + x[2] + '"><div class="adm-rev-l">' + esc(T("dashboard.revenue." + x[0])) + '</div><div class="adm-rev-v">' + A.money(g[x[1]][1], cur) + '</div><div class="adm-rev-c">' +
            esc(A.fmt(T("dashboard.revenue.count_label", "{{count}} ta"), { count: g[x[1]][0] })) + "</div></div>";
        }).join("") + "</div></div>" +
        '<div class="card-box adm-card"><div class="adm-card-head"><h3 class="adm-h3">' + esc(T("dashboard.recent_bookings", "So'nggi bronlar")) + '</h3><a href="#/bookings" class="adm-a">' + esc(T("dashboard.view_all", "Hammasi")) + '</a></div>' +
        '<div class="adm-tablewrap"><table class="adm-table"><thead><tr><th>' + esc(T("dashboard.col_number")) + "</th><th>" + esc(T("dashboard.col_date")) + "</th><th>" + esc(T("dashboard.col_guests")) + "</th><th>" + esc(T("dashboard.col_price")) + "</th><th>" + esc(T("dashboard.col_status")) + "</th></tr></thead><tbody>" +
        (recent.length ? recent.map(function (b) {
          return "<tr><td><b>" + esc(b.booking_number) + "</b></td><td>" + esc(b.tour_date) + "</td><td>" + ((b.num_adults || 0) + (b.num_children || 0)) + "</td><td>" + A.money(b.total_price, b.currency) + "</td><td>" + A.statusBadge(b.status) + "</td></tr>";
        }).join("") : A.empty(5, T("dashboard.no_bookings", "Hozircha bron yo'q"))) +
        "</tbody></table></div></div>";
    });
  });

  /* ================================================================ bookings */
  A.page("bookings", "bookings", function (ctx) {
    var all = [], filter = "all", STATUSES = ["pending", "confirmed", "completed", "cancelled"];
    function draw() {
      var rows = filter === "all" ? all : all.filter(function (b) { return b.status === filter; });
      var counts = { all: all.length };
      STATUSES.forEach(function (s) { counts[s] = all.filter(function (b) { return b.status === s; }).length; });
      ctx.el.innerHTML =
        A.head(T("bookings.title", "Bronlar"), esc(A.fmt(T("bookings.total"), { count: all.length })),
          '<button type="button" class="btn btn-outline" id="b-auto">' + esc(T("bookings.auto_complete")) + "</button>") +
        '<div class="adm-chips">' + ["all"].concat(STATUSES).map(function (s) {
          return '<button type="button" class="adm-chip' + (filter === s ? " on" : "") + '" data-f="' + s + '">' + esc(s === "all" ? T("bookings.filter_all") : T("bookings.status_" + s)) + " <i>" + counts[s] + "</i></button>";
        }).join("") + "</div>" +
        '<div class="card-box adm-card flush"><div class="adm-tablewrap"><table class="adm-table"><thead><tr><th>' + esc(T("bookings.col_number")) + "</th><th>" + esc(T("bookings.col_customer")) + "</th><th>" + esc(T("bookings.col_date")) + "</th><th>" + esc(T("bookings.col_people")) + "</th><th>" + esc(T("bookings.col_price")) + "</th><th>" + esc(T("bookings.col_notes", "Izoh")) + "</th><th>" + esc(T("bookings.col_status")) + "</th></tr></thead><tbody>" +
        (rows.length ? rows.map(function (b) {
          return "<tr><td><b>" + esc(b.booking_number) + "</b></td><td><div>" + esc(b.full_name || "—") + '</div><div class="adm-muted sm">' + esc(b.email || "") + '</div><div class="adm-muted sm">' + esc(b.phone || "") + "</div></td><td>" + esc(b.tour_date) + "</td><td>" +
            (b.num_adults || 0) + " " + esc(T("bookings.adults_short")) + (b.num_children ? ", " + b.num_children + " " + esc(T("bookings.children_short")) : "") + "</td><td>" + A.money(b.total_price, b.currency) + "</td><td>" +
            (b.notes ? '<button type="button" class="adm-note" data-note="' + esc(b.id) + '" title="' + esc(b.notes) + '">' + esc(b.notes) + "</button>" : "—") + "</td><td>" +
            '<div class="adm-status">' + A.statusBadge(b.status) + '<select class="select adm-sel" data-id="' + esc(b.id) + '">' + STATUSES.map(function (s) {
              return '<option value="' + s + '"' + (s === b.status ? " selected" : "") + ">" + esc(T("bookings.status_" + s)) + "</option>";
            }).join("") + "</select></div></td></tr>";
        }).join("") : A.empty(7, T("bookings.not_found"))) + "</tbody></table></div></div>";
    }
    A.load(ctx, function () { return DS.api.get("/bookings"); }, function (res) {
      all = sortBy(A.list(res), function (b) { return ts(b.created_at || b.tour_date); });
      draw();
    });
    ctx.el.addEventListener("click", function (e) {
      var f = e.target.closest("[data-f]");
      if (f) { filter = f.getAttribute("data-f"); draw(); return; }
      var n = e.target.closest("[data-note]");
      if (n) {
        var b = all.filter(function (x) { return x.id === n.getAttribute("data-note"); })[0];
        A.modal("<h2>" + esc(T("bookings.col_notes", "Izoh")) + " — " + esc(b.booking_number) + '</h2><div class="adm-pre">' + esc(b.notes) + '</div><div class="modal-actions"><button type="button" class="btn btn-outline" data-close="no">OK</button></div>');
        return;
      }
      if (e.target.closest("#b-auto")) {
        var btn = e.target.closest("#b-auto"); btn.disabled = true;
        DS.api.post("/bookings/auto-complete").then(function () {
          DS.toast.success(T("bookings.auto_complete_success"));
          return DS.api.get("/bookings");
        }).then(function (res) { all = sortBy(A.list(res), function (b) { return ts(b.created_at || b.tour_date); }); draw(); })
          .catch(function (er) { A.err(er, T("bookings.auto_complete_error")); btn.disabled = false; });
      }
    });
    ctx.el.addEventListener("change", function (e) {
      var s = e.target.closest("select[data-id]"); if (!s) return;
      var id = s.getAttribute("data-id"), val = s.value, b = all.filter(function (x) { return x.id === id; })[0], old = b.status;
      s.disabled = true;
      DS.api.patch("/bookings/" + id + "/status", { status: val }).then(function () {
        b.status = val; DS.toast.success(T("bookings.status_updated")); draw();
      }).catch(function (er) { A.err(er, T("bookings.status_update_error")); s.value = old; s.disabled = false; });
    });
  });

  /* ================================================================ messages */
  A.page("messages", "messages", function (ctx) {
    var msgs = [];
    function srcLabel(s) { return s === "contact" ? T("messages.source_contact") : s === "service" ? T("messages.source_service") : s; }
    function draw() {
      var unread = msgs.filter(function (m) { return !m.is_read; }).length;
      ctx.el.innerHTML =
        A.head(T("messages.title", "Xabarlar"), esc(A.fmt(T("messages.total"), { count: msgs.length })) + (unread ? ' <span class="adm-accent">· ' + esc(A.fmt(T("messages.unread_count"), { count: unread })) + "</span>" : "")) +
        '<div class="card-box adm-card flush"><div class="adm-tablewrap"><table class="adm-table"><thead><tr><th></th><th>' + esc(T("messages.col_name")) + "</th><th>" + esc(T("messages.col_email")) + "</th><th>" + esc(T("messages.col_source")) + "</th><th>" + esc(T("messages.col_message")) + "</th><th>" + esc(T("messages.col_date")) + "</th><th>" + esc(T("messages.col_status")) + "</th></tr></thead><tbody>" +
        (msgs.length ? msgs.map(function (m) {
          return '<tr class="clickable' + (m.is_read ? "" : " unread") + '" data-id="' + esc(m.id) + '"><td>' + A.ic(m.is_read ? "mail-open" : "mail", 16) + "</td><td>" + esc(m.name) + '</td><td class="adm-muted">' + esc(m.email) + "</td><td>" + A.badge(srcLabel(m.source), "outline") + '</td><td class="adm-trunc">' + esc(m.message) + '</td><td class="adm-muted nowrap">' + A.date(m.created_at, true) + "</td><td>" +
            (m.is_read ? A.badge(T("messages.status_read"), "secondary") : '<button type="button" class="btn btn-outline adm-sm" data-read="' + esc(m.id) + '">' + esc(T("messages.mark_read")) + "</button>") + "</td></tr>";
        }).join("") : A.empty(7, T("messages.not_found"))) + "</tbody></table></div></div>";
    }
    function markRead(id) {
      var m = msgs.filter(function (x) { return x.id === id; })[0];
      if (!m || m.is_read) return Promise.resolve();
      return DS.api.patch("/contact-messages/" + id, { is_read: true }).then(function () { m.is_read = true; draw(); })
        .catch(function (e) { A.err(e, T("messages.mark_read_error")); });
    }
    A.load(ctx, function () { return DS.api.get("/contact-messages"); }, function (res) {
      msgs = sortBy(A.list(res), function (m) { return ts(m.created_at); }); draw();
    });
    ctx.el.addEventListener("click", function (e) {
      var r = e.target.closest("[data-read]");
      if (r) { e.stopPropagation(); r.disabled = true; markRead(r.getAttribute("data-read")); return; }
      var tr = e.target.closest("tr[data-id]"); if (!tr) return;
      var m = msgs.filter(function (x) { return x.id === tr.getAttribute("data-id"); })[0]; if (!m) return;
      A.modal("<h2>" + esc(T("messages.title")) + '</h2><div class="adm-modal-scroll"><div class="adm-row-between">' + A.badge(srcLabel(m.source), "outline") + '<span class="adm-muted sm">' + A.date(m.created_at, true) + '</span></div><dl class="adm-dl"><dt>' + esc(T("messages.col_name")) + "</dt><dd><b>" + esc(m.name) + "</b></dd><dt>" + esc(T("messages.col_email")) + '</dt><dd><a class="adm-a" href="mailto:' + esc(m.email) + '">' + esc(m.email) + "</a></dd></dl><h4 class=\"adm-h4\">" + esc(T("messages.col_message")) + '</h4><div class="adm-pre">' + esc(m.message) + '</div></div><div class="modal-actions"><button type="button" class="btn btn-outline" data-close="no">OK</button></div>');
      markRead(m.id);
    });
  });

  /* ================================================================ reviews */
  A.page("reviews", "reviews", function (ctx) {
    var list = [];
    function draw() {
      ctx.el.innerHTML =
        A.head(T("reviews.title", "Sharhlar"), esc(A.fmt(T("reviews.total"), { count: list.length }))) +
        '<div class="card-box adm-card flush"><div class="adm-tablewrap"><table class="adm-table"><thead><tr><th>' + esc(T("reviews.col_author")) + "</th><th>" + esc(T("reviews.col_rating")) + "</th><th>" + esc(T("reviews.col_text")) + "</th><th>" + esc(T("reviews.col_source")) + "</th><th>" + esc(T("reviews.col_verified")) + '</th><th class="r">' + esc(T("reviews.col_actions")) + "</th></tr></thead><tbody>" +
        (list.length ? list.map(function (r) {
          return "<tr><td><b>" + esc(r.reviewer_name) + "</b>" + (r.reviewer_country ? '<div class="adm-muted sm">' + esc(r.reviewer_country) + "</div>" : "") + '</td><td><span class="adm-rating">' + A.ic("star", 14) + " " + esc(r.rating) + '</span></td><td class="adm-trunc">' + esc(r.text) + "</td><td>" + esc(r.source || "—") + "</td><td>" +
            (r.is_verified ? A.badge(T("reviews.verified_yes"), "st-completed") : "—") + '</td><td class="r"><button type="button" class="adm-icobtn danger" data-del="' + esc(r.id) + '" title="' + esc(T("reviews.delete_label")) + '" aria-label="' + esc(T("reviews.delete_label")) + '">' + A.ic("trash", 16) + "</button></td></tr>";
        }).join("") : A.empty(6, T("reviews.not_found"))) + "</tbody></table></div></div>";
    }
    A.load(ctx, function () { return DS.api.get("/reviews"); }, function (res) {
      list = sortBy(A.list(res), function (r) { return ts(r.created_at); }); draw();
    });
    ctx.el.addEventListener("click", function (e) {
      var d = e.target.closest("[data-del]"); if (!d) return;
      var r = list.filter(function (x) { return x.id === d.getAttribute("data-del"); })[0];
      A.confirm({ title: T("reviews.delete_title"), message: A.fmt(T("reviews.delete_confirm"), { name: r.reviewer_name }), cancel: T("reviews.cancel"), ok: T("reviews.delete_label") }).then(function (ok) {
        if (!ok) return;
        DS.api.del("/reviews/" + r.id).then(function () {
          list = list.filter(function (x) { return x.id !== r.id; }); DS.toast.success(T("reviews.delete_success")); draw();
        }).catch(function (er) { A.err(er, T("reviews.delete_error")); });
      });
    });
  });

  /* ================================================================ users */
  A.page("users", "users", function (ctx) {
    var users = [], q = "";
    var ROLE = { admin: "default", agent: "st-confirmed", customer: "outline" };
    function rows() {
      var s = q.toLowerCase();
      var f = users.filter(function (u) { return ((u.full_name || "") + " " + (u.email || "")).toLowerCase().indexOf(s) > -1; });
      return f.length ? f.map(function (u) {
        return "<tr><td><b>" + esc(u.full_name) + "</b></td><td>" + esc(u.email) + "</td><td>" + esc(u.phone || "—") + '</td><td class="up">' + esc(u.preferred_language || "") + '</td><td class="nowrap">' + (u.created_at ? A.date(u.created_at) : "—") + "</td><td>" + A.badge(T("users.role_" + u.role, u.role), ROLE[u.role] || "outline") + "</td></tr>";
      }).join("") : A.empty(6, T("users.not_found"));
    }
    A.load(ctx, function () { return DS.api.get("/users"); }, function (res) {
      users = A.list(res);
      ctx.el.innerHTML = A.head(T("users.title", "Foydalanuvchilar"), esc(A.fmt(T("users.total"), { count: users.length }))) +
        '<div class="adm-search"><span class="lead">' + A.ic("search", 16) + '</span><input class="input" id="u-q" type="search" placeholder="' + esc(T("users.search_placeholder")) + '"></div>' +
        '<div class="card-box adm-card flush"><div class="adm-tablewrap"><table class="adm-table"><thead><tr><th>' + esc(T("users.col_name")) + "</th><th>" + esc(T("users.col_email")) + "</th><th>" + esc(T("users.col_phone")) + "</th><th>" + esc(T("users.col_language")) + "</th><th>" + esc(T("users.col_created")) + "</th><th>" + esc(T("users.col_role")) + '</th></tr></thead><tbody id="u-body">' + rows() + "</tbody></table></div></div>";
      ctx.el.querySelector("#u-q").addEventListener("input", function (e) { q = e.target.value; ctx.el.querySelector("#u-body").innerHTML = rows(); });
    });
  });

  /* ================================================================ settings */
  A.page("settings", "settings", function (ctx) {
    A.load(ctx, function () { return DS.api.get("/site-stats"); }, function (s) {
      s = s || {};
      var S = "settings.site_stats.";
      function ro(k) { return '<div class="field"><label>' + esc(T(S + k)) + '</label><input class="input" disabled value="' + esc(s[k] != null ? s[k] : "—") + '"></div>'; }
      ctx.el.innerHTML = A.head(T("settings.title", "Sozlamalar"), esc(T("settings.subtitle", ""))) +
        '<div class="card-box adm-card"><h3 class="adm-h3">' + esc(T(S + "title")) + '</h3><p class="adm-muted sm">' + esc(T(S + "subtitle")) + '</p><form id="st-form" class="adm-form narrow">' +
        '<div class="field"><label>' + esc(T(S + "years_experience")) + '</label><input class="input" type="number" min="0" name="years" required value="' + esc(s.years_experience != null ? s.years_experience : 0) + '"></div>' +
        '<p class="adm-muted sm">' + esc(T(S + "auto_calculated_note")) + "</p>" + ro("satisfaction_percent") + ro("completed_trips") + ro("happy_travelers") +
        '<div><button class="btn btn-primary" type="submit">' + esc(T(S + "save")) + "</button></div></form></div>";
      ctx.el.querySelector("#st-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = e.target.querySelector("button"); btn.disabled = true; btn.textContent = T(S + "saving");
        DS.api.patch("/site-stats", { years_experience: Number(e.target.years.value) }).then(function () { DS.toast.success(T(S + "save_success")); })
          .catch(function (er) { A.err(er); })
          .then(function () { btn.disabled = false; btn.textContent = T(S + "save"); });
      });
    });
  });

  /* ================================================================ geography */
  function nameOf(v) { return DS.localizedText(v) || ""; }
  function toML(v) { return typeof v === "string" ? { uz: v, ru: v, en: v } : { uz: (v && v.uz) || "", ru: (v && v.ru) || "", en: (v && v.en) || "" }; }

  // 3 tilli nom + slug + rasm  (ikkala forma uchun umumiy)
  A.imageField = function (value, label) {
    return '<div class="field"><label>' + esc(label) + '</label><div class="adm-imgfield" data-img-field>' +
      '<div class="adm-imgprev">' + (value ? '<img src="' + esc(A.img(value)) + '" alt="">' : "") + "</div>" +
      '<div class="adm-imgbtns"><label class="btn btn-outline adm-sm">' + A.ic("upload", 14) + " " + esc(T("form.select_image")) +
      '<input type="file" accept="image/*" hidden data-img-input></label><button type="button" class="btn btn-outline adm-sm" data-img-rm' + (value ? "" : " hidden") + ">" + esc(T("form.remove_image")) + '</button></div><input type="hidden" data-img-val value="' + esc(value || "") + '"></div></div>';
  };
  // delegated: .adm-imgfield ichidagi fayl tanlash / o'chirish
  A.bindImageFields = function (root) {
    root.addEventListener("change", function (e) {
      var inp = e.target.closest("[data-img-input]"); if (!inp || !inp.files[0]) return;
      var box = inp.closest("[data-img-field]"), prev = box.querySelector(".adm-imgprev");
      prev.innerHTML = '<span class="spin"></span>';
      A.upload(inp.files[0]).then(function (url) {
        box.querySelector("[data-img-val]").value = url; prev.innerHTML = '<img src="' + esc(A.img(url)) + '" alt="">'; box.querySelector("[data-img-rm]").hidden = false;
      }).catch(function (er) { prev.innerHTML = ""; A.err(er, T("form.upload_error")); });
      inp.value = "";
    });
    root.addEventListener("click", function (e) {
      var rm = e.target.closest("[data-img-rm]"); if (!rm) return;
      var box = rm.closest("[data-img-field]");
      box.querySelector("[data-img-val]").value = ""; box.querySelector(".adm-imgprev").innerHTML = ""; rm.hidden = true;
    });
  };

  function geoForm(kind, item, countries) {
    var G = "settings.geography.", n = toML(item && item.name), isC = kind === "country";
    var h = '<form class="adm-form" data-kind="' + kind + '" data-edit="' + esc(item ? item.id : "") + '">';
    ["uz", "ru", "en"].forEach(function (l) {
      h += '<div class="field"><label>' + esc(T(G + "name")) + " (" + l.toUpperCase() + ')</label><input class="input" name="name_' + l + '" required value="' + esc(n[l]) + '"></div>';
    });
    h += '<div class="field"><label>' + esc(T(G + "slug")) + '</label><input class="input" name="slug" required value="' + esc(item ? item.slug : "") + '"' + (item ? ' data-touched="1"' : "") + "></div>";
    if (!isC) {
      h += '<div class="field"><label>' + esc(T(G + "country")) + '</label><select class="select" name="country_id" required><option value="">' + esc(T(G + "select_country")) + "</option>" +
        countries.map(function (c) { return '<option value="' + esc(c.id) + '"' + (item && item.country_id === c.id ? " selected" : "") + ">" + esc(nameOf(c.name)) + "</option>"; }).join("") + "</select></div>";
      h += '<div class="field"><label>' + esc(T(G + "description")) + '</label><textarea class="textarea" name="description" rows="3">' + esc(item && item.description || "") + "</textarea></div>";
    }
    h += A.imageField(item && item.cover_image, T(G + "cover_image"));
    h += '<div class="adm-formbtns"><button class="btn btn-primary" type="submit">' + esc(item ? T(G + "update") : T(G + "add")) + "</button>" +
      (item ? '<button class="btn btn-outline" type="button" data-cancel>' + esc(T(G + "cancel")) + "</button>" : "") + "</div></form>";
    return h;
  }

  A.page("geography", "geography", function (ctx) {
    var G = "settings.geography.", countries = [], dests = [], editC = null, editD = null;
    function draw() {
      var cName = {}; countries.forEach(function (c) { cName[c.id] = nameOf(c.name); });
      ctx.el.innerHTML = A.head(T(G + "page_title", "Geografiya"), esc(T(G + "page_subtitle", ""))) + '<div class="adm-two">' +
        '<div class="card-box adm-card"><h3 class="adm-h3">' + esc(T(G + "countries_title")) + '</h3><p class="adm-muted sm">' + esc(T(G + "countries_subtitle")) + "</p>" + geoForm("country", editC) +
        '<ul class="adm-list">' + (countries.length ? countries.map(function (c) {
          return '<li><div class="adm-thumb">' + (c.cover_image ? '<img src="' + esc(A.img(c.cover_image)) + '" alt="">' : "") + '</div><div class="adm-li-main"><b>' + esc(nameOf(c.name)) + '</b><span class="adm-muted sm">' + esc(c.slug) + " · " + esc(A.fmt(T(G + "tour_count"), { count: c.tour_count || 0 })) + '</span></div><div class="adm-li-act">' +
            '<button type="button" class="adm-icobtn" data-edit-c="' + esc(c.id) + '" title="' + esc(T(G + "edit")) + '">' + A.ic("pencil", 16) + '</button><button type="button" class="adm-icobtn danger" data-del-c="' + esc(c.id) + '" title="' + esc(T(G + "delete")) + '">' + A.ic("trash", 16) + "</button></div></li>";
        }).join("") : '<li class="adm-empty">' + esc(T(G + "no_countries")) + "</li>") + "</ul></div>" +
        '<div class="card-box adm-card"><h3 class="adm-h3">' + esc(T(G + "destinations_title")) + '</h3><p class="adm-muted sm">' + esc(T(G + "destinations_subtitle")) + "</p>" + geoForm("destination", editD, countries) +
        '<ul class="adm-list">' + (dests.length ? dests.map(function (d) {
          return '<li><div class="adm-thumb">' + (d.cover_image ? '<img src="' + esc(A.img(d.cover_image)) + '" alt="">' : "") + '</div><div class="adm-li-main"><b>' + esc(nameOf(d.name)) + '</b><span class="adm-muted sm">' + esc(cName[d.country_id] || "") + " · " + esc(d.slug) + '</span></div><div class="adm-li-act">' +
            '<button type="button" class="adm-icobtn" data-edit-d="' + esc(d.id) + '" title="' + esc(T(G + "edit")) + '">' + A.ic("pencil", 16) + '</button><button type="button" class="adm-icobtn danger" data-del-d="' + esc(d.id) + '" title="' + esc(T(G + "delete")) + '">' + A.ic("trash", 16) + "</button></div></li>";
        }).join("") : '<li class="adm-empty">' + esc(T(G + "no_destinations")) + "</li>") + "</ul></div></div>";
    }
    function reload() {
      return Promise.all([DS.api.get("/countries"), DS.api.get("/destinations")]).then(function (r) {
        if (ctx.stale()) return; countries = A.list(r[0]); dests = A.list(r[1]); draw();
      });
    }
    A.load(ctx, function () { return Promise.all([DS.api.get("/countries"), DS.api.get("/destinations")]); }, function (r) {
      countries = A.list(r[0]); dests = A.list(r[1]); draw();
    });
    A.bindImageFields(ctx.el);
    // slug avtomatik (UZ nomdan), qo'lda o'zgartirilsa to'xtaydi
    ctx.el.addEventListener("input", function (e) {
      var f = e.target.form; if (!f || !f.slug) return;
      if (e.target.name === "slug") { f.slug.setAttribute("data-touched", "1"); return; }
      if (/^name_/.test(e.target.name) && !f.slug.getAttribute("data-touched")) f.slug.value = A.slugify(f.name_uz.value || f.name_ru.value || f.name_en.value);
    });
    ctx.el.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = e.target, kind = f.getAttribute("data-kind"), id = f.getAttribute("data-edit"), isC = kind === "country";
      var body = { name: { uz: f.name_uz.value.trim(), ru: f.name_ru.value.trim(), en: f.name_en.value.trim() }, slug: f.slug.value.trim() };
      var img = f.querySelector("[data-img-val]").value; if (img) body.cover_image = img;
      if (!isC) {
        if (!f.country_id.value) { DS.toast.error(T(G + "select_country_first")); return; }
        body.country_id = f.country_id.value; if (f.description.value.trim()) body.description = f.description.value.trim();
      }
      var btn = f.querySelector("button[type=submit]"); btn.disabled = true; btn.textContent = T(G + "saving");
      var url = isC ? "/countries" : "/destinations";
      (id ? DS.api.patch(url + "/" + id, body) : DS.api.post(url, body)).then(function () {
        DS.toast.success(T(G + (isC ? "country_" : "destination_") + (id ? "updated" : "created")));
        if (isC) editC = null; else editD = null;
        return reload();
      }).catch(function (er) { A.err(er); btn.disabled = false; btn.textContent = id ? T(G + "update") : T(G + "add"); });
    });
    ctx.el.addEventListener("click", function (e) {
      function by(list, attr) { var id = e.target.closest("[" + attr + "]"); return id ? list.filter(function (x) { return x.id === id.getAttribute(attr); })[0] : null; }
      var c;
      if ((c = by(countries, "data-edit-c"))) { editC = c; draw(); return; }
      if ((c = by(dests, "data-edit-d"))) { editD = c; draw(); return; }
      if (e.target.closest("[data-cancel]")) { if (e.target.closest("form").getAttribute("data-kind") === "country") editC = null; else editD = null; draw(); return; }
      var isC = !!(c = by(countries, "data-del-c")), item = c || by(dests, "data-del-d");
      if (!item) return;
      A.confirm({ title: T(G + "delete"), message: T(G + (isC ? "confirm_delete_country" : "confirm_delete_destination")), cancel: T(G + "cancel"), ok: T(G + "delete") }).then(function (ok) {
        if (!ok) return;
        DS.api.del((isC ? "/countries/" : "/destinations/") + item.id).then(function () {
          if (isC && editC && editC.id === item.id) editC = null; if (!isC && editD && editD.id === item.id) editD = null;
          DS.toast.success(T(G + "delete_success")); return reload();
        }).catch(function (er) { A.err(er, T(G + "delete_error")); });
      });
    });
  });
})();
