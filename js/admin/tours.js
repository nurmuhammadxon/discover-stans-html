/* DiscoverStans — admin: turlar ro'yxati va tur formasi */
(function () {
  "use strict";
  var DS = window.DS, A = DS.Admin, esc = A.esc, T = A.t;
  var LANGS = ["uz", "ru", "en"];

  function loadAllTours() {
    var out = [];
    function page(n) {
      return DS.api.get("/tours", { page: n, page_size: 50, lang: DS.lang }).then(function (r) {
        var items = A.list(r); out = out.concat(items);
        var pages = (r && r.pages) || 1;
        if (!Array.isArray(r) && n < pages && n < 40) return page(n + 1);
        return out;
      });
    }
    return page(1);
  }

  /* ================================================================ ro'yxat */
  A.page("tours", "tours", function (ctx) {
    var tours = [];
    function sw(id, field, on) {
      return '<label class="adm-switch"><input type="checkbox" data-tg="' + field + '" data-id="' + esc(id) + '"' + (on ? " checked" : "") + '><span></span></label>';
    }
    function draw() {
      ctx.el.innerHTML = A.head(T("tours.title", "Turlar"), esc(A.fmt(T("tours.total"), { count: tours.length })),
        '<a class="btn btn-primary" href="#/tours/new">' + A.ic("plus", 16) + " " + esc(T("tours.new_tour")) + "</a>") +
        '<div class="card-box adm-card flush"><div class="adm-tablewrap"><table class="adm-table"><thead><tr><th>' + esc(T("tours.col_name")) + "</th><th>" + esc(T("tours.col_category")) + "</th><th>" + esc(T("tours.col_price")) + "</th><th>" + esc(T("form.is_featured_short")) + "</th><th>" + esc(T("form.is_active_short")) + '</th><th class="r">' + esc(T("tours.col_actions")) + "</th></tr></thead><tbody>" +
        (tours.length ? tours.map(function (t) {
          return '<tr><td><div class="adm-tourcell"><div class="adm-thumb">' + (t.cover_image ? '<img src="' + esc(A.img(t.cover_image)) + '" alt="">' : "") + "</div><div><b>" + esc(DS.localizedText(t.title)) + '</b><div class="adm-muted sm">' + esc(t.slug) + "</div></div></div></td><td>" + esc(t.category || "—") + "</td><td class=\"nowrap\">" + A.money(t.price, t.currency) + "</td><td>" + sw(t.id, "is_featured", t.is_featured) + "</td><td>" + sw(t.id, "is_active", t.is_active !== false) + '</td><td class="r nowrap">' +
            '<a class="adm-icobtn" href="#/tours/edit/' + encodeURIComponent(t.slug) + '" title="' + esc(T("settings.geography.edit")) + '">' + A.ic("pencil", 16) + '</a><button type="button" class="adm-icobtn danger" data-del="' + esc(t.id) + '" title="' + esc(T("tours.delete")) + '">' + A.ic("trash", 16) + "</button></td></tr>";
        }).join("") : A.empty(6, T("tours.empty"))) + "</tbody></table></div></div>";
    }
    A.load(ctx, loadAllTours, function (list) { tours = list; draw(); });
    ctx.el.addEventListener("change", function (e) {
      var c = e.target.closest("[data-tg]"); if (!c) return;
      var t = tours.filter(function (x) { return x.id === c.getAttribute("data-id"); })[0], f = c.getAttribute("data-tg"), val = c.checked, body = {};
      body[f] = val; c.disabled = true;
      DS.api.patch("/tours/" + t.id, body).then(function () { t[f] = val; c.disabled = false; })
        .catch(function (er) { c.checked = !val; c.disabled = false; A.err(er, T("tours.toggle_error")); });
    });
    ctx.el.addEventListener("click", function (e) {
      var d = e.target.closest("[data-del]"); if (!d) return;
      var t = tours.filter(function (x) { return x.id === d.getAttribute("data-del"); })[0];
      A.confirm({ title: T("tours.delete_title"), message: T("tours.delete_confirm"), cancel: T("tours.cancel"), ok: T("tours.delete") }).then(function (ok) {
        if (!ok) return;
        DS.api.del("/tours/" + t.id).then(function () { tours = tours.filter(function (x) { return x.id !== t.id; }); DS.toast.success(T("tours.delete_success")); draw(); })
          .catch(function (er) { A.err(er); });
      });
    });
  });

  /* ================================================================ forma */
  function ml(v) {
    if (!v) return { uz: "", ru: "", en: "" };
    if (typeof v === "string") return { uz: v, ru: v, en: v };
    return { uz: v.uz || "", ru: v.ru || "", en: v.en || "" };
  }
  function listText(v) { var o = {}; LANGS.forEach(function (l) { o[l] = ((v && v[l]) || []).join("\n"); }); return o; }
  function textList(s) { return String(s || "").split("\n").map(function (x) { return x.trim(); }).filter(Boolean); }
  function blank() { return { uz: "", ru: "", en: "" }; }

  function initState(d) {
    d = d || {};
    return {
      id: d.id || null, isEdit: !!d.id,
      title: ml(d.title), slug: d.slug || "", slugTouched: !!d.id,
      short: ml(d.short_description), desc: ml(d.description),
      category: d.category || "", duration_days: d.duration_days != null ? d.duration_days : 1, duration_nights: d.duration_nights != null ? d.duration_nights : 0,
      price: d.price != null ? Number(d.price) : 0, currency: d.currency || "USD", max_group_size: d.max_group_size != null ? d.max_group_size : 10,
      is_featured: !!d.is_featured, is_active: d.is_active !== false,
      technical_level: d.technical_level != null ? d.technical_level : 1, min_age: d.min_age != null ? d.min_age : 0, fitness_level: d.fitness_level != null ? d.fitness_level : 1,
      country_ids: d.country_ids || (d.countries || []).map(function (c) { return c.id; }),
      destination_ids: d.destination_ids || (d.destinations || []).map(function (c) { return c.id; }),
      cover: d.cover_image || "", images: (d.images || []).slice(),
      txt: { highlights: listText(d.highlights), included: listText(d.included), excluded: listText(d.excluded) },
      faqs: (d.faqs || []).map(function (f) { return { question: ml(f.question), answer: ml(f.answer) }; }),
      pricing: (d.pricing_options || []).map(function (p) {
        var o = { type: p.type || "group", label: ml(p.label), price: Number(p.price) || 0, currency: p.currency || "USD", min_people: p.min_people != null ? p.min_people : 1, max_people: p.max_people != null ? p.max_people : null };
        if (p.id) o.id = p.id; return o;
      }),
      route: (d.route_points || []).map(function (p, i) {
        return { order: p.order || i + 1, type: p.type || "stop", name: ml(p.name), address: ml(p.address), activity_type: p.activity_type || "", duration_minutes: p.duration_minutes != null ? p.duration_minutes : null, has_extra_fee: !!p.has_extra_fee, latitude: p.latitude != null ? p.latitude : null, longitude: p.longitude != null ? p.longitude : null };
      }),
      itinerary: d.itinerary || []
    };
  }

  function setPath(obj, path, val) {
    var p = path.split("."), cur = obj;
    for (var i = 0; i < p.length - 1; i++) cur = cur[p[i]];
    cur[p[p.length - 1]] = val;
  }

  // ---- HTML bo'laklar
  function inp(path, val, o) {
    o = o || {};
    return '<input class="input" data-p="' + path + '"' + (o.t ? ' data-t="' + o.t + '"' : "") + ' type="' + (o.type || "text") + '"' + (o.min != null ? ' min="' + o.min + '"' : "") + (o.max != null ? ' max="' + o.max + '"' : "") + (o.step ? ' step="' + o.step + '"' : "") + (o.req ? " required" : "") + (o.dis ? " disabled" : "") + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : "") + ' value="' + esc(val == null ? "" : val) + '">';
  }
  function field(label, html, cls) { return '<div class="field ' + (cls || "") + '"><label>' + esc(label) + "</label>" + html + "</div>"; }
  function ml3(label, base, obj, kind, req) {
    return LANGS.map(function (l) {
      var name = label + " (" + l.toUpperCase() + ")";
      return field(name, kind === "ta"
        ? '<textarea class="textarea" rows="4" data-p="' + base + "." + l + '"' + (req ? " required" : "") + ">" + esc(obj[l]) + "</textarea>"
        : inp(base + "." + l, obj[l], { req: req }));
    }).join("");
  }
  function sel(path, val, opts, t) {
    return '<select class="select" data-p="' + path + '"' + (t ? ' data-t="' + t + '"' : "") + ">" + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(val) ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select>";
  }
  function check(path, val, label) {
    return '<label class="adm-check"><input type="checkbox" data-p="' + path + '" data-t="bool"' + (val ? " checked" : "") + "><span>" + esc(label) + "</span></label>";
  }
  function sec(title, body, part) {
    return '<section class="card-box adm-card adm-sec"' + (part ? ' data-part="' + part + '"' : "") + '><h3 class="adm-h3">' + esc(title) + "</h3>" + body + "</section>";
  }

  function partFaqs(S) {
    return S.faqs.map(function (f, i) {
      return '<div class="adm-sub-card"><div class="adm-sub-head"><b>#' + (i + 1) + '</b><button type="button" class="adm-icobtn danger" data-act="rm-faq" data-i="' + i + '">' + A.ic("trash", 16) + "</button></div>" +
        '<div class="adm-grid3">' + LANGS.map(function (l) { return field(T("form.question") + " (" + l.toUpperCase() + ")", inp("faqs." + i + ".question." + l, f.question[l])); }).join("") + "</div>" +
        '<div class="adm-grid3">' + LANGS.map(function (l) { return field(T("form.answer") + " (" + l.toUpperCase() + ")", '<textarea class="textarea" rows="3" data-p="faqs.' + i + ".answer." + l + '">' + esc(f.answer[l]) + "</textarea>"); }).join("") + "</div></div>";
    }).join("") + '<button type="button" class="btn btn-outline" data-act="add-faq">' + A.ic("plus", 16) + " " + esc(T("form.add_faq")) + "</button>";
  }
  function partPricing(S) {
    return S.pricing.map(function (p, i) {
      return '<div class="adm-sub-card"><div class="adm-sub-head"><b>#' + (i + 1) + '</b><button type="button" class="adm-icobtn danger" data-act="rm-pr" data-i="' + i + '">' + A.ic("trash", 16) + "</button></div>" +
        '<div class="adm-grid3">' + LANGS.map(function (l) { return field(T("form.label") + " (" + l.toUpperCase() + ")", inp("pricing." + i + ".label." + l, p.label[l])); }).join("") + "</div>" +
        '<div class="adm-grid5">' + field(T("form.type"), sel("pricing." + i + ".type", p.type, [["group", "Group"], ["private", "Private"]])) +
        field(T("form.price"), inp("pricing." + i + ".price", p.price, { type: "number", t: "num", min: 0, step: "any" })) +
        field(T("form.currency"), sel("pricing." + i + ".currency", p.currency, [["USD", "USD"], ["UZS", "UZS"], ["EUR", "EUR"]])) +
        field(T("form.min_people"), inp("pricing." + i + ".min_people", p.min_people, { type: "number", t: "num", min: 1 })) +
        field(T("form.max_people"), inp("pricing." + i + ".max_people", p.max_people, { type: "number", t: "numnull", min: 1 })) + "</div></div>";
    }).join("") + '<button type="button" class="btn btn-outline" data-act="add-pr">' + A.ic("plus", 16) + " " + esc(T("form.add_pricing")) + "</button>";
  }
  function partRoute(S) {
    var TYPES = [["start", "Start"], ["stop", "Stop"], ["end", "End"]];
    var ACT = [["", "-"], ["photo_stop", "Photo stop"], ["guided_tour", "Guided tour"], ["shopping", "Shopping"]];
    return S.route.map(function (p, i) {
      var stop = p.type === "stop", b = "route." + i + ".";
      return '<div class="adm-sub-card"><div class="adm-sub-head"><b>#' + (i + 1) + '</b><span class="adm-sub-btns">' +
        '<button type="button" class="adm-icobtn" data-act="up" data-i="' + i + '"' + (i === 0 ? " disabled" : "") + ">" + A.ic("chevron-up", 16) + '</button><button type="button" class="adm-icobtn" data-act="down" data-i="' + i + '"' + (i === S.route.length - 1 ? " disabled" : "") + ">" + A.ic("chevron-down", 16) + '</button><button type="button" class="adm-icobtn danger" data-act="rm-rp" data-i="' + i + '">' + A.ic("trash", 16) + "</button></span></div>" +
        '<div class="adm-grid4">' + field(T("form.type"), sel(b + "type", p.type, TYPES) ) +
        (stop ? field(T("form.activity_type"), sel(b + "activity_type", p.activity_type, ACT)) + field(T("form.duration_minutes"), inp(b + "duration_minutes", p.duration_minutes, { type: "number", t: "numnull", min: 0 })) + '<div class="field adm-end">' + check(b + "has_extra_fee", p.has_extra_fee, T("form.has_extra_fee")) + "</div>" : "") + "</div>" +
        '<div class="adm-grid3">' + LANGS.map(function (l) { return field(T("form.name") + " (" + l.toUpperCase() + ")", inp(b + "name." + l, p.name[l])); }).join("") + "</div>" +
        (!stop ? '<div class="adm-grid3">' + LANGS.map(function (l) { return field(T("form.address") + " (" + l.toUpperCase() + ")", inp(b + "address." + l, p.address[l])); }).join("") + "</div>" : "") +
        '<div class="adm-grid2">' + field(T("form.latitude"), inp(b + "latitude", p.latitude, { type: "number", t: "numnull", step: "any" })) + field(T("form.longitude"), inp(b + "longitude", p.longitude, { type: "number", t: "numnull", step: "any" })) + "</div></div>";
    }).join("") + '<div class="adm-addrow">' + ["start", "stop", "end"].map(function (t) { return '<button type="button" class="btn btn-outline" data-act="add-rp" data-type="' + t + '">' + A.ic("plus", 16) + " " + esc(T("form.add_route_point")) + " (" + t + ")</button>"; }).join("") + "</div>";
  }
  function partGallery(S) {
    return '<p class="adm-muted sm">' + esc(T("form.gallery_hint")) + '</p><div class="adm-gallery">' + S.images.map(function (u, i) {
      return '<div class="adm-gitem"><img src="' + esc(A.img(u)) + '" alt=""><button type="button" class="adm-gx" data-act="rm-img" data-i="' + i + '" aria-label="remove">' + A.ic("x", 14) + "</button></div>";
    }).join("") + (S._upl ? '<div class="adm-gitem"><span class="spin"></span></div>' : "") + '</div><label class="btn btn-outline">' + A.ic("upload", 16) + " " + esc(T("form.add_images")) + '<input type="file" accept="image/*" multiple hidden data-gallery></label>';
  }
  function partGeo(S, countries, dests) {
    if (!countries.length) return '<p class="adm-muted">' + esc(T("form.no_countries")) + "</p>";
    return countries.map(function (c) {
      var on = S.country_ids.indexOf(c.id) > -1, ds = dests.filter(function (d) { return d.country_id === c.id; });
      return '<div class="adm-geo"><label class="adm-check"><input type="checkbox" data-geo-c="' + esc(c.id) + '"' + (on ? " checked" : "") + "><span><b>" + esc(DS.localizedText(c.name)) + "</b></span></label>" +
        (on ? '<div class="adm-geo-d">' + (ds.length ? ds.map(function (d) {
          return '<label class="adm-check"><input type="checkbox" data-geo-d="' + esc(d.id) + '"' + (S.destination_ids.indexOf(d.id) > -1 ? " checked" : "") + "><span>" + esc(DS.localizedText(d.name)) + "</span></label>";
        }).join("") : '<span class="adm-muted sm">' + esc(T("form.no_destinations")) + "</span>") + "</div>" : "") + "</div>";
    }).join("");
  }
  function partCover(S) {
    return A.imageField(S.cover, T("form.cover_image"));
  }

  function renderForm(ctx, detail, countries, dests) {
    var S = initState(detail);
    var title = T(S.isEdit ? "tours.edit_page_title" : "tours.new_page_title");
    var html = '<a href="#/tours" class="adm-back">' + A.ic("arrow-left", 16) + " " + esc(T("sidebar.tours")) + "</a>" + A.head(title) + '<form id="tour-form" class="adm-tform" novalidate>';
    html += sec(T("form.main_info"),
      '<div class="adm-grid3">' + ml3(T("form.name_uz").replace(/\s*\(UZ\)/, ""), "title", S.title, "in", true) + "</div>" +
      field(T("form.slug"), inp("slug", S.slug, { req: true, dis: S.isEdit }) + (S.isEdit ? '<small class="adm-muted">' + esc(T("form.slug_hint")) + "</small>" : "")) +
      '<div class="adm-grid3">' + ml3(T("form.short_desc_uz").replace(/\s*\(UZ\)/, ""), "short", S.short, "ta") + "</div>" +
      '<div class="adm-grid3">' + ml3(T("form.full_desc_uz").replace(/\s*\(UZ\)/, ""), "desc", S.desc, "ta") + "</div>");
    html += sec(T("form.price_params"),
      '<div class="adm-grid3">' + field(T("form.category"), inp("category", S.category, { req: true, ph: T("form.category_placeholder") })) +
      field(T("form.duration_days"), inp("duration_days", S.duration_days, { type: "number", t: "num", min: 0 })) + field(T("form.duration_nights"), inp("duration_nights", S.duration_nights, { type: "number", t: "num", min: 0 })) +
      field(T("form.max_group_size"), inp("max_group_size", S.max_group_size, { type: "number", t: "num", min: 0 })) + field(T("form.price"), inp("price", S.price, { type: "number", t: "num", min: 0, step: "any" })) +
      field(T("form.currency"), sel("currency", S.currency, [["USD", "USD"], ["UZS", "UZS"], ["EUR", "EUR"]])) +
      field(T("form.technical_level"), inp("technical_level", S.technical_level, { type: "number", t: "num", min: 1, max: 5 })) + field(T("form.min_age"), inp("min_age", S.min_age, { type: "number", t: "num", min: 0 })) +
      field(T("form.fitness_level"), inp("fitness_level", S.fitness_level, { type: "number", t: "num", min: 1, max: 5 })) + "</div>" +
      '<div class="adm-checks">' + check("is_featured", S.is_featured, T("form.is_featured")) + check("is_active", S.is_active, T("form.is_active")) + "</div>");
    html += sec(T("form.image_section"), '<div data-part="cover">' + partCover(S) + "</div>");
    html += sec(T("form.gallery"), "", "gallery");
    html += sec(T("form.geography"), '<p class="adm-muted sm">' + esc(T("form.geography_hint")) + '</p><div data-part-in="geo"></div>');
    html += sec(T("form.highlights"), '<p class="adm-muted sm">' + esc(T("form.list_hint")) + '</p><div class="adm-grid3">' + LANGS.map(function (l) { return field(T("form.highlights") + " (" + l.toUpperCase() + ")", '<textarea class="textarea" rows="5" data-p="txt.highlights.' + l + '">' + esc(S.txt.highlights[l]) + "</textarea>"); }).join("") + "</div>");
    html += sec(T("form.included"), '<p class="adm-muted sm">' + esc(T("form.list_hint")) + '</p><div class="adm-grid3">' + LANGS.map(function (l) { return field(T("form.included_label") + " (" + l.toUpperCase() + ")", '<textarea class="textarea" rows="5" data-p="txt.included.' + l + '">' + esc(S.txt.included[l]) + "</textarea>"); }).join("") + "</div>" +
      '<div class="adm-grid3">' + LANGS.map(function (l) { return field(T("form.excluded_label") + " (" + l.toUpperCase() + ")", '<textarea class="textarea" rows="5" data-p="txt.excluded.' + l + '">' + esc(S.txt.excluded[l]) + "</textarea>"); }).join("") + "</div>");
    html += sec(T("form.pricing_options"), "", "pricing");
    html += sec(T("form.route_points"), "", "route");
    html += sec(T("form.faqs"), "", "faqs");
    html += '<div class="adm-savebar"><a class="btn btn-outline" href="#/tours">' + esc(T("form.cancel")) + '</a><button class="btn btn-primary" type="submit" id="tf-save">' + esc(T(S.isEdit ? "form.save" : "form.create")) + "</button></div></form>";
    ctx.el.innerHTML = html;

    var form = ctx.el.querySelector("#tour-form");
    function mount(name, fn) {
      var host = form.querySelector('[data-part="' + name + '"]');
      if (!host) return;
      if (host.tagName === "SECTION") { var h = host.querySelector(".adm-h3"); var d = host.querySelector(".adm-body"); if (!d) { d = document.createElement("div"); d.className = "adm-body"; host.appendChild(d); } d.innerHTML = fn(S); }
      else host.innerHTML = fn(S);
    }
    function renderGeo() { form.querySelector('[data-part-in="geo"]').innerHTML = partGeo(S, countries, dests); }
    function renderAll() { mount("gallery", partGallery); mount("pricing", partPricing); mount("route", partRoute); mount("faqs", partFaqs); renderGeo(); }
    renderAll();
    A.bindImageFields(form);

    // ---- qiymatlarni state ga yozish
    function onInput(e) {
      var el = e.target, p = el.getAttribute && el.getAttribute("data-p");
      if (!p) { var iv = el.closest && el.closest("[data-img-val]"); return; }
      var t = el.getAttribute("data-t"), v;
      if (t === "bool") v = el.checked;
      else if (t === "num") v = el.value === "" ? 0 : Number(el.value);
      else if (t === "numnull") v = el.value === "" ? null : Number(el.value);
      else v = el.value;
      setPath(S, p, v);
      if (p === "title.uz" && !S.slugTouched) { S.slug = A.slugify(v); form.querySelector('[data-p="slug"]').value = S.slug; }
      if (p === "slug") S.slugTouched = true;
      if (/^route\.\d+\.type$/.test(p)) mount("route", partRoute);
    }
    form.addEventListener("input", onInput);
    form.addEventListener("change", function (e) {
      if (e.target.matches("select, input[type=checkbox]")) onInput(e);
      var gc = e.target.getAttribute("data-geo-c"), gd = e.target.getAttribute("data-geo-d");
      if (gc) {
        var i = S.country_ids.indexOf(gc);
        if (e.target.checked && i < 0) S.country_ids.push(gc);
        if (!e.target.checked && i > -1) {
          S.country_ids.splice(i, 1);
          S.destination_ids = S.destination_ids.filter(function (id) { var d = dests.filter(function (x) { return x.id === id; })[0]; return !d || d.country_id !== gc; });
        }
        renderGeo();
      }
      if (gd) {
        var j = S.destination_ids.indexOf(gd);
        if (e.target.checked && j < 0) S.destination_ids.push(gd);
        if (!e.target.checked && j > -1) S.destination_ids.splice(j, 1);
      }
      if (e.target.hasAttribute("data-gallery") && e.target.files.length) {
        var files = Array.prototype.slice.call(e.target.files); e.target.value = "";
        S._upl = true; mount("gallery", partGallery);
        files.reduce(function (pr, f) { return pr.then(function () { return A.upload(f).then(function (u) { S.images.push(u); }); }); }, Promise.resolve())
          .catch(function (er) { A.err(er, T("form.upload_error")); })
          .then(function () { S._upl = false; mount("gallery", partGallery); });
      }
    });
    form.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]"); if (!b) return;
      var a = b.getAttribute("data-act"), i = Number(b.getAttribute("data-i"));
      if (a === "add-faq") { S.faqs.push({ question: blank(), answer: blank() }); mount("faqs", partFaqs); }
      else if (a === "rm-faq") { S.faqs.splice(i, 1); mount("faqs", partFaqs); }
      else if (a === "add-pr") { S.pricing.push({ type: "group", label: blank(), price: 0, currency: "USD", min_people: 1, max_people: null }); mount("pricing", partPricing); }
      else if (a === "rm-pr") { S.pricing.splice(i, 1); mount("pricing", partPricing); }
      else if (a === "add-rp") { S.route.push({ order: S.route.length + 1, type: b.getAttribute("data-type"), name: blank(), address: blank(), activity_type: "", duration_minutes: null, has_extra_fee: false, latitude: null, longitude: null }); mount("route", partRoute); }
      else if (a === "rm-rp") { S.route.splice(i, 1); mount("route", partRoute); }
      else if (a === "up" || a === "down") { var j = i + (a === "up" ? -1 : 1); if (j >= 0 && j < S.route.length) { var tmp = S.route[i]; S.route[i] = S.route[j]; S.route[j] = tmp; mount("route", partRoute); } }
      else if (a === "rm-img") { S.images.splice(i, 1); mount("gallery", partGallery); }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var cover = form.querySelector('[data-part="cover"] [data-img-val]').value;
      var payload = {
        title: S.title, short_description: S.short, description: S.desc, category: S.category,
        duration_days: Number(S.duration_days), duration_nights: Number(S.duration_nights), price: Number(S.price), currency: S.currency,
        cover_image: cover, max_group_size: Number(S.max_group_size), is_featured: S.is_featured, is_active: S.is_active,
        country_ids: S.country_ids, destination_ids: S.destination_ids, itinerary: S.itinerary, images: S.images,
        technical_level: S.technical_level, min_age: S.min_age, fitness_level: S.fitness_level,
        highlights: {}, included: {}, excluded: {}, faqs: S.faqs, pricing_options: S.pricing,
        route_points: S.route.map(function (p, i) {
          var o = { order: i + 1, type: p.type, name: p.name, has_extra_fee: p.has_extra_fee };
          if (p.type !== "stop") o.address = p.address;
          if (p.type === "stop" && p.activity_type) o.activity_type = p.activity_type;
          if (p.type === "stop" && p.duration_minutes) o.duration_minutes = Number(p.duration_minutes);
          if (p.latitude !== null) o.latitude = Number(p.latitude);
          if (p.longitude !== null) o.longitude = Number(p.longitude);
          return o;
        })
      };
      LANGS.forEach(function (l) {
        payload.highlights[l] = textList(S.txt.highlights[l]); payload.included[l] = textList(S.txt.included[l]); payload.excluded[l] = textList(S.txt.excluded[l]);
      });
      if (!S.isEdit) payload.slug = S.slug;
      var btn = form.querySelector("#tf-save"); btn.disabled = true; btn.textContent = T("form.saving");
      (S.isEdit ? DS.api.patch("/tours/" + S.id, payload) : DS.api.post("/tours", payload)).then(function () {
        DS.toast.success(T(S.isEdit ? "form.update_success" : "form.create_success"));
        A.go("#/tours");
      }).catch(function (er) { A.err(er, T("form.save_error")); btn.disabled = false; btn.textContent = T(S.isEdit ? "form.save" : "form.create"); });
    });
  }

  function geo() {
    return Promise.all([DS.api.get("/countries"), DS.api.get("/destinations")]).then(function (r) { return [A.list(r[0]), A.list(r[1])]; });
  }
  A.page("tours/new", "tours", function (ctx) {
    A.load(ctx, geo, function (g) { renderForm(ctx, null, g[0], g[1]); });
  });
  A.page("tours/edit/:slug", "tours", function (ctx) {
    A.load(ctx, function () {
      return Promise.all([DS.api.get("/tours/" + encodeURIComponent(ctx.params.slug)), geo()]).then(function (r) { return [r[0], r[1][0], r[1][1]]; });
    }, function (r) {
      if (!r[0] || !r[0].id) { ctx.el.innerHTML = A.errorBox(T("tours.not_found")); return; }
      renderForm(ctx, r[0], r[1], r[2]);
    });
  });
})();
