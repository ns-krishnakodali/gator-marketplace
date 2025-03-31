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
  }).as('updatePasswordRequest')
}

export const setupProductDetailsIntercept = () => {
  cy.intercept('GET', '/api/product/*', {
    statusCode: 200,
    body: {
      ID: 0,
      Pid: 'cb1aea77-427a-4abe-bf9f-649145369dfa',
      Name: 'Sports-product 27',
      Description: 'This is a sample description for product 27',
      Price: 75.8,
      Category: 'Sports',
      PostedBy: 'GatorUser',
      Quantity: 92,
      PopularityScore: 9.83,
      CreatedAt: '2025-03-30T23:48:15.295084-04:00',
      UpdatedAt: '2025-03-30T23:48:15.295084-04:00',
      Images: [
        {
          ID: 27,
          Pid: 'cb1aea77-427a-4abe-bf9f-649145369dfa',
          MimeType: 'image/jpeg',
          Url: 'https://cdn.dummyjson.com/products/images/groceries/Apple/1.png',
          IsMain: true,
          CreatedAt: '2025-03-30T23:48:15.295602-04:00',
          UpdatedAt: '2025-03-30T23:48:15.295602-04:00',
        },
      ],
    },
  }).as('productDetailsRequest')
}
