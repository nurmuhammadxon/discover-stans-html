/* "Get in touch" bo'limi (contact va services sahifalarida) */
(function () {
  "use strict";
  var DS = window.DS;
  DS.renderGetInTouch = function (host, source) {
    var C = function (k) { return DS.t("contact", k); };
    host.innerHTML =
      '<div class="touch"><div class="container-lg">' +
      "<h2>" + DS.esc(C("form_title")) + '</h2><p class="s1">' + DS.esc(C("form_subtitle_short")) + '</p><p class="s2">' + DS.esc(C("form_subtitle")) + "</p>" +
      '<form id="touchForm">' +
      '<div class="field"><label for="tName">' + DS.esc(C("form_name")) + '</label><input class="input" id="tName" required></div>' +
      '<div class="field"><label for="tEmail">' + DS.esc(C("form_email")) + '</label><input class="input" id="tEmail" type="email" required></div>' +
      '<div class="field"><label for="tMsg">' + DS.esc(C("form_message")) + '</label><textarea class="textarea" id="tMsg" rows="5" required></textarea></div>' +
      '<button type="submit" class="btn btn-primary btn-block" id="tBtn">' + DS.icon("send", "icon-md") + DS.esc(C("form_submit")) + "</button></form></div></div>";
    document.getElementById("touchForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = document.getElementById("tBtn");
      btn.disabled = true; btn.innerHTML = DS.icon("loader-circle", "icon-md spin") + "...";
      DS.sendContactMessage({
        name: document.getElementById("tName").value,
        email: document.getElementById("tEmail").value,
        message: document.getElementById("tMsg").value,
        source: source
      }).then(function () {
        DS.toast.success("Xabar yuborildi");
        e.target.reset();
      }).catch(function (err) { DS.toast.error(err.message || "Xatolik yuz berdi"); })
        .finally(function () { btn.disabled = false; btn.innerHTML = DS.icon("send", "icon-md") + DS.esc(C("form_submit")); });
    });
  };
})();
