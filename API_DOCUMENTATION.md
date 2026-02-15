# Darula API Documentation

Complete API documentation for the Darula Whiskey Ecommerce Backend.

**Base URL:** `http://localhost:3000/api/v1`

---

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Whiskey APIs](#whiskey-apis)
3. [Test Runner APIs](#test-runner-apis)
4. [Error Responses](#error-responses)
5. [Authentication](#authentication)

---

## Authentication APIs

### 1. User Signup

Create a new user account.

**Endpoint:** `POST /auth/signup`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Required Fields:**
- `email` (string): Valid email address
- `password` (string): User password

**Optional Fields:**
- `firstName` (string): User's first name
- `lastName` (string): User's last name
- `phone` (string): User's phone number

**Success Response (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

- **400 Bad Request** - Missing required fields
```json
{
  "error": "Email and password are required"
}
```

- **409 Conflict** - Email already exists
```json
{
  "error": "User with this email already exists"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

---

### 2. User Login

Authenticate user and receive JWT token.

**Endpoint:** `POST /auth/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

- **400 Bad Request** - Missing fields
```json
{
  "error": "Email and password are required"
}
```

- **401 Unauthorized** - Invalid credentials
```json
{
  "error": "Invalid email or password"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123!"
  }'
```

---

### 3. Get User Profile

Get authenticated user's profile information.

**Endpoint:** `GET /auth/profile`

**Authentication:** Required (Bearer Token)

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "createdAt": "2024-02-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

- **401 Unauthorized** - No token provided
```json
{
  "error": "Access token required"
}
```

- **403 Forbidden** - Invalid or expired token
```json
{
  "error": "Invalid or expired token"
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Whiskey APIs

### 1. Get All Categories

Retrieve all whiskey categories.

**Endpoint:** `GET /whiskey/categories`

**Authentication:** Not required

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 4,
  "categories": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Bourbon",
      "description": "American whiskey made primarily from corn",
      "slug": "bourbon",
      "createdAt": "2024-02-15T10:30:00.000Z",
      "updatedAt": "2024-02-15T10:30:00.000Z"
    },
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Single Malt",
      "description": "Whiskey made from malted barley at a single distillery",
      "slug": "single-malt",
      "createdAt": "2024-02-15T10:30:00.000Z",
      "updatedAt": "2024-02-15T10:30:00.000Z"
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:3000/api/v1/whiskey/categories
```

---

### 2. Get Category by ID

Get a specific category with its associated brands.

**Endpoint:** `GET /whiskey/categories/:id`

**Authentication:** Not required

**URL Parameters:**
- `id` (string): Category MongoDB ObjectId

**Success Response (200 OK):**
```json
{
  "success": true,
  "category": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Bourbon",
    "description": "American whiskey made primarily from corn",
    "slug": "bourbon"
  },
  "brands": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "name": "Jim Beam",
      "category": "65f1a2b3c4d5e6f7g8h9i0j1",
      "description": "America's #1 bourbon",
      "country": "USA",
      "slug": "jim-beam"
    }
  ]
}
```

**Error Responses:**

- **404 Not Found**
```json
{
  "error": "Category not found"
}
```

**Example:**
```bash
curl http://localhost:3000/api/v1/whiskey/categories/65f1a2b3c4d5e6f7g8h9i0j1
```

---

### 3. Get All Brands

Retrieve all brands, optionally filtered by category.

**Endpoint:** `GET /whiskey/brands`

**Authentication:** Not required

**Query Parameters:**
- `categoryId` (string, optional): Filter brands by category ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 13,
  "brands": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "name": "Jim Beam",
      "category": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "name": "Bourbon",
        "slug": "bourbon"
      },
      "description": "America's #1 bourbon",
      "country": "USA",
      "slug": "jim-beam"
    }
  ]
}
```

**Examples:**
```bash
# Get all brands
curl http://localhost:3000/api/v1/whiskey/brands

# Get brands by category
curl "http://localhost:3000/api/v1/whiskey/brands?categoryId=65f1a2b3c4d5e6f7g8h9i0j1"
```

---

### 4. Get Brand by ID

Get a specific brand with its associated products.

**Endpoint:** `GET /whiskey/brands/:id`

**Authentication:** Not required

**URL Parameters:**
- `id` (string): Brand MongoDB ObjectId

**Success Response (200 OK):**
```json
{
  "success": true,
  "brand": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
    "name": "Jim Beam",
    "category": {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Bourbon",
      "slug": "bourbon"
    },
    "description": "America's #1 bourbon",
    "country": "USA",
    "slug": "jim-beam"
  },
  "products": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j4",
      "name": "Jim Beam White Label",
      "brand": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
        "name": "Jim Beam"
      },
      "category": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "name": "Bourbon"
      },
      "price": 19.99,
      "volume": "750ml",
      "alcoholContent": "40% ABV",
      "inStock": true
    }
  ]
}
```

**Error Responses:**

- **404 Not Found**
```json
{
  "error": "Brand not found"
}
```

**Example:**
```bash
curl http://localhost:3000/api/v1/whiskey/brands/65f1a2b3c4d5e6f7g8h9i0j3
```

---

### 5. Get All Products

Retrieve all products with optional filtering.

**Endpoint:** `GET /whiskey/products`

**Authentication:** Not required

**Query Parameters:**
- `categoryId` (string, optional): Filter by category ID
- `brandId` (string, optional): Filter by brand ID
- `inStock` (boolean, optional): Filter by stock status (true/false)

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 20,
  "products": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j4",
      "name": "Jim Beam White Label",
      "brand": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
        "name": "Jim Beam",
        "country": "USA"
      },
      "category": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "name": "Bourbon",
        "slug": "bourbon"
      },
      "description": "Classic Kentucky straight bourbon",
      "price": 19.99,
      "volume": "750ml",
      "alcoholContent": "40% ABV",
      "age": null,
      "images": [],
      "inStock": true,
      "stockQuantity": 50,
      "slug": "jim-beam-white-label"
    }
  ]
}
```

**Examples:**
```bash
# Get all products
curl http://localhost:3000/api/v1/whiskey/products

# Filter by category
curl "http://localhost:3000/api/v1/whiskey/products?categoryId=65f1a2b3c4d5e6f7g8h9i0j1"

# Filter by brand
curl "http://localhost:3000/api/v1/whiskey/products?brandId=65f1a2b3c4d5e6f7g8h9i0j3"

# Filter by stock status
curl "http://localhost:3000/api/v1/whiskey/products?inStock=true"

# Combine filters
curl "http://localhost:3000/api/v1/whiskey/products?categoryId=65f1a2b3c4d5e6f7g8h9i0j1&inStock=true"
```

---

### 6. Get Product by ID

Get detailed information about a specific product.

**Endpoint:** `GET /whiskey/products/:id`

**Authentication:** Not required

**URL Parameters:**
- `id` (string): Product MongoDB ObjectId

**Success Response (200 OK):**
```json
{
  "success": true,
  "product": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j4",
    "name": "Jim Beam White Label",
    "brand": {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "name": "Jim Beam",
      "country": "USA",
      "description": "America's #1 bourbon"
    },
    "category": {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Bourbon",
      "slug": "bourbon",
      "description": "American whiskey made primarily from corn"
    },
    "description": "Classic Kentucky straight bourbon",
    "price": 19.99,
    "volume": "750ml",
    "alcoholContent": "40% ABV",
    "age": null,
    "images": [],
    "inStock": true,
    "stockQuantity": 50,
    "slug": "jim-beam-white-label",
    "createdAt": "2024-02-15T10:30:00.000Z",
    "updatedAt": "2024-02-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

- **404 Not Found**
```json
{
  "error": "Product not found"
}
```

**Example:**
```bash
curl http://localhost:3000/api/v1/whiskey/products/65f1a2b3c4d5e6f7g8h9i0j4
```

---

### 7. Search Products

Search products by name or description.

**Endpoint:** `GET /whiskey/products/search`

**Authentication:** Not required

**Query Parameters:**
- `q` (string, required): Search query

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "products": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j4",
      "name": "Jim Beam White Label",
      "brand": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
        "name": "Jim Beam"
      },
      "category": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "name": "Bourbon"
      },
      "price": 19.99,
      "inStock": true
    }
  ]
}
```

**Error Responses:**

- **400 Bad Request** - Missing query parameter
```json
{
  "error": "Search query is required"
}
```

**Example:**
```bash
curl "http://localhost:3000/api/v1/whiskey/products/search?q=macallan"
```

**Note:** Search is case-insensitive and searches in both product name and description.

---

## Test Runner APIs

### 1. Health Check

Check if the test runner API is running.

**Endpoint:** `GET /test-runner/health`

**Authentication:** Not required

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Test runner API is running"
}
```

**Example:**
```bash
curl http://localhost:3000/api/v1/test-runner/health
```

---

### 2. Get Test Files

Retrieve list of available test files.

**Endpoint:** `GET /test-runner/files`

**Authentication:** Not required

**Success Response (200 OK):**
```json
{
  "success": true,
  "testFiles": [
    {
      "name": "auth.test.js",
      "path": "src/__tests__/auth.test.js"
    },
    {
      "name": "whiskey.test.js",
      "path": "src/__tests__/whiskey.test.js"
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:3000/api/v1/test-runner/files
```

---

### 3. Run Tests

Execute test files and get results.

**Endpoint:** `POST /test-runner/run`

**Authentication:** Not required

**Request Body:**
```json
{
  "testFile": "src/__tests__/auth.test.js"
}
```

**Request Body (Optional):**
- `testFile` (string, optional): Specific test file path. If omitted, runs all tests.

**Success Response (200 OK):**
```json
{
  "success": true,
  "exitCode": 0,
  "testResults": {
    "numFailedTests": 0,
    "numPassedTests": 14,
    "numPendingTests": 0,
    "numTotalTests": 14,
    "testResults": [
      {
        "name": "src/__tests__/auth.test.js",
        "status": "passed",
        "startTime": 1707894000000,
        "endTime": 1707894010000,
        "assertionResults": [
          {
            "title": "should signup a new user successfully",
            "status": "passed",
            "duration": 150
          }
        ]
      }
    ]
  },
  "rawOutput": "...",
  "errorOutput": null
}
```

**Error Response (200 OK with success: false):**
```json
{
  "success": false,
  "exitCode": 1,
  "testResults": {
    "numFailedTests": 2,
    "numPassedTests": 12,
    "numTotalTests": 14
  },
  "rawOutput": "...",
  "errorOutput": "..."
}
```

**Example:**
```bash
# Run all tests
curl -X POST http://localhost:3000/api/v1/test-runner/run \
  -H "Content-Type: application/json" \
  -d '{}'

# Run specific test file
curl -X POST http://localhost:3000/api/v1/test-runner/run \
  -H "Content-Type: application/json" \
  -d '{"testFile": "src/__tests__/auth.test.js"}'
```

---

## Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request parameters
- **401 Unauthorized** - Authentication required or failed
- **403 Forbidden** - Invalid or expired token
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource already exists (e.g., duplicate email)
- **500 Internal Server Error** - Server error

### Common Error Messages

**Authentication Errors:**
- `"Email and password are required"`
- `"Invalid email or password"`
- `"Access token required"`
- `"Invalid or expired token"`
- `"User with this email already exists"`

**Resource Errors:**
- `"Category not found"`
- `"Brand not found"`
- `"Product not found"`
- `"Search query is required"`

---

## Authentication

### JWT Token

Most protected endpoints require a JWT token in the Authorization header.

**Format:**
```
Authorization: Bearer <your-jwt-token>
```

### Token Expiration

- Tokens expire after **7 days**
- Token is returned on successful signup/login
- Use the token in the `Authorization` header for protected routes

### Example with Authentication

```bash
# 1. Login to get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.token')

# 2. Use token for protected routes
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## Rate Limiting

Currently, there are no rate limits implemented. Consider implementing rate limiting for production use.

---

## CORS

CORS is enabled for all origins. The API accepts requests from any domain.

**Headers:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, PUT, PATCH, POST, DELETE
```

---

## Data Formats

### Dates

All dates are returned in ISO 8601 format:
```
"2024-02-15T10:30:00.000Z"
```

### MongoDB ObjectIds

MongoDB ObjectIds are returned as strings:
```
"65f1a2b3c4d5e6f7g8h9i0j1"
```

### Prices

Prices are returned as numbers (floats):
```json
{
  "price": 19.99
}
```

---

## Whiskey Categories

The API supports the following whiskey categories:

1. **Bourbon** - American whiskey made primarily from corn
2. **Single Malt** - Whiskey made from malted barley at a single distillery
3. **Double Barrel** - Whiskey aged in two different barrels
4. **Blended Scotch** - Blend of single malt and grain whiskies from Scotland

---

## Examples

### Complete Authentication Flow

```bash
# 1. Signup
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "firstName": "Jane",
    "lastName": "Smith"
  }'

# 2. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!"
  }' | jq -r '.token')

# 3. Get Profile
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Browse Whiskey Catalog

```bash
# 1. Get all categories
curl http://localhost:3000/api/v1/whiskey/categories

# 2. Get brands in a category
CATEGORY_ID="65f1a2b3c4d5e6f7g8h9i0j1"
curl "http://localhost:3000/api/v1/whiskey/brands?categoryId=$CATEGORY_ID"

# 3. Get products from a brand
BRAND_ID="65f1a2b3c4d5e6f7g8h9i0j3"
curl "http://localhost:3000/api/v1/whiskey/products?brandId=$BRAND_ID"

# 4. Search for products
curl "http://localhost:3000/api/v1/whiskey/products/search?q=macallan"
```

---

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify database connections are active
3. Ensure all required environment variables are set
4. Review the troubleshooting guide in `TROUBLESHOOTING.md`

---

**Last Updated:** February 2024
**API Version:** v1

