export default {
  query: {
    bool: {
      // condition: only visible products
      filter: [
        {
          term: {
            visible: true
          }
        }
      ],
      // preference: in stock first
      should: [
        {
          range: {
            quantity: {
              gt: 0
            }
          }
        }
      ]
    }
  },
  sort: [
    {
      available: {
        order: 'desc'
      }
    },
    {
      ad_relevance: {
        order: 'desc'
      }
    },
    '_score'
  ],
  aggs: {
    brands: {
      terms: {
        field: 'brands.name'
      }
    },
    categories: {
      terms: {
        field: 'categories.name'
      }
    },
    // ref.: https://github.com/elastic/elasticsearch/issues/5789
    specs: {
      nested: {
        path: 'specs'
      },
      aggs: {
        grid: {
          terms: {
            field: 'specs.grid',
            size: 30
          },
          aggs: {
            text: {
              terms: {
                field: 'specs.text',
                size: 60
              }
            }
          }
        }
      }
    },
    // Metric Aggregations
    min_price: {
      min: {
        field: 'price'
      }
    },
    max_price: {
      max: {
        field: 'price'
      }
    },
    avg_price: {
      avg: {
        field: 'price'
      }
    }
  }
}
