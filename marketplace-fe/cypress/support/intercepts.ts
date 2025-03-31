export const setupLoginIntercept = () => {
  cy.intercept('POST', '/login', {
    statusCode: 200,
    body: {
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDEwMTQzNzAsInVzZXJfaWQiOjR9.SrJ9IBTPZsFNxMw-Hijygfq3tCBuWId_38GfWz0Csww',
    },
  }).as('loginRequest')
}

export const setupProtectedIntercept = () => {
  cy.intercept('GET', '/api/protected', {
    statusCode: 200,
    body: {
      message: 'You have accessed a protected endpoint!',
    },
  }).as('apiProtected')
}

export const setupAccountDetailsIntercept = () => {
  cy.intercept('GET', '/api/account-details', {
    statusCode: 200,
    body: {
      accountDetails: {
        displayImageUrl: '',
        name: 'John Doe',
        displayName: 'GatorUser',
        email: 'test@ufl.edu',
        mobile: '123-456-7890',
      },
    },
  }).as('accountDetailsRequest')
}

export const setupUpdateAccountIntercept = (delay?: number) => {
  cy.intercept('PUT', '/api/update-account', {
    statusCode: 204,
    delay: delay ?? 0,
  }).as('updateAccountRequest')
}

export const setupUpdatePasswordIntercept = () => {
  cy.intercept('PUT', '/api/update-password', {
    statusCode: 204,
  }).as('updatePasswordRequest');
}