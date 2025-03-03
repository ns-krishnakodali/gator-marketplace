describe('Signup Component Tests', () => {
  beforeEach(() => {
    cy.visit('/auth/signup')
  })

  it('Should display the signup form', () => {
    cy.get('#signup-form').should('exist')
    cy.get('#name').should('exist')
    cy.get('#email').should('exist')
    cy.get('#password').should('exist')
    cy.get('#confirm-password').should('exist')
    cy.get('#signup-button').should('exist')
    cy.get('#registered-text').should('exist')
    cy.get('#login-button').should('exist')
  })

  it('Should not allow signup with empty fields', () => {
    cy.get('#signup-button').click()
    cy.get('#name').find('input').should('have.attr', 'required')
    cy.get('#email').find('input').should('have.attr', 'required')
    cy.get('#password').find('input').should('have.attr', 'required')
    cy.get('#confirm-password').find('input').should('have.attr', 'required')
  })

  it('Should display a notification when passwords do not match', () => {
    cy.get('#name').type('John Doe')
    cy.get('#email').type('test@example.com')
    cy.get('#password').type('password123')
    cy.get('#confirm-password').type('password321')
    cy.get('#signup-button').click()

    cy.get('#notification-text').should('exist')
    cy.get('#notification-text').should('contain', '')
  })

  it('Should be submitted on entering valid credentials', () => {
    cy.intercept('POST', '/signup', {
      statusCode: 201,
      body: {
        message: 'User created successfully',
      },
    }).as('signupRequest')

    cy.get('#name').type('John Doe')
    cy.get('#email').type('test@ufl.edu')
    cy.get('#password').type('password123')
    cy.get('#confirm-password').type('password123')
    cy.get('#signup-button').click()

    cy.wait('@signupRequest')
    cy.get('#notification-text').should('exist')
    cy.get('#notification-text').should('contain', '')
    cy.url().should('include', '/auth/login')
  })

  it('Should navigate to the login page when clicking the Login button', () => {
    cy.get('#login-button').click()
    cy.url().should('include', '/auth/login')
    cy.get('#login-form').should('exist')
  })
})
