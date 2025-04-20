import {
  setupLoginIntercept,
  setupProtectedIntercept,
  setupCartProductsCountIntercept,
  setupProductDetailsIntercept,
} from '../../support/intercepts'

// Helper function to check price sorting
const checkPriceSorting = () => {
  const prices: number[] = []
  cy.get('.product-price')
    .each(($el) => {
      // Get the text content
      const priceText = $el.text()
      // Remove currency symbols ($, €, etc.) and any non-numeric characters except dots
      const cleanedPrice = priceText.replace(/[^\d.]/g, '')
      // Parse the resulting string as a float
      const price = parseFloat(cleanedPrice)
      // Only add valid numbers to the array
      if (!isNaN(price)) {
        prices.push(price)
      }
    })
    .then(() => {
      // Only check sorting if we have valid prices
      if (prices.length > 1) {
        for (let i = 1; i < prices.length; i++) {
          expect(prices[i]).to.be.gte(prices[i - 1])
        }
      }
    })
}

describe('Products Page', () => {
  beforeEach(() => {
    // Setup all intercepts before visiting any pages
    setupLoginIntercept()
    setupProtectedIntercept()
    setupCartProductsCountIntercept()

    // Login process
    cy.visit('/auth/login')
    cy.get('#email').type('test@ufl.edu')
    cy.get('#password').type('password123')
    cy.get('#login-button').click()
    cy.wait('@loginRequest')

    // Visit the landing page first
    cy.visit('/')
    cy.wait('@apiProtected')

    // Manually setup the products data intercept
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

    // Now directly visit the products page instead of clicking
    cy.visit('/products')

    // Wait for all necessary requests
    cy.wait('@apiProtected')
    cy.wait('@productsDataRequest', { timeout: 10000 })
    cy.wait('@cartProductsCountRequest', { timeout: 10000 })
  })

  describe('Page Load and Layout', () => {

    it('Should display the correct number of products', () => {
      cy.get('app-product-card').should('have.length', 12)
    })

    it('Should not show loading spinner after data is loaded', () => {
      cy.get('.loader').should('not.exist')
    })
  })

  describe('Product Display', () => {
    it('Should display products with correct information', () => {
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

    it('Should show accurate price formatting', () => {
      cy.get('.product-price').first().should('contain', ' ')
    })

    it('Should display proper date format for posting date', () => {
      cy.get('.posted-on')
        .first()
        .invoke('text')
        .should('match', /Posted on: \w+ \d+, \d{4}/)
    })
  })

  describe('Category Filtering', () => {
    it('Should filter products by a single category', () => {
      // Setup intercept for filtered products
      cy.intercept('GET', '/api/products**', (req) => {
        if (req.url.includes('categories=')) {
          req.reply({
            statusCode: 200,
            body: {
              products: Array(6)
                .fill(null)
                .map((_, i) => ({
                  pid: `filtered-pid-${i}`,
                  userUID: `user-uid-${i}`,
                  name: `Filtered Product ${i}`,
                  price: 20 + i * 10,
                  postedAt: new Date().toISOString(),
                  imageSrc: 'https://cdn.dummyjson.com/products/images/electronics/product1.png',
                })),
              page: 1,
              pageSize: 12,
              totalItems: 6,
              totalPages: 1,
            },
          })
        }
      }).as('filteredProductsRequest')

      // Click a category checkbox (index 2 could be any category)
      cy.get('[type="checkbox"]').eq(2).click()
      cy.wait('@filteredProductsRequest')

      // Verify filtered results
      cy.get('app-product-card').should('have.length', 6)
    })
  })

  describe('Sorting Functionality', () => {
    it('Should sort products by price (low to high)', () => {
      // Setup intercept for price sorting
      cy.intercept('GET', '/api/products**', (req) => {
        if (req.url.includes('sort=price_asc')) {
          req.reply({
            statusCode: 200,
            body: {
              products: Array(12)
                .fill(null)
                .map((_, i) => ({
                  pid: `sorted-pid-${i}`,
                  userUID: `user-uid-${i}`,
                  name: `Product ${i}`,
                  price: 10 + i * 5, // Prices in ascending order
                  postedAt: new Date().toISOString(),
                  imageSrc: 'https://cdn.dummyjson.com/products/images/electronics/product1.png',
                })),
              page: 1,
              pageSize: 12,
              totalItems: 36,
              totalPages: 3,
            },
          })
        }
      }).as('sortedProductsRequest')

      // Select the third radio button (Price: Low to High)
      cy.get('[type="radio"]').eq(2).click()
      cy.wait('@sortedProductsRequest')

      // Use the helper function to check price sorting
      checkPriceSorting()
    })
  })

  describe('Pagination', () => {
    it('Should navigate to next page', () => {
      // Setup intercept for second page
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

      // Click next page button
      cy.get('.mat-mdc-paginator-navigation-next').click()
      cy.wait('@page2Request')

      // Verify we're on page 2 by checking product names contain "Page 2"
      cy.get('.product-name').first().should('contain', 'Page 2')
    })
  })

  describe('Product Clickability', () => {
    it('Should navigate to product details when clicking on a product card', () => {
      // Setup product details intercept
      setupProductDetailsIntercept()

      // Click on the first product card
      cy.get('app-product-card').first().click()
      cy.wait('@productDetailsRequest')

      // Verify URL changed to product details
      cy.url().should('include', '/product/')
    })
  })

  describe('Add to Cart Functionality', () => {
    it('Should add product to cart when Add to Cart button is clicked', () => {
      // Setup cart intercept
      cy.intercept('POST', '/api/cart', {
        statusCode: 200,
        body: {
          message: 'Product added to cart successfully',
        },
      }).as('addToCartRequest')

      // Click the Add to Cart button (stopping propagation)
      cy.get('app-product-card').first().find('button').click({ force: true })

      // Wait for add to cart request to complete
      cy.wait('@addToCartRequest')

      // Check if the request was successful
      cy.get('@addToCartRequest').its('response.statusCode').should('eq', 200)
    })
  })

  describe('Empty State Display', () => {
    it('Should show empty state when no products match filter', () => {
      // Setup intercept for empty results
      cy.intercept('GET', '/api/products**', {
        statusCode: 200,
        body: {
          products: [],
          page: 1,
          pageSize: 12,
          totalItems: 0,
          totalPages: 0,
        },
      }).as('emptyResultsRequest')

      // Apply a filter that will return no results
      // Just visiting with this intercept will trigger it
      cy.visit('/products')
      cy.wait('@emptyResultsRequest')

      // Check for empty state message
      cy.get('.no-products').should('be.visible')
      cy.get('.no-products-text').should('contain', 'No active product listing')
    })
  })

  describe('Responsive Design', () => {
    it('Should adapt layout for tablet screens', () => {
      // Set viewport to tablet size
      cy.viewport(1024, 768)

      // Check for responsive layout changes
      cy.get('.sidebar').should('exist')
      cy.get('.products-container').should('exist')

      // Instead of checking for the exact CSS value, check the computed style
      cy.get('.products-container').then(($el) => {
        // Get the computed style
        const computedStyle = getComputedStyle($el[0])
        const gridTemplateColumns = computedStyle.gridTemplateColumns

        // Check that we have exactly 3 columns by counting the number of spaces
        // The format will be something like "229.719px 229.734px 229.734px"
        const columnCount = gridTemplateColumns.split(' ').length
        expect(columnCount).to.equal(3)
      })
    })
  })

  describe('Combined Filtering and Sorting', () => {
    it('Should apply both filters and sorting simultaneously', () => {
      // Setup intercept for combined filtering and sorting
      cy.intercept('GET', '/api/products**', (req) => {
        if (req.url.includes('categories=') && req.url.includes('sort=')) {
          req.reply({
            statusCode: 200,
            body: {
              products: Array(4)
                .fill(null)
                .map((_, i) => ({
                  pid: `combined-pid-${i}`,
                  userUID: `user-uid-${i}`,
                  name: `Combined Filter & Sort ${i}`,
                  price: 10 + i * 5, // Ascending price order
                  postedAt: new Date().toISOString(),
                  imageSrc: 'https://cdn.dummyjson.com/products/images/electronics/product1.png',
                })),
              page: 1,
              pageSize: 12,
              totalItems: 4,
              totalPages: 1,
            },
          })
        }
      }).as('combinedRequest')

      // Apply category filter
      cy.get('[type="checkbox"]').eq(2).click()

      // Apply sorting
      cy.get('[type="radio"]').eq(2).click()

      cy.wait('@combinedRequest')

      // Verify combined results (fewer products, sorted by price)
      cy.get('app-product-card').should('have.length', 4)

      // Use the helper function to check price sorting
      checkPriceSorting()
    })
  })
})
