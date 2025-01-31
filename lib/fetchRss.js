const axios = require('axios')

/**
 * Télécharge un flux RSS à partir de l'URL spécifiée.
 * @param {string} url - URL du flux RSS.
 * @returns {Promise<string>} - Le contenu RSS brut.
 */
exports.fetchRss = async (url) => {
  try {
    const response = await axios.get(url, { timeout: 30000 })
    return response.data
  } catch (error) {
    throw new Error(`Erreur lors du téléchargement du flux RSS: ${error.message}`)
  }
}
