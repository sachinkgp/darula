#!/bin/bash

# Test Signup Flow Script
BASE_URL="http://localhost:3000/api/v1/auth"
TIMESTAMP=$(date +%s)
TEST_EMAIL="testuser${TIMESTAMP}@example.com"

echo "=========================================="
echo "Testing Signup Flow"
echo "=========================================="
echo ""

# Test 1: Successful signup with all fields
echo "1. Testing successful signup with all fields:"
RESPONSE=$(curl -s -X POST "${BASE_URL}/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"TestPassword123!\",
    \"firstName\": \"John\",
    \"lastName\": \"Doe\",
    \"phone\": \"+1234567890\"
  }")

echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""
echo "---"
echo ""

# Test 2: Signup with minimal fields (email + password only)
echo "2. Testing signup with minimal fields (email + password only):"
MINIMAL_EMAIL="minimal${TIMESTAMP}@example.com"
RESPONSE=$(curl -s -X POST "${BASE_URL}/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${MINIMAL_EMAIL}\",
    \"password\": \"TestPassword123!\"
  }")

echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""
echo "---"
echo ""

# Test 3: Signup with missing email
echo "3. Testing signup with missing email (should fail):"
RESPONSE=$(curl -s -X POST "${BASE_URL}/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"password\": \"TestPassword123!\"
  }")

echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""
echo "---"
echo ""

# Test 4: Signup with missing password
echo "4. Testing signup with missing password (should fail):"
RESPONSE=$(curl -s -X POST "${BASE_URL}/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test${TIMESTAMP}@example.com\"
  }")

echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""
echo "---"
echo ""

# Test 5: Signup with duplicate email (should fail)
echo "5. Testing signup with duplicate email (should fail):"
RESPONSE=$(curl -s -X POST "${BASE_URL}/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"TestPassword123!\"
  }")

echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""
echo "=========================================="
echo "Signup Flow Testing Complete"
echo "=========================================="

