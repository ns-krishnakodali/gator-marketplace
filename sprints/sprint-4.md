# Sprint 3 Restrospective

## Table of Contents

1. [User Stories](#user-stories)
2. [Sprint Planning](#sprint-planning)
3. [Development](#development)
4. [API Documentation](#api-documentation)
5. [Testing](#testing)
6. [Completed Stories](#completed-stories)

## User Stories

- Created [**5 epics**](https://github.com/users/ns-krishnakodali/projects/4/views/8?filterQuery=label%3A%22sprint-4%22%22epic%22) and [**14 user stories**](https://github.com/users/ns-krishnakodali/projects/4/views/8?filterQuery=label%3A%22sprint-4%22%22story%22) during this sprint.
- The user stories cover the completion of the new features, API integrations, and application testing.

## Sprint Planning

- Sprint 4 [Board](https://github.com/users/ns-krishnakodali/projects/4/views/8)
- Conducted sprint planning and distributed tasks among participants.
- This sprint focuses on:
  - Developing List Products page.
  - Developing Checkout features from cart and product.
  - Developing User Orders and Order details pages.
  - Developing the corresponding APIs and integrating with FE.
  - Implementing unit tests for both backend and frontend.
  - Writiing end-to-end (E2E) tests using Cypress to ensure application reliability and functionality.
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

- Implemented a fully functional **List Product** page to list products with specifications.
- Developed the **Checkout** feature from the cart and allowed direct purchase from the product page.
- Implemented an **Order Details** page to show the summary of a user's order.
- Implemented a **My Orders** page to view all orders made by the user.
- Integrated **APIs** for the above-mentioned features.
- Wrote extensive **unit tests** for both frontend components and backend services, ensuring high code coverage.
- Improved user experience with a responsive design and loading indicators across all pages.

### BE (Backend)

- Modified the **List Product API** to support form data for listing product details.
- Integrated **AWS S3** for securely storing static product images.
- Developed **Checkout APIs** for checking out from the cart and directly buying a product, along with fetching checkout order details.
- Implemented **Order APIs** to fetch order details and all orders for a user.
- Added **unit tests** for all the developed handlers and services.
- Refactored the backend architecture for better maintainability.

### App (Application)

- Integrated **APIs** (List Product, Checkout and Orders) in the **Angular application**.
- Written **Cypress tests** to validate the functionality of **Products, List Product and Checkout** pages, ensuring correct form submission and field validations.

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
**Description:** Creates a new product in the marketplace using form data.

**Authentication:** Required (JWT Token in Authorization header)

**Request Body:** (Form Data)

- **name**: Product name (string)
- **description**: Product description (string)
- **price**: Product price (float)
- **category**: Product category (string)
- **quantity**: Product quantity (integer)
- **files**: Product images (multipart form data)

Example form data:

| Key         | Value                                     |
| ----------- | ----------------------------------------- |
| name        | Smartphone                                |
| description | Latest model with high-end specifications |
| price       | 699.99                                    |
| category    | Electronics                               |
| quantity    | 50                                        |
| files       | (image files)                             |

**Responses:**

- **201 Created:** Product successfully created, returns a success message.

  ```json
  {
    "message": "Product created successfully"
  }
  ```

- **400 Bad Request:** Invalid input format or data.

  ```json
  {
    "error": "Invalid category: Electronics"
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
    "handlingFee": 10.0,
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
    "handlingFee": 10.0,
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

## Checkout Management APIs

### **16. Get Checkout Cart Details**

**Endpoint:** `GET /checkout/cart`  
**Description:** Retrieve all the products in the user's cart along with the total cost details before proceeding to checkout.

**Authentication:** Required (JWT Token in Authorization header)

**Responses:**

- **200 OK:** Cart details successfully retrieved.

  ```json
  {
    "orderProductDetails": [
      {
        "productName": "Smartphone",
        "quantity": 2,
        "productTotalPrice": 1399.98
      }
    ],
    "productsTotal": 1399.98,
    "handlingFee": 10.0,
    "totalCost": 1409.98
  }
  ```

- **500 Internal Server Error:** Error retrieving cart details.

  ```json
  {
    "message": "Failed to retrieve order details"
  }
  ```

---

### **17. Get Checkout Product Details**

**Endpoint:** `GET /checkout/product`  
**Description:** Retrieve details of a single product with the requested quantity and its total price.

**Authentication:** Required (JWT Token in Authorization header)

**Query Parameters:**

- `pid`: Product ID (string, required)
- `qty`: Quantity (integer, optional)

**Responses:**

- **200 OK:** Product details successfully retrieved.

  ```json
  {
    "orderProductDetails": [
      {
        "productName": "Smartphone",
        "quantity": 3,
        "productTotalPrice": 2099.97
      }
    ],
    "productsTotal": 2099.97,
    "handlingFee": 10.0,
    "totalCost": 2109.97
  }
  ```

- **400 Bad Request:** Invalid quantity provided.

  ```json
  {
    "message": "Invalid quantity"
  }
  ```

- **404 Not Found:** Product not found or insufficient stock.

  ```json
  {
    "message": "Requested quantity exceeds available stock"
  }
  ```

- **500 Internal Server Error:** Error retrieving product details.

  ```json
  {
    "message": "Failed to retrieve order details"
  }
  ```

---

### **18. Checkout Cart Order**

**Endpoint:** `POST /checkout/cart`  
**Description:** Place an order for all the products in the user's cart.

**Authentication:** Required (JWT Token in Authorization header)

**Request Body:**

```json
{
  "meetupAddress": "123 Main St, City",
  "meetupDate": "2025-05-01",
  "meetupTime": "15:00",
  "additionalNotes": "Please handle with care",
  "paymentMethod": "CreditCard"
}
```

**Responses:**

- **200 OK:** Order successfully placed.

  ```json
  {
    "orderId": "order-uuid-1234"
  }
  ```

- **400 Bad Request:** Invalid input format or empty cart.

  ```json
  {
    "message": "Your cart is empty, add products to place an order"
  }
  ```

- **500 Internal Server Error:** Error placing the order.

  ```json
  {
    "message": "Couldn't place the order, please retry"
  }
  ```

---

### **19. Checkout Cart Product**

**Endpoint:** `POST /checkout/product`  
**Description:** Place an order for a specific product from the cart.

**Authentication:** Required (JWT Token in Authorization header)

**Request Body:**

```json
{
  "meetupAddress": "123 Main St, City",
  "meetupDate": "2025-05-01",
  "meetupTime": "15:00",
  "additionalNotes": "Please handle with care",
  "productId": "123e4567-e89b-12d3-a456-426614174000",
  "quantity": 2,
  "paymentMethod": "CreditCard",
  "priceProposal": 600
}
```

**Responses:**

- **200 OK:** Order successfully placed for the product.

  ```json
  {
    "orderId": "order-uuid-5678"
  }
  ```

- **400 Bad Request:** Invalid input or missing product ID.

  ```json
  {
    "message": "Product ID is required"
  }
  ```

  OR

  ```json
  {
    "message": "Invalid input format"
  }
  ```

- **404 Not Found:** Product not found or insufficient stock.

  ```json
  {
    "message": "Product not found, check again."
  }
  ```

- **500 Internal Server Error:** Error placing the order.

  ```json
  {
    "message": "Couldn't place the order, please retry"
  }
  ```

## Order Management APIs

### **20. Get Order Details**

**Endpoint:** `GET /orders/:oid`  
**Description:** Retrieve detailed information about a specific order.

**Authentication:** Required (JWT Token in Authorization header)

**URL Parameters:**

- `oid`: Order ID (UUID)

**Responses:**

- **200 OK:** Order details successfully retrieved.

  ```json
  {
    "orderId": "12345",
    "orderStatus": "Placed",
    "datePlaced": "2025-04-21T12:34:56Z",
    "paymentMethod": "Credit Card",
    "location": "1234 Marketplace St, City, State",
    "date": "2025-04-22",
    "time": "14:00",
    "orderProductDetails": [
      {
        "userUid": "user123",
        "displayName": "John Doe",
        "contact": "123-456-7890",
        "orderProducts": [
          {
            "pid": "p1",
            "name": "Product A",
            "quantity": 2,
            "price": 29.99
          },
          {
            "pid": "p2",
            "name": "Product B",
            "quantity": 1,
            "price": 19.99
          }
        ]
      }
    ],
    "handlingFee": 5.0,
    "totalCost": 79.97
  }
  ```

- **404 Not Found:** Order not found.

  ```json
  {
    "message": "No order found matching the given ID"
  }
  ```

- **500 Internal Server Error:** Error retrieving order details.

  ```json
  {
    "message": "Failed to retrieve order details"
  }
  ```

---

### **21. Get User Orders**

**Endpoint:** `GET /orders`  
**Description:** Retrieve a list of all orders placed by the user.

**Authentication:** Required (JWT Token in Authorization header)

**Responses:**

- **200 OK:** User orders successfully retrieved.

  ```json
  {
    "userOrders": [
      {
        "orderId": "12345",
        "orderStatus": "Placed",
        "datePlaced": "2025-04-21T12:34:56Z",
        "paymentMethod": "Credit Card",
        "totalItems": 3,
        "totalCost": 79.97
      },
      {
        "orderId": "12346",
        "orderStatus": "Shipped",
        "datePlaced": "2025-04-20T11:20:45Z",
        "paymentMethod": "PayPal",
        "totalItems": 2,
        "totalCost": 39.98
      }
    ],
    "totalOrders": 2
  }
  ```

- **404 Not Found:** No orders found for the user.

  ```json
  {
    "message": "No orders found"
  }
  ```

- **500 Internal Server Error:** Error retrieving user orders.

  ```json
  {
    "message": "Failed to retrieve user orders"
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
  - Should display loading spinner while data is loading
  - Should display navbar with account section
  - Should display two cards after loading completes
  - Should display correct content in cards
  - Should navigate to products page when Explore Marketplace card is clicked
  - Should navigate to list-product page when List Products card is clicked
- `cypress\e2e\my-account\profile.cy.ts`
  - Should be successfully logged in and visting my-account section
  - Should display the Profile Information section with correct values
  - Should update account details successfully
  - Should show a spinner while updating profile details
  - Should update password successfully
- `cypress\e2e\order\order.cy.ts`
  - Should display loading spinner while fetching order details
  - Should display order details page with correct heading
  - Should display order summary section with correct values
  - Should display meetup details section with correct values
  - Should handle error when fetching order details fails
  - Should display order items section with correct values
- `cypress\e2e\product\product.cy.ts`
  - Should display the product details correctly
  - Should display the product images
  - Should not show loading spinner after API loads
  - Should handle product with single image
  - Should have the correct number of quantity options
  - Should have a functional add to cart button
  - Should show proper date format for posted date
- `cypress\e2e\products\products-landing.cy.ts`
  - Should display the correct number of products
  - Should not show loading spinner after data is loaded
  - Should display products with correct information
  - Should show accurate price formatting
  - Should display proper date format for posting date
  - Should filter products by a single category
  - Should sort products by price (low to high)
  - Should navigate to next page
  - Should navigate to product details when clicking on a product card
  - Should add product to cart when Add to Cart button is clicked
  - Should show empty state when no products match filter
  - Should apply both filters and sorting simultaneously
- `cypress\e2e\list-product\list-product.cy.ts`
  - Should display the list product page structure
  - Should display product details form with all required fields
  - Should display list product button
  - Should display loading spinner when form is submitting
  - Should support drag and drop for images
- `cypress\e2e\products\products.cy.ts`
  - Should load the products page with all UI elements
  - Should display products with correct information
  - Should not show loading spinner after data is loaded
  - Should filter products by category
  - Should sort products by price (low to high)
  - Should navigate to next page
  - Should navigate to product details when clicking on a product card
  - Should add product to cart when Add to Cart button is clicked
- `cypress\support\intercepts.ts`
  - setupLoginIntercept()
  - setupProtectedIntercept()
  - setupAccountDetailsIntercept()
  - setupUpdateAccountIntercept()
  - setupUpdatePasswordIntercept()
  - setupProductDetailsIntercept()

### Unit Tests for Angular Components (FE)

The following unit tests cover different scenarios for various Angular components:

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
- should create the component
- should display marketplace title
- should not show search bar by default
- should show search bar when showSearchBar is true
- should not show account link by default
- should show account link when showAccount is true
- should not show cart by default
- should show cart when showCart is true
- should get cart count from service when showCart is true
- should not get cart count from service when showCart is false
- should show cart count when cart has items
- should have working router links
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

- `tests\handlers\checkout_handler_test.go`

  - TestGetCheckoutCartDetails
    - Success - Empty Cart
    - Success - With Items
  - TestGetCheckoutProductDetails
    - Success - Valid Product and Quantity
    - Invalid Quantity
    - Product Not Found
    - Insufficient Quantity
  - TestCheckoutCartOrder
    - Invalid Input Format
    - Empty Cart
    - Successful Order
  - TestCheckoutCartProduct
    - Invalidate Input Format
    - Product Not Found
    - Successful Order

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

- `tests\services\checkout_service_test.go`

  - TestGetCheckoutCartDetailsService
    - Empty Cart
    - Cart With Single Item
    - Cart With Multiple Items
  - TestGetCheckoutProductDetailsService
    - Valid Product and Quantity
    - Product Not Found
    - Insufficient Quantity
  - TestCheckoutCartOrderService
    - Empty Cart
    - Successful Order Creation
    - Database Error Handling
  - TestCheckoutCartProductService
    - Product not found
    - Insufficient product quantity
    - Successfully place product order

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

- **All user stories** for this project inclusive of spring-4 have been **completed**; there are **no pending tasks**.
- **Next Steps:** Make the application scalabile with proper integrations, add additional pages, and deploy the application live.
