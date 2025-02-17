import { parse } from 'json2csv'
import TurndownService from 'turndown'
import dayjs from 'dayjs'
import type { RssItem } from '../types/index.ts'

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

/**
 * Transforme un flux RSS en CSV avec des descriptions converties en Markdown.
 * @param {Array<any>} items - Liste des articles du flux RSS.
 * @returns {string} - Contenu formaté en CSV.
 */
export const transformToCsv = (items: Array<RssItem>): string => {
  const csvData = items.map(item => ({
    title: transformToMarkdown(item.title) || 'Titre inconnu',
    link: item.link || '#',
    datePublication: parseToISO(item.pubDate),
    description: transformToMarkdown(item.description) || 'Pas de description disponible.',
    image: (item.enclosure?.$.url || item['media:content']?.$.url || 'Pas d\'image disponible')
  }))

  try {
    return parse(csvData)
  } catch (error: any) {
    throw new Error(`Erreur lors de la conversion en CSV : ${error.message}`)
  }
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
