import {
  i19addToFavorites,
  i19buy,
  i19connectionErrorProductMsg,
  i19outOfStock,
  i19unavailable
} from '@ecomplus/i18n'

import {
  i18n,
  name as getName,
  inStock as checkInStock,
  onPromotion as checkOnPromotion,
  price as getPrice
} from '@ecomplus/utils'

import Vue from 'vue'
import { store } from '@ecomplus/client'
import ecomCart from '@ecomplus/shopping-cart'
import ALink from '@ecomplus/storefront-components/src/ALink.vue'
import APicture from '@ecomplus/storefront-components/src/APicture.vue'
import APrices from '@ecomplus/storefront-components/src/APrices.vue'
import ecomPassport from '@ecomplus/passport-client'
import { toggleFavorite, checkFavorite } from '@ecomplus/storefront-components/src/js/helpers/favorite-products'

const getExternalHtml = (varName, product) => {
  if (typeof window === 'object') {
    varName = `productCard${varName}Html`
    const html = typeof window[varName] === 'function'
      ? window[varName](product)
      : window[varName]
    if (typeof html === 'string') {
      return html
    }
  }
  return undefined
}

export default {
  name: 'ProductCard',

  components: {
    ALink,
    APicture,
    APrices
  },

  props: {
    searchTerm: String,
    product: Object,
    productId: String,
    isSmall: Boolean,
    headingTag: {
      type: String,
      default: 'h3'
    },
    buyText: String,
    transitionClass: {
      type: String,
      default: 'animated fadeIn'
    },
    canAddToCart: {
      type: Boolean,
      default: true
    },
    ecomPassport: {
      type: Object,
      default () {
        return ecomPassport
      }
    },
    accountUrl: {
      type: String,
      default: '/app/#/account/'
    },
    isLoaded: Boolean,
    installmentsOption: Object,
    discountOption: Object
  },

  data () {
    return {
      body: {},
      modeloSearch: "",
      marcaSearch: "",
      isLoading: false,
      isWaitingBuy: false,
      isHovered: false,
      isFavorite: false,
      error: ''
    }
  },

  computed: {
    i19addToFavorites: () => i18n(i19addToFavorites),
    i19outOfStock: () => i18n(i19outOfStock),
    i19unavailable: () => i18n(i19unavailable),

    isSearchingPhoneModel (){
      let body = this.body;
      let nameProduct = this.body.name;
      let getListModels = this.body.variations;
      let term = this.searchTerm;
      let listNomeProduto = {nome: "", modelo: "", marca: "", cor: "", foto: ""};
      
      //console.log('this.body.name', this.body.name)
      //console.log('this.body', this.body)
      
      if(term !== undefined){
        term = term.toLowerCase();
        nameProduct = nameProduct.toLowerCase();

        console.log('getListModels',getListModels)
  
        if(getListModels !== undefined){

          getListModels.map( (variation) => {    

            if(variation !== undefined){
              let modeloVariation = "";
              let marcaVariation = "";
              let variationColor = "";

              //se array nao for vazio 
              if( variation.specifications.modelo.length > 0){
                modeloVariation = variation.specifications.modelo[0].text;
              }
              if(variation.specifications.marca_do_aparelho.length > 0){
                marcaVariation = variation.specifications.marca_do_aparelho[0].text;
                modeloVariation = modeloVariation.toLowerCase();
              }
              if(variation.specifications.colors !== undefined){
                
                if(variation.specifications.colors.length > 0){
                  variationColor = variation.specifications.colors[0].text;
                  variationColor = variationColor.toLowerCase();
                }
              }

              //se tem o nome do produto 
              if(term.indexOf(nameProduct) !== -1 ){
                listNomeProduto.nome = nameProduct;
              }

              //se tem o modelo ja seta a marca 
              if(term.indexOf(modeloVariation) !== -1 ){
                listNomeProduto.modelo = modeloVariation;
                listNomeProduto.marca = marcaVariation;
              }

              //se tem a cor busca pela foto 
              if(term.indexOf(variationColor) !== -1 ){
                listNomeProduto.cor = variationColor;
                
                console.log('body.name', body.name)
                console.log('body.pictures', body.pictures)
  
                body.pictures.map( function(product,index) {
                  console.log('prod', product)

                  let variationId = variation._id;

                  console.log('variationId', variationId)
                  console.log('product._id', product._id)

                  if(product._id !== undefined){

                    let skuId = product._id;
                    
                    if(skuId === variationId){
                      listNomeProduto.foto = product.normal.url;
                    }
                  }
                })
              }


              console.log('listNomeProduto', listNomeProduto)
            }
          })
        }
      }    

      return nameProduct;
       
    },

    ratingHtml () {
      return getExternalHtml('Rating', this.body)
    },

    buyHtml () {
      return getExternalHtml('Buy', this.body)
    },

    footerHtml () {
      return getExternalHtml('Footer', this.body)
    },

    name () {
      return getName(this.body)
    },

    strBuy () {
      return this.buyText ||
        (typeof window === 'object' && window.productCardBuyText) ||
        i18n(i19buy)
    },

    isInStock () {
      return checkInStock(this.body)
    },

    isActive () {
      return this.body.available && this.body.visible && this.isInStock
    },

    isLogged () {
      return ecomPassport.checkAuthorization()
    },

    discount () {
      const { body } = this
      return checkOnPromotion(body)
        ? Math.round(((body.base_price - getPrice(body)) * 100) / body.base_price)
        : 0
    }
  },

  methods: {
    setBody (data) {
      this.body = Object.assign({}, data)
      delete this.body.body_html
      delete this.body.body_text
      delete this.body.inventory_records
      delete this.body.price_change_records
      this.isFavorite = checkFavorite(this.body._id, this.ecomPassport)
    },

    fetchItem () {
      if (this.productId) {
        this.isLoading = true
        store({ url: `/products/${this.productId}.json` })
          .then(({ data }) => {
            this.$emit('update:product', data)
            this.setBody(data)
            this.$emit('update:is-loaded', true)
          })
          .catch(err => {
            console.error(err)
            if (!this.body.name || !this.body.slug || !this.body.pictures) {
              this.error = i18n(i19connectionErrorProductMsg)
            }
          })
          .finally(() => {
            this.isLoading = false
          })
      }
    },

    toggleFavorite () {
      if (this.isLogged) {
        this.isFavorite = toggleFavorite(this.body._id, this.ecomPassport)
      }
    },

    buy () {
      const product = this.body
      this.$emit('buy', { product })
      if (this.canAddToCart) {
        this.isWaitingBuy = true
        store({ url: `/products/${product._id}.json` })
          .then(({ data }) => {
            const selectFields = ['variations', 'customizations', 'kit_composition']
            for (let i = 0; i < selectFields.length; i++) {
              const selectOptions = data[selectFields[i]]
              if (selectOptions && selectOptions.length) {
                return import('@ecomplus/storefront-components/src/ProductQuickview.vue')
                  .then(quickview => {
                    new Vue({
                      render: h => h(quickview.default, {
                        props: {
                          product: data
                        }
                      })
                    }).$mount(this.$refs.quickview)
                  })
              }
            }
            const { quantity, price } = data
            ecomCart.addProduct({ ...product, quantity, price })
          })
          .catch(err => {
            console.error(err)
            window.location = `/${product.slug}`
          })
          .finally(() => {
            this.isWaitingBuy = false
          })
      }
    }
  },

  created () {
    if (this.product) {
      this.setBody(this.product)
      if (this.product.available === undefined) {
        this.body.available = true
      }
      if (this.product.visible === undefined) {
        this.body.visible = true
      }
    }
    if (!this.isLoaded) {
      this.fetchItem()
    }
  }
}
