import {
  setupLoginIntercept,
  setupProtectedIntercept,
  setupCartProductsCountIntercept,
} from '../../support/intercepts'

describe('List Product Page Tests', () => {
  beforeEach(() => {
    setupLoginIntercept()
    setupProtectedIntercept()
    setupCartProductsCountIntercept()

    cy.visit('/auth/login')

    cy.get('#email').type('test@ufl.edu')
    cy.get('#password').type('password123')
    cy.get('#login-button').click()
    cy.wait('@loginRequest')

    cy.visit('/')
    cy.wait('@apiProtected')

    cy.visit('/list-product')
    cy.wait('@cartProductsCountRequest')
  })

  it('Should display the list product page structure', () => {
    cy.get('app-navbar').should('exist')
    cy.get('.list-product-container').should('exist')
    cy.get('#list-product-heading').should('contain', 'List a New Product')

    cy.get('form').should('exist')
  })

  it('Should display product details form with all required fields', () => {
    cy.get('.product-details-heading').should('contain', 'Product Details')

    cy.get('label[for="product-name"]').should('contain', 'Product Name*')
    cy.get('#product-name')
      .should('exist')
      .and('have.attr', 'type', 'text')
      .and('have.attr', 'placeholder', 'Enter Product Name')
      .and('have.attr', 'required')

    cy.get('label[for="product-description"]').should('contain', 'Description*')
    cy.get('#product-description')
      .should('exist')
      .and('have.attr', 'placeholder', 'Provide details about your product')
      .and('have.attr', 'required')

    cy.get('label[for="product-price"]').should('contain', 'Price* ($)')
    cy.get('#product-price')
      .should('exist')
      .and('have.attr', 'type', 'number')
      .and('have.attr', 'step', '0.01')
      .and('have.attr', 'placeholder', '0.00')
      .and('have.attr', 'required')

    cy.get('label[for="product-category"]').should('contain', 'Category*')
    cy.get('#product-category').should('exist').and('have.attr', 'required')
    cy.get('#product-category option').first().should('contain', '-- Select a category --')

    cy.get('label[for="product-quantity"]').should('contain', 'Quantity*')
    cy.get('#product-quantity')
      .should('exist')
      .and('have.attr', 'type', 'number')
      .and('have.attr', 'value', '1')
      .and('have.attr', 'required')
  })

  it('Should display list product button', () => {
    cy.get('.list-product-button-container').should('exist')

    cy.get('#list-product-button')
      .should('exist')
      .and('have.attr', 'type', 'submit')
      .and('contain', 'List Product')
      .and('have.class', 'list-product-button')
  })

  it('Should display loading spinner when form is submitting', () => {
    cy.intercept('POST', '**/api/product/**', (req) => {
      req.reply({
        statusCode: 200,
        delay: 1000,
        body: { success: true },
      })
    }).as('submitProduct')

    cy.get('#product-name').type('Test Product')
    cy.get('#product-description').type('Test Description')
    cy.get('#product-price').type('10.99')
    cy.get('#product-category').select(1) // Select first real option
    cy.get('#product-quantity').clear().type('2')

    cy.get('#list-product-button').click()

    cy.get('mat-spinner').should('exist').and('have.attr', 'diameter', '40')
  })

  it('Should support drag and drop for images', () => {
    cy.get('.upload-product-images-container').should('exist')
    cy.get('.upload-product-images-container').trigger('dragover').trigger('drop')
  })
})
