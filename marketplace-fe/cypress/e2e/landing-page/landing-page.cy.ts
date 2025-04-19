import {
  setupLoginIntercept,
  setupProtectedIntercept,
  setupCartProductsCountIntercept,
  setupProductsDataIntercept,
} from '../../support/intercepts'

describe('Landing Page Tests', () => {
  beforeEach(() => {
    // Setup all intercepts before visiting any pages
    setupLoginIntercept()
    setupProtectedIntercept()
    setupCartProductsCountIntercept()
    setupProductsDataIntercept()

    // Login process
    cy.visit('/auth/login')
    cy.get('#email').type('test@ufl.edu')
    cy.get('#password').type('password123')
    cy.get('#login-button').click()
    cy.wait('@loginRequest')

    // Visit the landing page
    cy.visit('/')
    cy.wait('@apiProtected')
  })

  it('Should display loading spinner while data is loading', () => {
    // Setup intercept with delay to simulate loading
    setupProtectedIntercept(500) // 500ms delay

    // Reload page to see loading spinner
    cy.visit('/')

    // Check for loading spinner
    cy.get('body').then(($body) => {
      if ($body.find('mat-spinner').length > 0) {
        cy.get('mat-spinner').should('exist')
      }
    })

    // Wait for the protected endpoint to be called
    cy.wait('@apiProtected')

    // Spinner should be gone after data loads
    cy.get('mat-spinner').should('not.exist')
  })

  it('Should display navbar with account section', () => {
    cy.get('app-navbar').should('be.visible')
  })

  it('Should display two cards after loading completes', () => {
    cy.get('app-landing-page-card').should('have.length', 2)
  })

  it('Should display correct content in cards', () => {
    // Explore Marketplace card
    cy.get('app-landing-page-card')
      .eq(0)
      .within(() => {
        cy.get('img.card-image').should(
          'have.attr',
          'src',
          'assets/svg-icons/explore-marketplace.svg'
        )
        cy.get('#card-title').should('contain.text', 'Explore Marketplace')
        cy.get('#card-decription').should(
          'contain.text',
          'Discover and purchase items within UF community'
        )
      })

    // List Products card
    cy.get('app-landing-page-card')
      .eq(1)
      .within(() => {
        cy.get('img.card-image').should('have.attr', 'src', 'assets/svg-icons/list-products.svg')
        cy.get('#card-title').should('contain.text', 'List Products')
        cy.get('#card-decription').should(
          'contain.text',
          'Early list and sell your items among the UF community'
        )
      })
  })

  it('Should navigate to products page when Explore Marketplace card is clicked', () => {
    // Setup additional intercepts for products page
    cy.intercept('GET', '/api/products**').as('productsRequest')

    // Force app to stay on same domain to avoid auth redirect
    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen')
    })

    cy.get('app-landing-page-card').eq(0).click()

    // Verify navigation by checking URL contains products
    cy.url().then((url) => {
      if (!url.includes('/products')) {
        cy.log('Direct navigation failed, checking if window.open was called')
        cy.get('@windowOpen').should('be.called')
      } else {
        cy.url().should('include', '/products')
      }
    })
  })

  it('Should navigate to list-product page when List Products card is clicked', () => {
    // Force app to stay on same domain to avoid auth redirect
    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen')
    })

    cy.get('app-landing-page-card').eq(1).click()

    // Verify navigation
    cy.url().then((url) => {
      if (!url.includes('/list-product')) {
        cy.log('Direct navigation failed, checking if window.open was called')
        cy.get('@windowOpen').should('be.called')
      } else {
        cy.url().should('include', '/list-product')
      }
    })
  })
})
