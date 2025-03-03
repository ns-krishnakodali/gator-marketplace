# Sprint 2 Restrospective

## Table of Contents

1. [User Stories](#user-stories)
2. [Sprint Planning](#sprint-planning)
3. [Development](#development)
4. [API Documentation](#api-documentation)
5. [Testing](#testing)
6. [Completed Stories](#completed-stories)

## User Stories

- Created [**5 epics**](https://github.com/users/KrishnaKodali99/projects/4/views/6?filterQuery=label%3A%22sprint-2%22+label%3Aepic) and [**16 user stories**](https://github.com/users/KrishnaKodali99/projects/4/views/6?filterQuery=label%3A%22sprint-2%22+label%3Astory) during this sprint.
- The user stories cover the development of new features, API integrations, and application testing.

## Sprint Planning

- Sprint 2 [Board](https://github.com/users/KrishnaKodali99/projects/4/views/6)
- Conducted sprint planning and distributed tasks among participants.
- This sprint focuses on:
  - Integrating APIs for user authentication.
  - Developing the landing page.
  - Developing the products page, including pagination and complete API integrations.
  - Implementing unit tests for both backend and frontend.
  - Working on additional pending tasks.
- Each task is prefixed with **FE** (Frontend), **BE** (Backend), or **App** (Application).
  - **FE**: Frontend
  - **BE**: Backend
  - **App**: Application
- Tasks are labeled as:
  - **Enhancement**: Significant application development
  - **Configuration**: Related to configuration changes only
- All **PRs** (Pull Requests) are linked to tasks upon moving to the **In Review** phase.
- Workflow stages for tasks:
  1. **Todo**
  2. **In Progress**
  3. **In Review**
  4. **Done**

## Development

### FE (Frontend)

- **Integrated APIs** for user authentication.
- **Configured routes** and implemented **Auth guards** for controlled access.
- Developed a reusable **Notifications component** for the application.
- Created the **Landing Page** along with its corresponding components.
- Built the **Products Page** and its associated component.
- Integrated the Products Page with **APIs**, including filters for categories and pagination.
- **Added additional unit tests** for all developed components.

### BE (Backend)

- Developed a **mock products script** for generating dummy product data and adding it to the **database**.
- Created a **Products API** to fetch product details based on **pagination** and **category filters**.
- Created a **Product API** to retrieve product details using its **PID**.
- Partially developed the **Delete** and **Update** APIs to modify product details using the product- s **PID**.
- **Added unit tests** for **Auth and Product API** functionalities.
- Implemented **GitHub workflows** for running unit tests.

### App (Application)

- Integrated **Authentication APIs** (Login and Signup) in the **Angular application**.
- Configured **Cypress for end-to-end (E2E) testing**, including installation, necessary settings, and test environment setup.
- Written **Cypress tests** to validate the functionality of **Login and Signup pages**, ensuring correct form submission and field validations.

## API Documentation

### **1. Login API**

**Endpoint:** `POST /login`  
**Description:** Authenticates a user and returns a token upon successful login.

**Request Body:**

```json
{
  "email": "johndoe@example.com",
  "password": "securepassword123"
}
```

**Responses:**

- **200 OK:** Authentication successful, returns a JWT token.

  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
  }
  ```

- **400 Bad Request:** Invalid input format.

  ```json
  {
    "message": "Invalid input format"
  }
  ```

- **404 Not Found:** Incorrect email or user does not exist.

  ```json
  {
    "message": "Invalid credentials, try again"
  }
  ```

- **401 Unauthorized:** Incorrect password.

  ```json
  {
    "message": "Invalid credentials, try again"
  }
  ```

- **500 Internal Server Error:** Token generation failure.
  ```json
  {
    "message": "Failed to generate token"
  }
  ```

### **2. Signup API**

**Endpoint:** `POST /signup`  
**Description:** Registers a new user by creating an account with a unique email and hashed password.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "password": "securepassword123"
}
```

**Responses:**

- **201 Created:** User successfully registered.

  ```json
  {
    "message": "User created successfully"
  }
  ```

- **400 Bad Request:** Invalid input format.

  ```json
  {
    "message": "Invalid input format"
  }
  ```

- **409 Conflict:** Email is already registered.

  ```json
  {
    "message": "Email already registered"
  }
  ```

- **500 Internal Server Error:** Unexpected error during user creation.
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

---

### **3. Get Products**

**Endpoint:** `GET /products`  
**Description:** Fetch a list of products with optional filtering, sorting, and pagination.

**Query Parameters:**

- `categories`: Comma-separated list of categories (e.g., `Electronics,Books`)
- `sort`: Sorting order (`price_asc`, `price_desc`, `name_asc`, `name_desc`, `newest`, `most_popular`)
- `page`: Page number (default: 1)
- `pageSize`: Number of products per page (default: 10)

**Responses:**

- **200 OK:** Products successfully fetched with pagination metadata.

  ```json
  {
    "data": [
      {
        "pid": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Smartphone",
        "description": "Latest model with high-end specifications",
        "price": 699.99,
        "category": "Electronics",
        "quantity": 50,
        "images": [
          {
            "id": 1,
            "pid": "123e4567-e89b-12d3-a456-426614174000",
            "mimeType": "image/jpeg",
            "url": "https://example.com/image1.jpg",
            "isMain": true
          }
        ]
      }
    ],
    "page": 1,
    "pageSize": 10,
    "totalItems": 100,
    "totalPages": 10
  }
  ```

- **400 Bad Request:** Invalid sort parameter or category.

  ```json
  {
    "error": "Invalid sort parameter"
  }
  ```

- **500 Internal Server Error:** Error fetching products.
  ```json
  {
    "error": "Could not fetch products"
  }
  ```

---

### **4. Get Product by PID**

**Endpoint:** `GET /products/:pid`  
**Description:** Retrieve a product by its unique product ID (PID).

**URL Parameters:**

- `pid`: Product ID (UUID)

**Responses:**

- **200 OK:** Product successfully fetched.

  ```json
  {
    "pid": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Smartphone",
    "description": "Latest model with high-end specifications",
    "price": 699.99,
    "category": "Electronics",
    "quantity": 50,
    "images": [
      {
        "id": 1,
        "pid": "123e4567-e89b-12d3-a456-426614174000",
        "mimeType": "image/jpeg",
        "url": "https://example.com/image1.jpg",
        "isMain": true
      }
    ]
  }
  ```

- **404 Not Found:** Product with specified PID not found.
  ```json
  {
    "error": "Product not found"
  }
  ```

---

### **5. Update Product**

**Endpoint:** `PUT /products/:pid`  
**Description:** Update the details of an existing product by its PID, including optional image updates.

**URL Parameters:**

- `pid`: Product ID (UUID)

**Request Body:**

```json
{
  "name": "Updated Smartphone",
  "description": "Updated model with even better specifications",
  "price": 799.99,
  "category": "Electronics",
  "quantity": 100,
  "images": [
    {
      "mimeType": "image/jpeg",
      "url": "https://example.com/image3.jpg",
      "isMain": true
    }
  ]
}
```

**Responses:**

- **200 OK:** Product successfully updated.

  ```json
  {
    "pid": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Updated Smartphone",
    "description": "Updated model with even better specifications",
    "price": 799.99,
    "category": "Electronics",
    "quantity": 100,
    "images": [
      {
        "id": 3,
        "pid": "123e4567-e89b-12d3-a456-426614174000",
        "mimeType": "image/jpeg",
        "url": "https://example.com/image3.jpg",
        "isMain": true
      }
    ]
  }
  ```

- **400 Bad Request:** Invalid category or input format.

  ```json
  {
    "error": "Invalid category: Electronics"
  }
  ```

- **404 Not Found:** Product with specified PID not found.

  ```json
  {
    "error": "Product not found"
  }
  ```

- **500 Internal Server Error:** Error updating the product.
  ```json
  {
    "error": "Could not update product"
  }
  ```

---

### **6. Delete Product**

**Endpoint:** `DELETE /products/:pid`  
**Description:** Delete a product by its PID, including associated images.

**URL Parameters:**

- `pid`: Product ID (UUID)

**Responses:**

- **200 OK:** Product successfully deleted.

  ```json
  {
    "message": "Product deleted successfully"
  }
  ```

- **404 Not Found:** Product with specified PID not found.

  ```json
  {
    "error": "Product not found"
  }
  ```

- **500 Internal Server Error:** Error deleting the product.
  ```json
  {
    "error": "Could not delete product"
  }
  ```

---

## Testing

### Cypress Tests for Application

The following Cypress end-to-end tests cover authentication functionality:

#### Authentication Tests

- `cypress/e2e/auth/login.cy.ts`
  - Should display the login form
  - Should not allow login with empty fields
  - Should be able to enter incorrect inputs and click login button
  - Should be submitted on entering valid credentials
  - Should navigate to the signup page when clicking the Sign Up button
- `cypress/e2e/auth/signup.cy.ts`
  - Should display the signup form
  - Should not allow signup with empty fields
  - Should display a notification when passwords do not match
  - Should be submitted on entering valid credentials
  - Should navigate to the login page when clicking the Login button

### Unit Tests for Angular Components (FE)

The following unit tests cover **82** different scenarios for various Angular components:

#### Authentication

- `src/app/features/auth/components/form/form.component.spec.ts`
  - should create the form component
  - should bind the id correctly
  - should bind the heading correctly
  - should emit the submitForm event when the form is submitted
  - should prevent default form submission behavior
- `src/app/features/auth/pages/login/login.component.spec.ts`
  - should create
  - should call handleUserLogin on submit
  - should call handleOnSignup on onSignUp
- `src/app/features/auth/pages/signup/signup.component.spec.ts`
  - should create
  - should call handleUserSignup on onSubmit
  - should call handleOnLogin on onLogin
- `src/app/features/auth/services/login/login.service.spec.ts`
  - should be created
  - should show an error if login fields are empty
  - should show an error if email is invalid
  - should show an error if email is not from UFL domain
  - should call API and navigate on successful login
  - should show error notification if login fails
  - should handle API error response correctly
  - should set isLoading to false on API failuredone
  - should navigate to signup page
- `src/app/features/auth/services/signup/signup.service.spec.ts`
  - should be created
  - should show an error if signup fields are empty
  - should show an error if email is invalid
  - should show an error if email is not from UFL domain
  - should show an error if passwords do not match
  - should call API and navigate on successful signup
  - should handle API error response correctly
  - should set isLoading to false on API failuredone
  - should navigate to login page

#### Landing Page

- `src/app/features/landing-page/components/landing-page-card/landing-page-card.component.spec.ts`
  - should create the component
  - should display the correct title and description
  - should set the correct image source and alt attributes
  - should call onCardClick when card is clicked
- `src/app/features/landing-page/landing-page.component.spec.ts`
  - should create the landing page component
  - should pass the correct input to the NavbarComponent
  - should render two cards in the cards-container
  - should call navigateTo with correct URL when onExploreMarketplaceClick is called
  - should call navigateTo with correct URL when onListProductsClick is called

#### Products

- `src/app/features/products/components/display-products/display-products.component.spec.ts`
  - should create

#### Shared UI Components

- `src/app/shared-ui/button/button.component.spec.ts`
  - should create the button component
  - should disable the button when disabled is true
  - should call the onClickHandler when clicked
  - should not call the onClickHandler when disabled is true
- `src/app/shared-ui/input/input.component.spec.ts`
  - should create the component
  - should bind id property
  - should bind class property
  - should bind value property
  - should bind checked property for checkbox type
  - should bind disabled property
  - should emit valueChange event on input value change
  - should emit checkedChange event on checkbox change
  - should handle radio button input correctly
  - should handle text input correctly
  - should not emit events when input is disabled
  - should bind placeholder property
  - should bind required property
  - should emit valueChange with the correct value when the input is changed
- `src/app/shared-ui/navbar/navbar.component.spec.ts`
  - should create the navbar component
  - should call goToLandingPage when the logo is clicked
  - should call goToLandingPage when the enter key is pressed on the logo
  - should display search bar when showSearchBar is true
  - should not display search bar when showSearchBar is false
  - should display My Account link when showAccount is true
  - should not display My Account link when showAccount is false
  - should display Cart link when showCart is true
  - should not display Cart link when showCart is false
  - should call NavbarService.navigateToLandingPage when goToLandingPage is called
- `src/app/shared-ui/notifications/notifications.component.spec.ts`
  - should create
  - should display all notifications
  - should display the correct message for each notification
  - should apply the correct CSS class based on notification type
  - should call removeNotification when close icon is clicked
  - should call removeNotification when Enter key is pressed on close icon
  - should add a new notification
  - should remove a notification by id
  - should correctly display notifications with special characters
  - should clear all notifications when clearNotifications is called
- `src/app/shared-ui/text/text.component.spec.ts`
  - should create the text component
  - should apply the default size "medium" if no size is provided
  - should apply the correct size class based on the input size
  - should apply the correct id
  - should render the content projected using ng-content

### Unit Tests for Go Files (Backend)

The following unit tests cover various backend functionalities:

#### Test Utilities

- `test_utils/test_utils.go`

#### Authentication Tests

- `tests/auth_test.go`
  - TestLogin_Success
  - TestLogin_UserNotFound
  - TestLogin_InvalidCredentials
  - TestLogin_BadRequest_InvalidJSON
  - TestSignup_Success
  - TestSignup_EmailAlreadyRegistered
  - TestSignup_BadRequest_InvalidJSON
  - TestSignup_BadRequest_Validation

#### Product Tests

- `tests/products_test.go`
  - TestCreateProduct_Success
  - TestCreateProduct_InvalidCategory
  - TestGetProducts_Simple
  - TestGetProducts_FilterAndSort
  - TestGetProductByPID_Success
  - TestUpdateProduct_Success
  - TestDeleteProduct_Success

## Completed Stories

- **All user stories** for this sprint have been **completed**; there are **no pending tasks**.
- **Next sprint focus** will be on completing all **UI pages**, including **Account, List Product, and Product pages** and corresponding APIs.
