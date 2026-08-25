# sources/

Registre i còpies de les fonts oficials.

| Fitxer / directori | Què és | Es versiona a Git? |
| --- | --- | --- |
| `source-manifest.json` | Registre de totes les fonts: URL, organisme, dates, vigència i estat de còpia | **Sí** |
| `cache/` | Còpies baixades amb `npm run sources:download`, amb SHA-256 al manifest | No |
| `extracted/` | Text normalitzat generat amb `npm run sources:extract` | No |

`cache/` i `extracted/` són **prescindibles**: es poden esborrar i tornar a
generar, i la seva absència no trenca el build ni els tests. El manifest, en
canvi, és contingut del projecte.

Vegeu [`../CONTENT.md`](../CONTENT.md) per al procés complet i
[`../SOURCES.md`](../SOURCES.md) per a la llista llegible (fitxer generat).
