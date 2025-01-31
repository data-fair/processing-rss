const { parse } = require('json2csv')
const TurndownService = require('turndown')
const dayjs = require('dayjs')
const path = require('path')

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
 * Remplace les mois et jours dans une date en fonction de la langue.
 * @param {string} dateStr - Date à transformer.
 * @param {string} lang - Langue (ex: 'fr', 'en').
 * @returns {string} - Date avec les mois et jours en langue choisie.
 */
const replaceDateParts = (dateStr, lang) => {
  const configPath = path.resolve(__dirname, 'lang', `${lang}.js`)
  const { months, weekdays } = require(configPath)
  let modifiedDateStr = dateStr
  for (const [langMonth, enMonth] of Object.entries(months)) {
    const regex = new RegExp(langMonth, 'gi')
    modifiedDateStr = modifiedDateStr.replace(regex, enMonth)
  }

  for (const [langWeekday, enWeekday] of Object.entries(weekdays)) {
    const regex = new RegExp(langWeekday, 'gi')
    modifiedDateStr = modifiedDateStr.replace(regex, enWeekday)
  }

  return modifiedDateStr
}

/**
 * Convertit une date en ISO 8601 en fonction de la langue.
 * @param {string} dateStr - Date au format texte à convertir.
 * @param {string} lang - Langue utilisée pour la conversion.
 * @returns {string} - Date formatée en ISO 8601 ou un message d'erreur.
 */
const convertDate = (dateStr, lang) => {
  // Étape 1: Vérifier si la date est nulle
  if (!dateStr) {
    return 'Date non spécifiée'
  }
  // Étape 4: Essayer de convertir la date dans avec le format de base
  const parsedDate = dayjs(dateStr, 'DD MMM YYYY HH:mm:ss Z', true)
  if (parsedDate.isValid()) {
    return parsedDate.toISOString()
  }

  // Étape 3: Essayer de convertir la date dans la langue spécifiée
  const dateInLanguage = replaceDateParts(dateStr, lang)
  const parsedDateInLang = dayjs(dateInLanguage, 'DD MMM YYYY HH:mm:ss Z', true)
  if (parsedDateInLang.isValid()) {
    return parsedDateInLang.toISOString()
  }
  // Étape 4: Si aucune conversion n'a fonctionné, afficher un message d'erreur
  return 'Date erreur'
}

/**
 * Transforme un flux RSS en CSV avec des descriptions converties en Markdown.
 * @param {Array} items - Liste des articles du flux RSS.
 * @param {string} lang - Langue utilisée pour la conversion des dates.
 * @returns {string} - Contenu formaté en CSV.
 */
exports.transformToCsv = (items, lang) => {
  const csvData = items.map(item => ({
    title: transformToMarkdown(item.title) || 'Titre inconnu',
    link: item.link || '#',
    datePublication: convertDate(item.pubDate, lang),
    description: transformToMarkdown(item.description) || 'Pas de description disponible.',
    image: (item.enclosure?.$.url || item['media:content']?.$.url || 'Pas d\'image disponible')
  }))

  try {
    return parse(csvData)
  } catch (error) {
    throw new Error(`Erreur lors de la conversion en CSV : ${error.message}`)
  }
}
