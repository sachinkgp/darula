# API Quick Reference

Quick reference guide for the Darula API.

**Base URL:** `http://localhost:3000/api/v1`

---

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | ❌ | Create new user account |
| POST | `/auth/login` | ❌ | Login and get JWT token |
| GET | `/auth/profile` | ✅ | Get user profile |

---

## Whiskey Catalog

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/whiskey/categories` | ❌ | Get all categories |
| GET | `/whiskey/categories/:id` | ❌ | Get category with brands |
| GET | `/whiskey/brands` | ❌ | Get all brands (optional: `?categoryId=...`) |
| GET | `/whiskey/brands/:id` | ❌ | Get brand with products |
| GET | `/whiskey/products` | ❌ | Get all products (optional filters) |
| GET | `/whiskey/products/:id` | ❌ | Get product details |
| GET | `/whiskey/products/search?q=...` | ❌ | Search products |

---

## Test Runner

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/test-runner/health` | ❌ | Health check |
| GET | `/test-runner/files` | ❌ | List test files |
| POST | `/test-runner/run` | ❌ | Run tests |

---

## Query Parameters

### Products Endpoint
- `categoryId` - Filter by category
- `brandId` - Filter by brand
- `inStock` - Filter by stock (true/false)

### Brands Endpoint
- `categoryId` - Filter by category

### Search Endpoint
- `q` - Search query (required)

---

## Authentication Header

```
Authorization: Bearer <your-jwt-token>
```

---

## Common Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

---

## Example cURL Commands

```bash
# Signup
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Get Categories
curl http://localhost:3000/api/v1/whiskey/categories

# Get Products
curl http://localhost:3000/api/v1/whiskey/products

# Search
curl "http://localhost:3000/api/v1/whiskey/products/search?q=macallan"
```

---

For detailed documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

