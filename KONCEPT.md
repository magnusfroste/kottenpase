# Kotten och påsen – koncept

**Mål (en sak):** Barnet ska avgöra om en händelse är **säkert**, **kanske** eller **omöjligt**
att den inträffar, genom att titta på vad som faktiskt ligger i påsen.

**Målgrupp:** innehållet är åk 1–3 (6–9 år). Kan spelas utan att kunna läsa: frågan läses upp, de
tre svarskorten har egen form och färg (grön bock, gult frågetecken, rött kryss) och rätt kort lyser
efter två försök.

**Kärnmekanik (touch först):** En genomskinlig påse med 5–8 nötter i två färger (röda och blå) står
på skärmen. Frågan: "Kotten drar en nöt utan att titta. Blir den röd?" Barnet trycker på ett av tre
stora kort. Nivå 3 visar två påsar med lika många nötter och barnet trycker på den påse där chansen
är störst – alltså måste barnet jämföra, inte bara räkna det största antalet.

**5-minuterssession:** 8 uppgifter per runda, ungefär 3–5 minuter, "en runda till" och nivåstegring
vid 6 rätt.

**Belöning barnet kan berätta om:** stjärnor och "8 av 8 rätt" – och att Kotten drar en nöt ur påsen
och visar vad det blev när svaret var rätt.

**Vad barnet lär:** skillnaden mellan säkert, kanske och omöjligt; att slutsatsen måste bygga på
innehållet och inte på tur; att jämföra chans när helheten är lika stor.

**Lgr22 (ordagrant ur get_curriculum):**
- MA.1-3.4.1 Sannolikhet och statistik: "Slumpmässiga händelser i konkreta situationer."
- MA.1-3.1.1 Taluppfattning och tals användning: "Naturliga tal och deras egenskaper samt hur talen
  delas upp och används för att ange antal och ordning."

**Varför iPad:** hela uppgiften ryms på en skärm utan scroll, tre tryckytor på ≥ 88 px i liggande
och staplade helbreddskort i stående, inget som kräver att barnet håller kvar fingret.

**Källor:** Skolverket, läroplanen för grundskolan (Lgr22) via skolappar.com:s syllabus-API.
Inga andra faktapåståenden i appen – allt som sägs härleds ur påsens innehåll.

## Testplan (mätbara krav)

1. `node verify.mjs` – 90 000 uppgifter: rätt svar stämmer med påsens innehåll (säkert = bara den
   frågade färgen, omöjligt = ingen av den färgen, kanske = båda färgerna finns), nivå 3 har två
   påsar med lika många nötter och olika många av den frågade färgen, och svarskorten är alltid tre
   unika.
2. Spelbar med bara fingrar: hela rundan spelas med `Input.dispatchTouchEvent`
   (touchStart/touchEnd), inte klick; poäng, prickar, stjärnor och resultatruta kontrolleras.
3. `scrollHeight - innerHeight == 0` och `scrollWidth - innerWidth == 0` i 1024×768, 768×1024,
   390×844 och 1440×900, mätt **efter** att startskärmen stängts.
4. Svensk text i barnets nivå, frågan både skriven och uppläst; rätt/fel ger omedelbar återkoppling
   och ny chans; efter två fel lyser rätt kort utan förlust.
5. Ingen inloggning, ingen reklam, inga länkar ut, inga tredjepartsanrop förutom kodsnutten
   `kotten.js`.
6. Korrekt innehåll: alla påsar ritas ur uppgiftens egen data, aldrig ur en på förhand skriven text.