/* DiscoverStans — admin: shell, router, helpers  (DS.Admin) */
(function () {
  "use strict";
  var DS = window.DS;
  var A = (DS.Admin = {});
  var esc = DS.esc;
  A.esc = esc;

  /* ------------------------------------------------------------ icons */
  var P = {
    "layout-dashboard": '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    "map-pin": '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    "calendar-check": '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    "mail-open": '<path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    sliders: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
    "log-out": '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
    menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    "arrow-left": '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
    "chevron-up": '<path d="m18 15-6-6-6 6"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    "badge-check": '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>'
  };
  A.ic = function (name, size) {
    var s = size || 18;
    return '<svg class="adm-ic" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || "") + "</svg>";
  };

  /* ------------------------------------------------------------ helpers */
  // admin.json ichida kalit bo'lmasa, fallback matn ishlatiladi
  var EXTRA = {
    uz: { retry: "Qayta urinish", site: "Saytga qaytish", "bookings.col_notes": "Izoh", "form.is_featured_short": "Mashhur", "form.is_active_short": "Faol" },
    ru: { retry: "Повторить", site: "На сайт", "bookings.col_notes": "Примечание", "form.is_featured_short": "Избранный", "form.is_active_short": "Активен" },
    en: { retry: "Retry", site: "Back to site", "bookings.col_notes": "Notes", "form.is_featured_short": "Featured", "form.is_active_short": "Active" }
  };
  A.t = function (key, fb) {
    var v = DS.t("admin", key);
    if (v !== key) return v;
    var x = (EXTRA[DS.lang] || EXTRA.en)[key];
    return x != null ? x : (fb != null ? fb : key);
  };
  A.fmt = function (str, vars) {
    return String(str).replace(/\{\{\s*(\w+)\s*\}\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : ""; });
  };
  A.date = function (iso, time) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d)) return esc(iso);
    var o = { day: "2-digit", month: "2-digit", year: "numeric" };
    if (time) { o.hour = "2-digit"; o.minute = "2-digit"; }
    return d.toLocaleString("uz-UZ", o);
  };
  A.money = function (n, cur) {
    return (Number(n) || 0).toLocaleString("en-US", { maximumFractionDigits: 2 }) + (cur ? " " + cur : "");
  };
  A.list = function (res) { return Array.isArray(res) ? res : (res && res.items) || []; };
  A.slugify = function (text) {
    return String(text).toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
  };
  A.loading = function () { return '<div class="adm-loading"><span class="spin"></span></div>'; };
  A.errorBox = function (msg) { return '<div class="adm-error">' + esc(msg) + ' <button type="button" class="btn btn-outline adm-sm" data-retry>' + esc(A.t("retry", "Qayta urinish")) + "</button></div>"; };
  A.head = function (title, sub, actions) {
    return '<div class="adm-head"><div><h1>' + esc(title) + "</h1>" + (sub ? '<p class="adm-sub">' + sub + "</p>" : "") + "</div>" + (actions ? '<div class="adm-head-actions">' + actions + "</div>" : "") + "</div>";
  };
  A.err = function (e, fb) { DS.toast.error((e && e.message) || fb || A.t("settings.error_generic", "Xatolik")); };
  A.badge = function (text, cls) { return '<span class="adm-badge ' + (cls || "") + '">' + esc(text) + "</span>"; };
  A.statusLabel = function (s) { return A.t("dashboard.status." + s, s); };
  A.statusBadge = function (s) { return A.badge(A.statusLabel(s), "st-" + s); };
  A.empty = function (cols, text) { return '<tr><td colspan="' + cols + '" class="adm-empty">' + esc(text) + "</td></tr>"; };

  /* ------------------------------------------------------------ modal */
  function openModal(html, wide) {
    return new Promise(function (resolve) {
      var ov = document.createElement("div");
      ov.className = "modal-overlay open adm-ov";
      ov.innerHTML = '<div class="modal adm-modal' + (wide ? " wide" : "") + '" role="dialog" aria-modal="true">' + html + "</div>";
      document.body.appendChild(ov);
      function close(v) { document.removeEventListener("keydown", key); ov.remove(); resolve(v); }
      function key(e) { if (e.key === "Escape") close(false); }
      document.addEventListener("keydown", key);
      ov.addEventListener("mousedown", function (e) { if (e.target === ov) close(false); });
      ov.addEventListener("click", function (e) {
        var b = e.target.closest("[data-close]");
        if (b) close(b.getAttribute("data-close") === "ok");
      });
      var first = ov.querySelector("[data-focus]"); if (first) first.focus();
    });
  }
  A.modal = openModal;
  A.confirm = function (o) {
    return openModal(
      "<h2>" + esc(o.title) + '</h2><p class="adm-modal-text">' + esc(o.message) + '</p><div class="modal-actions">' +
      '<button type="button" class="btn btn-outline" data-close="no">' + esc(o.cancel || A.t("tours.cancel", "Bekor qilish")) + "</button>" +
      '<button type="button" class="btn ' + (o.danger === false ? "btn-primary" : "btn-danger") + '" data-close="ok" data-focus>' + esc(o.ok || A.t("tours.delete", "O'chirish")) + "</button></div>"
    );
  };

  /* ------------------------------------------------------------ upload */
  A.upload = function (file) {
    var fd = new FormData(); fd.append("file", file);
    return DS.api.upload("/reviews/upload-image", fd).then(function (r) { return r.url; });
  };
  A.img = function (path) { return DS.mediaUrl ? DS.mediaUrl(path) : path; };

  /* ------------------------------------------------------------ router */
  var routes = [];
  var navId = 0;
  var cleanup = null;
  A.page = function (pattern, key, fn) {
    var names = [];
    var re = new RegExp("^" + pattern.replace(/:(\w+)/g, function (m, n) { names.push(n); return "([^/]+)"; }) + "$");
    routes.push({ re: re, names: names, key: key, fn: fn });
  };
  A.go = function (hash) { location.hash = hash; };

  var NAV = [
    ["dashboard", "layout-dashboard", "", "sidebar.dashboard", "Dashboard"],
    ["tours", "map-pin", "tours", "sidebar.tours", "Turlar"],
    ["geography", "globe", "geography", "sidebar.geography", "Geografiya"],
    ["bookings", "calendar-check", "bookings", "sidebar.bookings", "Bronlar"],
    ["messages", "mail", "messages", "sidebar.messages", "Xabarlar"],
    ["reviews", "star", "reviews", "sidebar.reviews", "Sharhlar"],
    ["users", "users", "users", "sidebar.users", "Foydalanuvchilar"],
    ["settings", "sliders", "settings", "sidebar.settings", "Sozlamalar"]
  ];

  function renderNav() {
    document.getElementById("adm-nav").innerHTML = NAV.map(function (n) {
      return '<a class="adm-nav-item" data-key="' + n[0] + '" href="#/' + n[2] + '">' + A.ic(n[1], 18) + "<span>" + esc(A.t(n[3], n[4])) + "</span></a>";
    }).join("");
  }
  function setActive(key) {
    DS.qsa(".adm-nav-item").forEach(function (a) {
      var on = a.getAttribute("data-key") === key;
      a.classList.toggle("active", on);
      if (on) { document.getElementById("adm-top-title").textContent = a.textContent; document.title = a.textContent + " — Admin"; }
    });
  }
  function closeSide() { document.getElementById("adm-side").classList.remove("open"); document.getElementById("adm-backdrop").classList.remove("open"); }

  function route() {
    var path = (location.hash || "#/").replace(/^#\/?/, "").replace(/\/+$/, "");
    var old = document.getElementById("adm-view");
    var view = old.cloneNode(false); // eski tinglovchilar qolmasligi uchun yangi element
    old.parentNode.replaceChild(view, old);
    if (typeof cleanup === "function") { try { cleanup(); } catch (e) {} }
    cleanup = null;
    var id = ++navId;
    closeSide();
    for (var i = 0; i < routes.length; i++) {
      var m = routes[i].re.exec(path);
      if (!m) continue;
      var params = {};
      routes[i].names.forEach(function (n, k) { params[n] = decodeURIComponent(m[k + 1]); });
      setActive(routes[i].key);
      view.innerHTML = "";
      window.scrollTo(0, 0);
      var ctx = { el: view, params: params, stale: function () { return id !== navId; } };
      try {
        var r = routes[i].fn(ctx);
        if (typeof r === "function") cleanup = r;
      } catch (e) { view.innerHTML = A.errorBox(e.message); }
      return;
    }
    A.go("#/");
  }

  // sahifa uchun: yuklash + xatoda "qayta urinish"
  A.load = function (ctx, loader, render) {
    ctx.el.innerHTML = A.loading();
    loader().then(function (data) {
      if (ctx.stale()) return;
      render(data);
    }).catch(function (e) {
      if (ctx.stale()) return;
      ctx.el.innerHTML = A.errorBox(e.message);
      var b = ctx.el.querySelector("[data-retry]");
      if (b) b.onclick = function () { A.load(ctx, loader, render); };
    });
  };

  /* ------------------------------------------------------------ start */
  A.start = function () {
    var guard = document.getElementById("adm-guard");
    var gtext = document.getElementById("adm-guard-text");
    DS.loadNamespaces(["admin"]).then(function () {
      gtext.textContent = A.t("guard.checking", "Tekshirilmoqda...");
      return DS.authReady;
    }).then(function (u) {
      if (!u) { location.replace("login.html"); return; }
      if (!DS.isAdminUser(u)) {
        guard.innerHTML = '<div class="adm-forbid"><p>' + esc(A.t("guard.forbidden", "Admin panelga ruxsat yo'q")) + '</p><a class="btn btn-primary" href="index.html">' + esc(A.t("site", "Saytga qaytish")) + "</a></div>";
        return;
      }
      guard.hidden = true;
      document.getElementById("adm-app").hidden = false;
      renderNav();
      document.getElementById("adm-burger").innerHTML = A.ic("menu", 22);
      document.getElementById("adm-logout").innerHTML = A.ic("log-out", 18) + "<span>" + esc(A.t("sidebar.logout", "Chiqish")) + "</span>";
      document.getElementById("adm-site").innerHTML = A.ic("home", 18) + "<span>" + esc(A.t("site", "Sayt")) + "</span>";
      var sel = document.getElementById("adm-lang"); sel.value = DS.lang;
      sel.onchange = function () { try { localStorage.setItem("ds_lang", sel.value); } catch (e) {} var u = new URL(location.href); u.searchParams.delete("lng"); history.replaceState(null, "", u.pathname + u.search + u.hash); location.reload(); };
      document.getElementById("adm-burger").onclick = function () { document.getElementById("adm-side").classList.add("open"); document.getElementById("adm-backdrop").classList.add("open"); };
      document.getElementById("adm-backdrop").onclick = closeSide;
      document.getElementById("adm-logout").onclick = function () { DS.logout().then(function () { location.href = "login.html"; }); };
      var warned = false;
      window.addEventListener("ds:retrying", function () { if (!warned) { warned = true; DS.toast.info(A.t("users.retrying", "Server uyg'otilmoqda, kuting...")); } });
      window.addEventListener("hashchange", route);
      route();
    });
  };
})();
