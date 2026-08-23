# Captures de QA visual

Generades amb `node scripts/smoke.mjs` sobre el build de producció, amb un
navegador real. L'script informa, a més, d'errors de consola, recursos 404 i
desbordaments horitzontals; l'última execució no en va detectar cap.

| Fitxer | Pantalla | Resolució |
| --- | --- | --- |
| `01-onboarding.png` | Onboarding | 393 × 852 |
| `02-inici.png` | Inici amb la missió diària | 393 × 852 |
| `03-ruta.png` | Ruta dels 40 temes en quatre blocs | 393 × 852 |
| `04-tema-lliso.png` | Detall de tema amb la microlliçó | 393 × 852 |
| `05-pregunta.png` | Pregunta abans de respondre | 393 × 852 |
| `06-correccio.png` | Correcció raonada amb font | 393 × 852 |
| `07-simulacres.png` | Simulacres amb les regles reals | 393 × 852 |
| `08-simulacre-en-curs.png` | Simulacre en curs amb temporitzador | 393 × 852 |
| `09-resultat-simulacre.png` | Resultat amb desglossament i revisió | 393 × 852 |
| `10-progres.png` | Progrés i semàfor per temes | 393 × 852 |
| `11-entrenar.png` | Modes d'entrenament i filtres | 393 × 852 |
| `12-ajustos-tema-clar.png` | Ajustos en tema clar | 393 × 852 |
| `13-inici-tema-clar.png` | Inici en tema clar | 393 × 852 |
| `14-mobil-estret-320.png` | Mòbil estret, sense desbordaments | 320 × 640 |
| `15-iphone-390x844.png` | iPhone | 390 × 844 |
| `16-tauleta-768x1024.png` | Tauleta | 768 × 1024 |
| `17-escriptori-1280x900.png` | Escriptori | 1280 × 900 |
| `18-simulacre-complet-prova-1.png` | Simulacre complet, prova 1 de 2 | 393 × 852 |
| `19-simulacre-complet-prova-2.png` | Simulacre complet, prova 2 de 2 | 393 × 852 |
| `20-simulacre-complet-resultat.png` | Resultat per proves, sense suma enganyosa | 393 × 852 |
| `21-pregunta-de-reserva.png` | Pregunta de reserva, anunciada i comptada a part | 393 × 852 |

Les captures es fan a escala 1 a propòsit: serveixen per revisar la interfície,
no per publicar-les, i a escala 2 el conjunt superava els 9 MB.

La barra de navegació inferior és `position: fixed`; a les captures de pàgina
sencera apareix a mitja imatge perquè el navegador la fixa a la finestra, no al
document. Al dispositiu queda sempre a baix.
