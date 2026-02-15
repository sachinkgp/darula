// API Configuration
const API_BASE = '/api/v1';
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let categories = [];
let products = [];
let cart = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadCategories();
    loadProducts();
    if (authToken) {
        loadCart();
    }
});

// Authentication Functions
function checkAuth() {
    if (authToken && currentUser) {
        showUserMenu();
        showView('products');
    } else {
        showAuthButtons();
        showView('products');
    }
}

function showAuthButtons() {
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userMenu').style.display = 'none';
}

function showUserMenu() {
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userMenu').style.display = 'flex';
    document.getElementById('userName').textContent = currentUser.firstName || currentUser.email;
}

async function handleSignup(e) {
    e.preventDefault();
    showLoading(true);
    clearError('signupError');

    const userData = {
        email: document.getElementById('signupEmail').value,
        password: document.getElementById('signupPassword').value,
        firstName: document.getElementById('signupFirstName').value,
        lastName: document.getElementById('signupLastName').value,
        phone: document.getElementById('signupPhone').value || null
    };

    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showToast('Account created successfully!', 'success');
            checkAuth();
            showView('products');
            
            // Auto-login flow: Show success message and redirect
            setTimeout(() => {
                showToast('Welcome! You are now logged in.', 'success');
            }, 500);
        } else {
            showError('signupError', data.error || 'Signup failed');
        }
    } catch (error) {
        showError('signupError', 'Network error. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    showLoading(true);
    clearError('loginError');

    const credentials = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showToast('Login successful!', 'success');
            checkAuth();
            showView('products');
            loadCart();
        } else {
            showError('loginError', data.error || 'Login failed');
        }
    } catch (error) {
        showError('loginError', 'Network error. Please try again.');
    } finally {
        showLoading(false);
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    cart = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showToast('Logged out successfully', 'success');
    checkAuth();
    showView('products');
}

// View Navigation
function showView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.style.display = 'none';
    });

    // Show requested view
    const view = document.getElementById(`${viewName}View`);
    if (view) {
        view.style.display = 'block';
    }

    // Load data for specific views
    switch(viewName) {
        case 'products':
            loadProducts();
            break;
        case 'cart':
            if (authToken) loadCart();
            else showView('login');
            break;
        case 'orders':
            if (authToken) loadOrders();
            else showView('login');
            break;
        case 'checkout':
            if (authToken) {
                if (!cart || !cart.items || cart.items.length === 0) {
                    showToast('Your cart is empty', 'error');
                    showView('cart');
                } else {
                    showCheckout();
                }
            } else {
                showView('login');
            }
            break;
    }
}

// Category and Product Functions
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/whiskey/categories`);
        const data = await response.json();
        
        if (data.success) {
            categories = data.categories;
            const select = document.getElementById('categoryFilter');
            select.innerHTML = '<option value="">All Categories</option>';
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat._id;
                option.textContent = cat.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadProducts() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/whiskey/products`);
        const data = await response.json();
        
        if (data.success) {
            products = data.products;
            displayProducts(products);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error loading products', 'error');
    } finally {
        showLoading(false);
    }
}

function displayProducts(productsToShow) {
    const grid = document.getElementById('productsGrid');
    if (!productsToShow || productsToShow.length === 0) {
        grid.innerHTML = '<p class="empty-cart">No products found</p>';
        return;
    }

    grid.innerHTML = productsToShow.map(product => `
        <div class="product-card" onclick="showProductDetail('${product._id}')">
            <div class="product-image">🥃</div>
            <div class="product-info">
                <div class="product-category">${product.category.name}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-brand">${product.brand.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="event.stopPropagation(); addToCart('${product._id}')">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterProducts() {
    const categoryId = document.getElementById('categoryFilter').value;
    let filtered = products;

    if (categoryId) {
        filtered = products.filter(p => p.category._id === categoryId);
    }

    displayProducts(filtered);
}

function searchProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    let filtered = products;

    if (query) {
        filtered = products.filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.brand.name.toLowerCase().includes(query)
        );
    }

    displayProducts(filtered);
}

async function showProductDetail(productId) {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/whiskey/products/${productId}`);
        const data = await response.json();
        
        if (data.success) {
            const product = data.product;
            const detailDiv = document.getElementById('productDetail');
            detailDiv.innerHTML = `
                <div class="product-detail-image">🥃</div>
                <div class="product-detail-info">
                    <div class="product-category">${product.category.name}</div>
                    <h1>${product.name}</h1>
                    <div class="product-brand">${product.brand.name} - ${product.brand.country}</div>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-description">${product.description || 'Premium quality whiskey'}</div>
                    <div class="product-specs">
                        <p><strong>Volume:</strong> ${product.volume}</p>
                        <p><strong>Alcohol Content:</strong> ${product.alcoholContent}</p>
                        ${product.age ? `<p><strong>Age:</strong> ${product.age}</p>` : ''}
                        <p><strong>Stock:</strong> ${product.inStock ? `${product.stockQuantity} available` : 'Out of stock'}</p>
                    </div>
                    <div class="product-actions" style="margin-top: 2rem;">
                        ${product.inStock ? `
                            <button class="btn btn-primary" onclick="addToCart('${product._id}')">
                                Add to Cart
                            </button>
                        ` : `
                            <button class="btn btn-outline" disabled>Out of Stock</button>
                        `}
                    </div>
                </div>
            `;
            showView('productDetail');
        }
    } catch (error) {
        console.error('Error loading product:', error);
        showToast('Error loading product', 'error');
    } finally {
        showLoading(false);
    }
}

// Cart Functions
async function addToCart(productId) {
    if (!authToken) {
        showToast('Please login to add items to cart', 'error');
        showView('login');
        return;
    }

    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        const data = await response.json();

        if (response.ok) {
            cart = data.cart;
            updateCartBadge();
            showToast('Product added to cart!', 'success');
            if (document.getElementById('cartView').style.display !== 'none') {
                displayCart();
            }
        } else {
            showToast(data.error || 'Failed to add to cart', 'error');
        }
    } catch (error) {
        showToast('Network error', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadCart() {
    if (!authToken) return;

    try {
        const response = await fetch(`${API_BASE}/cart`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            cart = data.cart;
            updateCartBadge();
            if (document.getElementById('cartView').style.display !== 'none') {
                displayCart();
            }
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

function displayCart() {
    const cartContent = document.getElementById('cartContent');
    
    if (!cart || !cart.items || cart.items.length === 0) {
        cartContent.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        return;
    }

    cartContent.innerHTML = `
        ${cart.items.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">🥃</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.product.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                </div>
                <div class="cart-item-quantity">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateCartItem('${item._id}', ${item.quantity - 1})">-</button>
                        <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateCartItem('${item._id}', ${item.quantity + 1})">+</button>
                    </div>
                    <div style="margin-left: 1rem; font-weight: 600;">
                        $${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button class="btn btn-outline" onclick="removeFromCart('${item._id}')" style="margin-left: 1rem;">
                        Remove
                    </button>
                </div>
            </div>
        `).join('')}
        <div class="cart-total">
            <div class="checkout-summary-item">
                <span>Subtotal:</span>
                <span>$${cart.total.toFixed(2)}</span>
            </div>
            <div class="checkout-summary-item">
                <span>Tax (10%):</span>
                <span>$${(cart.total * 0.1).toFixed(2)}</span>
            </div>
            <div class="checkout-summary-item">
                <span>Shipping:</span>
                <span>${cart.total > 100 ? 'Free' : '$10.00'}</span>
            </div>
            <h3>Total: $${((cart.total * 1.1) + (cart.total > 100 ? 0 : 10)).toFixed(2)}</h3>
            <button class="btn btn-primary btn-block" onclick="showCheckout()" style="margin-top: 1rem;">
                Proceed to Checkout
            </button>
        </div>
    `;
}

async function updateCartItem(itemId, quantity) {
    if (quantity < 1) {
        removeFromCart(itemId);
        return;
    }

    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/cart/item/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ quantity })
        });

        const data = await response.json();

        if (response.ok) {
            cart = data.cart;
            updateCartBadge();
            displayCart();
        } else {
            showToast(data.error || 'Failed to update cart', 'error');
        }
    } catch (error) {
        showToast('Network error', 'error');
    } finally {
        showLoading(false);
    }
}

async function removeFromCart(itemId) {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/cart/item/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            cart = data.cart;
            updateCartBadge();
            displayCart();
            showToast('Item removed from cart', 'success');
        } else {
            showToast(data.error || 'Failed to remove item', 'error');
        }
    } catch (error) {
        showToast('Network error', 'error');
    } finally {
        showLoading(false);
    }
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (cart && cart.items) {
        const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline' : 'none';
    } else {
        badge.textContent = '0';
        badge.style.display = 'none';
    }
}

// Checkout Functions
function showCheckout() {
    if (!cart || !cart.items || cart.items.length === 0) {
        showToast('Your cart is empty', 'error');
        showView('products');
        return;
    }

    const summary = document.getElementById('checkoutSummary');
    const subtotal = cart.total;
    const tax = subtotal * 0.1;
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + tax + shipping;

    summary.innerHTML = `
        <div class="checkout-summary">
            ${cart.items.map(item => `
                <div class="checkout-summary-item">
                    <span>${item.product.name} x${item.quantity}</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('')}
            <div class="checkout-summary-item">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="checkout-summary-item">
                <span>Tax:</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="checkout-summary-item">
                <span>Shipping:</span>
                <span>${shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div class="checkout-summary-total">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        </div>
    `;

    showView('checkout');
}

async function handleCheckout(e) {
    e.preventDefault();
    showLoading(true);

    const shippingAddress = {
        street: document.getElementById('checkoutStreet').value,
        city: document.getElementById('checkoutCity').value,
        state: document.getElementById('checkoutState').value,
        zipCode: document.getElementById('checkoutZip').value,
        country: document.getElementById('checkoutCountry').value
    };

    try {
        const response = await fetch(`${API_BASE}/order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ shippingAddress })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Order placed successfully!', 'success');
            cart = null;
            updateCartBadge();
            setTimeout(() => {
                showView('orders');
                loadOrders();
            }, 1500);
        } else {
            showToast(data.error || 'Failed to place order', 'error');
        }
    } catch (error) {
        showToast('Network error', 'error');
    } finally {
        showLoading(false);
    }
}

// Order Functions
async function loadOrders() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/order`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            displayOrders(data.orders);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Error loading orders', 'error');
    } finally {
        showLoading(false);
    }
}

function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    
    if (!orders || orders.length === 0) {
        ordersList.innerHTML = '<div class="empty-cart">No orders yet</div>';
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <div class="order-card" onclick="showOrderDetail('${order._id}')">
            <div class="order-header">
                <div class="order-number">${order.orderNumber}</div>
                <div class="order-status ${order.status}">${order.status}</div>
            </div>
            <div style="margin-top: 1rem;">
                <p><strong>Items:</strong> ${order.items.length}</p>
                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="order-total">Total: $${order.total.toFixed(2)}</div>
        </div>
    `).join('');
}

async function showOrderDetail(orderId) {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/order/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const order = data.order;
            const detailDiv = document.getElementById('orderDetail');
            detailDiv.innerHTML = `
                <div style="margin-bottom: 2rem;">
                    <h2>Order ${order.orderNumber}</h2>
                    <div class="order-status ${order.status}" style="display: inline-block; margin-top: 0.5rem;">
                        ${order.status}
                    </div>
                </div>
                <div style="margin: 2rem 0;">
                    <h3>Items</h3>
                    ${order.items.map(item => `
                        <div class="order-detail-item">
                            <div style="flex: 1;">
                                <div style="font-weight: 600;">${item.productName}</div>
                                <div style="color: var(--gray);">Quantity: ${item.quantity}</div>
                            </div>
                            <div style="font-weight: 600;">$${item.subtotal.toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
                <div style="background: var(--light); padding: 1.5rem; border-radius: 12px;">
                    <div class="checkout-summary-item">
                        <span>Subtotal:</span>
                        <span>$${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="checkout-summary-item">
                        <span>Tax:</span>
                        <span>$${order.tax.toFixed(2)}</span>
                    </div>
                    <div class="checkout-summary-item">
                        <span>Shipping:</span>
                        <span>$${order.shipping.toFixed(2)}</span>
                    </div>
                    <div class="checkout-summary-total">
                        <span>Total:</span>
                        <span>$${order.total.toFixed(2)}</span>
                    </div>
                </div>
            `;
            showView('orderDetail');
        }
    } catch (error) {
        console.error('Error loading order:', error);
        showToast('Error loading order', 'error');
    } finally {
        showLoading(false);
    }
}

// Utility Functions
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showError(elementId, message) {
    const errorDiv = document.getElementById(elementId);
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

function clearError(elementId) {
    const errorDiv = document.getElementById(elementId);
    errorDiv.classList.remove('show');
}

// Make functions globally accessible
window.showView = showView;
window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
window.logout = logout;
window.addToCart = addToCart;
window.updateCartItem = updateCartItem;
window.removeFromCart = removeFromCart;
window.showProductDetail = showProductDetail;
window.filterProducts = filterProducts;
window.searchProducts = searchProducts;
window.showCheckout = showCheckout;
window.handleCheckout = handleCheckout;
window.showOrderDetail = showOrderDetail;

