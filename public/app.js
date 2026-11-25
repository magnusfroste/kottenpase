/* Kotten och påsen – säkert, kanske, omöjligt.
   Statisk app, inga beroenden. Tränar MA.1-3.4.1 (slumpmässiga händelser i konkreta
   situationer) och MA.1-3.1.1 (antal och ordning).
   Frågan skrivs OCH läses upp på svenska. Allt ritas i kod: påsen, nötterna och Kotten
   i SVG, ljud i WebAudio och talsyntes. Uppgiftsgeneratorn är en ren funktion som
   verify.mjs kör, och svaret räknas alltid fram ur påsens eget innehåll. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * 1. Ren uppgiftsgenerator                                            *
   * ------------------------------------------------------------------ */
  var FARG = {
    rod: { namn: "röd", farg: "#c9503f", mork: "#8f3527" },
    bla: { namn: "blå", farg: "#3f6fbf", mork: "#2a4c85" }
  };
  var SVAR = [
    { id: "sakert", ord: "Säkert", farg: "#2f7d5a" },
    { id: "kanske", ord: "Kanske", farg: "#c98a1b" },
    { id: "omojligt", ord: "Omöjligt", farg: "#c0503f" }
  ];

  function heltal(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function blanda(a) {
    var i, j, t;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function slumpa(l) { return l[heltal(0, l.length - 1)]; }
  function bygg(farg, antal) {
    var ut = [], i;
    for (i = 0; i < antal; i++) ut.push(farg);
    return ut;
  }
  function rakna(notter, farg) {
    var n = 0, i;
    for (i = 0; i < notter.length; i++) if (notter[i] === farg) n++;
    return n;
  }
  /* Svaret är alltid en funktion av påsens innehåll – aldrig av slumpen. */
  function svarFor(notter, farg) {
    var n = rakna(notter, farg);
    if (n === notter.length) return "sakert";
    if (n === 0) return "omojligt";
    return "kanske";
  }
  function forklaring(notter, farg, svar) {
    var n = rakna(notter, farg), andra = notter.length - n;
    if (svar === "sakert") return "Alla " + notter.length + " nötter är " + FARG[farg].namn + ". Då är det säkert.";
    if (svar === "omojligt") return "Ingen av de " + notter.length + " nötterna är " + FARG[farg].namn + ". Då är det omöjligt.";
    return n + " " + FARG[farg].namn + (n === 1 ? "" : "a") + " och " + andra + " " +
      FARG[farg === "rod" ? "bla" : "rod"].namn + (andra === 1 ? "" : "a") +
      ". Då är det kanske.";
  }

  function uppgift(niva) {
    niva = niva === 2 || niva === 3 ? niva : 1;
    var farg, notter, svar;

    /* ---- Nivå 1: påsen har bara en färg. Frågan gäller antingen den
       färgen (säkert) eller den som inte finns (omöjligt). ---- */
    if (niva === 1) {
      var enda = slumpa(["rod", "bla"]);
      var antal = heltal(5, 6);
      notter = blanda(bygg(enda, antal));
      farg = Math.random() < 0.5 ? enda : (enda === "rod" ? "bla" : "rod");
      svar = svarFor(notter, farg);
      return {
        niva: 1, typ: "kort", notter: notter, farg: farg, ratt: svar,
        fragaText: "Kotten drar en nöt utan att titta. Blir den " + FARG[farg].namn + "?",
        text: forklaring(notter, farg, svar)
      };
    }

    /* ---- Nivå 2: oftast blandad påse (kanske), ibland bara en färg, så
       att barnet måste titta i påsen varje gång i stället för att gissa. ---- */
    if (niva === 2) {
      var tot2 = heltal(6, 8);
      if (Math.random() < 0.3) {
        var bara = slumpa(["rod", "bla"]);
        notter = blanda(bygg(bara, tot2));
      } else {
        var roda = heltal(1, tot2 - 1);
        notter = blanda(bygg("rod", roda).concat(bygg("bla", tot2 - roda)));
      }
      farg = slumpa(["rod", "bla"]);
      svar = svarFor(notter, farg);
      return {
        niva: 2, typ: "kort", notter: notter, farg: farg, ratt: svar,
        fragaText: "Kotten drar en nöt utan att titta. Blir den " + FARG[farg].namn + "?",
        text: forklaring(notter, farg, svar)
      };
    }

    /* ---- Nivå 3: två påsar med lika många nötter, olika många av den
       frågade färgen. Barnet trycker på påsen med störst chans. ---- */
    var tot3 = 6, roda3 = heltal(0, tot3);
    var roda4;
    do { roda4 = heltal(0, tot3); } while (roda4 === roda3);
    farg = slumpa(["rod", "bla"]);
    var par = [
      blanda(bygg("rod", roda3).concat(bygg("bla", tot3 - roda3))),
      blanda(bygg("rod", roda4).concat(bygg("bla", tot3 - roda4)))
    ];
    var antalA = rakna(par[0], farg), antalB = rakna(par[1], farg);
    if (antalA === antalB) {
      /* kan bara hända om färgerna är spegelvända – byt frågefärg */
      farg = farg === "rod" ? "bla" : "rod";
      antalA = rakna(par[0], farg); antalB = rakna(par[1], farg);
    }
    var ratt3 = antalA > antalB ? 0 : 1;
    return {
      niva: 3, typ: "bagval", pasar: par, farg: farg, ratt: ratt3,
      fragaText: "I vilken påse är chansen störst att få en " + FARG[farg].namn + " nöt?",
      text: "Påse " + (ratt3 === 0 ? "ett" : "två") + " har " + Math.max(antalA, antalB) +
        " " + FARG[farg].namn + (Math.max(antalA, antalB) === 1 ? "" : "a") + " av " + tot3 +
        ". Där är chansen störst."
    };
  }

  /* ------------------------------------------------------------------ *
   * 2. Kotten (egen SVG, fem uttryck – samma figur som i familjen)       *
   * ------------------------------------------------------------------ */
  function kottenSvg(uttryck, klass) {
    var F = "#b07d4b", M = "#8a5f36", O = "#2b2118", mun, ogen = "", extra = "";
    if (uttryck === "hejar") { mun = '<path d="M22 36 q8 8 16 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    else if (uttryck === "firar") {
      mun = '<path d="M21 34 q9 12 18 0" fill="#fff"/><path d="M21 34 q9 12 18 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>';
      extra = '<path d="M10 12 l3 6M50 12 l-3 6M30 6 v5" stroke="#e8a33d" stroke-width="2.2" stroke-linecap="round" fill="none"/>';
    }
    else if (uttryck === "tanker") { mun = '<path d="M24 37 h11" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round" fill="none"/>'; ogen = '<circle cx="46" cy="24" r="4" fill="none" stroke="' + M + '" stroke-width="1.6" opacity=".5"/>'; }
    else if (uttryck === "funderar") { mun = '<path d="M22 38 q8 -6 16 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    else { mun = '<path d="M22 34 q8 8 16 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    var oga = '<circle cx="23" cy="24" r="5.2" fill="#fff"/><circle cx="37" cy="24" r="5.2" fill="#fff"/>' +
      '<circle cx="24" cy="24.6" r="2.5" fill="' + O + '"/><circle cx="36" cy="24.6" r="2.5" fill="' + O + '"/>';
    return '<svg class="' + (klass || "kotten-svg") + '" viewBox="0 0 60 60" aria-hidden="true">' + extra +
      '<path d="M30 6 q9 4 12 12 q9 12 4 24 q-4 12 -16 14 q-12 -2 -16 -14 q-5 -12 4 -24 q3 -8 12 -12z" fill="' + F + '"/>' +
      '<path d="M19 20 q11 -5 22 0M16 30 q14 -5 28 0M16 40 q14 -4 28 0" stroke="' + M + '" stroke-width="1.7" fill="none" opacity=".85" stroke-linecap="round"/>' +
      oga + ogen + mun + '</svg>';
  }

  /* ------------------------------------------------------------------ *
   * 3. Ljud (WebAudio + talsyntes, skapas vid första gesten)             *
   * ------------------------------------------------------------------ */
  var ac = null, ljudPa = true;
  function ljud(frekvens, langd, typ) {
    if (!ljudPa) return;
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = typ || "sine"; o.frequency.value = frekvens;
      g.gain.value = 0.001; o.connect(g); g.connect(ac.destination);
      var t = ac.currentTime;
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + langd);
      o.start(t); o.stop(t + langd + 0.02);
    } catch (e) { }
  }
  function sag(text) {
    if (!ljudPa) return;
          try { if (window.__rost && window.__rost(text, true)) return; } catch (e) { }
    try {
      if (!("speechSynthesis" in window) || !text) return;
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "sv-SE"; u.rate = 0.95; u.volume = 0.9;
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    } catch (e) { }
  }
  function spar(namn, varde) { try { if (window.skolappar && window.skolappar.event) window.skolappar.event(namn, varde); } catch (e) { } }

  /* ------------------------------------------------------------------ *
   * 4. Figurerna, ritade i kod                                          *
   * ------------------------------------------------------------------ */
  function not(cx, cy, r, farg) {
    var f = FARG[farg] || FARG.rod;
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + f.farg + '" stroke="' + f.mork + '" stroke-width="' + (r * 0.16) + '"/>' +
      '<path d="M' + (cx - r * 0.42) + ',' + (cy - r * 0.42) + ' a' + (r * 0.6) + ',' + (r * 0.6) + ' 0 0 1 ' + (r * 0.5) + ',-' + (r * 0.1) + '" fill="none" stroke="#fff" stroke-width="' + (r * 0.16) + '" stroke-linecap="round" opacity=".45"/>';
  }

  /* Påsen: en öppen påse med rund botten, nötterna i rader så att de går att räkna. */
  function pase(x, y, w, h, notter) {
    var h2 = [], i, n = notter.length;
    var toppB = w * 0.66, topp = y + h * 0.10, bot = y + h;
    var v = toppB / 2, xm = x + w / 2;
    h2.push('<path d="M' + (xm - v) + ',' + topp + ' L' + (xm + v) + ',' + topp +
      ' L' + (x + w * 0.94) + ',' + (bot - h * 0.10) + ' Q' + (x + w * 0.96) + ',' + bot + ' ' + (x + w * 0.82) + ',' + bot +
      ' L' + (x + w * 0.18) + ',' + bot + ' Q' + (x + w * 0.04) + ',' + bot + ' ' + (x + w * 0.06) + ',' + (bot - h * 0.10) + ' Z" fill="#f6e7d2" stroke="#c9b393" stroke-width="4"/>');
    h2.push('<path d="M' + (xm - v) + ',' + topp + ' q' + v + ',-' + (h * 0.05) + ' ' + (2 * v) + ',0" fill="none" stroke="#c9b393" stroke-width="5" stroke-linecap="round"/>');
    var perRad = 3, rader = Math.ceil(n / perRad);
    var inW = w * 0.70, inH = h * 0.60, y0 = topp + h * 0.17;
    var rr = Math.min(inW / (perRad * 2.5), inH / (rader * 2.3));
    var radH = rr * 2.3;
    var blockH = rader * radH;
    var startY = y0 + Math.max(0, (inH - blockH) / 2) + radH / 2;
    for (i = 0; i < n; i++) {
      var k = Math.floor(i / perRad), j = i % perRad;
      var iRaden = Math.min(perRad, n - k * perRad);
      var radW = (iRaden - 1) * rr * 2.5;
      var cx = xm - radW / 2 + j * rr * 2.5;
      var cy = startY + k * radH;
      h2.push(not(cx, cy, rr, notter[i]));
    }
    return h2.join("");
  }

  /* ------------------------------------------------------------------ *
   * 5. Ritningen                                                        *
   * ------------------------------------------------------------------ */
  var RUNDA = 8;
  var S = {
    skarm: "start", niva: 1, runda: 1, item: 0, svarRatt: 0, stjarnor: 0,
    fel: 0, p: null, klar: false, visaRatt: false, sistaVal: -1
  };

  function layoutFor(el) {
    var r = el.getBoundingClientRect();
    if (r.width && r.height && r.width < r.height * 0.95) {
      return {
        vb: [660, 980], liggande: false,
        fraga: { x: 24, y: 26, w: 612, h: 146 },
        pase: { x: 40, y: 196, w: 580, h: 352 },
        knapp: { y: 562, h: 132, w: 612, gap: 8, kolumn: true, storlek: 34 }
      };
    }
    return {
      vb: [900, 560], liggande: true,
      fraga: { x: 24, y: 14, w: 852, h: 92 },
      pase: { x: 60, y: 116, w: 780, h: 316 },
      knapp: { y: 452, h: 88, w: 250, gap: 18, kolumn: false, storlek: 28 }
    };
  }

  /* Frågebubbla: nöt i frågans färg + texten (texten finns även skriven, eftersom
     klassrumsplattor ofta är ljudlösa). */
  function fragaRit(L, p) {
    var b = L.fraga, h = [];
    h.push('<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" rx="' + (L.liggande ? 22 : 28) + '" fill="#fff" stroke="var(--linje)" stroke-width="3"/>');
    var cx = b.x + (L.liggande ? 62 : 70), cy = b.y + b.h / 2;
    h.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + (L.liggande ? 40 : 46) + '" fill="color-mix(in srgb, ' + FARG[p.farg].farg + ' 13%, #fff)"/>');
    h.push(not(cx, cy, L.liggande ? 22 : 26, p.farg));
    var textX = b.x + (L.liggande ? 118 : 132);
    var tillganglig = (b.x + b.w - 22) - textX;
    var fs = L.liggande ? 30 : 32, rader = [];
    for (var försök = 0; försök < 8; försök++) {
      var perRad = Math.max(8, Math.floor(tillganglig / (fs * 0.60)));
      var ord = p.fragaText.split(" "), nu = "";
      rader = [];
      ord.forEach(function (o) {
        if ((nu + " " + o).trim().length <= perRad) nu = (nu + " " + o).trim();
        else { if (nu) rader.push(nu); nu = o; }
      });
      if (nu) rader.push(nu);
      if (rader.length * fs * 1.14 <= b.h - 18) break;
      fs -= 2;
    }
    var blockH = rader.length * fs * 1.14;
    var yStart = b.y + (b.h - blockH) / 2 + fs * 0.9;
    rader.forEach(function (r, k) {
      h.push('<text x="' + textX + '" y="' + (yStart + k * fs * 1.14) + '" font-size="' + fs + '" font-weight="700" fill="var(--bläck)">' + r + '</text>');
    });
    return h.join("");
  }

  function glyf(id, cx, cy, r) {
    if (id === "sakert") {
      return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#2f7d5a"/>' +
        '<path d="M' + (cx - r * 0.46) + ',' + (cy + r * 0.02) + ' l' + (r * 0.32) + ',' + (r * 0.36) + ' l' + (r * 0.62) + ',-' + (r * 0.78) + '" fill="none" stroke="#fff" stroke-width="' + (r * 0.30) + '" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    if (id === "kanske") {
      return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#c98a1b"/>' +
        '<text x="' + cx + '" y="' + (cy + r * 0.44) + '" text-anchor="middle" font-size="' + (r * 1.5) + '" font-weight="800" fill="#fff">?</text>';
    }
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#c0503f"/>' +
      '<path d="M' + (cx - r * 0.42) + ',' + (cy - r * 0.42) + ' l' + (r * 0.84) + ',' + (r * 0.84) + ' M' + (cx + r * 0.42) + ',' + (cy - r * 0.42) + ' l-' + (r * 0.84) + ',' + (r * 0.84) + '" stroke="#fff" stroke-width="' + (r * 0.30) + '" stroke-linecap="round"/>';
  }

  function knapparRit(L, p) {
    var k = L.knapp, h = [], i;
    var antal = SVAR.length;
    var totW = k.kolumn ? k.w : k.w * antal + k.gap * (antal - 1);
    var x0 = L.vb[0] / 2 - totW / 2;
    for (i = 0; i < antal; i++) {
      var s = SVAR[i];
      var x = k.kolumn ? x0 : x0 + i * (k.w + k.gap);
      var y = k.kolumn ? k.y + i * (k.h + k.gap) : k.y;
      var ratt = S.klar && S.visaRatt && s.id === p.ratt;
      var valt = S.sistaVal === i;
      h.push('<g class="svar-g' + (ratt ? ' ratt' : '') + (valt && !ratt ? ' fel' : '') + '" data-i="' + i + '" role="button" tabindex="0" aria-label="' + s.ord + '">');
      h.push('<rect class="svar-kort" x="' + x + '" y="' + y + '" width="' + k.w + '" height="' + k.h + '" rx="' + (L.liggande ? 20 : 22) + '" fill="' + (ratt ? s.farg : '#fff') + '" stroke="' + (ratt ? s.farg : 'var(--linje)') + '" stroke-width="3"/>');
      var gr = L.liggande ? 25 : 27;
      var gx = L.liggande ? x + 44 : x + 52, gy = y + k.h / 2;
      h.push(glyf(s.id, gx, gy, gr));
      h.push('<text x="' + (gx + gr + 16) + '" y="' + (gy + k.storlek * 0.35) + '" font-size="' + k.storlek + '" font-weight="800" fill="' + (ratt ? '#fff' : 'var(--bläck)') + '">' + s.ord + '</text>');
      h.push('</g>');
    }
    return h.join("");
  }

  function ritaScen() {
    var p = S.p, el = document.getElementById("scen");
    if (!p) return;
    var L = layoutFor(el), h = [], b = L.pase, i;
    h.push('<rect x="0" y="0" width="' + L.vb[0] + '" height="' + L.vb[1] + '" fill="var(--papper)"/>');
    h.push(fragaRit(L, p));

    if (p.typ === "bagval") {
      /* Liggande: två påsar sida vid sida. Stående: två påsar ovanpå varandra,
         så att varje påse blir bred nog att räkna nötterna i. */
      var gap = L.liggande ? 60 : 26;
      var tillganglig = (L.vb[1] - b.y) - 18;
      var bh = L.liggande ? tillganglig : (tillganglig - gap) / 2;
      var bw = L.liggande ? (b.w - gap) / 2 : b.w;
      for (i = 0; i < 2; i++) {
        var by = L.liggande ? b.y : b.y + i * (bh + gap);
        var bx = L.liggande ? b.x + i * (bw + gap) : b.x;
        var rattPase = S.klar && S.visaRatt && i === p.ratt;
        h.push('<g class="svar-g" data-i="' + i + '" role="button" tabindex="0" aria-label="påse ' + (i + 1) + '">');
        h.push('<rect class="svar-kort" x="' + (bx + 4) + '" y="' + (by - 4) + '" width="' + (bw - 8) + '" height="' + (bh + 8) + '" rx="24" fill="' + (rattPase ? 'color-mix(in srgb, var(--accent) 9%, #fff)' : '#fff') + '" stroke="' + (rattPase ? 'var(--accent)' : 'var(--linje)') + '" stroke-width="' + (rattPase ? 4 : 2) + '"/>');
        h.push(pase(bx + bw * 0.06, by + bh * 0.02, bw * 0.88, bh * 0.78, p.pasar[i]));
        if (S.klar || S.visaRatt) {
          var n = rakna(p.pasar[i], p.farg);
          h.push('<text x="' + (bx + bw / 2) + '" y="' + (by + bh * 0.96) + '" text-anchor="middle" font-size="' + (L.liggande ? 28 : 30) + '" font-weight="800" fill="' + FARG[p.farg].farg + '">' + n + ' ' + FARG[p.farg].namn + (n === 1 ? '' : 'a') + ' av ' + p.pasar[i].length + '</text>');
        }
        h.push('</g>');
      }
    } else {
      var pw = Math.min(b.w * (L.liggande ? 0.56 : 0.80), b.h * 0.80);
      var px = L.vb[0] / 2 - pw / 2;
      h.push(pase(px, b.y + b.h * 0.03, pw, b.h * 0.80, p.notter));
      if (S.klar || S.visaRatt) {
        var ro = rakna(p.notter, "rod"), bl = p.notter.length - ro;
        h.push('<text x="' + (L.vb[0] / 2) + '" y="' + (b.y + b.h * 0.985) + '" text-anchor="middle" font-size="' + (L.liggande ? 28 : 32) + '" font-weight="800" fill="var(--dämpad)">' +
          ro + ' röda · ' + bl + ' blå</text>');
      }
    }
    /* I nivå 3 är påsarna själva svarsknapparna – då ritas inga kort under. */
    if (p.typ !== "bagval") h.push(knapparRit(L, p));
    el.setAttribute("viewBox", "0 0 " + L.vb[0] + " " + L.vb[1]);
    el.innerHTML = h.join("");
  }

  function ritaPrickar() {
    var h = "", i;
    for (i = 0; i < RUNDA; i++) h += '<i class="' + (i < S.item ? "klar" : "") + '"></i>';
    document.getElementById("prickar").innerHTML = h;
  }
  function ritaStjarnor() {
    document.getElementById("stjarnor").textContent = "★".repeat(Math.min(S.stjarnor, 12)) + (S.stjarnor > 12 ? "+" : "");
  }
  function kottenByt(uttryck) {
    var el = document.getElementById("kotten");
    if (el) el.innerHTML = kottenSvg(uttryck, "kotten-svg");
  }

  /* ------------------------------------------------------------------ *
   * 6. Spelflöde                                                        *
   * ------------------------------------------------------------------ */
  var idleTimer = null;
  function startIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      if (S.skarm === "spel" && !S.klar && S.fel === 0) {
        sag(S.p.fragaText);
        spar("hint");
      }
    }, 12000);
  }

  function nyUppgift() {
    S.p = uppgift(S.niva);
    S.klar = false; S.fel = 0; S.visaRatt = false; S.sistaVal = -1;
    ritaScen(); ritaPrickar();
    sag(S.p.fragaText);
    startIdle();
  }

  function valj(i) {
    if (S.skarm !== "spel" || S.klar) return;
    var p = S.p, ratt;
    if (p.typ === "bagval") {
      if (i < 0 || i > 1) return;
      ratt = i === p.ratt;
    } else {
      if (i < 0 || i >= SVAR.length) return;
      ratt = SVAR[i].id === p.ratt;
    }
    clearTimeout(idleTimer);
    S.sistaVal = i;
    if (ratt) {
      S.klar = true; S.visaRatt = true; S.item++; S.svarRatt++; S.stjarnor++;
      ritaScen(); ritaPrickar(); ritaStjarnor();
      ljud(520, 0.12, "square");
      setTimeout(function () { ljud(780, 0.14, "sine"); }, 130);
      setTimeout(function () { ljud(1040, 0.18, "sine"); }, 260);
      sag("Rätt! " + p.text);
      kottenByt("firar");
      setTimeout(function () {
        kottenByt("glad");
        if (S.item >= RUNDA) rundaKlar(); else nyUppgift();
      }, 2600);
    } else {
      S.fel++;
      ritaScen();
      ljud(220, 0.16, "triangle");
      setTimeout(function () { ljud(170, 0.18, "triangle"); }, 150);
      kottenByt("funderar");
      if (S.fel >= 2) {
        S.visaRatt = true; S.klar = true;
        ritaScen();
        sag("Titta i påsen. " + p.text);
        kottenByt("tanker");
        setTimeout(function () {
          S.item++;
          kottenByt("glad");
          if (S.item >= RUNDA) rundaKlar(); else nyUppgift();
        }, 3400);
      } else {
        sag("Titta i påsen. " + p.fragaText);
        spar("hint");
        setTimeout(function () { ritaScen(); startIdle(); }, 600);
      }
    }
  }

  function rundaKlar() {
    S.skarm = "overlagg";
    var procent = Math.round(100 * S.svarRatt / RUNDA);
    spar("round_done", procent);
    sag("Rundan är klar. " + S.svarRatt + " av " + RUNDA + " rätt.");
    var stegUpp = S.svarRatt >= 6 && S.niva < 3;
    visaOverlay(S.svarRatt >= 6 ? "firar" : "hejar", "Rundan är klar!",
      S.svarRatt + " av " + RUNDA + " rätt. " + S.stjarnor + " stjärnor totalt." +
      (stegUpp ? " Nu blir det svårare!" : ""),
      "En runda till →", function () {
        if (stegUpp) { S.niva++; spar("level", S.niva); }
        S.runda++; startaRunda(S.niva);
      }, true);
  }

  function visaOverlay(uttryck, titel, text, knapptext, vidare, medNiva) {
    var ov = document.getElementById("overlay");
    document.getElementById("ov-bild").innerHTML = kottenSvg(uttryck, "ov-kotten");
    document.getElementById("ov-titel").textContent = titel;
    document.getElementById("ov-text").textContent = text;
    var b = document.getElementById("ov-nasta");
    b.textContent = knapptext;
    b.onclick = function () { ov.hidden = true; vidare(); };
    var n = document.getElementById("ov-niva");
    n.hidden = !medNiva;
    n.onclick = function () { ov.hidden = true; S.niva = S.niva >= 3 ? 1 : S.niva + 1; S.runda++; startaRunda(S.niva); };
    ov.hidden = false;
  }

  function startaRunda(niva) {
    S.niva = niva; S.skarm = "spel"; S.item = 0; S.svarRatt = 0; S.fel = 0; S.sistaVal = -1;
    document.getElementById("startskarm").hidden = true;
    document.getElementById("spel").hidden = false;
    document.getElementById("overlay").hidden = true;
    ritaStjarnor(); kottenByt("glad");
    spar("round_start"); spar("level", niva);
    if (niva === 2) setTimeout(function () { sag("Nu finns det både röda och blå nötter i påsen."); }, 900);
    if (niva === 3) setTimeout(function () { sag("Två påsar. Tryck på den påse där chansen är störst."); }, 900);
    nyUppgift();
  }

  function tipsa() {
    if (S.skarm !== "spel" || S.klar) return;
    sag(S.p.fragaText);
    spar("hint");
    kottenByt("tanker");
    setTimeout(function () { if (!S.klar) kottenByt("glad"); }, 1800);
  }

  /* ------------------------------------------------------------------ *
   * 7. Händelser och start                                              *
   * ------------------------------------------------------------------ */
  function ritaLjudIkon() {
    document.getElementById("ljudikon").innerHTML = ljudPa
      ? '<path d="M4 9h3l4-3v12l-4-3H4z"/><path d="M15 8a5 5 0 0 1 0 8"/>'
      : '<path d="M4 9h3l4-3v12l-4-3H4z"/><path d="M15 9l5 6M20 9l-5 6"/>';
  }

  function bind() {
    document.getElementById("scen").addEventListener("pointerdown", function (e) {
      var g = e.target.closest(".svar-g");
      if (g) { e.preventDefault(); valj(Number(g.dataset.i)); }
    });
    document.getElementById("spela").addEventListener("click", function () { ljud(600, 0.1); startaRunda(1); });
    document.getElementById("hjalp").addEventListener("click", tipsa);
    document.getElementById("ljud").addEventListener("click", function () {
      ljudPa = !ljudPa;
      if (!ljudPa && "speechSynthesis" in window) { try { window.speechSynthesis.cancel(); } catch (e) { } }
      ritaLjudIkon(); spar("sound_off");
    });
    document.addEventListener("keydown", function (e) {
      if (S.skarm !== "spel") return;
      if (e.key === "1" || e.key === "ArrowLeft") valj(0);
      if (e.key === "2" || e.key === "ArrowDown") valj(1);
      if (e.key === "3" || e.key === "ArrowRight") valj(2);
      if (e.key === "h" || e.key === "?") tipsa();
    });
    window.addEventListener("resize", function () { if (S.p) ritaScen(); });
  }

  function init() {
    bind(); ritaLjudIkon(); ritaStjarnor(); ritaPrickar();
    document.getElementById("kotten-hud").innerHTML = kottenSvg("glad", "kotten-hud");
    kottenByt("glad");
    window.__game = {
      S: S, uppgift: uppgift, SVAR: SVAR, valj: valj, rakna: rakna, svarFor: svarFor,
      startaRunda: startaRunda, nyUppgift: nyUppgift, tipsa: tipsa, ritaScen: ritaScen
    };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();