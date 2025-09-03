# Frontend Quick Reference - GroFast API

## 🚀 Quick Start

### Base URLs
- **Development**: `http://localhost:8000`
- **Staging**: `https://staging-api.grofast.com`
- **Production**: `https://api.grofast.com`

### Authentication
All protected endpoints require Firebase ID token:
```javascript
headers: {
  'Authorization': `Bearer ${firebaseIdToken}`,
  'Content-Type': 'application/json'
}
```

## 📋 API Endpoints Summary

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/verify-otp` | Verify Firebase OTP | ❌ |
| GET | `/auth/me` | Get user profile | ✅ |
| PUT | `/auth/me` | Update user profile | ✅ |

### Products
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products/categories` | Get categories | ❌ |
| GET | `/products` | Get products (with filters) | ❌ |
| GET | `/products/{id}` | Get product details | ❌ |

### Cart
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/cart` | Get user cart | ✅ |
| POST | `/cart/add` | Add item to cart | ✅ |
| POST | `/cart/remove` | Remove item from cart | ✅ |
| DELETE | `/cart/clear` | Clear entire cart | ✅ |

### Orders
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/orders/create` | Create order from cart | ✅ |
| GET | `/orders/my-orders` | Get user orders | ✅ |
| GET | `/orders/{id}` | Get order details | ✅ |
| PUT | `/orders/{id}/status` | Update order status | ✅ |

### Delivery
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/delivery/me` | Get delivery partner profile | ✅ |
| PUT | `/delivery/status` | Update delivery status | ✅ |
| POST | `/delivery/location` | Update GPS location | ✅ |
| GET | `/delivery/orders` | Get assigned orders | ✅ |

### Notifications
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/notifications/fcm` | Send FCM notification | ✅ |

### Admin
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/stats?admin_key=xxx` | Get dashboard stats | ✅ |
| GET | `/admin/products?admin_key=xxx` | Get all products | ✅ |
| POST | `/admin/products?admin_key=xxx` | Create product | ✅ |
| GET | `/admin/orders?admin_key=xxx` | Get all orders | ✅ |

## 🔧 Common Request/Response Examples

### User Authentication
```javascript
// Verify OTP
POST /auth/verify-otp
{
  "firebase_id_token": "eyJhbGciOiJSUzI1NiIs..."
}

// Response
{
  "id": 123,
  "firebase_uid": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Product Search
```javascript
// Get products with filters
GET /products?category_id=1&search=apple&page=1&size=20&sort_by=price&sort_order=asc

// Response
{
  "products": [...],
  "total": 150,
  "page": 1,
  "size": 20,
  "total_pages": 8
}
```

### Cart Operations
```javascript
// Add to cart
POST /cart/add
{
  "product_id": 123,
  "quantity": 2
}

// Response
{
  "id": 789,
  "user_id": 123,
  "items": [...],
  "total_amount": 29.94,
  "total_items": 6
}
```

### Create Order
```javascript
// Create order
POST /orders/create
{
  "delivery_address": "123 Main St, Apt 4B, New York, NY 10001",
  "delivery_time_slot": "today_evening",
  "payment_method": "cash_on_delivery",
  "notes": "Please call before delivery"
}

// Response
{
  "id": 12345,
  "status": "pending",
  "total_amount": 29.94,
  "items": [...],
  "created_at": "2024-01-15T10:30:00Z"
}
```

## ⚡ Quick Validation Rules

### Required Fields by Endpoint

#### POST /auth/verify-otp
- `firebase_id_token` ✅ (100-2000 chars, JWT format)

#### PUT /auth/me
- `name` ❌ (2-50 chars, letters/spaces only)
- `email` ❌ (valid email, max 100 chars)
- `phone` ❌ (10-15 digits, +country code)
- `address` ❌ (10-200 chars)

#### POST /cart/add
- `product_id` ✅ (positive integer)
- `quantity` ❌ (1-99, default: 1)

#### POST /orders/create
- `delivery_address` ✅ (10-200 chars)
- `delivery_time_slot` ❌ (enum: today/tomorrow + morning/afternoon/evening)
- `payment_method` ❌ (enum: cash_on_delivery, card, upi, wallet)
- `notes` ❌ (max 500 chars)

#### POST /delivery/location
- `latitude` ✅ (-90 to 90)
- `longitude` ✅ (-180 to 180)
- `order_id` ❌ (positive integer)

#### POST /notifications/fcm
- `title` ✅ (1-100 chars)
- `body` ✅ (1-500 chars)
- `user_ids` ✅ (array of 1-1000 positive integers)
- `data` ❌ (object with string values)

## 🎯 Common Enums

### Order Status
```javascript
["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]
```

### Delivery Status
```javascript
["available", "busy", "offline"]
```

### Payment Methods
```javascript
["cash_on_delivery", "card", "upi", "wallet"]
```

### Delivery Time Slots
```javascript
["today_morning", "today_afternoon", "today_evening", "tomorrow_morning", "tomorrow_afternoon", "tomorrow_evening"]
```

### Product Units
```javascript
["kg", "g", "l", "ml", "piece", "pack", "dozen"]
```

### Sort Options
```javascript
["name", "price", "created_at", "popularity"]
```

### Sort Order
```javascript
["asc", "desc"]
```

## 🚨 Error Codes

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

### Custom Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Authentication failed
- `INVALID_TOKEN` - Firebase token invalid/expired
- `INSUFFICIENT_STOCK` - Product out of stock
- `EMPTY_CART` - Cannot create order with empty cart
- `INVALID_TIME_SLOT` - Delivery time slot unavailable
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist

## 📱 Frontend Implementation Tips

### 1. API Client Setup
```javascript
// axios setup
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 10000,
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = getFirebaseToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiry
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);
```

### 2. Form Validation
```javascript
// Real-time validation
const validateField = (field, value, rules) => {
  if (rules.required && !value) return `${field} is required`;
  if (rules.minLength && value.length < rules.minLength) 
    return `${field} must be at least ${rules.minLength} characters`;
  if (rules.pattern && !rules.pattern.test(value)) 
    return rules.errorMessage;
  return null;
};
```

### 3. Error Handling
```javascript
// Centralized error handler
const handleApiError = (error) => {
  if (error.response?.data?.code === 'VALIDATION_ERROR') {
    return error.response.data.details.field_errors;
  }
  return [{ message: error.response?.data?.error || 'Something went wrong' }];
};
```

### 4. Loading States
```javascript
// Loading state management
const [loading, setLoading] = useState(false);

const handleSubmit = async (data) => {
  setLoading(true);
  try {
    await apiClient.post('/endpoint', data);
    // Handle success
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};
```

### 5. Pagination Helper
```javascript
// Pagination component
const usePagination = (fetchFunction, pageSize = 20) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async (pageNum = page) => {
    setLoading(true);
    try {
      const response = await fetchFunction({ page: pageNum, size: pageSize });
      setData(response.data.items);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { data, page, totalPages, loading, setPage, fetchData };
};
```

## 🔍 Testing Endpoints

### Using curl
```bash
# Test authentication
curl -X POST http://localhost:8000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"firebase_id_token":"your_token_here"}'

# Test with auth header
curl -X GET http://localhost:8000/cart \
  -H "Authorization: Bearer your_firebase_token"
```

### Using Postman
1. Import the Swagger JSON file
2. Set environment variables for base URL and tokens
3. Use collection runner for automated testing

## 📊 Rate Limits
- **General**: 100 requests/minute per IP
- **Authenticated**: 1000 requests/hour per user
- **Admin**: 500 requests/minute
- **Location Updates**: 60 requests/minute per delivery partner

## 🔐 Security Notes
- Always validate Firebase tokens on critical operations
- Use HTTPS in production
- Implement proper CORS policies
- Store sensitive data securely (never in localStorage for tokens)
- Implement proper session management
- Use environment variables for API keys

## 📞 Support
- **API Issues**: Create GitHub issue
- **Documentation**: Check `/docs/api/` folder
- **Validation Rules**: See `frontend-validation-rules.md`
- **Full Swagger**: Use `swagger-complete.yaml` or `swagger-complete.json`