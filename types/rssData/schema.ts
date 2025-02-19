export default {
  $id: 'https://github.com/data-fair/processing-rss/rssdata',
  'x-exports': [
    'types',
    'validate'
  ],
  title: 'RssData',
  type: 'object',
  additionalProperties: false,
  required: [
    'items'
  ],
  properties: {
    items: {
      type: 'array',
      items: {
        $ref: 'https://github.com/data-fair/processing-rss/rssitem'
      },
    }
  }
}
