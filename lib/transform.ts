import { parse } from 'json2csv'
import TurndownService from 'turndown'
import dayjs from 'dayjs'
import type { RssItem } from '#types'

/**
 * Transforme un contenu HTML en Markdown.
 * @param {string} html - Contenu HTML à convertir.
 * @returns {string} - Contenu converti en Markdown.
 */
const transformToMarkdown = (html: string): string => {
  if (!html) return ''
  const turndown = new TurndownService()
  return turndown.turndown(html)
}

export const transformToCsv = (items: Array<RssItem>, type: string): string => {
  let csvData: any[] = []

  try {
    csvData = items.map(item => {
      let title
      let link
      let datePublication
      let description
      let image
      if (type === 'rss') {
        title = transformToMarkdown(item.title) || 'Titre inconnu'
        link = item.link || '#'
        datePublication = parseToISO(item.pubDate || '') || 'Pas de date disponible'
        description = transformToMarkdown(item.description || '') || 'Pas de description disponible.'
        image = item.enclosure?.$?.url || item['media:content']?.$?.url || 'Pas d\'image disponible'
      } else if (type === 'atom') {
        title = transformToMarkdown(item.title) || 'Titre inconnu'
        link = typeof item.link === 'object' && item.link.$ ? item.link.$.href : item.link || '#'
        datePublication = parseToISO(item.updated || 'Pas de date disponible') || 'Pas de date disponible'
        description = transformToMarkdown(
          Array.isArray(item.summary)
            ? extractText(item.summary[0])
            : extractText(item.summary)
        ) || 'Pas de description disponible.'
        image = item['media:content']?.$?.url || 'Pas d\'image disponible'
      }

      return { title, link, datePublication, description, image }
    })
  } catch (error: any) {
    if (type !== 'rss' && type !== 'atom') {
      console.error(`Le type n'est pas correct : ${error.message}`)
    }
    console.error(`Erreur lors de la conversion en CSV : ${error.message}`)
  }

  return csvData.length > 0 ? parse(csvData) : ''
}

/**
 * Parse une date au format ISO.
 * @param {string} dateStr - Date à convertir.
 * @returns {string} - Date au format ISO ou message d'erreur si la conversion échoue.
 */
const parseToISO = (dateStr: string): string => {
  try {
    const parsedDate = dayjs(dateStr)
    if (parsedDate.isValid()) {
      return parsedDate.toISOString()
    } else {
      return 'Format Date non valide'
    }
  } catch (e) {
    console.error('Erreur lors du parsing de la date', e)
    return 'Erreur de conversion de la date'
  }
}

const extractText = (data: any): string => {
  if (typeof data === 'string') {
    return data
  } else if (data && typeof data === 'object' && '_' in data) {
    return data._
  }
  return ''
}
