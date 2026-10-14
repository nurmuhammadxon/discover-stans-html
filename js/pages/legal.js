/* Oferta / Maxfiylik siyosati.  <body data-doc="offer|privacy"> */
(function () {
  "use strict";
  var DS = window.DS;
  var doc = document.body.getAttribute("data-doc");
  var OFFSET = 96;

  DS.init({ page: "legal", ns: ["legal"], header: false, footer: false }).then(function () {
    var T = function (k) { return DS.t("legal", k); };
    var lng = DS.lang === "uz" ? "uz" : "en";
    var ruNotice = DS.lang === "ru" ? T("ru_fallback_notice") : "";
    var title = T(doc === "offer" ? "offer_title" : "privacy_title");
    document.title = title + " | DiscoverStans";

    var host = document.getElementById("app");
    host.innerHTML =
      '<div class="legal-top"><div class="in"><a href="index.html" aria-label="Close">' + DS.icon("x", "icon-xl") + "</a></div></div>" +
      '<div class="legal-wrap"><h1>' + DS.esc(title) + "</h1>" + (ruNotice ? '<div class="notice">' + DS.esc(ruNotice) + "</div>" : "") +
      '<div class="legal-cols"><nav class="legal-nav" id="legalNav" aria-label="Sections"></nav><article class="prose" id="legalBody"><div class="center-load" style="height:20vh">' + DS.icon("loader-circle", "spin") + "</div></article></div></div>" +
      (doc === "offer" ? certificate(T) : "");

    fetch("legal/" + doc + "." + lng + ".html").then(function (r) { return r.text(); }).then(function (html) {
      var body = document.getElementById("legalBody");
      body.innerHTML = html;
      var heads = DS.qsa("h3[id]", body);
      var nav = document.getElementById("legalNav");
      if (heads.length) {
        nav.innerHTML = '<div class="stick"><ul>' + heads.map(function (h, i) { return '<li><a href="#' + h.id + '" data-id="' + h.id + '" class="' + (i === 0 ? "active" : "") + '">' + DS.esc(h.textContent) + "</a></li>"; }).join("") + "</ul></div>";
        DS.qsa("a", nav).forEach(function (a) {
          a.addEventListener("click", function (e) {
            e.preventDefault();
            var el = document.getElementById(a.getAttribute("data-id"));
            window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - OFFSET, behavior: "smooth" });
            history.replaceState(null, "", "#" + el.id);
          });
        });
        var ticking = false;
        function compute() {
          var threshold = window.scrollY + OFFSET + 4, current = heads[0].id;
          heads.forEach(function (h) { if (h.getBoundingClientRect().top + window.scrollY <= threshold) current = h.id; });
          DS.qsa("a", nav).forEach(function (a) { a.classList.toggle("active", a.getAttribute("data-id") === current); });
          ticking = false;
        }
        window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(compute); } }, { passive: true });
        if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(function () { window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - OFFSET }); }, 50); }
      }
    }).catch(function () { document.getElementById("legalBody").textContent = "Hujjatni yuklab bo'lmadi."; });

    var thumb = document.getElementById("certThumb");
    if (thumb) {
      var modal = document.getElementById("certModal");
      var open = function (v) { modal.classList.toggle("open", v); document.body.style.overflow = v ? "hidden" : ""; };
      thumb.addEventListener("click", function () { open(true); });
      document.getElementById("certClose").addEventListener("click", function () { open(false); });
      modal.addEventListener("click", function (e) { if (!e.target.closest(".big")) open(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") open(false); });
    }
  });

  function certificate(T) {
    return '<section class="cert"><div class="in"><h2>' + DS.esc(T("certificate_title")) + "</h2><p>" + DS.esc(T("certificate_description")) + "</p>" +
      '<button type="button" class="cert-thumb" id="certThumb" aria-label="' + DS.esc(T("certificate_title")) + '"><div class="frame"><img src="images/legal/business-license.jpg" alt="' + DS.esc(T("certificate_title")) + '" loading="lazy"></div>' +
      '<span class="hint">' + DS.icon("zoom-in", "icon-sm") + DS.esc(T("certificate_zoom_hint")) + "</span></button></div></section>" +
      '<div class="cert-modal" id="certModal" role="dialog" aria-modal="true"><button type="button" class="cert-close" id="certClose" aria-label="' + DS.esc(T("certificate_close")) + '">' + DS.icon("x", "icon-lg") + '</button><div class="big"><img src="images/legal/business-license.jpg" alt=""></div></div>';
  }
})();
