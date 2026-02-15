# API Usage Examples

## Authentication Examples

### 1. Signup
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get Profile (Protected Route)
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Whiskey API Examples

### 1. Get All Categories
```bash
curl http://localhost:3000/api/v1/whiskey/categories
```

**Response:**
```json
{
  "success": true,
  "count": 4,
  "categories": [
    {
      "_id": "...",
      "name": "Bourbon",
      "description": "American whiskey made primarily from corn",
      "slug": "bourbon"
    },
    ...
  ]
}
```

### 2. Get Category by ID with Brands
```bash
curl http://localhost:3000/api/v1/whiskey/categories/CATEGORY_ID
```

### 3. Get All Brands
```bash
# Get all brands
curl http://localhost:3000/api/v1/whiskey/brands

# Get brands by category
curl http://localhost:3000/api/v1/whiskey/brands?categoryId=CATEGORY_ID
```

### 4. Get Brand by ID with Products
```bash
curl http://localhost:3000/api/v1/whiskey/brands/BRAND_ID
```

### 5. Get All Products
```bash
# Get all products
curl http://localhost:3000/api/v1/whiskey/products

# Filter by category
curl http://localhost:3000/api/v1/whiskey/products?categoryId=CATEGORY_ID

# Filter by brand
curl http://localhost:3000/api/v1/whiskey/products?brandId=BRAND_ID

# Filter by stock status
curl http://localhost:3000/api/v1/whiskey/products?inStock=true

# Combine filters
curl "http://localhost:3000/api/v1/whiskey/products?categoryId=CATEGORY_ID&inStock=true"
```

### 6. Get Product by ID
```bash
curl http://localhost:3000/api/v1/whiskey/products/PRODUCT_ID
```

**Response:**
```json
{
  "success": true,
  "product": {
    "_id": "...",
    "name": "Jim Beam White Label",
    "brand": {
      "_id": "...",
      "name": "Jim Beam",
      "country": "USA"
    },
    "category": {
      "_id": "...",
      "name": "Bourbon",
      "slug": "bourbon"
    },
    "description": "Classic Kentucky straight bourbon",
    "price": 19.99,
    "volume": "750ml",
    "alcoholContent": "40% ABV",
    "inStock": true,
    "stockQuantity": 50
  }
}
```

### 7. Search Products
```bash
curl "http://localhost:3000/api/v1/whiskey/products/search?q=macallan"
```

## Using Postman or Similar Tools

1. **Set Base URL**: `http://localhost:3000/api/v1`

2. **For Protected Routes**:
   - Go to Headers tab
   - Add header: `Authorization`
   - Value: `Bearer YOUR_JWT_TOKEN`

3. **For JSON Requests**:
   - Set Content-Type: `application/json`
   - Add JSON body in the Body tab

## Testing Flow

1. Start the server: `npm start`
2. Seed the database: `npm run seed`
3. Signup a new user
4. Login to get a token
5. Use the token to access protected routes
6. Browse categories, brands, and products

