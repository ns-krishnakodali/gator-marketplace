describe('Login Component Tests', () => {
    beforeEach(() => {
      cy.visit('/login'); 
    });
  
    it('Should display the login form', () => {
      cy.get('#login-form').should('exist');
      cy.get('#email').should('exist');
      cy.get('#password').should('exist');
      cy.get('#login-button').should('exist');
    });
  
    it('Should show error on empty submission', () => {
      cy.get('#login-button').click();
      cy.contains('required').should('exist');
    });
  
    it('Should login with correct credentials', () => {
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('password123');
      cy.get('#login-button').click();
      cy.url().should('include', '/dashboard');
    });
  });