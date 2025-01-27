const xml2js = require('xml2js')

/**
 * Parse un flux RSS brut en un objet JSON.
 * @param {string} rssData - Contenu brut du flux RSS.
 * @returns {Promise<object>} - Objet JSON parsé.
 */
exports.parseRss = async (rssData) => {
  try {
    const parser = new xml2js.Parser({ explicitArray: false })
    return await parser.parseStringPromise(rssData)
  } catch (error) {
    throw new Error(`Erreur lors du parsing du flux RSS: ${error.message}`)
  }
}
