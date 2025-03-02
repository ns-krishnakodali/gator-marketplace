describe('Signup Component Tests', () => {
    beforeEach(() => {
      cy.visit('/signup'); 
    });
  
    it('Should display the signup form', () => {
      cy.get('#signup-form').should('exist');
      cy.get('#name').should('exist');
      cy.get('#email').should('exist');
      cy.get('#password').should('exist');
      cy.get('#confirm-password').should('exist');
      cy.get('#signup-button').should('exist');
    });
  
    it('Should show error on mismatched passwords', () => {
      cy.get('#name').type('Test User');
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('password123');
      cy.get('#confirm-password').type('password321');
      cy.get('#signup-button').click();
      cy.contains('Passwords do not match').should('exist');
    });
  
    it('Should signup with correct details', () => {
      cy.get('#name').type('Test User');
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('password123');
      cy.get('#confirm-password').type('password123');
      cy.get('#signup-button').click();
      cy.url().should('include', '/dashboard');
    });
  });
  