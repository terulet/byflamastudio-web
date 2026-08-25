/**
 * Activitat d'estudi: dues xifres que no volen dir el mateix.
 *
 * La **ratxa** compta dies seguits amb l'objectiu diari **complet**. És una
 * xifra exigent a propòsit: serveix per sostenir un hàbit, i per això es trenca.
 *
 * Els **dies estudiats** compten dies amb alguna resposta, seguits o no. Aquesta
 * no es trenca mai, perquè un dia que vas estudiar ja no el pots desestudiar.
 *
 * Fins ara l'app només ensenyava la primera, i etiquetada només com a «Ratxa».
 * Qui estudiava cinc preguntes d'un objectiu de deu veia «Ratxa · 0 dies»
 * l'endemà i no veia res més: el seu dia no existia enlloc. Les dues xifres
 * juntes són el que passa de debò, i el nom de cada una diu què mesura.
 *
 * Cap de les dues bloqueja res ni castiga ningú: són informació, no una nota.
 */

/**
 * Dies amb activitat, comptats del registre diari.
 *
 * Es compta la clau amb almenys una resposta, no el valor: dues sessions el
 * mateix dia són un dia. El registre no s'esporga mai, així que això és
 * l'històric sencer i no només la finestra que ensenya el calendari.
 */
export function daysStudied(dailyCounts: Readonly<Record<string, number>>): number {
  let days = 0
  for (const count of Object.values(dailyCounts)) {
    if (count > 0) days++
  }
  return days
}
