/* DiscoverStans — core: utils, i18n, API, auth, toast */
(function () {
  "use strict";
  var CFG = window.DS_CONFIG;
  var DS = (window.DS = window.DS || {});

  /* ------------------------------------------------------------ utils */
  DS.esc = function (v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  DS.icon = function (name, cls) {
    var inner = (window.DS_ICONS || {})[name] || "";
    return '<svg class="icon ' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true">' + inner + "</svg>";
  };

  DS.qs = function (sel, root) { return (root || document).querySelector(sel); };
  DS.qsa = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  DS.param = function (name) { return new URLSearchParams(location.search).get(name); };

  DS.localizedText = function (value, lang) {
    lang = lang || DS.lang;
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[lang] || value.uz || value.en || value.ru || "";
  };
  DS.localizedList = function (value, lang) {
    lang = lang || DS.lang;
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value[lang] || value.uz || value.en || value.ru || [];
  };
  DS.localizedSite = function (field) { return field[DS.lang] || field.en; };

  DS.formatSom = function (usd, rate) {
    return Math.round(usd * rate).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  DS.debounce = function (fn, ms) {
    var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); };
  };

  /* --------------------------------------------------------------- toast */
  function toast(type, msg) {
    var box = document.getElementById("toasts");
    if (!box) { box = document.createElement("div"); box.id = "toasts"; box.className = "toasts"; document.body.appendChild(box); }
    var el = document.createElement("div");
    el.className = "toast " + type;
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(function () { el.style.transition = "opacity .3s"; el.style.opacity = "0"; setTimeout(function () { el.remove(); }, 300); }, 4000);
  }
  DS.toast = {
    success: function (m) { toast("success", m); },
    error: function (m) { toast("error", m); },
    info: function (m) { toast("info", m); }
  };

  /* ---------------------------------------------------------------- i18n */
  var storedLang = null;
  try { storedLang = localStorage.getItem("ds_lang"); } catch (e) {}
  var urlLang = new URLSearchParams(location.search).get("lng");
  var lang = urlLang || storedLang || CFG.DEFAULT_LANG;
  if (CFG.SUPPORTED_LANGS.indexOf(lang) < 0) lang = CFG.DEFAULT_LANG;
  try { localStorage.setItem("ds_lang", lang); } catch (e) {}
  DS.lang = lang;
  document.documentElement.lang = lang;

  var dict = {};
  DS.loadNamespaces = function (list) {
    return Promise.all(list.map(function (ns) {
      if (dict[ns]) return Promise.resolve();
      return fetch("locales/" + DS.lang + "/" + ns + ".json")
        .then(function (r) { if (!r.ok) throw new Error(ns + " " + r.status); return r.json(); })
        .catch(function () {
          if (DS.lang === CFG.DEFAULT_LANG) return {};
          return fetch("locales/" + CFG.DEFAULT_LANG + "/" + ns + ".json").then(function (r) { return r.json(); }).catch(function () { return {}; });
        })
        .then(function (json) { dict[ns] = json; });
    }));
  };

  // DS.t("home", "hero.eyebrow")  yoki  DS.t("common:nav.home")
  DS.t = function (ns, key) {
    if (key === undefined && ns.indexOf(":") > -1) { var p = ns.split(":"); ns = p[0]; key = p[1]; }
    var cur = dict[ns];
    var parts = String(key).split(".");
    for (var i = 0; cur != null && i < parts.length; i++) cur = cur[parts[i]];
    return typeof cur === "string" ? cur : key;
  };
  DS.hasT = function (ns, key) { return DS.t(ns, key) !== key; };
  // meta_title bo'lmasa fallback
  DS.metaT = function (ns, key, fallback) { return DS.hasT(ns, key) ? DS.t(ns, key) : DS.t(ns, fallback); };

  DS.setLang = function (code) {
    try { localStorage.setItem("ds_lang", code); } catch (e) {}
    var u = new URL(location.href);
    u.searchParams.delete("lng");
    location.href = u.pathname + (u.search || "") + u.hash;
  };

  /* ------------------------------------------------------------ cookies */
  var cookie = {
    get: function (name) {
      var m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
      return m ? decodeURIComponent(m[1]) : undefined;
    },
    set: function (name, value, days) {
      var d = new Date(Date.now() + days * 864e5);
      document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + d.toUTCString() + "; path=/; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : "");
    },
    remove: function (name) { document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"; }
  };

  /* ----------------------------------------------------------------- API */
  var API_URL = (CFG.API_URL || "").replace(/\/+$/, "");
  var API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

  DS.mediaUrl = function (path) {
    if (!path) return null;
    if (/^https?:\/\//.test(path)) return path;
    return API_ORIGIN + (path.charAt(0) === "/" ? "" : "/") + path;
  };

  DS.setTokens = function (tokens) {
    if (!tokens) return;
    if (tokens.access_token) cookie.set("access_token", tokens.access_token, 7);
    if (tokens.refresh_token) cookie.set("refresh_token", tokens.refresh_token, 7);
  };
  DS.clearTokens = function () { cookie.remove("access_token"); cookie.remove("refresh_token"); };
  DS.hasStoredSession = function () { return !!cookie.get("refresh_token"); };

  function formatErrorDetail(detail) {
    if (!detail) return "Xatolik yuz berdi";
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail.map(function (item) {
        if (item && typeof item === "object") {
          var loc = Array.isArray(item.loc) ? item.loc.filter(function (p) { return p !== "body"; }).join(".") : "";
          var msg = item.msg || JSON.stringify(item);
          return loc ? loc + ": " + msg : msg;
        }
        return String(item);
      }).join("; ");
    }
    try { return JSON.stringify(detail); } catch (e) { return "Xatolik yuz berdi"; }
  }

  function buildUrl(path, params) {
    var url = API_URL + path;
    if (params) {
      var sp = new URLSearchParams();
      Object.keys(params).forEach(function (k) {
        if (params[k] !== undefined && params[k] !== null && params[k] !== "") sp.append(k, params[k]);
      });
      var s = sp.toString();
      if (s) url += (url.indexOf("?") > -1 ? "&" : "?") + s;
    }
    return url;
  }

  function rawFetch(method, path, opts, timeoutMs) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, timeoutMs || 60000);
    var headers = {};
    var body;
    if (opts.formData) { body = opts.formData; }
    else if (opts.body !== undefined) { headers["Content-Type"] = "application/json"; body = JSON.stringify(opts.body); }
    var token = cookie.get("access_token");
    if (token) headers["Authorization"] = "Bearer " + token;
    return fetch(buildUrl(path, opts.params), { method: method, headers: headers, body: body, signal: ctrl.signal })
      .finally(function () { clearTimeout(timer); });
  }

  // Render "uxlab qolgan" paytida backend xato/CORS-siz javob beradi: GET so'rovlarni qayta urinamiz
  var RETRY_DELAYS = [3000, 6000, 10000, 15000, 20000];
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function shouldRetry(method, state, status) {
    if (method !== "GET") return false;
    if ((state.retries || 0) >= RETRY_DELAYS.length) return false;
    return status === undefined || status === 502 || status === 503 || status === 504;
  }
  function retryLater(method, path, opts, state) {
    var delay = RETRY_DELAYS[state.retries || 0];
    state.retries = (state.retries || 0) + 1;
    DS.retrying = true;
    window.dispatchEvent(new CustomEvent("ds:retrying", { detail: { attempt: state.retries } }));
    return wait(delay).then(function () { return request(method, path, opts, state); });
  }

  function request(method, path, opts, state) {
    opts = opts || {}; state = state || {};
    return rawFetch(method, path, opts).then(function (res) {
      if (res.status === 401 && !state.refreshed) {
        state.refreshed = true;
        var rt = cookie.get("refresh_token");
        if (rt) {
          return fetch(API_URL + "/auth/refresh", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: rt })
          }).then(function (r) {
            if (!r.ok) throw new Error("refresh failed");
            return r.json();
          }).then(function (tokens) {
            DS.setTokens(tokens);
            return request(method, path, opts, state);
          }).catch(function (e) { DS.clearTokens(); throw e; });
        }
      }
      if (shouldRetry(method, state, res.status)) return retryLater(method, path, opts, state);
      return res.text().then(function (txt) {
        var data = null;
        if (txt) { try { data = JSON.parse(txt); } catch (e) { data = txt; } }
        if (!res.ok) {
          var err = new Error(formatErrorDetail(data && data.detail));
          err.status = res.status; err.detail = data && data.detail;
          throw err;
        }
        return data;
      });
    }, function (e) {
      if (e && e.name === "AbortError" && !state.timeoutRetried) { state.timeoutRetried = true; return request(method, path, opts, state); }
      if (shouldRetry(method, state, undefined)) return retryLater(method, path, opts, state);
      var err = new Error("Server bilan bog'lanib bo'lmadi (" + (e && e.message || "network error") + "). Sabablari: CORS ruxsat yo'q, backend o'chgan/uxlab yotibdi (Render cold start), yoki internet aloqasi yo'q.");
      throw err;
    });
  }

  var api = DS.api = {
    get: function (p, params) { return request("GET", p, { params: params }); },
    post: function (p, body) { return request("POST", p, { body: body }); },
    patch: function (p, body) { return request("PATCH", p, { body: body }); },
    del: function (p) { return request("DELETE", p, {}); },
    upload: function (p, fd) { return request("POST", p, { formData: fd }); }
  };

  // Auth
  DS.registerRequest = function (payload) { return api.post("/auth/register", payload); };
  DS.meRequest = function () { return api.get("/auth/me"); };
  DS.loginRequest = function (payload) {
    return api.post("/auth/login", payload).then(function (tokens) { DS.setTokens(tokens); return DS.meRequest(); });
  };
  // Tours & geography
  DS.getTours = function (params) { return api.get("/tours", params || {}); };
  DS.getTourBySlug = function (slug, lng) { return api.get("/tours/" + encodeURIComponent(slug), { lang: lng }); };
  DS.getCountries = function () { return api.get("/countries"); };
  DS.getDestinations = function (countryId) { return api.get("/destinations", countryId ? { country_id: countryId } : undefined); };
  // Bookings / reviews / contact / stats / profile
  DS.createBooking = function (p) { return api.post("/bookings", p); };
  DS.getMyBookings = function () { return api.get("/bookings/my"); };
  DS.createReview = function (p) { return api.post("/reviews", p); };
  DS.getAllReviews = function () {
    return api.get("/reviews").then(function (res) { return Array.isArray(res) ? res : (res && res.items) || []; });
  };
  DS.getSiteStats = function () { return api.get("/site-stats"); };
  DS.sendContactMessage = function (p) { return api.post("/contact-messages", p); };
  DS.getProfile = function () { return api.get("/users/me"); };
  DS.updateProfile = function (p) { return api.patch("/users/me", p); };

  /* ------------------------------------------------------------- currency */
  DS.getUsdRate = function () {
    try {
      var c = JSON.parse(localStorage.getItem("ds_usd_rate") || "null");
      if (c && Date.now() - c.t < 3600e3) return Promise.resolve(c.rate);
    } catch (e) {}
    var CBU = "https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/";
    function parse(d) {
      var rate = parseFloat(d && d[0] && d[0].Rate);
      if (!isFinite(rate) || rate <= 0) throw new Error("bad rate");
      return rate;
    }
    function load(url) { return fetch(url).then(function (r) { if (!r.ok) throw new Error("status " + r.status); return r.json(); }).then(parse); }
    // 1) to'g'ridan-to'g'ri milliy bank; 2) CORS bloklasa — ochiq proksi orqali
    return load(CBU)
      .catch(function () { return load("https://api.allorigins.win/raw?url=" + encodeURIComponent(CBU)); })
      .then(function (rate) {
        try { localStorage.setItem("ds_usd_rate", JSON.stringify({ t: Date.now(), rate: rate })); } catch (e) {}
        return rate;
      })
      .catch(function (e) {
        console.warn("CBU kursini olib bo'lmadi, zaxira kurs ishlatildi:", e && e.message);
        return CFG.FALLBACK_USD_RATE;
      });
  };

  /* ----------------------------------------------------------------- auth */
  var listeners = [];
  DS.auth = { user: null, loading: true };
  DS.onAuth = function (fn) { listeners.push(fn); if (!DS.auth.loading) fn(DS.auth.user); };
  function setUser(u) { DS.auth.user = u; DS.auth.loading = false; listeners.forEach(function (fn) { fn(u); }); }
  DS.isAdminUser = function (u) { return !!u && (u.role === "admin" || u.role === "agent"); };

  DS.authReady = new Promise(function (resolve) {
    if (!DS.hasStoredSession()) { setUser(null); return resolve(null); }
    DS.meRequest().then(function (u) { setUser(u); resolve(u); })
      .catch(function () { DS.clearTokens(); setUser(null); resolve(null); });
  });

  DS.login = function (payload) { return DS.loginRequest(payload).then(function (u) { setUser(u); startInactivity(); return u; }); };
  DS.register = function (payload) {
    return DS.registerRequest(payload).then(function () { return DS.login({ email: payload.email, password: payload.password }); });
  };
  DS.logout = function () { DS.clearTokens(); setUser(null); stopInactivity(); return Promise.resolve(); };

  // 30 daqiqa faolsizlik -> chiqish
  var inactTimer = null, EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"], LIMIT = 30 * 60 * 1000;
  function resetTimer() {
    clearTimeout(inactTimer);
    inactTimer = setTimeout(function () {
      DS.logout().then(function () { DS.toast.info("Faolsizlik tufayli tizimdan chiqarildingiz"); location.href = "login.html"; });
    }, LIMIT);
  }
  function startInactivity() { EVENTS.forEach(function (e) { window.addEventListener(e, resetTimer, { passive: true }); }); resetTimer(); }
  function stopInactivity() { EVENTS.forEach(function (e) { window.removeEventListener(e, resetTimer); }); clearTimeout(inactTimer); }
  DS.authReady.then(function (u) { if (u) startInactivity(); });

  // Backend "uyg'otish" (Render cold start)
  if (API_URL && API_URL.indexOf("your-backend-url") < 0) { fetch(API_URL + "/health", { cache: "no-store" }).catch(function () {}); }
  DS.apiConfigured = !!API_URL && API_URL.indexOf("your-backend-url") < 0;

  /* ------------------------------------------------------ shared markup bits */
  DS.placeholder = function () {
    return '<div class="placeholder"><div class="ph-inner"><div class="ph-circle">' + DS.icon("compass") + '</div><span class="ph-text">Centralia Tours</span></div></div>';
  };

  DS.tourCard = function (tour, viewLabel) {
    var img = DS.mediaUrl(tour.cover_image || (tour.images && tour.images[0]));
    var title = DS.localizedText(tour.title);
    var short = DS.localizedText(tour.short_description);
    var country = tour.countries && tour.countries[0] ? DS.localizedText(tour.countries[0].name) : "";
    return '<a class="tour-card" href="tour.html?slug=' + encodeURIComponent(tour.slug) + '">' +
      '<div class="media">' + (img ? '<img src="' + DS.esc(img) + '" alt="' + DS.esc(title) + '" loading="lazy">' : DS.placeholder()) +
      '<div class="price-badge">$' + DS.esc(tour.price) + '</div></div>' +
      '<div class="body">' +
      (country ? '<div class="country">' + DS.icon("map-pin", "icon-sm") + DS.esc(country) + "</div>" : "") +
      "<h3>" + DS.esc(title) + "</h3>" +
      (short ? '<p class="desc">' + DS.esc(short) + "</p>" : "") +
      '<span class="view-link">' + DS.esc(viewLabel) + DS.icon("arrow-up-right", "icon-sm") + "</span></div></a>";
  };

  DS.starsHtml = function (rating) {
    var s = '<div class="stars">';
    for (var i = 0; i < 5; i++) s += DS.icon("star", i < rating ? "on" : "");
    return s + "</div>";
  };

  // Gorizontal drag-scroll (sichqoncha bilan sudrash)
  DS.enableDragScroll = function (el, onEnd) {
    var down = false, moved = false, startX = 0, startLeft = 0;
    el.addEventListener("mousedown", function (e) { down = true; moved = false; el.classList.add("dragging"); startX = e.pageX - el.offsetLeft; startLeft = el.scrollLeft; });
    function end() { if (!down) return; down = false; el.classList.remove("dragging"); if (onEnd) onEnd(); }
    el.addEventListener("mouseup", end); el.addEventListener("mouseleave", end);
    el.addEventListener("mousemove", function (e) {
      if (!down) return; e.preventDefault();
      var walk = (e.pageX - el.offsetLeft) - startX;
      if (Math.abs(walk) > 5) moved = true;
      el.scrollLeft = startLeft - walk;
    });
    el.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    el.querySelectorAll("img, a").forEach(function (n) { n.setAttribute("draggable", "false"); });
  };
})();