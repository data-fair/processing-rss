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
const transformToCsv = (items) => {
  const csvData = items.map(item => ({
    title: transformToMarkdown(item.title) || 'Titre inconnu',
    link: item.link || '#',
    datePublication: parseToISO(item.pubDate),
    description: transformToMarkdown(item.description) || 'Pas de description disponible.',
    image: (item.enclosure?.$.url || item['media:content']?.$.url || 'Pas d\'image disponible')
  }))

  try {
    return parse(csvData)
  } catch (error) {
    throw new Error(`Erreur lors de la conversion en CSV : ${error.message}`)
  }
}

const parseToISO = (dateStr) => {
  try {
    const parsedDate = dayjs.utc(dateStr)
    if (parsedDate.isValid()) {
      return parsedDate.toISOString()
    } else {
      return 'Format Date non valide'
    }
  } catch (e) {
    console.log('Erreur lors du parsing de la date', e)
  }
}

module.exports = { transformToCsv, parseToISO }
/*
 janv. ; nov. ; oct. ; sept. ; mars
: déc. ; août ; juil. ; juin ; mai; avril ; févr.
*/
