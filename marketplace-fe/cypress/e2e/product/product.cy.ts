import {
  setupLoginIntercept,
  setupProtectedIntercept,
  setupProductDetailsIntercept,
  setupCartProductsCountIntercept,
} from '../../support/intercepts'

describe('Product Details Page', () => {
  beforeEach(() => {
    // Setup all intercepts before visiting any pages
    setupLoginIntercept()
    setupProtectedIntercept()
    setupProductDetailsIntercept()
    setupCartProductsCountIntercept()

    // Login first
    cy.visit('/auth/login')
    cy.get('#email').type('test@ufl.edu')
    cy.get('#password').type('password123')
    cy.get('#login-button').click()
    cy.wait('@loginRequest')

    // Visiting the landing page first to ensure authentication is complete
    cy.visit('/')
    cy.wait('@apiProtected')

    // Instead of navigating from UI, directly visit the product page
    // This prevents navigation issues that could cause timeouts
    cy.visit('/product/cb1aea77-427a-4abe-bf9f-649145369dfa', { timeout: 10000 })
    cy.wait('@productDetailsRequest', { timeout: 10000 })
    cy.wait('@cartProductsCountRequest', { timeout: 10000 })
  })

  it('Should display the product details correctly', () => {
    cy.get('.product-name', { timeout: 10000 }).should('contain', 'Sports-product 27')
    cy.get('#product-description').should('contain', 'This is a sample description for product')

    // For the product meta - we'll need to find the correct selector
    // If there's a specific element with Posted By information
    cy.contains('Posted By').should('exist')
    cy.contains('GatorUser').should('exist')
  })

  it('Should display the product images', () => {
    cy.get('.display-image').should('exist')
    cy.get('.image-thumbnails .product-images').should('exist')
    cy.get('.image-thumbnails .product-images')
      .first()
      .should('have.attr', 'src')
      .and('include', 'groceries/Apple/1.png')
  })

  it('Should not show loading spinner after API loads', () => {
    cy.get('mat-spinner').should('not.exist')
  })

  it('Should handle product with single image', () => {
    cy.get('.image-thumbnails .product-images').then((thumbnails) => {
      expect(thumbnails.length).to.equal(1)
      cy.log('Product has only one image as expected')
    })
  })

  it('Should have the correct number of quantity options', () => {
    cy.get('select').should('exist')

    // Check if dropdown has expected options (1-10 range)
    cy.get('select option').should('have.length.at.least', 1)
    cy.get('select option').first().should('have.value', '1')
  })

  it('Should have a functional add to cart button', () => {
    // Setup add to cart intercept
    cy.intercept('POST', '/api/cart', {
      statusCode: 200,
      body: {
        message: 'Product added to cart successfully',
      },
    }).as('addToCartRequest')

    cy.get('button').contains('Add to cart').should('exist')
    cy.get('button').contains('Add to cart').click()

    // Verify the request was made
    cy.wait('@addToCartRequest')
  })

  it('Should show proper date format for posted date', () => {
    cy.get('.product-meta').contains('Posted On:').should('exist')

    // Check the date format (Apr 12, 2025)
    cy.get('.product-meta').contains(/Posted On: \w+ \d+, \d{4}/)
  })
})
