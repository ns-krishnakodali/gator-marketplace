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

  it('Should display landing page cards after loading completes', () => {
    cy.wait('@apiProtected')
    cy.get('mat-spinner').should('not.exist')
    cy.get('.card').should('have.length', 2)
  })

  it('Should navigate to /products when Explore Marketplace is clicked', () => {
    cy.wait('@apiProtected')
    cy.get('.card').eq(0).click()
    cy.url().should('include', '/products')
  })

  it('Should navigate to /list-product when List Products is clicked', () => {
    cy.wait('@apiProtected')
    cy.get('.card').eq(1).click()
    cy.url().should('include', '/list-product')
  })
})
