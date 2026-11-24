# Kotten och påsen

Säkert, kanske eller omöjligt – matematik åk 1–3 (Lgr22 MA.1-3.4.1, MA.1-3.1.1).

Kotten har en påse med röda och blå nötter och drar en nöt utan att titta. Barnet tittar i påsen
och avgör om det är säkert, kanske eller omöjligt att nöten har en viss färg:

1. **Nivå 1** – påsen har bara en färg. Frågan gäller antingen den färgen (säkert) eller den som
   inte finns (omöjligt).
2. **Nivå 2** – oftast båda färgerna (kanske), ibland bara en, så att barnet måste titta i påsen
   varje gång i stället för att gissa på föregående svar.
3. **Nivå 3** – två påsar med lika många nötter och olika många av den frågade färgen. Barnet
   trycker på påsen där chansen är störst, alltså måste hen jämföra i stället för att räkna det
   största antalet.

Frågan skrivs ut **och** läses upp på svenska; svarskorten har egen form och färg (grön bock, gult
frågetecken, rött kryss). Fel svar kostar inget – efter två försök lyser rätt kort och rundan går
vidare. Åtta uppgifter per runda, stjärnor och "en runda till". Efter varje svar visas hur många
nötter av varje färg påsen innehöll ("4 röda · 2 blå").

## Filer

```
public/index.html      appen (startskärm med läroplansruta, spel, överlägg)
public/app.js          uppgiftsgenerator (ren funktion) + SVG-ritning + ljud
public/styles.css      Kotten-familjens färger
public/kort.png        1200×900 spelmoment (kortbild till katalogen)
kit.py                 appikoner, favicon, og.png, manifest, robots, sitemap
verify.mjs             räknar om 90 000 uppgifter mot påsens egen data
```

## Test

```
node verify.mjs     # 0 fel = varje svar stämmer med påsens innehåll
```

Rikt browser-test: `python3 -m http.server` i `public/`, sedan touch-events på korten och påsarna
(se KONCEPT.md, testplanen). 0 px scroll i 1024×768, 768×1024, 390×844 och 1440×900.

## Iteration efter test

1. Nivå 3 ritade först även de tre korten (säkert/kanske/omöjligt) under påsarna – de var både
   överflödiga och farliga, eftersom ett tryck på "Säkert" råkade välja påse ett. Nu ritas inga kort
   i nivå 3; påsarna är svarsknapparna.
2. Påsen var nästan vit mot pappret och gick inte att se som en behållare. Nu är den
   kraftpappersfärgad med tydlig kant.
3. I stående läge blev två påsar sida vid sida 246 px breda med 714 px höjd (tom påse, små nötter).
   Nu staplas de i stället, 528 px breda och 349 px höga var.