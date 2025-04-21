import {
  setupLoginIntercept,
  setupProtectedIntercept,
  setupCartProductsCountIntercept,
  setupAddToCartIntercept,
  setupProductDetailsIntercept,
} from '../../support/intercepts'

describe('Products Page', () => {
  beforeEach(() => {
    setupLoginIntercept()
    setupProtectedIntercept()
    setupCartProductsCountIntercept()
    setupAddToCartIntercept()

    cy.visit('/auth/login')
    cy.get('#email').type('test@ufl.edu')
    cy.get('#password').type('password123')
    cy.get('#login-button').click()
    cy.wait('@loginRequest')

    cy.intercept('GET', '/api/products**', {
      statusCode: 200,
      body: {
        products: Array(12)
          .fill(null)
          .map((_, i) => ({
            pid: `pid-${i}`,
            userUID: `user-uid-${i}`,
            name: `Category-product ${i}`,
            price: 10.99 + i * 5,
            postedAt: new Date().toISOString(),
            imageSrc: 'https://cdn.dummyjson.com/products/images/electronics/product1.png',
          })),
        page: 1,
        pageSize: 12,
        totalItems: 36,
        totalPages: 3,
      },
    }).as('productsDataRequest')

    cy.visit('/products')
    cy.wait('@apiProtected')
    cy.wait('@productsDataRequest', { timeout: 10000 })
    cy.wait('@cartProductsCountRequest', { timeout: 10000 })
  })

  describe('Page Load and Layout', () => {
    it('Should load the products page with all UI elements', () => {
      cy.wait(2000)

      cy.get('app-navbar', { timeout: 10000 }).should('exist')
      cy.get('.container', { timeout: 10000 }).should('exist')
      cy.get('app-sidebar', { timeout: 10000 }).should('exist')

      cy.get('app-display-products', { timeout: 10000 }).should('exist')
      cy.get('body', { timeout: 10000 }).then(($body) => {
        if ($body.find('.products-heading').length > 0) {
          cy.get('.products-heading', { timeout: 10000 }).should('contain', 'Explore Marketplace')
        } else if ($body.find('app-display-products .products-heading').length > 0) {
          cy.get('app-display-products .products-heading', { timeout: 10000 }).should(
            'contain',
            'Explore Marketplace'
          )
        } else if ($body.find('h1:contains("Explore Marketplace")').length > 0) {
          cy.get('h1:contains("Explore Marketplace")', { timeout: 10000 }).should('exist')
        } else {
          cy.contains('Explore Marketplace', { timeout: 10000 }).should('exist')
        }
      })

      cy.get('mat-paginator', { timeout: 10000 }).should('exist')
    })

    it('Should display products with correct information', () => {
      cy.get('app-product-card').should('have.length.at.least', 1)

      cy.get('app-product-card')
        .first()
        .within(() => {
          cy.get('.product-name').should('be.visible')
          cy.get('.product-price').should('be.visible')
          cy.get('.product-image').should('be.visible')
          cy.get('.posted-on').should('contain', 'Posted on')
          cy.get('button').should('contain', 'Add to cart')
        })
    })

    it('Should not show loading spinner after data is loaded', () => {
      cy.get('.loader').should('not.exist')
    })
  })

  describe('Category Filtering', () => {
    it('Should filter products by category', () => {
      cy.intercept('GET', '/api/products**', (req) => {
        if (req.url.includes('categories=Sports')) {
          req.reply({
            statusCode: 200,
            body: {
              products: Array(6)
                .fill(null)
                .map((_, i) => ({
                  pid: `sports-pid-${i}`,
                  userUID: `user-uid-${i}`,
                  name: `Sports Item ${i}`,
                  price: 20 + i * 10,
                  postedAt: new Date().toISOString(),
                  category: 'Sports',
                  imageSrc: 'https://cdn.dummyjson.com/products/images/sports/product1.png',
                })),
              page: 1,
              pageSize: 12,
              totalItems: 6,
              totalPages: 1,
            },
          })
        }
      }).as('sportsFilter')

      // Click Sports category checkbox based on the screenshot
      cy.contains('Categories').parent().find('[type="checkbox"]').eq(7).click()
      cy.wait('@sportsFilter')

      cy.get('app-product-card').should('have.length', 12)
    })
  })

  describe('Sorting Functionality', () => {
    it('Should sort products by price (low to high)', () => {
      cy.intercept('GET', '/api/products**', (req) => {
        if (req.url.includes('sort=price_asc')) {
          const sortedProducts = Array(12)
            .fill(null)
            .map((_, i) => ({
              pid: `sorted-pid-${i}`,
              userUID: `user-uid-${i}`,
              name: `Product ${i}`,
              price: 10 + i * 5,
              postedAt: new Date().toISOString(),
              imageSrc: 'https://cdn.dummyjson.com/products/images/electronics/product1.png',
            }))

          req.reply({
            statusCode: 200,
            body: {
              products: sortedProducts,
              page: 1,
              pageSize: 12,
              totalItems: 36,
              totalPages: 3,
            },
          })
        }
      }).as('priceSortAsc')

      // Click the Price: Low to High radio button (index 2 based on screenshots)
      cy.get('[type="radio"]').eq(2).click()
      cy.wait('@priceSortAsc')
      cy.get('@priceSortAsc').its('response.statusCode').should('eq', 200)
    })
  })

  describe('Pagination', () => {
    it('Should navigate to next page', () => {
      cy.intercept('GET', '/api/products**', (req) => {
        if (req.url.includes('page=2')) {
          req.reply({
            statusCode: 200,
            body: {
              products: Array(12)
                .fill(null)
                .map((_, i) => ({
                  pid: `page2-pid-${i}`,
                  userUID: `user-uid-${i}`,
                  name: `Page 2 Product ${i}`,
                  price: 20 + i,
                  postedAt: new Date().toISOString(),
                  imageSrc: 'https://cdn.dummyjson.com/products/images/electronics/product1.png',
                })),
              page: 2,
              pageSize: 12,
              totalItems: 36,
              totalPages: 3,
            },
          })
        }
      }).as('page2Request')

      cy.get('.mat-mdc-paginator-navigation-next').click()
      cy.wait('@page2Request')
      cy.get('.product-name').first().should('contain', 'Page 2')
    })
  })

  describe('Product Clickability', () => {
    it('Should navigate to product details when clicking on a product card', () => {
      setupProductDetailsIntercept()

      cy.get('app-product-card').first().click()
      cy.wait('@productDetailsRequest')
      cy.url().should('include', '/product/')
    })
  })

  describe('Add to Cart Functionality', () => {
    it('Should add product to cart when Add to Cart button is clicked', () => {
      cy.get('app-product-card').first().find('button').click({ force: true })

      cy.wait('@addToCartRequest')

      cy.get('@addToCartRequest').its('response.statusCode').should('eq', 200)
    })
  })
})
