export const setupLoginIntercept = () => {
  cy.intercept('POST', '/login', {
    statusCode: 200,
    body: {
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDEwMTQzNzAsInVzZXJfaWQiOjR9.SrJ9IBTPZsFNxMw-Hijygfq3tCBuWId_38GfWz0Csww',
    },
  }).as('loginRequest');
};

export const setupProtectedIntercept = () => {
  cy.intercept('GET', '/api/protected', {
    statusCode: 200,
    body: {
      message: 'You have accessed a protected endpoint!',
    },
  }).as('apiProtected');
};

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
  }).as('accountDetailsRequest');
};

export const setupUpdateAccountIntercept = (delay?: number) => {
  cy.intercept('PUT', '/api/update-account', {
    statusCode: 204,
    delay: delay ?? 0,
  }).as('updateAccountRequest');
};

export const setupUpdatePasswordIntercept = () => {
  cy.intercept('PUT', '/api/update-password', {
    statusCode: 204,
  }).as('updatePasswordRequest');
};

export const setupProductDetailsIntercept = () => {
  cy.intercept('GET', '/api/product-details/*', {
    statusCode: 200,
    body: {
      productDetails: {
        ID: 0,
        Pid: '84db83a5-7137-4541-9bbf-844c3d162645',
        Name: 'Sports-product 93',
        Description: 'This is a sample description for product 93',
        Price: 41.65,
        Category: 'Sports',
        PostedBy: 'GatorUser',
        Quantity: 74,
        PopularityScore: 9.96,
        CreatedAt: '2025-03-29T14:03:45.258158-04:00',
        UpdatedAt: '2025-03-29T14:03:45.258158-04:00',
        Images: [
          {
            ID: 93,
            Pid: '84db83a5-7137-4541-9bbf-844c3d162645',
            MimeType: 'image/jpeg',
            Url: 'https://cdn.dummyjson.com/products/images/furniture/Annibale%20Colombo%20Sofa/1.png',
            IsMain: true,
            CreatedAt: '2025-03-29T14:03:45.258676-04:00',
            UpdatedAt: '2025-03-29T14:03:45.258676-04:00'
          }
        ]
      }
    }
  }).as('productDetailsRequest');
};
