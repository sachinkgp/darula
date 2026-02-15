# User Flows Guide

Complete guide to the user flows in the Darula ecommerce application.

## Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

---

## Flow 1: Sign Up → Login → Browse → Add to Cart → Order

### Step 1: Sign Up
1. Click **"Sign Up"** button in the navigation
2. Fill in the form:
   - First Name
   - Last Name
   - Email
   - Password
   - Phone (optional)
3. Click **"Sign Up"**
4. ✅ You'll be automatically logged in after signup
5. You'll see a success message and be redirected to products

### Step 2: Browse Products
1. You're now on the Products page
2. Browse the whiskey collection
3. Use filters:
   - Select a category from the dropdown
   - Search by typing in the search box
4. Click on any product card to see details

### Step 3: View Product Details
1. Click on any product card
2. See full product information:
   - Name, brand, category
   - Price
   - Description
   - Specifications (volume, alcohol content, age, stock)
3. Click **"Add to Cart"** button

### Step 4: Add to Cart
1. Click **"Add to Cart"** on any product
2. ✅ Success message appears
3. Cart badge in navigation updates with item count
4. Click **"Cart"** in navigation to view your cart

### Step 5: Manage Cart
1. View all items in your cart
2. Adjust quantities:
   - Click **"-"** to decrease
   - Click **"+"** to increase
3. Remove items:
   - Click **"Remove"** button
4. See cart total with:
   - Subtotal
   - Tax (10%)
   - Shipping (Free over $100, otherwise $10)
   - Total

### Step 6: Checkout
1. Click **"Proceed to Checkout"** button
2. Fill in shipping address:
   - Street Address
   - City
   - State
   - ZIP Code
   - Country
3. Review order summary
4. Click **"Place Order"**

### Step 7: View Orders
1. ✅ Order confirmation message
2. Automatically redirected to Orders page
3. View your order:
   - Order number
   - Status (pending, processing, shipped, delivered)
   - Items
   - Total amount
4. Click on any order to see full details

---

## Flow 2: Direct Login → Quick Purchase

### Step 1: Login
1. Click **"Login"** button
2. Enter your email and password
3. Click **"Login"**
4. ✅ You're logged in and redirected to products

### Step 2: Quick Purchase
1. Browse products
2. Click **"Add to Cart"** on desired items
3. Click **"Cart"** in navigation
4. Review cart and click **"Proceed to Checkout"**
5. Fill shipping address and place order

---

## Flow 3: Browse Without Account

1. Browse products (no login required)
2. View product details
3. When you try to add to cart:
   - You'll be prompted to login
   - Login or signup
   - Then add to cart

---

## Navigation Guide

### Navigation Bar
- **Products** - Browse all whiskey products
- **Cart** - View and manage your cart (requires login)
- **Login/Sign Up** - Authentication (when not logged in)
- **Orders** - View order history (when logged in)
- **Logout** - Sign out (when logged in)

### Views
- **Products View** - Main product listing
- **Product Detail View** - Individual product information
- **Cart View** - Shopping cart management
- **Checkout View** - Order placement
- **Orders View** - Order history
- **Order Detail View** - Individual order information

---

## Features

### Product Browsing
- ✅ Filter by category
- ✅ Search by name, description, or brand
- ✅ View product details
- ✅ See stock availability

### Cart Management
- ✅ Add products to cart
- ✅ Update quantities
- ✅ Remove items
- ✅ See real-time totals
- ✅ Automatic tax calculation
- ✅ Free shipping over $100

### Order Management
- ✅ Place orders
- ✅ View order history
- ✅ See order details
- ✅ Track order status

### Authentication
- ✅ Secure signup
- ✅ Login with JWT tokens
- ✅ Persistent sessions (localStorage)
- ✅ Auto-login after signup

---

## Tips

1. **Quick Access**: Click the cart icon in navigation to quickly access your cart
2. **Search**: Use the search box to find specific products
3. **Filters**: Use category filter to narrow down products
4. **Order History**: Check "Orders" to see all your past purchases
5. **Stock**: Products show stock availability - add to cart only if in stock

---

## Error Handling

The application handles various errors gracefully:
- Network errors show toast notifications
- Validation errors show inline messages
- Authentication errors redirect to login
- Stock errors prevent adding out-of-stock items

---

## Responsive Design

The UI is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

---

Enjoy shopping for premium whiskey! 🥃

