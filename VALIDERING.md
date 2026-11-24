# Validering före bygge

Ingen separat agent fanns tillgänglig i den här körningen (ingen delegate_task i verktygslistan),
så go/no-go gjordes mot de tre frågorna i uppdraget och mot kravlistan i `childrens-game-design`.
Underlaget är konceptet och testplanen i `KONCEPT.md` samt katalogens faktiska celler
(admin-`list_apps`: ingen app tränar MA.1-3.4.1).

**(a) Skulle ett barn frivilligt spela det i 5 minuter?**
Ja, med tre förbehåll som är inbyggda: (1) rundan är åtta uppgifter och tar 3–5 minuter, (2) varje
svar ger en synlig konsekvens – nötterna räknas upp i påsen – så uppgiften känns som en gåta och
inte som ett prov, (3) nivå 3 byter från "svara på frågan" till "peka på rätt påse", vilket är den
enda variationen ett barn i åk 1–3 behöver för att stanna en runda till. Risken är att nivå 1–2 är
för lätta för en 9-åring; det är därför nivåstegringen sker vid 6 rätt och nivå 3 även kräver
jämförelse av två påsar.

**(b) Träffar det ett verkligt kunskapskrav?**
Ja. MA.1-3.4.1 "Slumpmässiga händelser i konkreta situationer" är ordagrant hämtat ur
`get_curriculum`, och appens hela mekanik är just en konkret slumpmässig händelse (dra en nöt ur en
påse) där barnet ska resonera om utfallet. MA.1-3.1.1 tillkommer eftersom barnet måste hålla reda på
antal och jämföra antal i nivå 3. Ingen annan app i katalogen har MA.1-3.4.1 länkat, och
sannolikhet/statistik är en tunn cell för åk 1–3.

**(c) Teknisk risk?**
Låg. Ingen fysik, ingen realtid, ingen nätverksåtkomst: en ren uppgiftsgenerator, SVG som ritas om
per uppgift och WebAudio/talsyntes bakom guard. Det som kan gå fel är layouten (löst med två
viewBoxar, en för liggande och en för stående) och att texten i frågebubblan klipps (löst med
breddmätning och krympning, samma lösning som i Kotten och diagrammet). `verify.mjs` räknar om
90 000 uppgifter mot påsens egen data, så faktafelet "rätt svar stämmer inte med påsen" kan inte gå
ut obemärkt.

**Beslut: GO.**