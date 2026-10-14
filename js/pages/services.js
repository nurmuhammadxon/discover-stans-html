/* Xizmatlar */
(function () {
  "use strict";
  var DS = window.DS, T = function (k) { return DS.t("services", k); };
  var KEYS = ["transportation", "visa_support", "tours", "itineraries", "insurance", "corporate"];
  var ICONS = { transportation: "bus", visa_support: "file-check-2", tours: "compass", itineraries: "route", insurance: "shield-check", corporate: "building-2" };
  DS.init({ page: "services", ns: ["services", "contact"] }).then(function () {
    document.title = DS.metaT("services", "meta_title", "title");
    document.getElementById("app").innerHTML =
      '<div style="min-height:100vh"><div class="page-hero"><div class="page-hero-bg"><img src="images/service_image.png" alt="' + DS.esc(T("title")) + '"><div class="shade"></div></div>' +
      '<div class="page-hero-body"><div class="eyebrow-light">' + DS.icon("map-pin", "icon-md") + DS.esc(T("eyebrow")) + "</div><h1>" + DS.esc(T("title")) + '</h1><p class="lead">' + DS.esc(T("subtitle")) + "</p></div></div>" +
      '<div class="container-6"><div class="services-grid">' + KEYS.map(function (k) {
        return '<div class="service-card"><div class="icon-circle lg">' + DS.icon(ICONS[k], "icon-lg") + "</div><h3>" + DS.esc(T("items." + k + ".title")) + "</h3><p>" + DS.esc(T("items." + k + ".text")) + "</p></div>";
      }).join("") + '</div></div><div id="touch"></div></div>';
    DS.renderGetInTouch(document.getElementById("touch"), "service");
  });
})();
