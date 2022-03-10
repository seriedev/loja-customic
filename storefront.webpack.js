const path = require('path')

const dirSearchAlias = path.resolve(__dirname, 'template/js/lib/search-engine')
const pathDslAlias = path.resolve(dirSearchAlias, 'dsl')

module.exports = () => ({
  resolve: {
    alias: {
      './lib/dsl': pathDslAlias,
      './../lib/dsl': pathDslAlias,
      '../lib/dsl': pathDslAlias,
      './methods/set-search-term': path.resolve(dirSearchAlias, 'set-search-term'),
      './js/ProductCard.js': path.resolve(__dirname, 'template/js/custom-js/ProductCard.js'),
      './js/ProductVariations.js': path.resolve(__dirname, 'template/js/custom-js/ProductVariations.js'),
      './html/ProductVariations.html': path.resolve(__dirname, 'template/js/custom-js/ProductVariations.html'),
      './html/SearchEngine.html': path.resolve(__dirname, 'template/js/custom-js/SearchEngine.html'),
      './html/ProductCard.html': path.resolve(__dirname, 'template/js/custom-js/ProductCard.html')
    }
  }
})
