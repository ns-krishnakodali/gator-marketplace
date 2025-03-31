import { setupLoginIntercept, setupProtectedIntercept } from '../../support/intercepts'

describe('Landing Page Tests', () => {
  beforeEach(() => {
    // 1. Set up intercept for login
    setupLoginIntercept()

    // 2. Visit login page & log in
    cy.visit('/auth/login')
    cy.get('#email').type('test@ufl.edu')
    cy.get('#password').type('password123')
    cy.get('#login-button').click()
    cy.wait('@loginRequest') // Wait for login request

    // 3. Now set up the protected intercept
    setupProtectedIntercept()

    // 4. Visit the Landing Page AFTER logging in
    cy.visit('/')
  })

  it('Should load successfully and display required elements', () => {
    // Instead of searching for <header>, check for <app-navbar>
    cy.get('app-navbar').should('exist').and('be.visible')

    // Check the "cards-container" is rendered
    cy.get('.cards-container').should('exist').and('be.visible')

    // If your site doesn't have a footer, remove that assertion or adapt it:
    // e.g. cy.get('app-footer').should('exist')
    // For now, let's skip it since there's no footer in your code:
    // cy.get('footer').should('be.visible') // <-- remove if no footer

    // You can also check that spinner shows up initially if it’s loading
    // If the spinner appears only briefly, consider waiting on the request
    cy.wait('@apiProtected')
  })

  it('Should navigate correctly when clicking on internal cards', () => {
    // Because you have no <a href="/products">, we test the card click
    cy.wait('@apiProtected')

    // The first card is "Explore Marketplace"
    cy.contains('.card', 'Explore Marketplace').click()
    cy.url().should('include', '/products')

    // Go back to landing page to test the second card
    cy.visit('/')
    cy.wait('@apiProtected')

    // The second card is "List Products"
    cy.contains('.card', 'List Products').click()
    cy.url().should('include', '/list-product')
  })

  it('Should display key content sections correctly', () => {
    // Wait for /api/protected so the content is fully rendered
    cy.wait('@apiProtected')

    // Verify the two cards exist
    cy.get('.card').should('have.length', 2)

    // The first card should contain its text:
    cy.get('.card')
      .first()
      .within(() => {
        cy.contains('Explore Marketplace').should('be.visible')
        cy.contains('Discover and purchase items within UF community').should('be.visible')
      })

    // The second card should contain its text:
    cy.get('.card')
      .last()
      .within(() => {
        cy.contains('List Products').should('be.visible')
        cy.contains('Early list and sell your items among the UF community').should('be.visible')
      })
  })

  describe('Responsive Design', () => {
    // You can iterate over multiple viewport sizes
    const sizes: (Cypress.ViewportPreset | [number, number])[] = [
      'iphone-6',
      'ipad-2',
      [1024, 768],
      [1920, 1080],
    ]

    sizes.forEach((size) => {
      it(`Should display correctly on ${size} viewport`, () => {
        // Use a type guard to handle different types
        if (typeof size === 'string') {
          cy.viewport(size) // For string sizes like "iphone-6"
        } else if (Array.isArray(size)) {
          cy.viewport(size[0], size[1]) // For array sizes like [1024, 768]
        }

        // Revisit to ensure layout reloads in that viewport
        cy.visit('/')
        cy.wait('@apiProtected')

        // Check the navbar
        cy.get('app-navbar').should('exist').and('be.visible')

        // Check the cards
        cy.get('.cards-container').should('exist')
        cy.get('.card').should('have.length', 2)
      })
    })
  })
})
