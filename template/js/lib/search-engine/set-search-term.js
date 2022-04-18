import * as merge from 'lodash.merge'

export default (self, term) => {
  const words = (term || '').split(/\s+/).map(word => {
    switch (word) {
      case 'iphone':
        return 'iPhone'
      case '8':
        return '7/8'
      case 'x':
      case 'x/xs':
        return 'X/XS'
      case 'xs':
        return 'XS'
      case 'xl':
        return 'XL'
      case 'a20':
      case 'a30':
      case 'a20/a30':
        return 'A20/A30'
      case 'a52':
        return 'galaxy a52 4g/5g'
      default:
        return word.charAt(0).toUpperCase() + word.substr(1)
    }
  })

  // match name and/or keyword with term
  // https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-multi-match-query.html
  self.mergeFilter({
    bool: {
      should: [
        {
          multi_match: {
            query: term,
            fields: [
              'name',
              'keywords'
            ]
          }
        },
        {
          bool: {
            must: {
              nested: {
                path: 'specs',
                query: {
                  terms: {
                    'specs.text': [
                      words.join(' ').replace(/(samsung|apple|motorola|lg|xiaomi|huawei)\s/ig, ''),
                      ...words.filter(word => word.length > 1)
                    ]
                  }
                }
              }
            },
            boost: 3.5
          }
        }
      ]
    }
  }, 'must')

  merge(self.dsl, {
    // handle terms suggestion
    // 'did you mean?'
    // https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html
    suggest: {
      text: term,
      words: {
        term: {
          field: 'name'
        }
      }
    }
  })

  return self
}

/**
 * @method
 * @name EcomSearch#setSearchTerm
 * @description Defines term to match with product name
 * and/or keywords on next search request.
 *
 * @param {string} term - Term to be searched
 * @returns {self}
 *
 * @example
// Set new search term
search.setSearchTerm('smartphone')
 * @example
// Set new term and run search request
search.setSearchTerm('notebook').fetch()
 */
