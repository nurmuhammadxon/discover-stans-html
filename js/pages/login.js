/* Kirish / Ro'yxatdan o'tish */
(function () {
  "use strict";
  var DS = window.DS, SITE = window.DS_CONFIG.site, T = function (k) { return DS.t("auth", k); };

  DS.init({ page: "login", ns: ["auth"] }).then(function () {
    document.title = T("tab_login") + " | DiscoverStans";
    var app = document.getElementById("app");
    function bg(inner) {
      return '<div class="login-page"><img class="bgimg" src="images/login_image.png" alt=""><div class="bgshade"></div>' + inner + "</div>";
    }
    app.innerHTML = bg('<div class="center-load" style="height:auto;position:relative;z-index:10;color:#fff">' + DS.icon("loader-circle", "spin") + "</div>");

    var justAuthed = false;
    DS.authReady.then(function (user) {
      if (user) return redirectExisting(user);
      renderForm();
    });

    function redirectExisting(u) { location.replace(DS.isAdminUser(u) ? "admin.html" : "profile.html"); }
    function redirectAfter(u) { location.href = DS.isAdminUser(u) ? "admin.html" : "index.html"; }

    function pw(id, ph) {
      return '<div class="input-wrap"><input class="input has-trail" id="' + id + '" type="password" placeholder="' + ph + '">' +
        '<button type="button" class="trail" data-eye="' + id + '" tabindex="-1">' + DS.icon("eye", "icon-md") + "</button></div>";
    }
    function fld(id, label, input, extra) {
      return '<div class="field"><label for="' + id + '">' + DS.esc(label) + "</label>" + input + '<p class="field-error" data-err="' + id + '" hidden></p></div>';
    }

    function renderForm() {
      app.innerHTML = bg(
        '<div class="login-box"><div class="login-brand"><div class="nm">' + DS.icon("map-pin") + DS.esc(SITE.logo.name) + "<b>" + DS.esc(SITE.logo.highlight) + "</b></div><p>" + DS.esc(T("subtitle")) + "</p></div>" +
        '<div class="auth-card"><div class="seg"><button type="button" class="active" data-tab="login">' + DS.esc(T("tab_login")) + '</button><button type="button" data-tab="register">' + DS.esc(T("tab_register")) + "</button></div>" +
        '<form id="loginForm" class="form-stack" novalidate>' +
        fld("l-email", T("email"), '<input class="input" id="l-email" type="email" placeholder="email@example.com">') +
        fld("l-pass", T("password"), pw("l-pass", "********")) +
        '<button type="submit" class="btn btn-primary btn-block" id="loginBtn">' + DS.esc(T("submit_login")) + "</button></form>" +
        '<form id="regForm" class="form-stack" novalidate hidden>' +
        fld("r-name", T("full_name"), '<input class="input" id="r-name" placeholder="Ism Familiya">') +
        fld("r-email", T("email"), '<input class="input" id="r-email" type="email" placeholder="email@example.com">') +
        fld("r-phone", T("phone"), '<input class="input" id="r-phone" type="tel" placeholder="+998 90 123 45 67">') +
        fld("r-pass", T("password"), pw("r-pass", "********")) +
        fld("r-pass2", T("confirm_password"), pw("r-pass2", "********")) +
        '<button type="submit" class="btn btn-primary btn-block" id="regBtn">' + DS.esc(T("submit_register")) + "</button></form></div></div>");
      bind();
    }

    function setErr(id, msg) {
      var el = document.querySelector('[data-err="' + id + '"]');
      if (!el) return;
      el.textContent = msg || ""; el.hidden = !msg;
    }
    var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };

    function bind() {
      DS.qsa("[data-tab]").forEach(function (b) {
        b.addEventListener("click", function () {
          var t = b.getAttribute("data-tab");
          DS.qsa("[data-tab]").forEach(function (x) { x.classList.toggle("active", x === b); });
          document.getElementById("loginForm").hidden = t !== "login";
          document.getElementById("regForm").hidden = t !== "register";
        });
      });
      DS.qsa("[data-eye]").forEach(function (b) {
        b.addEventListener("click", function () {
          var inp = document.getElementById(b.getAttribute("data-eye"));
          var show = inp.type === "password";
          inp.type = show ? "text" : "password";
          b.innerHTML = DS.icon(show ? "eye-off" : "eye", "icon-md");
        });
      });

      document.getElementById("loginForm").addEventListener("submit", function (e) {
        e.preventDefault();
        var email = document.getElementById("l-email").value.trim(), pass = document.getElementById("l-pass").value;
        var ok = true;
        setErr("l-email", emailOk(email) ? "" : "Email notogri"); if (!emailOk(email)) ok = false;
        setErr("l-pass", pass.length >= 6 ? "" : "Parol kamida 6 belgi bolishi kerak"); if (pass.length < 6) ok = false;
        if (!ok) return;
        var btn = document.getElementById("loginBtn"); btn.disabled = true; btn.textContent = T("loading");
        DS.login({ email: email, password: pass }).then(function (u) {
          justAuthed = true; DS.toast.success(T("login_success")); redirectAfter(u);
        }).catch(function (err) {
          DS.toast.error(err.message || T("error_generic")); btn.disabled = false; btn.textContent = T("submit_login");
        });
      });

      document.getElementById("regForm").addEventListener("submit", function (e) {
        e.preventDefault();
        var v = {
          full_name: document.getElementById("r-name").value.trim(), email: document.getElementById("r-email").value.trim(),
          phone: document.getElementById("r-phone").value.trim(), password: document.getElementById("r-pass").value, confirm: document.getElementById("r-pass2").value
        };
        var ok = true;
        function chk(id, cond, msg) { setErr(id, cond ? "" : msg); if (!cond) ok = false; }
        chk("r-name", v.full_name.length >= 2, "Ismingizni kiriting");
        chk("r-email", emailOk(v.email), "Email notogri");
        chk("r-pass", v.password.length >= 6, "Parol kamida 6 belgi bolishi kerak");
        chk("r-pass2", v.confirm.length >= 6, "Parolni tasdiqlang");
        if (v.confirm.length >= 6) chk("r-pass2", v.password === v.confirm, "Parollar mos emas");
        if (!ok) return;
        var btn = document.getElementById("regBtn"); btn.disabled = true; btn.textContent = T("loading");
        var payload = { full_name: v.full_name, email: v.email, password: v.password };
        if (v.phone) payload.phone = v.phone;
        DS.register(payload).then(function (u) {
          justAuthed = true; DS.toast.success(T("register_success")); redirectAfter(u);
        }).catch(function (err) {
          DS.toast.error(err.message || T("error_generic")); btn.disabled = false; btn.textContent = T("submit_register");
        });
      });
    }
  });
})();
