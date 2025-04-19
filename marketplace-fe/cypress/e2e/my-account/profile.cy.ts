import {
  setupLoginIntercept,
  setupProtectedIntercept,
  setupAccountDetailsIntercept,
  setupUpdateAccountIntercept,
  setupUpdatePasswordIntercept,
  setupCartProductsCountIntercept,
} from '../../support/intercepts'

describe('Profile Component Tests', () => {
  beforeEach(() => {
    setupLoginIntercept()
    setupProtectedIntercept()
    setupAccountDetailsIntercept()
    setupCartProductsCountIntercept()

    cy.visit('/auth/login')

    cy.get('#email').type('test@ufl.edu')
    cy.get('#password').type('password123')
    cy.get('#login-button').click()
    cy.wait('@loginRequest')

    cy.visit('/')
    cy.wait('@apiProtected')

    cy.visit('/my-account')
    cy.wait('@cartProductsCountRequest')
    cy.wait('@accountDetailsRequest')
  })

  it('Should be visting my-account section', () => {
    cy.url().should('include', '/my-account')

    cy.get('.heading').should('contain', 'My Account')

    cy.get('.account-section-list li').should('have.length', 3)
    cy.get('.account-section-list li').eq(0).should('contain', 'My Profile')
    cy.get('.account-section-list li').eq(1).should('contain', 'Orders')
    cy.get('.account-section-list li').eq(2).should('contain', 'Listings')

    cy.get('.account-section-icon').should('have.length', 3) // 3 icons for Profile, Orders, and Listings

    cy.get('.logout-button').should('exist').and('contain', 'Logout')
  })

  it('Should display the Profile Information section with correct values', () => {
    cy.get('.profile-heading').should('contain', 'Profile Information')

    cy.get('.display-picture').should('exist')
    cy.get('.upload-label').should(($label) => {
      const text = $label.text()
      expect(text).to.match(/Upload|Change Image/)
    })

    // Verify Profile Input Fields with Values and Update Details Button
    cy.get('#name input').should('have.value', 'John Doe')

    cy.get('#display-name input').should('have.value', 'GatorUser')
    cy.get('#email input').should('have.value', 'test@ufl.edu')
    cy.get('#mobile-number input').should('have.value', '123-456-7890')

    cy.get('#update-details-button').should('exist').and('contain', 'Update Details')

    // Verify Password Fields and Modify Password Button
    cy.get('h3.profile-heading').should('contain', 'Password')
    cy.get('#old-password input').should('exist').and('have.attr', 'placeholder', 'Old Password')
    cy.get('#new-password input').should('exist').and('have.attr', 'placeholder', 'New Password')
  })

  it('Should update account details successfully', () => {
    setupUpdateAccountIntercept()

    // Modify Profile Fields and click Update Button
    cy.get('#name input').clear().type('Updated Name')
    cy.get('#display-name input').clear().type('UpdatedDisplay')
    cy.get('#email  input').clear().type('updated@ufl.edu')
    cy.get('#mobile-number input').clear().type('999-888-7777')
    cy.get('#update-details-button').contains('Update Details').click()

    cy.wait('@updateAccountRequest')

    // Ensure the new values are reflected
    cy.get('#name input').should('have.value', 'Updated Name')
    cy.get('#display-name input').should('have.value', 'UpdatedDisplay')
    cy.get('#email input').should('have.value', 'updated@ufl.edu')
    cy.get('#mobile-number input').should('have.value', '999-888-7777')
  })

  it('Should show a spinner while updating profile details', () => {
    setupUpdateAccountIntercept(1000)

    cy.get('#update-details-button').click()
    cy.get('mat-spinner').should('exist')
    cy.wait('@updateAccountRequest')

    cy.get('#update-details-button').should('contain', 'Update Details')
  })

  it('Should update password successfully', () => {
    // Mock Successful Update Response
    setupUpdatePasswordIntercept()

    // Modify Profile Password and click modify Button
    cy.get('#old-password input').type('oldPass123')
    cy.get('#new-password input').type('newPass456')
    cy.get('#modify-password-button').contains('Modify Password').click()

    cy.wait('@updatePasswordRequest')

    cy.get('#modify-password-button').should('contain', 'Modify Password')
  })
})
