// Kontrollerar uppgiftsgeneratorn i public/app.js mot påsens egen data:
//  – nivå 1 och 2: rätt svar är en funktion av innehållet (bara den frågade färgen = säkert,
//    ingen av den = omöjligt, båda = kanske), påsen har 5–8 nötter av bara röd/blå,
//    frågetexten nämner färgen och förklaringen räknar rätt,
//  – nivå 3: två påsar med lika många nötter och olika många av den frågade färgen,
//    rätt svar är den påse som har flest av färgen,
//  – alla nivåer: förklaringen stämmer med påsens innehåll.
//   node verify.mjs
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("./public/app.js", import.meta.url), "utf8");
const start = src.indexOf("var FARG = {");
const end = src.indexOf("* 2. Kotten");
if (start < 0 || end < 0) throw new Error("hittar inte den rena generatorn i app.js");
const ren = src.slice(start, src.lastIndexOf("/*", end));
const G = eval("(function(){" + ren + "\nreturn {uppgift:uppgift, SVAR:SVAR, FARG:FARG, rakna:rakna, svarFor:svarFor};})()");

let seed = 20261124;
Math.random = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

let fel = 0;
const kolla = (c, m, p) => { if (!c) { fel++; if (fel <= 25) console.log("FEL", m, JSON.stringify(p)); } };
const antal = { 1: 0, 2: 0, 3: 0 };
const typer = { 1: new Set(), 2: new Set(), 3: new Set() };
const svar = { 1: new Set(), 2: new Set(), 3: new Set() };
const IDS = G.SVAR.map(s => s.id);

for (let k = 0; k < 30000; k++) {
  for (const niva of [1, 2, 3]) {
    const p = G.uppgift(niva);
    antal[niva]++; typer[niva].add(p.typ); svar[niva].add(p.ratt);

    kolla(p.niva === niva, "fel nivå", p.niva);
    kolla(["rod", "bla"].includes(p.farg), "okänd frågefärg", p.farg);
    kolla(IDS.includes(p.ratt) || p.typ === "bagval", "okänt svar", p.ratt);
    kolla(typeof p.fragaText === "string" && p.fragaText.length > 20 && p.fragaText.endsWith("?"), "dålig fråga", p.fragaText);
    kolla(p.fragaText.includes(G.FARG[p.farg].namn), "frågan nämner inte färgen", p.fragaText);
    kolla(typeof p.text === "string" && p.text.length > 12, "saknar förklaring", p.text);
    kolla(/[0-9]/.test(p.text), "förklaringen saknar antal", p.text);

    if (p.typ === "kort") {
      const n = p.notter.length;
      kolla(Array.isArray(p.notter) && n >= 5 && n <= 8, "påsen har fel antal nötter", n);
      kolla(p.notter.every(f => f === "rod" || f === "bla"), "okänd färg i påsen", p.notter);
      const ratt = G.svarFor(p.notter, p.farg);
      kolla(p.ratt === ratt, "svaret stämmer inte med innehållet", { notter: p.notter, farg: p.farg, ratt: p.ratt, borde: ratt });
      const av = G.rakna(p.notter, p.farg);
      if (p.ratt === "sakert") kolla(av === n, "säkert men inte alla", p);
      if (p.ratt === "omojligt") kolla(av === 0, "omöjligt men färgen finns", p);
      if (p.ratt === "kanske") kolla(av > 0 && av < n, "kanske men bara en färg", p);
      // förklaringen ska räkna rätt: antalet nötter av frågans färg nämns
      if (p.ratt === "kanske") {
        kolla(p.text.includes(String(av)), "förklaringen nämner fel antal", p.text);
        kolla(p.text.includes(String(n - av)), "förklaringen nämner inte andra färgen", p.text);
      }
      if (niva === 1) kolla(new Set(p.notter).size === 1, "nivå 1 ska bara ha en färg", p.notter);
      if (niva === 2 && new Set(p.notter).size === 2) kolla(p.ratt === "kanske", "blandad påse ska ge kanske", p);
    }

    if (p.typ === "bagval") {
      kolla(niva === 3, "bagval utanför nivå 3", p.niva);
      kolla(Array.isArray(p.pasar) && p.pasar.length === 2, "nivå 3 ska ha två påsar", p.pasar && p.pasar.length);
      const [a, b] = p.pasar;
      kolla(a.length === b.length, "påsarna har olika många nötter", [a.length, b.length]);
      kolla(a.length === 6, "påsarna ska ha sex nötter", a.length);
      kolla([...a, ...b].every(f => f === "rod" || f === "bla"), "okänd färg i påse", [a, b]);
      const avA = G.rakna(a, p.farg), avB = G.rakna(b, p.farg);
      kolla(avA !== avB, "lika många av färgen – ingen vinnare", { a, b, farg: p.farg });
      kolla(p.ratt === (avA > avB ? 0 : 1), "rätt påse är inte den med flest", { avA, avB, ratt: p.ratt });
      kolla(p.text.includes(String(Math.max(avA, avB))), "förklaringen nämner fel antal", p.text);
      kolla(p.text.includes(p.ratt === 0 ? "ett" : "två"), "förklaringen nämner fel påse", p.text);
    }
  }
}

kolla(typer[1].has("kort"), "nivå 1 ska svara med kort");
kolla(typer[3].has("bagval"), "nivå 3 ska välja påse");
kolla(svar[1].has("sakert") && svar[1].has("omojligt"), "nivå 1 ska ge både säkert och omöjligt: " + [...svar[1]]);
kolla(svar[2].has("kanske"), "nivå 2 ska ge kanske");
kolla(G.SVAR.length === 3 && new Set(IDS).size === 3, "svarskorten ska vara tre unika");
kolla(G.SVAR.map(s => s.ord).join() === "Säkert,Kanske,Omöjligt", "svarskortens ord och ordning");

for (const niva of [1, 2, 3]) console.log("nivå " + niva + ":", antal[niva], "uppgifter, typer:", [...typer[niva]].join("+"), "svar:", [...svar[niva]].join("+"));
console.log(fel === 0 ? "OK – 0 fel" : fel + " FEL");
process.exit(fel === 0 ? 0 : 1);