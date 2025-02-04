const { describe, it } = require('mocha')
const { parseToISO } = require('../lib/transform')

// Tests corrigés
describe('parseToISO', function () {
  it('devrait parser une date au format DD/MM/YYYY', function () {
    const result = parseToISO('15/02/2025', 'DD/MM/YYYY', 'en')
    if (result === null) {
      throw new Error(`Test échoué, résultat: ${result}`)
    }
  })

  it('devrait parser une date au format MM-DD-YYYY', function () {
    const result = parseToISO('02-15-2025', 'MM-DD-YYYY', 'en')
    if (result === null) {
      throw new Error(`Test échoué, résultat: ${result}`)
    }
  })

  it('devrait parser une date avec heure au format YYYY-MM-DD HH:mm', function () {
    const result = parseToISO('2025-02-15 14:30', 'YYYY-MM-DD HH:mm', 'en')
    if (result === null) {
      throw new Error(`Test échoué, résultat: ${result}`)
    }
  })
  it('devrait parser une date au format en fr MMMM DD YYYY', function () {
    const result = parseToISO('mars 35 2025', 'MMMM DD YYYY', 'fr')
    if (result === null) {
      throw new Error(`Test échoué, résultat: ${result}`)
    }
  })

  it('devrait mettre une valeur null', function () {
    const result = parseToISO('15 avrill 2025', 'DD MMMM YYYY', 'fr')
    if (result !== null) {
      throw new Error(`Test échoué, résultat: ${result}`)
    }
  })

  it('devrait parser une date avec heure au format DD MMMM YYYY, HH:mm', function () {
    const result = parseToISO('15 Feb 25, 14:30', 'DD MMM YY, HH:mm', 'en')
    if (result === null) {
      throw new Error(`Test échoué, résultat: ${result}`)
    }
  })
  it('devrait parser une date avec heure au format ddd., DD MMMM YYYY HH:mm:ss Z', function () {
    const result = parseToISO('Dim., 07 juil. 2018 00:00:00 +0100', 'ddd., DD MMM YYYY HH:mm:ss Z', 'fr')
    if (result === null) {
      throw new Error(`Test échoué, résultat: ${result}`)
    }
  })
})
/*
 janv. ; nov. ; oct. ; sept. ; mars
: déc. ; août ; juil. ; juin ; mai; avril ; févr.
*/
