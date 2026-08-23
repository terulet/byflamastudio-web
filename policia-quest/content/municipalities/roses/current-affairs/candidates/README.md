# Candidats d'actualitat — paquet 2026-08-24

Aquesta carpeta conserva **la proposta tal com va arribar**, sense modificar-la:

- `questions.candidates.json` — 25 preguntes candidates.
- `sources.evidence.json` — fitxes de 19 fonts oficials.
- `SHA256SUMS.txt` — integritat dels dos fitxers anteriors.

Els hashes es van comprovar en rebre el paquet: **4/4 correctes** (els dos
fitxers d'aquí més el README i el prompt de l'encàrrec, que no es versionen
perquè no són contingut).

## Per què són aquí i no al banc

**Cap de les 25 s'ha importat.** L'encàrrec exigeix obrir cada URL oficial i
comprovar-hi el fet abans d'adoptar la pregunta, i des d'aquest entorn les 19
URL són inabastables: la política de sortida de xarxa respon 403 al CONNECT per
als vuit dominis implicats, tant amb `curl` com amb l'eina de fetch.

Sense poder obrir la font no hi ha verificació, i la regla del paquet és
explícita: una URL inaccessible implica excloure la pregunta. Substituir
l'evidència per memòria seria exactament el que aquest projecte no fa.

El detall pregunta a pregunta és a `artifacts/actualitat-decisio-2026-08-24.md`.

## Què cal fer amb això des d'una xarxa amb accés

```bash
python3 scripts/transcription/import_current_affairs.py --check   # obre les 19 URL i informa
python3 scripts/transcription/import_current_affairs.py           # importa només el que es demostra
npm run content:validate
```

L'importador no adopta res que no hagi pogut obrir i contrastar. Vegeu la seva
capçalera per al detall del que comprova.
