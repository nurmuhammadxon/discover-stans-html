/* Aloqa */
(function () {
  "use strict";
  var DS = window.DS, SITE = window.DS_CONFIG.site, T = function (k) { return DS.t("contact", k); };
  var tel = function (v) { return "tel:" + v.replace(/\s+/g, ""); };
  DS.init({ page: "contact", ns: ["contact"] }).then(function () {
    document.title = DS.metaT("contact", "meta_title", "title");
    var c = SITE.contact, mail = "mailto:" + c.email;
    function hd(icon, title) { return '<div class="hd"><span class="icon-circle sm">' + DS.icon(icon, "icon-lg") + "</span><h3>" + DS.esc(title) + "</h3></div>"; }
    document.getElementById("app").innerHTML =
      '<div style="min-height:100vh"><div class="page-hero"><div class="page-hero-bg"><img src="images/contact_image.png" alt="' + DS.esc(T("title")) + '"><div class="shade"></div></div>' +
      '<div class="page-hero-body"><div class="eyebrow-light" style="font-size:1.125rem">' + DS.icon("map-pin", "icon-md") + DS.esc(T("eyebrow")) + "</div><h1>" + DS.esc(T("title")) + "</h1></div></div>" +
      '<div class="container-6"><div class="contact-grid">' +
      "<div>" + hd("map-pin", T("location_title")) + '<p class="fm">' + DS.esc(DS.localizedSite(SITE.companyName)) + '</p><p class="mt">' + DS.esc(DS.localizedSite(c.address)) + "</p>" +
      '<div style="margin-top:1rem"><p class="fm">' + DS.esc(T("operator_title")) + '</p><p class="mt">' + DS.esc(SITE.operator.name) + "</p></div></div>" +
      "<div>" + hd("phone", T("call_title")) + '<div class="blk"><div class="small-muted" style="display:flex;align-items:center;gap:.375rem;margin-bottom:2px">' + DS.icon("smartphone", "icon-xs") + DS.esc(T("mobile_label")) + '</div><a class="lnk" href="' + tel(c.phone) + '">' + DS.esc(c.phone) + "</a></div>" +
      (c.phoneSecondary ? '<div class="blk"><div class="small-muted" style="margin-bottom:2px">' + DS.esc(T("office_label")) + '</div><a class="lnk" href="' + tel(c.phoneSecondary) + '">' + DS.esc(c.phoneSecondary) + "</a></div>" : "") + "</div>" +
      "<div>" + hd("mail", T("write_title")) +
      '<div class="blk"><p class="fm">' + DS.esc(T("quotes_title")) + '</p><p class="mt">' + DS.esc(T("quotes_text")) + ' <a class="em" href="' + mail + '">' + DS.esc(c.email) + "</a></p></div>" +
      '<div class="blk"><p class="fm">' + DS.esc(T("consulting_title")) + '</p><p class="mt">' + DS.esc(T("consulting_text")) + ' <a class="em" href="' + mail + '">' + DS.esc(c.email) + "</a></p></div></div>" +
      '</div></div><div id="touch"></div></div>';
    DS.renderGetInTouch(document.getElementById("touch"), "contact");
  });
})();
