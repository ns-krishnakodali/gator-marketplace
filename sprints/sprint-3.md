# Sprint 3 Restrospective

## Table of Contents

1. [User Stories](#user-stories)
2. [Sprint Planning](#sprint-planning)
3. [Development](#development)
4. [API Documentation](#api-documentation)
5. [Testing](#testing)
6. [Completed Stories](#completed-stories)

## User Stories

- Created [**5 epics**](https://github.com/users/ns-krishnakodali/projects/4/views/7?filterQuery=label%3A%22sprint-3%22%22epic%22) and [**16 user stories**](https://github.com/users/ns-krishnakodali/projects/4/views/7?filterQuery=label%3A%22sprint-3%22%22story%22) during this sprint.
- The user stories cover the development of new features, API integrations, and application testing.

## Sprint Planning

- Sprint 3 [Board](https://github.com/users/ns-krishnakodali/projects/4/views/7)
- Conducted sprint planning and distributed tasks among participants.
- This sprint focuses on:
  - Developing Accounts page.
  - Developing User Cart page.
  - Developing Product page.
  - Developing the corresponding APIs and integrating with FE.
  - Implementing unit tests for both backend and frontend.
  - Working on additional tasks like refactoring BE codebase.
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

- Created fully functional **User Account page** with profile management capabilities.
- Developed comprehensive **Cart page** with order summary and product management features.
- Implemented detailed **Product page** with image gallery and add-to-cart functionality.
- Implemented proper error handling for the pages.
- **Integrated APIs** cart management, product details and account.
- **Wrote extensive unit tests** for both frontend components and backend services, achieving high code coverage.
- Enhanced user experience with responsive design and loading state indicators across all pages.

### BE (Backend)

- Created a **Product API** to retrieve product details using its **PID**.
- Developed **Cart APIs** for adding products to cart, retrieving cart items, and calculating order summaries.
- Completed developing **Delete** and **Update** APIs to modify product details using the product's **PID**.
- Implemented **User Cart APIs** to handle checkout cart products and order management.
- **Added unit tests** for all the developed handlers and services.
- **Refactored** the backend architecture for better maintainability.

### App (Application)

- Integrated **APIs** (Product, Cart and Account) in the **Angular application**.
- Written **Cypress tests** to validate the functionality of **Landing and Product** pages, ensuring correct form submission and field validations.

# API Documentation

## Authentication APIs

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
  "mobile": "123-456-7890",
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

## Account Management APIs

### **3. Get Account Details**

**Endpoint:** `GET /account`  
**Description:** Retrieves the account details of the authenticated user.

**Authentication:** Required (JWT Token in Authorization header)

**Responses:**

- **200 OK:** Account details successfully retrieved.

  ```json
  {
    "accountDetails": {
      "displayImageUrl": "https://example.com/profile.jpg",
      "name": "John Doe",
      "displayName": "JohnD",
      "email": "johndoe@example.com",
      "mobile": "123-456-7890"
    }
  }
  ```

- **404 Not Found:** User account not found.

  ```json
  {
    "message": "User account not found"
  }
  ```

- **500 Internal Server Error:** Server error while fetching details.
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

### **4. Update Account Details**

**Endpoint:** `PUT /account`  
**Description:** Updates the account details of the authenticated user.

**Authentication:** Required (JWT Token in Authorization header)

**Request Body:**

```json
{
  "name": "John Doe",
  "displayName": "JohnD",
  "email": "johndoe@example.com",
  "mobile": "123-456-7890"
}
```

**Responses:**

- **204 No Content:** Account details successfully updated.

- **400 Bad Request:** Invalid input format.

  ```json
  {
    "message": "Invalid input format"
  }
  ```

- **422 Unprocessable Entity:** Data validation errors.

  ```json
  {
    "message": "Invalid input data, please check again"
  }
  ```

  OR

  ```json
  {
    "message": "Invalid email format, please enter valid UFL email"
  }
  ```

  OR

  ```json
  {
    "message": "Invalid mobile number, please follow xxx-xxx-xxxx format"
  }
  ```

- **500 Internal Server Error:** Server error while updating details.
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

### **5. Update Password**

**Endpoint:** `PUT /account/password`  
**Description:** Updates the password of the authenticated user.

**Authentication:** Required (JWT Token in Authorization header)

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Responses:**

- **204 No Content:** Password successfully updated.

- **400 Bad Request:** Invalid input format.

  ```json
  {
    "message": "Invalid input format"
  }
  ```

- **401 Unauthorized:** Current password is incorrect.

  ```json
  {
    "message": "Invalid password. Please check and try again."
  }
  ```

- **409 Conflict:** New password is the same as the current password.

  ```json
  {
    "message": "New password, cannot be same as the current password."
  }
  ```

- **500 Internal Server Error:** Server error while updating password.
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

## Product Management APIs

### **6. Create Product**

**Endpoint:** `POST /products`  
**Description:** Creates a new product in the marketplace.

**Authentication:** Required (JWT Token in Authorization header)

**Request Body:**

```json
{
  "name": "Smartphone",
  "description": "Latest model with high-end specifications",
  "price": 699.99,
  "category": "Electronics",
  "quantity": 50,
  "images": [
    {
      "mimeType": "image/jpeg",
      "url": "https://example.com/image1.jpg",
      "isMain": true
    }
  ]
}
```

**Responses:**

- **201 Created:** Product successfully created, returns the created product.

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

- **400 Bad Request:** Invalid input format or data.

  ```json
  {
    "error": "Invalid category"
  }
  ```

- **500 Internal Server Error:** Error creating product.
  ```json
  {
    "error": "Could not create product"
  }
  ```

### **7. Get Products**

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

### **8. Get Product by PID**

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

### **9. Update Product**

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

### **10. Delete Product**

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

## Cart Management APIs

### **11. Add to Cart**

**Endpoint:** `POST /cart`  
**Description:** Add a product to the user's shopping cart.

**Authentication:** Required (JWT Token in Authorization header)

**Request Body:**

```json
{
  "productId": "123e4567-e89b-12d3-a456-426614174000",
  "quantity": 2
}
```

**Responses:**

- **201 Created:** Product successfully added to cart.

  ```json
  "Added to cart"
  ```

- **400 Bad Request:** Invalid input format.

  ```json
  {
    "message": "Invalid input"
  }
  ```

  OR

  ```json
  {
    "message": "Product ID is required"
  }
  ```

- **404 Not Found:** Product not found.

  ```json
  {
    "message": "Product not found"
  }
  ```

- **409 Conflict:** Product already in cart or insufficient stock.

  ```json
  {
    "message": "Product already added to cart"
  }
  ```

  OR

  ```json
  {
    "message": "Not enough product in stock"
  }
  ```

- **500 Internal Server Error:** Error adding product to cart.
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

### **12. Get Cart Items**

**Endpoint:** `GET /cart`  
**Description:** Retrieve all items in the user's shopping cart with total cost details.

**Authentication:** Required (JWT Token in Authorization header)

**Responses:**

- **200 OK:** Cart items successfully retrieved.

  ```json
  {
    "cartProducts": [
      {
        "addedQuantity": 2,
        "maxQuantity": 50,
        "pid": "123e4567-e89b-12d3-a456-426614174000",
        "productName": "Smartphone",
        "productPrice": 699.99,
        "primaryImage": "https://example.com/image1.jpg"
      }
    ],
    "productsTotal": 1399.98,
    "handlingFee": 10.00,
    "totalCost": 1409.98
  }
  ```

- **500 Internal Server Error:** Error retrieving cart items.
  ```json
  {
    "message": "Failed to retrieve cart items"
  }
  ```

### **13. Update Cart Item**

**Endpoint:** `PUT /cart`  
**Description:** Update the quantity of a product in the user's cart.

**Authentication:** Required (JWT Token in Authorization header)

**Request Body:**

```json
{
  "productId": "123e4567-e89b-12d3-a456-426614174000",
  "quantity": 3
}
```

**Responses:**

- **200 OK:** Cart item successfully updated, returns updated totals.

  ```json
  {
    "productsTotal": 2099.97,
    "handlingFee": 10.00,
    "totalCost": 2109.97
  }
  ```

- **400 Bad Request:** Invalid input format.

  ```json
  {
    "message": "Invalid input"
  }
  ```

  OR

  ```json
  {
    "message": "Product ID is required"
  }
  ```

- **404 Not Found:** Product or cart item not found.

  ```json
  {
    "message": "Product not found"
  }
  ```

  OR

  ```json
  {
    "message": "Cart item not found"
  }
  ```

- **409 Conflict:** Insufficient stock.

  ```json
  {
    "message": "Not enough product in stock"
  }
  ```

- **500 Internal Server Error:** Error updating cart item.
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

### **14. Remove Cart Item**

**Endpoint:** `DELETE /cart/:pid`  
**Description:** Remove a specific product from the user's cart.

**Authentication:** Required (JWT Token in Authorization header)

**URL Parameters:**

- `pid`: Product ID (UUID)

**Responses:**

- **200 OK:** Cart item successfully removed.

  ```json
  {
    "message": "Item removed"
  }
  ```

- **404 Not Found:** Cart item not found.

  ```json
  {
    "message": "Cart item not found"
  }
  ```

- **500 Internal Server Error:** Error removing cart item.
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

### **15. Clear Cart**

**Endpoint:** `DELETE /cart`  
**Description:** Remove all items from the user's cart.

**Authentication:** Required (JWT Token in Authorization header)

**Responses:**

- **200 OK:** Cart successfully cleared.

  ```json
  {
    "message": "Cart cleared"
  }
  ```

- **500 Internal Server Error:** Error clearing cart.
  ```json
  {
    "message": "Failed to clear cart"
  }
  ```

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
  - Should display a notification on incorrect mobile number
  - Should display a notification when passwords do not match
  - Should be submitted on entering valid credentials
  - Should navigate to the login page when clicking the Login button
- `cypress\e2e\landing-page\landing-page.cy.ts`
  - Should load successfully and display required elements
  - Should navigate correctly when clicking on internal cards
  - Should display key content sections correctly
- `cypress\e2e\my-account\profile.cy.ts`
  - Should be successfully logged in and visting my-account section
  - Should display the Profile Information section with correct values
  - Should update account details successfully
  - Should show a spinner while updating profile details
  - Should update password successfully
- `cypress\e2e\product\product.cy.ts`
  - Should display the product details correctly
  - Should display the product images
  - Should not show loading spinner after API loads
  - Should handle product with single image
  - Should have the correct number of quantity options
  - Should have a functional add to cart button
  - Should show proper date format for posted date
- `cypress\support\intercepts.ts`
  - setupLoginIntercept()
  - setupProtectedIntercept()
  - setupAccountDetailsIntercept()
  - setupUpdateAccountIntercept()
  - setupUpdatePasswordIntercept()
  - setupProductDetailsIntercept()

### Unit Tests for Angular Components (FE)

The following unit tests cover **130** different scenarios for various Angular components:

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
- should call API and navigate to returnUrl on successful login
- should show error notification if login fails
- should handle API error response correctly
- should set isLoading to false on API failure
- should navigate to signup page

- `src/app/features/auth/services/signup/signup.service.spec.ts`
- should be created
- should show an error if signup fields are empty
- should show an error if email is invalid
- should show an error if email is not from UFL domain
- should show an error if mobile number is not valid
- should show an error if passwords do not match
- should call API and navigate on successful signup
- should handle API error response correctly
- should set isLoading to false on API failure
- should navigate to login page

#### Cart

- `src/app/features/cart/cart.component.spec.ts`
- should create the component
- should call getCartItems on init

- `src/app/features/cart/components/cart-card/cart-card.component.spec.ts`
- should create
- should display product name correctly
- should display product price with currency format
- should display the correct quantity
- should show quantity selector when not removing item
- should call navigateToProductPage when image is clicked
- should call navigateToProductPage when Enter key is pressed on image
- should increment quantity when + button is clicked
- should decrement quantity when - button is clicked
- should not allow quantity to go below 0
- should not allow quantity to exceed maxQuantity
- should not allow quantity to exceed 10 even if maxQuantity is higher
- should handle maxQuantity of 0

- `src/app/features/cart/components/order-summary/order-summar.component.spec.ts`
- should create
- should have required input properties
- should set input values correctly
- should render the heading
- should display products total with currency
- should display handling fee with currency
- should display total cost with currency
- should render a checkout button
- should update the view when input properties change
- should handle zero values correctly
- should handle negative values correctly

#### Landing Page

- `src/app/features/landing-page/components/landing-page-card/landing-page-card.component.spec.ts`
- should create the component
- should display the correct title and description
- should set the correct image source and alt attributes
- should call onCardClick when card is clicked

- `src/app/features/landing-page/landing-page.component.spec.ts`
- should create the landing page component
- should call callProtectedEndpoint on component initialization
- should display loader when isLoading$ is true
- should not display loader when isLoading$ is false
- should pass the correct input to the NavbarComponent
- should render two cards when not loading
- should not render cards when loading
- should call navigateTo with correct URL when onExploreMarketplaceClick is called
- should call navigateTo with correct URL when onListProductsClick is called

#### My Account

- `src/app/features/my-account/components/orders/orders.component.spec.ts`
- should create

- `src/app/features/my-account/components/payments/payments.component.spec.ts`
- should create

#### Product

- `src/app/features/product/components/display-images/display-images.component.spec.ts`
- should create
- should set displayImageSrc to main image on init if available
- should set displayImageSrc to first image if no main image is available
- should handle empty images array
- should update displayImageSrc when onDisplayImageClick is called
- should render all thumbnail images
- should render the display image with the correct src
- should update display image when a thumbnail is clicked
- should handle keyboard navigation with Enter key

- `src/app/features/product/components/product-details/product-details.component.spec.ts`
- should create
- should initialize quantity options correctly
- should limit quantity options to maxQuantity if less than 10
- should call addToCart method with correct parameters
- should handle loading state during addToCart
- should display product details correctly

- `src/app/features/product/product.component.spec.ts`
- should create the component
- should call getProductDetails with correct ID on init

- `src/app/features/products/components/display-products/display-products.component.spec.ts`
- should create

#### Shared UI

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
- should display search bar when showSearchBar is true
- should not display search bar when showSearchBar is false
- should display My Account link when showAccount is true
- should not display My Account link when showAccount is false
- should display Cart link when showCart is true
- should not display Cart link when showCart is false
- should format cart items count correctly

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

#### Handler Tests
- `tests\handlers\accounts_handler_test.go`
  - TestGetAccountDetails
    - User Not Found
    - Successful Get Account Details
  - TestUpdateAccountDetailsHandler
    - Invalid Input Format
    - Invalid Email Format
    - Invalid Mobile Number Format
    - Successful Update
  
- `tests\handlers\auth_handler_test.go`
  - TestLoginHandler
    - Invalid Input
    - User Not Found
    - Invalid Credentials
    - Successful Login
  - TestSignupHandler
    - Invalid Input
    - Invalid user email (non ufl domain)
    - Invalid user mobile number
    - Email Already Registered
    - Successful Signup

- `tests\handlers\cart_handler_test.go`
  - TestAddToCart
    - Invalid Input Format
    - Product Not Found
    - Not Enough Product Quantity
    - Successful Add To Cart
    - Product Already Added
  - TestGetCartItems
    - Successfully Get Cart Items
  - TestUpdateCartItem
    - Invalid Input Format
    - Product Not Found
    - Not Enough Quantity
    - Successful Update
  - TestRemoveCartItem
    - Item Not Found
    - Successful Remove
  - TestClearCart
    - Successful Clear Cart

- `tests\handlers\products_handler_test.go`
  - TestCreateProduct
    - Create product successfully
    - Invalid Input Format
    - Invalid Category
  - TestGetProducts
    - Default Params
    - With Pagination
    - Filter By Category
    - Sort By Price
    - Filter And Sort Combined
  - TestGetProductByPID
    - Get Product details Success
    - Product Not Found
  - TestUpdateProduct
    - Update Product details Success
    - Product Not Found
    - Invalid Input
  - TestDeleteProduct
    - Delete Product Success
    - Product Not Found

#### Services Tests
  - `tests\services\accounts_service_test.go`
    - TestAccountDetailsService
      - User Not Found
      - Successful Fetch
    - TestUpdateAccountDetailsService
      - Email Not Matching
      - Invalid Email Format (Not UFL domain)
      - Empty Name
      - Empty Mobile Number
      - Invalid Mobile Number Format
      - Successful Update
    - TestUpdatePasswordService
      - User Not Found
      - Invalid Current Password
      - Same Password
      - Successful Password Update
  - `tests\services\auth_service_test.go`
    - TestLoginService
      - User Not Found
      - Invalid Credentials
      - Successful Login
    - TestSignupService
      - Invalid Email format (empty and non ufl.edu domain)
      - Empty User Name and mobile number
      - Invalid mobile number (empty and incorrect format)
      - Email Already Exists
      - Successful Signup
  - `tests\services\cart_service_test.go`
    - TestAddToCartService
      - Add to cart Success
      - Product Already Added
    - TestUpdateCartItemService
      - Increase Qty Success
      - Decrease Qty Success
      - Quantity Too High
      - Product Not Found
    - TestRemoveCartItemService
      - Remove from cart Success
    - TestClearCartService
      - Clear cart Success
  - `tests\services\products_service_test.go`
    - TestCreateProductService
      - Created product Success
      - Invalid Category
    - TestGetProductsService
      - Get products Success
      - Filter And Sort
    - TestGetProductByPIDService
      - Get product by pid Success
    - TestUpdateProductService
      - Update Product details Success
    - TestDeleteProductService
      - Delete Product details Success

## Completed Stories

- **All user stories** for this sprint have been **completed**; there are **no pending tasks**.
- **Next Sprint Focus:** Completing remaining **UI pages**, implementing minor functionalities, and addressing **checkout and payment** details.
