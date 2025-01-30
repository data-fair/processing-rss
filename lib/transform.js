const { parse } = require('json2csv')
const TurndownService = require('turndown')

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
 * @returns {string} - Contenu formaté en CSV.
 */
exports.transformToCsv = (items) => {
  const csvData = items.map((item) => ({
    title: transformToMarkdown(item.title) || 'Titre inconnu',
    link: item.link || '#',
    datePublication: item.pubDate ? new Date(item.pubDate).toISOString() : 'Date non spécifiée',
    description: transformToMarkdown(item.description) || 'Pas de description disponible.',
    image: (item.enclosure && item.enclosure.$ && item.enclosure.$.url) || (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) || 'Pas d\'image disponible'
  }))
  try {
    const csv = parse(csvData)
    return csv
  } catch (error) {
    throw new Error(`Erreur lors de la conversion en CSV : ${error.message}`)
  }
}
