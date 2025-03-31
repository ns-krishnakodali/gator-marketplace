import {
  setupLoginIntercept,
  setupProductDetailsIntercept,
  setupProtectedIntercept,
} from '../../support/intercepts'

describe('Product Details Page', () => {
  beforeEach(() => {
    setupLoginIntercept()
    setupProtectedIntercept()
    setupProductDetailsIntercept()

    cy.visit('/auth/login')

    cy.get('#email').type('test@ufl.edu')
    cy.get('#password').type('password123')
    cy.get('#login-button').click()
    cy.wait('@loginRequest')

    cy.visit('/')
    cy.wait('@apiProtected')

    cy.visit('/product/cb1aea77-427a-4abe-bf9f-649145369dfa')
    cy.wait('@productDetailsRequest')
  })

  it('should display the product details correctly', () => {
    cy.get('.product-name').should('contain', 'Sports-product 27')
    cy.get('.product-description').should('contain', 'This is a sample description for product 27')
    cy.get('.product-meta').should('contain', 'Posted By: GatorUser')
    cy.get('.quantity-label').should('contain', 'Quantity:')
  })

  it('should display the product images', () => {
    cy.get('.display-image').should('exist')

    cy.get('.image-thumbnails .product-images').should('exist')
    cy.get('.image-thumbnails .product-images')
      .first()
      .should('have.attr', 'src')
      .and('include', 'groceries/Apple/1.png')
  })

  it('should not show loading spinner after API loads', () => {
    cy.get('.loading-spinner').should('not.exist')
    cy.get('mat-spinner').should('not.exist')
  })

  it('should handle product with single image', () => {
    cy.get('.image-thumbnails .product-images').then((thumbnails) => {
      // Since we only have one image in the mock response
      expect(thumbnails.length).to.equal(1)

      // Check that the display image matches the only thumbnail
      cy.get('.image-thumbnails .product-images')
        .first()
        .invoke('attr', 'src')
        .then((thumbnailSrc) => {
          cy.get('.display-image').should('have.attr', 'src').and('eq', thumbnailSrc)
        })

      cy.log('Product has only one image as expected')
    })
  })

  it('should have the correct number of quantity options', () => {
    // The quantity select dropdown should have 10 options since product quantity is 92
    // (component limits to max 10 options as per ProductDetailsComponent)
    cy.get('#quantity.quantity-select')
      .find('option')
      .then((options) => {
        const optionCount = options.length
        expect(optionCount).to.equal(10)

        // Check the first and last options
        cy.get('#quantity.quantity-select option').first().should('have.value', '1')
        cy.get('#quantity.quantity-select option').last().should('have.value', '10')
      })
  })

  it('should have a functional add to cart button', () => {
    cy.get('#add-to-cart').should('exist')
    cy.get('#add-to-cart').should('contain', 'Add to cart')
    cy.get('#add-to-cart').find('mat-icon').should('contain', 'shopping_cart')
  })

  it('should show proper date format for posted date', () => {
    cy.get('.product-meta').should('contain', 'Posted On:')
    
    // Check that the date follows the MMM dd, yyyy format (e.g., "Jan 01, 2023")
    cy.get('.product-meta').contains(/Posted On: \w{3} \d{2}, \d{4}/)
  })
})
