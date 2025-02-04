const { parse } = require('json2csv')
const TurndownService = require('turndown')
const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)
dayjs.extend(customParseFormat)
/**
 * Transforme un contenu HTML en Markdown.
 * @param {string} html - Contenu HTML à convertir.
 * @returns {string} - Contenu converti en Markdown.
 */
const transformToMarkdown = (html) => {
  if (!html) return ''
  const turndown = new TurndownService()
  return turndown.turndown(html)
}

/**
 * Transforme un flux RSS en CSV avec des descriptions converties en Markdown.
 * @param {Array} items - Liste des articles du flux RSS.
 * @param {string} lang - Langue utilisée pour la conversion des dates.
 * @returns {string} - Contenu formaté en CSV.
 */
const transformToCsv = (items, lang, formDate) => {
  const csvData = items.map(item => ({
    title: transformToMarkdown(item.title) || 'Titre inconnu',
    link: item.link || '#',
    datePublication: parseToISO(item.pubDate, formDate, lang),
    description: transformToMarkdown(item.description) || 'Pas de description disponible.',
    image: (item.enclosure?.$.url || item['media:content']?.$.url || 'Pas d\'image disponible')
  }))

  try {
    return parse(csvData)
  } catch (error) {
    throw new Error(`Erreur lors de la conversion en CSV : ${error.message}`)
  }
}

const setDayjsLocale = (lang) => {
  try {
    require(`dayjs/locale/${lang}`)
    dayjs.locale(lang)
    return lang
  } catch {
    console.warn(`Locale ${lang} non trouvée, utilisation de 'en' par défaut`)
    dayjs.locale('en')
    return 'en'
  }
}

const normalizeDateString = (dateStr, lang, format) => {
  const currentLang = setDayjsLocale(lang)
  const refDate = dayjs('2024-01-01').locale(currentLang)

  // Mois abrégés et longs
  const monthsAbr = [...Array(12).keys()].map(i => refDate.month(i).format('MMM')) // Mois abrégés
  const monthsLong = [...Array(12).keys()].map(i => refDate.month(i).format('MMMM')) // Mois longs

  // Vérification si le format contient 'MMM' ou 'MMMM'
  if (format.includes('MMMM')) {
    monthsLong.forEach(month => {
      const regex = new RegExp(`(${month})`, 'gi')
      dateStr = dateStr.replace(regex, month)
    })
    return dateStr
  } else if (format.includes('MMM')) {
    return monthsLong.reduce((acc, month) => {
      const regex = new RegExp(`(${month})`, 'gi')
      return acc.replace(regex, monthsAbr[monthsLong.indexOf(month)])
    }, dateStr)
  }

  return dateStr
}

const parseToISO = (dateStr, format, lang) => {
  try {
    console.log(format)
    let parsedDate = dayjs.utc(dateStr)
    if (parsedDate.isValid()) {
      console.log(parsedDate.toISOString())
      return parsedDate.toISOString()
    } else {
      setDayjsLocale(lang)
      const normalizedDateStr = normalizeDateString(dateStr, lang, format)
      parsedDate = dayjs.utc(normalizedDateStr, format, lang)
      if (parsedDate.isValid()) {
        console.log(parsedDate.toISOString())
        return parsedDate.toISOString()
      } else {
        console.warn('Format date incorrect')
        return null
      }
    }
  } catch (e) {
    console.warn('Erreur lors du parsing de la date', e)
    return 'Date incorrect'
  }
}

module.exports = { transformToCsv, parseToISO }
/*
 janv. ; nov. ; oct. ; sept. ; mars
: déc. ; août ; juil. ; juin ; mai; avril ; févr.
*/
