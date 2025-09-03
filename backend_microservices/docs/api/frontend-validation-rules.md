# Frontend Validation Rules - GroFast API

This document provides comprehensive validation rules for all API endpoints to ensure proper frontend form validation and data handling.

## Table of Contents
- [Authentication](#authentication)
- [User Profile](#user-profile)
- [Products](#products)
- [Cart Operations](#cart-operations)
- [Order Management](#order-management)
- [Delivery Operations](#delivery-operations)
- [Notifications](#notifications)
- [Admin Operations](#admin-operations)
- [Common Validation Patterns](#common-validation-patterns)
- [Error Handling](#error-handling)

## Authentication

### POST /auth/verify-otp

**Request Body Validation:**
```javascript
{
  firebase_id_token: {
    required: true,
    type: "string",
    minLength: 100,
    maxLength: 2000,
    pattern: /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/,
    errorMessage: "Invalid Firebase ID token format"
  }
}
```

**Frontend Implementation:**
```javascript
// Validation function
function validateFirebaseToken(token) {
  if (!token) return "Firebase token is required";
  if (token.length < 100) return "Token too short";
  if (token.length > 2000) return "Token too long";
  if (!/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(token)) {
    return "Invalid token format";
  }
  return null;
}
```

## User Profile

### PUT /auth/me

**Request Body Validation:**
```javascript
{
  name: {
    required: false,
    type: "string",
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
    errorMessage: "Name must be 2-50 characters, letters and spaces only"
  },
  email: {
    required: false,
    type: "string",
    format: "email",
    maxLength: 100,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: "Please enter a valid email address"
  },
  phone: {
    required: false,
    type: "string",
    pattern: /^\+?[1-9]\d{9,14}$/,
    errorMessage: "Phone number must be 10-15 digits with optional country code"
  },
  address: {
    required: false,
    type: "string",
    minLength: 10,
    maxLength: 200,
    errorMessage: "Address must be 10-200 characters"
  },
  fcm_token: {
    required: false,
    type: "string",
    minLength: 100,
    maxLength: 500,
    errorMessage: "Invalid FCM token format"
  }
}
```

**Frontend Implementation:**
```javascript
// User profile validation
const userProfileValidation = {
  name: (value) => {
    if (!value) return null; // Optional field
    if (value.length < 2) return "Name must be at least 2 characters";
    if (value.length > 50) return "Name must not exceed 50 characters";
    if (!/^[a-zA-Z\s]+$/.test(value)) return "Name can only contain letters and spaces";
    return null;
  },
  
  email: (value) => {
    if (!value) return null; // Optional field
    if (value.length > 100) return "Email must not exceed 100 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email";
    return null;
  },
  
  phone: (value) => {
    if (!value) return null; // Optional field
    if (!/^\+?[1-9]\d{9,14}$/.test(value)) {
      return "Phone number must be 10-15 digits with optional country code (+)";
    }
    return null;
  },
  
  address: (value) => {
    if (!value) return null; // Optional field
    if (value.length < 10) return "Address must be at least 10 characters";
    if (value.length > 200) return "Address must not exceed 200 characters";
    return null;
  }
};
```

## Products

### GET /products

**Query Parameters Validation:**
```javascript
{
  page: {
    required: false,
    type: "integer",
    minimum: 1,
    default: 1,
    errorMessage: "Page must be a positive integer"
  },
  size: {
    required: false,
    type: "integer",
    minimum: 1,
    maximum: 100,
    default: 20,
    errorMessage: "Size must be between 1 and 100"
  },
  category_id: {
    required: false,
    type: "integer",
    minimum: 1,
    errorMessage: "Category ID must be a positive integer"
  },
  search: {
    required: false,
    type: "string",
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_]+$/,
    errorMessage: "Search term must be 2-50 characters, alphanumeric with spaces, hyphens, underscores"
  },
  min_price: {
    required: false,
    type: "number",
    minimum: 0,
    multipleOf: 0.01,
    errorMessage: "Minimum price must be a positive number with up to 2 decimal places"
  },
  max_price: {
    required: false,
    type: "number",
    minimum: 0,
    multipleOf: 0.01,
    errorMessage: "Maximum price must be a positive number with up to 2 decimal places"
  },
  sort_by: {
    required: false,
    type: "string",
    enum: ["name", "price", "created_at", "popularity"],
    default: "created_at",
    errorMessage: "Sort by must be one of: name, price, created_at, popularity"
  },
  sort_order: {
    required: false,
    type: "string",
    enum: ["asc", "desc"],
    default: "desc",
    errorMessage: "Sort order must be 'asc' or 'desc'"
  }
}
```

**Frontend Implementation:**
```javascript
// Product search validation
const productSearchValidation = {
  validateSearchParams: (params) => {
    const errors = {};
    
    if (params.page && (params.page < 1 || !Number.isInteger(params.page))) {
      errors.page = "Page must be a positive integer";
    }
    
    if (params.size && (params.size < 1 || params.size > 100 || !Number.isInteger(params.size))) {
      errors.size = "Size must be between 1 and 100";
    }
    
    if (params.search) {
      if (params.search.length < 2) errors.search = "Search term must be at least 2 characters";
      if (params.search.length > 50) errors.search = "Search term must not exceed 50 characters";
      if (!/^[a-zA-Z0-9\s\-_]+$/.test(params.search)) {
        errors.search = "Search term can only contain letters, numbers, spaces, hyphens, and underscores";
      }
    }
    
    if (params.min_price && (params.min_price < 0 || !isValidPrice(params.min_price))) {
      errors.min_price = "Minimum price must be a positive number";
    }
    
    if (params.max_price && (params.max_price < 0 || !isValidPrice(params.max_price))) {
      errors.max_price = "Maximum price must be a positive number";
    }
    
    if (params.min_price && params.max_price && params.min_price > params.max_price) {
      errors.price_range = "Minimum price cannot be greater than maximum price";
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  }
};

function isValidPrice(price) {
  return /^\d+(\.\d{1,2})?$/.test(price.toString());
}
```

## Cart Operations

### POST /cart/add

**Request Body Validation:**
```javascript
{
  product_id: {
    required: true,
    type: "integer",
    minimum: 1,
    errorMessage: "Product ID is required and must be a positive integer"
  },
  quantity: {
    required: false,
    type: "integer",
    minimum: 1,
    maximum: 99,
    default: 1,
    errorMessage: "Quantity must be between 1 and 99"
  }
}
```

### POST /cart/remove

**Request Body Validation:**
```javascript
{
  product_id: {
    required: true,
    type: "integer",
    minimum: 1,
    errorMessage: "Product ID is required and must be a positive integer"
  }
}
```

**Frontend Implementation:**
```javascript
// Cart operations validation
const cartValidation = {
  addToCart: (data) => {
    const errors = {};
    
    if (!data.product_id) {
      errors.product_id = "Product ID is required";
    } else if (!Number.isInteger(data.product_id) || data.product_id < 1) {
      errors.product_id = "Product ID must be a positive integer";
    }
    
    if (data.quantity !== undefined) {
      if (!Number.isInteger(data.quantity) || data.quantity < 1 || data.quantity > 99) {
        errors.quantity = "Quantity must be between 1 and 99";
      }
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  },
  
  removeFromCart: (data) => {
    if (!data.product_id) return { product_id: "Product ID is required" };
    if (!Number.isInteger(data.product_id) || data.product_id < 1) {
      return { product_id: "Product ID must be a positive integer" };
    }
    return null;
  }
};
```

## Order Management

### POST /orders/create

**Request Body Validation:**
```javascript
{
  delivery_address: {
    required: true,
    type: "string",
    minLength: 10,
    maxLength: 200,
    errorMessage: "Delivery address is required and must be 10-200 characters"
  },
  delivery_time_slot: {
    required: false,
    type: "string",
    enum: [
      "today_morning",
      "today_afternoon", 
      "today_evening",
      "tomorrow_morning",
      "tomorrow_afternoon",
      "tomorrow_evening"
    ],
    pattern: /^(today|tomorrow)_(morning|afternoon|evening)$/,
    errorMessage: "Invalid delivery time slot"
  },
  payment_method: {
    required: false,
    type: "string",
    enum: ["cash_on_delivery", "card", "upi", "wallet"],
    default: "cash_on_delivery",
    errorMessage: "Payment method must be one of: cash_on_delivery, card, upi, wallet"
  },
  notes: {
    required: false,
    type: "string",
    maxLength: 500,
    errorMessage: "Notes must not exceed 500 characters"
  }
}
```

### PUT /orders/{order_id}/status

**Path Parameter Validation:**
```javascript
{
  order_id: {
    required: true,
    type: "integer",
    minimum: 1,
    errorMessage: "Order ID must be a positive integer"
  }
}
```

**Request Body Validation:**
```javascript
{
  status: {
    required: true,
    type: "string",
    enum: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
    errorMessage: "Status must be one of: pending, confirmed, preparing, out_for_delivery, delivered, cancelled"
  }
}
```

**Frontend Implementation:**
```javascript
// Order validation
const orderValidation = {
  createOrder: (data) => {
    const errors = {};
    
    if (!data.delivery_address) {
      errors.delivery_address = "Delivery address is required";
    } else {
      if (data.delivery_address.length < 10) {
        errors.delivery_address = "Delivery address must be at least 10 characters";
      }
      if (data.delivery_address.length > 200) {
        errors.delivery_address = "Delivery address must not exceed 200 characters";
      }
    }
    
    if (data.delivery_time_slot) {
      const validSlots = [
        "today_morning", "today_afternoon", "today_evening",
        "tomorrow_morning", "tomorrow_afternoon", "tomorrow_evening"
      ];
      if (!validSlots.includes(data.delivery_time_slot)) {
        errors.delivery_time_slot = "Invalid delivery time slot";
      }
    }
    
    if (data.payment_method) {
      const validMethods = ["cash_on_delivery", "card", "upi", "wallet"];
      if (!validMethods.includes(data.payment_method)) {
        errors.payment_method = "Invalid payment method";
      }
    }
    
    if (data.notes && data.notes.length > 500) {
      errors.notes = "Notes must not exceed 500 characters";
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  },
  
  updateOrderStatus: (status) => {
    const validStatuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
    if (!status) return "Status is required";
    if (!validStatuses.includes(status)) return "Invalid order status";
    return null;
  }
};
```

## Delivery Operations

### POST /delivery/location

**Request Body Validation:**
```javascript
{
  latitude: {
    required: true,
    type: "number",
    minimum: -90,
    maximum: 90,
    errorMessage: "Latitude is required and must be between -90 and 90"
  },
  longitude: {
    required: true,
    type: "number",
    minimum: -180,
    maximum: 180,
    errorMessage: "Longitude is required and must be between -180 and 180"
  },
  order_id: {
    required: false,
    type: "integer",
    minimum: 1,
    errorMessage: "Order ID must be a positive integer"
  }
}
```

### PUT /delivery/status

**Request Body Validation:**
```javascript
{
  status: {
    required: true,
    type: "string",
    enum: ["available", "offline"],
    errorMessage: "Status must be 'available' or 'offline'"
  }
}
```

**Frontend Implementation:**
```javascript
// Delivery validation
const deliveryValidation = {
  updateLocation: (data) => {
    const errors = {};
    
    if (data.latitude === undefined || data.latitude === null) {
      errors.latitude = "Latitude is required";
    } else if (data.latitude < -90 || data.latitude > 90) {
      errors.latitude = "Latitude must be between -90 and 90";
    }
    
    if (data.longitude === undefined || data.longitude === null) {
      errors.longitude = "Longitude is required";
    } else if (data.longitude < -180 || data.longitude > 180) {
      errors.longitude = "Longitude must be between -180 and 180";
    }
    
    if (data.order_id && (!Number.isInteger(data.order_id) || data.order_id < 1)) {
      errors.order_id = "Order ID must be a positive integer";
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  },
  
  updateStatus: (status) => {
    if (!status) return "Status is required";
    if (!["available", "offline"].includes(status)) {
      return "Status must be 'available' or 'offline'";
    }
    return null;
  }
};
```

## Notifications

### POST /notifications/fcm

**Request Body Validation:**
```javascript
{
  title: {
    required: true,
    type: "string",
    minLength: 1,
    maxLength: 100,
    errorMessage: "Title is required and must be 1-100 characters"
  },
  body: {
    required: true,
    type: "string",
    minLength: 1,
    maxLength: 500,
    errorMessage: "Body is required and must be 1-500 characters"
  },
  user_ids: {
    required: true,
    type: "array",
    minItems: 1,
    maxItems: 1000,
    items: {
      type: "integer",
      minimum: 1
    },
    errorMessage: "User IDs array is required, must contain 1-1000 positive integers"
  },
  data: {
    required: false,
    type: "object",
    additionalProperties: {
      type: "string"
    },
    errorMessage: "Data must be an object with string values only"
  }
}
```

**Frontend Implementation:**
```javascript
// Notification validation
const notificationValidation = {
  sendFCM: (data) => {
    const errors = {};
    
    if (!data.title) {
      errors.title = "Title is required";
    } else {
      if (data.title.length < 1) errors.title = "Title cannot be empty";
      if (data.title.length > 100) errors.title = "Title must not exceed 100 characters";
    }
    
    if (!data.body) {
      errors.body = "Body is required";
    } else {
      if (data.body.length < 1) errors.body = "Body cannot be empty";
      if (data.body.length > 500) errors.body = "Body must not exceed 500 characters";
    }
    
    if (!data.user_ids || !Array.isArray(data.user_ids)) {
      errors.user_ids = "User IDs array is required";
    } else {
      if (data.user_ids.length < 1) errors.user_ids = "At least one user ID is required";
      if (data.user_ids.length > 1000) errors.user_ids = "Cannot send to more than 1000 users";
      
      const invalidIds = data.user_ids.filter(id => !Number.isInteger(id) || id < 1);
      if (invalidIds.length > 0) {
        errors.user_ids = "All user IDs must be positive integers";
      }
    }
    
    if (data.data && typeof data.data === 'object') {
      const nonStringValues = Object.values(data.data).filter(value => typeof value !== 'string');
      if (nonStringValues.length > 0) {
        errors.data = "All data values must be strings";
      }
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  }
};
```

## Admin Operations

### POST /admin/products

**Request Body Validation:**
```javascript
{
  name: {
    required: true,
    type: "string",
    minLength: 2,
    maxLength: 100,
    errorMessage: "Product name is required and must be 2-100 characters"
  },
  description: {
    required: false,
    type: "string",
    maxLength: 1000,
    errorMessage: "Description must not exceed 1000 characters"
  },
  price: {
    required: true,
    type: "number",
    minimum: 0.01,
    maximum: 99999.99,
    multipleOf: 0.01,
    errorMessage: "Price is required, must be between 0.01 and 99999.99"
  },
  original_price: {
    required: false,
    type: "number",
    minimum: 0.01,
    maximum: 99999.99,
    multipleOf: 0.01,
    errorMessage: "Original price must be between 0.01 and 99999.99"
  },
  stock_quantity: {
    required: true,
    type: "integer",
    minimum: 0,
    maximum: 99999,
    errorMessage: "Stock quantity is required and must be between 0 and 99999"
  },
  unit: {
    required: true,
    type: "string",
    enum: ["kg", "g", "l", "ml", "piece", "pack", "dozen"],
    errorMessage: "Unit is required and must be one of: kg, g, l, ml, piece, pack, dozen"
  },
  category_id: {
    required: true,
    type: "integer",
    minimum: 1,
    errorMessage: "Category ID is required and must be a positive integer"
  },
  image_url: {
    required: false,
    type: "string",
    format: "uri",
    maxLength: 500,
    pattern: /^https?:\/\/.+/,
    errorMessage: "Image URL must be a valid HTTP/HTTPS URL, max 500 characters"
  }
}
```

**Frontend Implementation:**
```javascript
// Admin product validation
const adminProductValidation = {
  createProduct: (data) => {
    const errors = {};
    
    if (!data.name) {
      errors.name = "Product name is required";
    } else {
      if (data.name.length < 2) errors.name = "Product name must be at least 2 characters";
      if (data.name.length > 100) errors.name = "Product name must not exceed 100 characters";
    }
    
    if (data.description && data.description.length > 1000) {
      errors.description = "Description must not exceed 1000 characters";
    }
    
    if (!data.price) {
      errors.price = "Price is required";
    } else {
      if (data.price < 0.01) errors.price = "Price must be at least 0.01";
      if (data.price > 99999.99) errors.price = "Price must not exceed 99999.99";
      if (!isValidPrice(data.price)) errors.price = "Price must have at most 2 decimal places";
    }
    
    if (data.original_price) {
      if (data.original_price < 0.01) errors.original_price = "Original price must be at least 0.01";
      if (data.original_price > 99999.99) errors.original_price = "Original price must not exceed 99999.99";
      if (!isValidPrice(data.original_price)) errors.original_price = "Original price must have at most 2 decimal places";
      if (data.price && data.original_price < data.price) {
        errors.original_price = "Original price cannot be less than current price";
      }
    }
    
    if (data.stock_quantity === undefined || data.stock_quantity === null) {
      errors.stock_quantity = "Stock quantity is required";
    } else if (!Number.isInteger(data.stock_quantity) || data.stock_quantity < 0 || data.stock_quantity > 99999) {
      errors.stock_quantity = "Stock quantity must be an integer between 0 and 99999";
    }
    
    if (!data.unit) {
      errors.unit = "Unit is required";
    } else {
      const validUnits = ["kg", "g", "l", "ml", "piece", "pack", "dozen"];
      if (!validUnits.includes(data.unit)) {
        errors.unit = "Unit must be one of: " + validUnits.join(", ");
      }
    }
    
    if (!data.category_id) {
      errors.category_id = "Category ID is required";
    } else if (!Number.isInteger(data.category_id) || data.category_id < 1) {
      errors.category_id = "Category ID must be a positive integer";
    }
    
    if (data.image_url) {
      if (data.image_url.length > 500) {
        errors.image_url = "Image URL must not exceed 500 characters";
      }
      if (!/^https?:\/\/.+/.test(data.image_url)) {
        errors.image_url = "Image URL must be a valid HTTP/HTTPS URL";
      }
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  }
};
```

## Common Validation Patterns

### Reusable Validation Functions

```javascript
// Common validation utilities
const ValidationUtils = {
  // Email validation
  isValidEmail: (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  
  // Phone validation (international format)
  isValidPhone: (phone) => {
    return /^\+?[1-9]\d{9,14}$/.test(phone);
  },
  
  // Price validation (up to 2 decimal places)
  isValidPrice: (price) => {
    return /^\d+(\.\d{1,2})?$/.test(price.toString());
  },
  
  // URL validation
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  // Positive integer validation
  isPositiveInteger: (value) => {
    return Number.isInteger(value) && value > 0;
  },
  
  // Non-negative integer validation
  isNonNegativeInteger: (value) => {
    return Number.isInteger(value) && value >= 0;
  },
  
  // String length validation
  isValidLength: (str, min, max) => {
    if (typeof str !== 'string') return false;
    return str.length >= min && str.length <= max;
  },
  
  // Enum validation
  isValidEnum: (value, validValues) => {
    return validValues.includes(value);
  },
  
  // Coordinate validation
  isValidLatitude: (lat) => {
    return typeof lat === 'number' && lat >= -90 && lat <= 90;
  },
  
  isValidLongitude: (lng) => {
    return typeof lng === 'number' && lng >= -180 && lng <= 180;
  }
};
```

### Form Validation Helper

```javascript
// Generic form validation helper
class FormValidator {
  constructor(rules) {
    this.rules = rules;
  }
  
  validate(data) {
    const errors = {};
    
    for (const [field, rule] of Object.entries(this.rules)) {
      const value = data[field];
      const error = this.validateField(field, value, rule);
      if (error) {
        errors[field] = error;
      }
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  }
  
  validateField(field, value, rule) {
    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      return rule.errorMessage || `${field} is required`;
    }
    
    // Skip other validations if field is optional and empty
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return null;
    }
    
    // Type validation
    if (rule.type && typeof value !== rule.type) {
      return `${field} must be of type ${rule.type}`;
    }
    
    // String validations
    if (rule.type === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `${field} must be at least ${rule.minLength} characters`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return `${field} must not exceed ${rule.maxLength} characters`;
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.errorMessage || `${field} format is invalid`;
      }
    }
    
    // Number validations
    if (rule.type === 'number' || rule.type === 'integer') {
      if (rule.minimum !== undefined && value < rule.minimum) {
        return `${field} must be at least ${rule.minimum}`;
      }
      if (rule.maximum !== undefined && value > rule.maximum) {
        return `${field} must not exceed ${rule.maximum}`;
      }
      if (rule.multipleOf && value % rule.multipleOf !== 0) {
        return `${field} must be a multiple of ${rule.multipleOf}`;
      }
    }
    
    // Array validations
    if (rule.type === 'array') {
      if (rule.minItems && value.length < rule.minItems) {
        return `${field} must contain at least ${rule.minItems} items`;
      }
      if (rule.maxItems && value.length > rule.maxItems) {
        return `${field} must not contain more than ${rule.maxItems} items`;
      }
    }
    
    // Enum validation
    if (rule.enum && !rule.enum.includes(value)) {
      return `${field} must be one of: ${rule.enum.join(', ')}`;
    }
    
    return null;
  }
}
```

## Error Handling

### Standard Error Response Format

All API endpoints return errors in this consistent format:

```javascript
{
  error: "Error message",
  code: "ERROR_CODE",
  details: {
    // Additional error details
    field_errors: [
      {
        field: "email",
        message: "Invalid email format",
        code: "INVALID_FORMAT"
      }
    ]
  }
}
```

### Frontend Error Handling

```javascript
// Error handling utility
class ApiErrorHandler {
  static handleValidationError(errorResponse) {
    const errors = {};
    
    if (errorResponse.details && errorResponse.details.field_errors) {
      errorResponse.details.field_errors.forEach(fieldError => {
        errors[fieldError.field] = fieldError.message;
      });
    } else {
      errors.general = errorResponse.error || 'Validation failed';
    }
    
    return errors;
  }
  
  static getErrorMessage(errorResponse) {
    return errorResponse.error || 'An unexpected error occurred';
  }
  
  static isValidationError(errorResponse) {
    return errorResponse.code === 'VALIDATION_ERROR';
  }
  
  static isAuthenticationError(errorResponse) {
    return errorResponse.code === 'AUTHENTICATION_ERROR' || 
           errorResponse.code === 'INVALID_TOKEN';
  }
}
```

### Usage Example

```javascript
// Example usage in a React component
const handleSubmit = async (formData) => {
  // Client-side validation
  const validator = new FormValidator(userProfileValidation);
  const clientErrors = validator.validate(formData);
  
  if (clientErrors) {
    setErrors(clientErrors);
    return;
  }
  
  try {
    const response = await api.updateProfile(formData);
    // Handle success
  } catch (error) {
    if (ApiErrorHandler.isValidationError(error.response.data)) {
      const serverErrors = ApiErrorHandler.handleValidationError(error.response.data);
      setErrors(serverErrors);
    } else {
      setGeneralError(ApiErrorHandler.getErrorMessage(error.response.data));
    }
  }
};
```

## Best Practices

1. **Always validate on both client and server side**
2. **Use consistent error messages across the application**
3. **Provide real-time validation feedback to users**
4. **Handle network errors gracefully**
5. **Show loading states during API calls**
6. **Cache validation rules for better performance**
7. **Use debouncing for search inputs**
8. **Implement proper form state management**
9. **Provide clear error messages that help users fix issues**
10. **Test validation with edge cases and invalid data**

This comprehensive validation guide ensures your frontend application properly validates all user inputs before sending requests to the API, providing a better user experience and reducing server-side validation errors.