# Darula - Whiskey Ecommerce Backend API

A fully functional backend API for a whiskey ecommerce platform with user authentication and comprehensive whiskey catalog management.

## Features

- **User Authentication**: Signup and login with JWT tokens
- **Whiskey Categories**: Bourbon, Single Malt, Double Barrel, Blended Scotch
- **Brand Management**: Multiple brands per category
- **Product Catalog**: Detailed product information with pricing and inventory
- **Search Functionality**: Search products by name or description

## Tech Stack

- **Node.js** with Express
- **PostgreSQL** for user data
- **MongoDB** with Mongoose for product catalog
- **Redis** for caching (configured)
- **JWT** for authentication
- **bcrypt** for password hashing

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database URLs
MONGO_URL=mongodb://localhost:27017/darula
POSTGRES_URL=postgresql://postgres:devpass@localhost:5433/devdb

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=3000
```

### 3. Start Databases

```bash
docker-compose up -d
```

### 4. Seed Initial Data

```bash
npm run seed
```

This will create:
- 4 whiskey categories (Bourbon, Single Malt, Double Barrel, Blended Scotch)
- 13 brands across all categories
- 20+ products with detailed information

### 5. Start Server

```bash
npm start
```

The server will run on `http://localhost:3000`

## API Documentation

For complete API documentation, see:
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference with examples
- **[API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)** - Quick reference guide
- **[API_EXAMPLES.md](./API_EXAMPLES.md)** - Usage examples

### Quick Links

**Authentication:**
- `POST /api/v1/auth/signup` - Create account
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/profile` - Get profile (requires auth)

**Whiskey Catalog:**
- `GET /api/v1/whiskey/categories` - All categories
- `GET /api/v1/whiskey/brands` - All brands
- `GET /api/v1/whiskey/products` - All products
- `GET /api/v1/whiskey/products/search?q=...` - Search

**Test Runner:**
- `GET /api/v1/test-runner/health` - Health check
- `GET /api/v1/test-runner/files` - List tests
- `POST /api/v1/test-runner/run` - Run tests

## Database Schema

### PostgreSQL (Users)
- `users` table with email, password_hash, first_name, last_name, phone

### MongoDB (Products)
- `WhiskeyCategory` collection
- `Brand` collection
- `Product` collection with full product details

## Whiskey Categories

1. **Bourbon**: American whiskey made primarily from corn
   - Brands: Jim Beam, Maker's Mark, Wild Turkey, Woodford Reserve

2. **Single Malt**: Whiskey made from malted barley at a single distillery
   - Brands: The Macallan, Glenfiddich, The Glenlivet, Lagavulin

3. **Double Barrel**: Whiskey aged in two different barrels
   - Brands: Woodford Reserve Double Oaked, The Balvenie

4. **Blended Scotch**: Blend of single malt and grain whiskies
   - Brands: Johnnie Walker, Chivas Regal, Dewar's

## Project Structure

```
darula/
├── src/
│   ├── api/
│   │   ├── controller/
│   │   │   ├── auth.controller.js
│   │   │   └── whiskey.controller.js
│   │   ├── model/
│   │   │   ├── user.model.js
│   │   │   └── whiskey.model.js
│   │   └── router/
│   │       ├── auth.router.js
│   │       ├── whiskey.router.js
│   │       └── index.router.js
│   ├── config/
│   │   └── db/
│   │       ├── index.js
│   │       ├── mongo.js
│   │       ├── postgres.js
│   │       ├── redis.js
│   │       ├── init.js
│   │       └── schema.sql
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── scripts/
│   │   └── seedWhiskey.js
│   └── index.js
├── server.js
├── docker-compose.yml
└── package.json
```

## Testing

### Running Tests

The project includes comprehensive test suites for all API endpoints.

#### Command Line

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

#### Test Runner UI

A web-based test runner UI is available at:
```
http://localhost:3000/test-runner.html
```

Features:
- Run all tests or specific test files
- Real-time test execution
- Visual test results with pass/fail indicators
- Detailed error messages
- Test summary statistics

### Test Coverage

The test suite includes:

**Authentication Tests:**
- User signup (success, validation, duplicate email)
- User login (success, invalid credentials, missing fields)
- Profile access (with/without token, invalid token)

**Whiskey API Tests:**
- Category endpoints (list, get by ID, 404 handling)
- Brand endpoints (list, filter by category, get by ID)
- Product endpoints (list, filter, search, get by ID)
- Search functionality (case-insensitive, query validation)

## Notes

- The PostgreSQL schema is automatically initialized on server start
- JWT tokens expire after 7 days
- All passwords are hashed using bcrypt with 10 salt rounds
- Product search is case-insensitive
- Tests use separate test databases (configure via .env)

