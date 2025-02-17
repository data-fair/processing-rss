import type { AxiosInstance } from 'axios'
/**
 * Télécharge un flux RSS à partir de l'URL spécifiée.
 * @param {string} url - URL du flux RSS.
 * @returns {Promise<string>} - Le contenu RSS brut.
 */
export const fetchRss = async (url: string, axios: AxiosInstance): Promise<string> => {
  try {
    const response = await axios.get(url)
    return response.data
  } catch (error : any) {
    throw new Error(`Erreur lors du téléchargement du flux RSS: ${error.message}`)
  }
}
