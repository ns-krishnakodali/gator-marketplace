import { setupLoginIntercept } from '../../support/intercepts'

describe('Login Component Tests', () => {
  beforeEach(() => {
    setupLoginIntercept()
    cy.visit('/auth/login')
  })

  it('Should display the login form', () => {
    cy.get('#login-form').should('exist')
    cy.get('#email').should('exist')
    cy.get('#password').should('exist')
    cy.get('#login-button').should('exist')
    cy.get('#no-account-text').should('exist')
    cy.get('#signup-button').should('exist')
  })

  it('Should not allow login with empty fields', () => {
    cy.get('#login-button').click()
    cy.get('#email').find('input').should('have.attr', 'required')
    cy.get('#password').find('input').should('have.attr', 'required')
  })

  it('Should be able to enter incorrect inputs and click login button', () => {
    cy.get('#email').type('test@example.com')
    cy.get('#password').type('password123')
    cy.get('#login-button').click()

    cy.get('#notification-text').should('exist')
    cy.get('#notification-text').should('contain', '')
  })

  it('Should be submitted on entering valid credentials', () => {
    cy.get('#email').type('test@ufl.edu')
    cy.get('#password').type('password123')
    cy.get('#login-button').click()

    cy.wait('@loginRequest')
    cy.url().should('include', '/')
  })

  it('Should navigate to the signup page when clicking the Sign Up button', () => {
    cy.get('#signup-button').click()
    cy.url().should('include', '/auth/signup')
    cy.get('#signup-form').should('exist')
  })
})
