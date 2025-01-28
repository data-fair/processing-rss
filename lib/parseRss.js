const { parseStringPromise } = require('xml2js')
/**
 * Parse un flux RSS brut en un objet JSON.
 * @param {string} rssData - Contenu brut du flux RSS.
 * @returns {Promise<object>} - Objet JSON parsé.
 */
exports.parseRss = async (rssData) => {
  try {
    const parsed = await parseStringPromise(rssData, { trim: true, explicitArray: false })
    const items = parsed?.rss?.channel?.item
    if (!items) {
      throw new Error('Aucun article trouvé dans le flux RSS.')
    }

    // S'assurer que les articles sont dans un tableau
    return Array.isArray(items) ? items : [items]
  } catch (error) {
    console.error(`Erreur lors du parsing du flux RSS : ${error.message}`)
    throw error
  }
}
