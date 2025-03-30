import { setupProductDetailsIntercept } from '../../support/intercepts';


describe('Product Details Page', () => {
  beforeEach(() => {
    setupProductDetailsIntercept();
    cy.visit('/auth/product/84db83a5-7137-4541-9bbf-844c3d162645');
    cy.wait('@productDetailsRequest'); // Ensure API has resolved before running tests
  });

  it('should display the product details correctly', () => {
    cy.get('.product-details-container').should('be.visible');
    
    cy.get('.product-details-container').should('contain', 'Sports-product 93');
    cy.get('.product-details-container').should('contain', 'This is a sample description for product 93');
    cy.get('.product-details-container').should('contain', 'Posted by: GatorUser');
    cy.get('.product-details-container').should('contain', 'Quantity: 74');
    cy.get('.product-details-container').should('contain', '$41.65');
  });

  it('should display the product image', () => {
    cy.get('img')
      .should('have.attr', 'src')
      .and('include', 'Annibale%20Colombo%20Sofa/1.png');
  });

  it('should not show loading spinner after API loads', () => {
    cy.get('.loading-spinner').should('not.exist');
  });
});
