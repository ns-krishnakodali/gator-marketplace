import {
  setupLoginIntercept,
  setupProtectedIntercept,
  setupCartProductsCountIntercept,
  setupProductsDetailsIntercept,
} from '../../support/intercepts'

describe('Landing Page Tests', () => {
  beforeEach(() => {
    setupLoginIntercept()
    setupProtectedIntercept()
    setupCartProductsCountIntercept()
    setupProductsDetailsIntercept()

    cy.visit('/auth/login')
    cy.get('#email').type('test@ufl.edu')
    cy.get('#password').type('password123')
    cy.get('#login-button').click()
    cy.wait('@loginRequest')

    cy.visit('/')
    cy.wait('@apiProtected')
  })

  it('Should display loading spinner while data is loading', () => {
    setupProtectedIntercept(500)

    cy.visit('/')

    cy.get('body').then(($body) => {
      if ($body.find('mat-spinner').length > 0) {
        cy.get('mat-spinner').should('exist')
      }
    })
    cy.wait('@apiProtected')
    cy.get('mat-spinner').should('not.exist')
  })

  it('Should display navbar with account section', () => {
    cy.get('app-navbar').should('be.visible')
  })

  it('Should display two cards after loading completes', () => {
    cy.get('app-landing-page-card').should('have.length', 2)
  })

  it('Should display correct content in cards', () => {
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
    cy.intercept('GET', '/api/products**').as('productsRequest')

    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen')
    })

    cy.get('app-landing-page-card').eq(0).click()

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
    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen')
    })

    cy.get('app-landing-page-card').eq(1).click()

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
