export default {
    $id: 'https://github.com/data-fair/processing-rss/',
    'x-exports': [
      'types',
      'validate'
    ],
    title: 'RssItem',
    type: 'object',
    additionalProperties: false,
    required: [
      'title',
      'link',
      'description',
      'pubDate',
    ],
    properties: {
      title: {
        type: 'string'
      },
      link: {
        type: 'string'
      },
      description: {
        type: 'string'
      },
      pubDate: {
        type: 'string'
      }
    }
  }