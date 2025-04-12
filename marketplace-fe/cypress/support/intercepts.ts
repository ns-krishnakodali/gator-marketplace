export const setupLoginIntercept = () => {
  cy.intercept('POST', '/login', {
    statusCode: 200,
    body: {
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDEwMTQzNzAsInVzZXJfaWQiOjR9.SrJ9IBTPZsFNxMw-Hijygfq3tCBuWId_38GfWz0Csww',
    },
  }).as('loginRequest')
}

export const setupProtectedIntercept = (delay = 0) => {
  cy.intercept('GET', '/api/protected', {
    statusCode: 200,
    delay,
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

export const setupUpdateAccountIntercept = (delay = 0) => {
  cy.intercept('PUT', '/api/update-account', {
    statusCode: 204,
    delay,
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
      pid: 'cb1aea77-427a-4abe-bf9f-649145369dfa',
      userUid: '77ff828f-210e-456b-a1ea-476a3ca9c503',
      name: 'Sports-product 27',
      price: 75.8,
      description: 'This is a sample description for product 27',
      category: 'Sports',
      quantity: 92,
      popularityScore: 9.83,
      postedAt: '2025-04-12T14:02:00.221882-04:00',
      postedBy: 'GatorUser',
      images: [
        {
          url: 'https://cdn.dummyjson.com/products/images/groceries/Apple/1.png',
          mimeType: 'image/jpeg',
          isMain: true,
        },
      ],
    },
  }).as('productDetailsRequest')
}
