# Paquet offline d'actualitat 2026-08-24 — Policia Quest Roses

Segona versió del paquet, preparada després que el contenidor de Claude rebés `CONNECT 403` en les 19 fonts. Permet contrastar el contingut sense xarxa i sense rebaixar les garanties del projecte.

## Contingut

- `snapshots/`: 19 fitxers independents amb metadades i el text oficial que demostra cada resposta.
- `snapshots/SHA256SUMS.txt`: integritat individual de les 19 instantànies.
- `questions.candidates.json`: 25 preguntes corregides de quatre opcions.
- `sources.evidence.json`: índex auxiliar; no substitueix les instantànies.
- `PROMPT_CLAUDE_IMPORTA_ACTUALITAT_OFFLINE.md`: encàrrec complet d'adopció i importació offline.
- `validate-pack.mjs`: comprova hashes, estructura, referències i les 25 evidències textuals.
- `SHA256SUMS.txt`: integritat dels fitxers principals i del manifest d'instantànies.

## Cobertura

| Àmbit | Preguntes |
|---|---:|
| Roses | 8 |
| Catalunya | 6 |
| Espanya | 5 |
| UE, cultura i esport | 6 |
| **Total** | **25** |

## Estat probatori

Les preguntes continuen sent **candidates**, no contingut ja adoptat. Les dades es van contrastar el 24 d'agost de 2026 obrint fonts oficials. Claude ha de verificar-les contra els fitxers de `snapshots/`, adoptar aquests documents al cache i només llavors marcar la referència com a `verified`.

No es pot substituir una instantània insuficient per memòria, premsa, xarxes socials o una altra pàgina no oficial. Si el text preservat no demostra el fet, la pregunta queda fora del banc.

Validació ràpida: `node validate-pack.mjs`.

## Caducitat

Totes les preguntes declaren `dynamic: true` i `reviewBy`. La data és deliberadament conservadora: fa caducar el material quan deixa de ser actualitat útil, encara que el fet històric continuï sent cert. La presidència irlandesa del Consell de la UE caduca el 31 de desembre de 2026; la resta, entre gener i juny de 2027.
