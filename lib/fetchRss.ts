import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'

/**
 * Télécharge un flux RSS à partir de l'URL spécifiée.
 * @param {string} url - URL du flux RSS.
 * @returns {Promise<string>} - Le contenu RSS brut.
 */
export const fetchRss = async (url: string, axios: ProcessingContext['axios']): Promise<string> => {
  try {
    // external source: the context axios refuses redirects by default and has no timeout
    const response = await axios.get(url, { maxRedirects: 5, timeout: 60000, responseType: 'text', maxContentLength: 200 * 1024 * 1024 })
    return response.data
  } catch (error: any) {
    throw new Error(`Erreur lors du téléchargement du flux RSS: ${error.message}`)
  }
}
