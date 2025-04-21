describe('List Product Page Tests', () => {
    beforeEach(() => {
      cy.visit('/list-product') 
    })
  
    it('Should display all form fields', () => {
      cy.get('form').should('exist')
      cy.get('input[name="name"]').should('exist')
      cy.get('textarea[name="description"]').should('exist')
      cy.get('input[name="price"]').should('exist')
      cy.get('select[name="category"]').should('exist')
      cy.get('input[name="quantity"]').should('exist')
      cy.get('input[type="file"]').should('exist')
      cy.get('#list-product-button').should('exist')
    })
  
    it('Should prevent submission with empty fields', () => {
      cy.get('#list-product-button').click()
      cy.get('input:invalid').should('have.length.greaterThan', 0)
    })
  
    it('Should allow selecting category', () => {
      cy.get('select[name="category"]').select('Books')
      cy.get('select[name="category"]').should('have.value', 'Books')
    })
  
    it('Should upload and preview image', () => {
      // Skip if no sample image is available
      cy.get('input[type="file"]').selectFile('cypress/fixtures/sample.jpg', { force: true })
      cy.get('.image-preview').should('exist')
      cy.get('.remove-image-button').click()
      cy.get('.image-preview').should('not.exist')
    })
  
    it('Should submit form with valid input', () => {
      cy.intercept('POST', '/api/products', {
        statusCode: 201,
        body: { message: 'Product listed successfully' }
      }).as('submitProduct')
  
      cy.get('input[name="name"]').type('Demo Product')
      cy.get('textarea[name="description"]').type('Nice and clean')
      cy.get('input[name="price"]').type('20')
      cy.get('select[name="category"]').select('Electronics')
      cy.get('input[name="quantity"]').type('5')
      cy.get('input[type="file"]').selectFile('cypress/fixtures/sample.jpg', { force: true })
  
      cy.get('#list-product-button').click()
      cy.wait('@submitProduct')
      cy.get('#notification-text').should('contain', 'Product listed successfully')
    })
  
    it('Should show spinner during submission', () => {
      cy.intercept('POST', '/api/products', (req) => {
        req.reply((res) => {
          res.setDelay(1000)
          res.send({ message: 'Success' })
        })
      }).as('delayedSubmit')
  
      cy.get('input[name="name"]').type('Delayed')
      cy.get('textarea[name="description"]').type('With spinner')
      cy.get('input[name="price"]').type('15')
      cy.get('select[name="category"]').select('Books')
      cy.get('input[name="quantity"]').type('3')
      cy.get('#list-product-button').click()
  
      cy.get('mat-spinner').should('exist')
      cy.get('#list-product-button').should('not.exist')
      cy.wait('@delayedSubmit')
    })
  
    it('Should be responsive on preset devices', () => {
      const presets: Cypress.ViewportPreset[] = ['iphone-6', 'ipad-2']
      presets.forEach(preset => {
        cy.viewport(preset)
        cy.visit('/list-product')
        cy.get('form').should('exist')
      })
    })
  
    it('Should be responsive on custom screen sizes', () => {
      const sizes: [number, number][] = [[1024, 768], [1440, 900]]
      sizes.forEach(([w, h]) => {
        cy.viewport(w, h)
        cy.visit('/list-product')
        cy.get('form').should('exist')
      })
    })
  })
  