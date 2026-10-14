/* Profil va bronlarim */
(function () {
  "use strict";
  var DS = window.DS, T = function (k) { return DS.t("profile", k); };
  var STATUS_BADGE = { pending: "outline", confirmed: "default", completed: "secondary", cancelled: "destructive" };

  DS.init({ page: "profile", ns: ["profile"] }).then(function () {
    document.title = T("title") + " | DiscoverStans";
    var app = document.getElementById("app");
    app.innerHTML = '<div class="center-load">' + DS.icon("loader-circle", "spin") + "</div>";

    DS.authReady.then(function (user) {
      if (!user) { location.replace("login.html"); return; }
      DS.getProfile().then(render).catch(function (err) {
        DS.toast.error(err.message || T("error_load"));
        app.innerHTML = "";
      });
    });

    function render(profile) {
      var ROLE = { admin: T("role_admin"), agent: T("role_agent"), customer: T("role_customer") };
      app.innerHTML =
        '<div class="profile-wrap">' +
        '<div class="card-box"><div class="card-head"><h2 class="card-title">' + DS.esc(T("title")) + '</h2><span class="badge secondary">' + DS.esc(ROLE[profile.role] || profile.role) + "</span></div>" +
        '<form id="profileForm" class="form-stack">' +
        '<div class="field"><label for="p-name">' + DS.esc(T("full_name")) + '</label><input class="input" id="p-name" required value="' + DS.esc(profile.full_name) + '"></div>' +
        '<div class="field"><label>' + DS.esc(T("email")) + '</label><input class="input" type="email" disabled value="' + DS.esc(profile.email) + '"></div>' +
        '<div class="field"><label for="p-phone">' + DS.esc(T("phone")) + '</label><input class="input" id="p-phone" placeholder="+998 90 123 45 67" value="' + DS.esc(profile.phone || "") + '"></div>' +
        '<div class="field"><label for="p-lang">' + DS.esc(T("language")) + '</label><select class="select" id="p-lang">' +
        ["uz", "ru", "en"].map(function (l) { return '<option value="' + l + '"' + ((profile.preferred_language || "uz") === l ? " selected" : "") + ">" + DS.esc(T("language_" + l)) + "</option>"; }).join("") + "</select></div>" +
        '<div class="field"><label>' + DS.esc(T("role")) + '</label><input class="input" disabled value="' + DS.esc(ROLE[profile.role] || profile.role) + '"></div>' +
        '<button type="submit" class="btn btn-primary btn-block btn-rect" id="saveBtn">' + DS.esc(T("save")) + "</button></form>" +
        '<button type="button" class="btn btn-outline btn-block btn-rect text-destructive" id="logoutBtn" style="margin-top:.75rem">' + DS.icon("log-out", "icon-md") + DS.esc(T("logout")) + "</button></div>" +
        '<div class="card-box"><div class="card-head"><h2 class="card-title">' + DS.esc(T("bookings.title")) + '</h2></div><div id="bookings"><div class="center-load" style="height:6rem">' + DS.icon("loader-circle", "spin") + "</div></div></div></div>";

      document.getElementById("profileForm").addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = document.getElementById("saveBtn"); btn.disabled = true; btn.textContent = T("saving");
        var phone = document.getElementById("p-phone").value.trim();
        var payload = { full_name: document.getElementById("p-name").value, preferred_language: document.getElementById("p-lang").value };
        if (phone) payload.phone = phone;
        DS.updateProfile(payload).then(function () { DS.toast.success(T("success")); })
          .catch(function (err) { DS.toast.error(err.message || T("error_generic")); })
          .finally(function () { btn.disabled = false; btn.textContent = T("save"); });
      });
      document.getElementById("logoutBtn").addEventListener("click", function () { DS.logout().then(function () { location.href = "login.html"; }); });

      DS.getMyBookings().then(function (list) {
        var box = document.getElementById("bookings");
        if (!list.length) { box.innerHTML = '<p class="text-muted center" style="font-size:.875rem;padding:1.5rem 0">' + DS.esc(T("bookings.empty")) + "</p>"; return; }
        box.innerHTML = list.map(function (b) {
          return '<div class="booking-item"><div><p class="n">' + DS.esc(b.booking_number) + '</p><p class="m">' + DS.esc(b.tour_date) + " · " + b.num_adults + " " + DS.esc(T("bookings.adults_short")) +
            (b.num_children ? ", " + b.num_children + " " + DS.esc(T("bookings.children_short")) : "") + '</p><p class="m">' + DS.esc(b.total_price) + " " + DS.esc(b.currency || "") + "</p></div>" +
            '<span class="badge ' + STATUS_BADGE[b.status] + '">' + DS.esc(T("bookings.status_" + b.status)) + "</span></div>";
        }).join("");
      }).catch(function (err) {
        document.getElementById("bookings").innerHTML = '<p class="text-destructive" style="font-size:.875rem">' + DS.esc(err.message || T("bookings.error_load")) + "</p>";
      });
    }
  });
})();
