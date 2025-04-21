import {
  setupCartProductsCountIntercept,
  setupLoginIntercept,
  setupOrderDetailsIntercept,
  setupProtectedIntercept,
} from '../../support/intercepts'

describe('Order Component Tests', () => {
  const orderId = '4b8eecdc-af01-42da-9897-1d14378bc971'

  beforeEach(() => {
    setupLoginIntercept()
    setupProtectedIntercept()
    setupCartProductsCountIntercept()
    setupOrderDetailsIntercept()

    cy.visit('/auth/login')

    cy.get('#email').type('test@ufl.edu')
    cy.get('#password').type('password123')
    cy.get('#login-button').click()
    cy.wait('@loginRequest')

    cy.visit('/')
    cy.wait('@apiProtected')

    cy.visit(`/order/${orderId}`)
    cy.wait('@cartProductsCountRequest')
  })

  it('Should display loading spinner while fetching order details', () => {
    // Setup a delayed response to see the spinner
    setupOrderDetailsIntercept(1000)

    cy.visit(`/order/${orderId}`)
    cy.get('.loader mat-spinner').should('exist')
    cy.wait('@orderDetailsRequest')
    cy.get('.loader mat-spinner').should('not.exist')
  })

  it('Should display order details page with correct heading', () => {
    cy.wait('@orderDetailsRequest')
    cy.url().should('include', `/order/${orderId}`)
    cy.get('#order.heading').should('contain', 'Order Details')
  })

  it('Should display order summary section with correct values', () => {
    cy.wait('@orderDetailsRequest')

    cy.get('#order-summary').should('contain', 'Order Summary')
    cy.get('app-order-status').should('exist')
    cy.get('#order-id').should('contain', `Order ID: ${orderId}`)
    cy.get('#date-placed').should('contain', 'Date Placed: April 21, 2025')
    cy.get('#payment-method').should('contain', 'Payment Method: Cash')
  })

  it('Should display meetup details section with correct values', () => {
    cy.wait('@orderDetailsRequest')

    cy.get('.order-meetup-heading').should('contain', 'Meetup Details')
    cy.get('#location').should('contain', 'Location: 1233 SW 5th Ave, Gainesville, FL 32601, USA')
    cy.get('#date').should('contain', 'Date: 2025-04-26')
    cy.get('#time').should('contain', 'Time: 23:30')
    cy.get('#notes').should('contain', 'Notes: Make sure its in good condition.')
  })

  it('Should handle error when fetching order details fails', () => {
    cy.intercept('GET', '**/api/order/*', {
      statusCode: 500,
      body: { message: 'Failed to fetch order details' },
    }).as('orderDetailsErrorRequest')

    cy.visit(`/order/${orderId}`)
    cy.wait('@orderDetailsErrorRequest')

    cy.get('.loader mat-spinner').should('not.exist')
  })

  it('Should display order items section with correct values', () => {
    cy.wait('@orderDetailsRequest')

    cy.get('.order-items-container').should('exist')
    cy.get('#order-items').should('contain', 'Items in Order')

    cy.get('.seller-details app-text').eq(0).should('contain', 'Seller: GatorUsere5d979')
    cy.get('.seller-details app-text').eq(1).should('contain', 'Contact: 289-128-9342')

    cy.get('.product-details app-text').eq(0).should('contain', '1 x Furniture-product 67')
    cy.get('.product-details app-text').eq(1).should('contain', '$10.68')

    cy.get('.price-details-container .price-detail')
      .eq(0)
      .find('app-text')
      .eq(0)
      .should('contain', 'Handling Fee')
    cy.get('.price-details-container .price-detail')
      .eq(0)
      .find('app-text')
      .eq(1)
      .should('contain', '$1.00')

    cy.get('.price-details-container .price-detail')
      .eq(1)
      .find('app-text')
      .eq(0)
      .should('contain', 'Total')
    cy.get('.price-details-container .price-detail')
      .eq(1)
      .find('app-text')
      .eq(1)
      .should('contain', '$10.68')
  })
})
