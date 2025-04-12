import { setupLoginIntercept, setupProtectedIntercept } from '../../support/intercepts'

describe('Landing Page Tests', () => {
  beforeEach(() => {
    setupLoginIntercept()

    cy.visit('/auth/login')
    cy.get('#email').type('test@ufl.edu')
    cy.get('#password').type('password123')
    cy.get('#login-button').click()
    cy.wait('@loginRequest')

    setupProtectedIntercept()

    cy.visit('/')
  })

  it('Should display loading spinner while data is loading', () => {
    cy.get('body').then(($body) => {
      if ($body.find('mat-spinner').length > 0) {
        cy.get('mat-spinner').should('exist')
      }
    })

    cy.wait('@apiProtected')

    cy.get('mat-spinner').should('not.exist')
  })

  it('Should display navbar with account section', () => {
    cy.wait('@apiProtected');
    cy.get('app-navbar').should('be.visible');
  });

  it('Should display two cards after loading completes', () => {
    cy.wait('@apiProtected');
    cy.get('app-landing-page-card').should('have.length', 2);
  });

  it('should display correct content in cards', () => {
    cy.wait('@apiProtected');
    
    // Explore Marketplace card
    cy.get('app-landing-page-card').eq(0).within(() => {
      cy.get('img.card-image').should('have.attr', 'src', 'assets/svg-icons/explore-marketplace.svg');
      cy.get('#card-title').should('contain.text', 'Explore Marketplace');
      cy.get('#card-decription').should('contain.text', 'Discover and purchase items within UF community');
    });
    
    // List Products card
    cy.get('app-landing-page-card').eq(1).within(() => {
      cy.get('img.card-image').should('have.attr', 'src', 'assets/svg-icons/list-products.svg');
      cy.get('#card-title').should('contain.text', 'List Products');
      cy.get('#card-decription').should('contain.text', 'Early list and sell your items among the UF community');
    });
  });

  it('should navigate to products page when Explore Marketplace card is clicked', () => {
    cy.wait('@apiProtected');

    cy.get('app-landing-page-card').eq(0).click();
    cy.url().should('include', '/products');
  });

  // it('should navigate to list-product page when List Products card is clicked', () => {
  //   cy.wait('@apiProtected');
    
  //   // Click the List Products card and check URL
  //   cy.get('app-landing-page-card').eq(1).click();
  //   cy.url().should('include', '/list-product');
  // });
})
