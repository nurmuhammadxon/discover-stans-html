/* Biz haqimizda */
(function () {
  "use strict";
  var DS = window.DS, T = function (k) { return DS.t("about", k); };
  var ICONS = ["compass", "shield-check", "heart", "users"];
  DS.init({ page: "about", ns: ["about"] }).then(function () {
    document.title = T("title") + " | DiscoverStans";
    document.getElementById("app").innerHTML =
      '<section style="min-height:100vh;padding-bottom:2.5rem">' +
      '<div class="page-hero end"><div class="page-hero-bg"><img src="images/about_image.png" alt="' + DS.esc(T("title")) + '"><div class="shade"></div></div>' +
      '<div class="page-hero-body"><div class="eyebrow-light">' + DS.icon("compass", "icon-md") + DS.esc(T("eyebrow")) + "</div><h1>" + DS.esc(T("title")) + '</h1><p class="lead">' + DS.esc(T("story")) + "</p></div></div>" +
      '<div class="container-4"><p class="story">' + DS.esc(T("story")) + "</p>" +
      '<div class="values-grid">' + [1, 2, 3, 4].map(function (i) {
        return '<div class="value-card"><div class="icon-circle">' + DS.icon(ICONS[i - 1], "icon-lg") + "</div><h3>" + DS.esc(T("values.item_" + i + "_title")) + "</h3><p>" + DS.esc(T("values.item_" + i + "_text")) + "</p></div>";
      }).join("") + "</div>" +
      '<div class="cta-box"><h2>' + DS.esc(T("cta_title")) + "</h2><p>" + DS.esc(T("cta_subtitle")) + '</p><a href="tours.html" class="btn btn-accent-solid" style="padding:.75rem 1.5rem">' + DS.icon("compass", "icon-md") + DS.esc(T("cta_button")) + "</a></div></div></section>";
  });
})();
