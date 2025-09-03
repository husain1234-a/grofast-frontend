# GroFast - Ultra-Fast Grocery Delivery Platform

A modern, production-ready grocery delivery application built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Fast Grocery Delivery**: Order groceries and get them delivered in 10-15 minutes
- **Real-time Cart Management**: Add/remove items with instant updates
- **Secure Authentication**: Firebase-based authentication with OTP verification
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Production Ready**: Comprehensive error handling, logging, and monitoring
- **Type Safe**: Full TypeScript implementation with OpenAPI integration

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: SWR for server state
- **UI Components**: Radix UI primitives
- **Authentication**: Firebase Auth
- **API**: OpenAPI/Swagger integration
- **Error Handling**: React Error Boundaries
- **Logging**: Custom production logger

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm
- Firebase project (for authentication)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd grofast-web-app
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
NEXT_PUBLIC_GROFAST_API_URL=https://your-api-url.com
NEXT_PUBLIC_DEV_FIREBASE_TOKEN=your_firebase_token
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_ENABLE_LOGGING=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

### 3. Development

```bash
# Start development server
npm run dev

# Run with type checking
npm run type-check

# Run linting
npm run lint
```

### 4. Production Build

```bash
# Run all checks and build
npm run build:prod

# Or just build (includes pre-build checks)
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
grofast-web-app/
├── app/                    # Next.js app directory
│   ├── (with-header)/     # Route groups
│   ├── auth/              # Authentication pages
│   ├── cart/              # Cart management
│   ├── checkout/          # Checkout flow
│   ├── delivery/          # Delivery partner dashboard
│   └── orders/            # Order management
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── ...               # Feature components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── api-client.ts     # API client with error handling
│   ├── logger.ts         # Production logging system
│   └── utils.ts          # Utility functions
├── scripts/              # Build and development scripts
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_GROFAST_API_URL` | API base URL | Yes | - |
| `NEXT_PUBLIC_DEV_FIREBASE_TOKEN` | Firebase token for development | No | - |
| `NEXT_PUBLIC_ENV` | Environment name | No | development |
| `NEXT_PUBLIC_ENABLE_LOGGING` | Enable logging | No | true |
| `NEXT_PUBLIC_LOG_LEVEL` | Log level (debug/info/warn/error) | No | info |

### API Integration

The app uses OpenAPI/Swagger for type-safe API integration:

```bash
# Generate types from OpenAPI spec
npm run generate-types
```

## 🛡️ Production Features

### Error Handling
- **Global Error Boundary**: Catches and handles React errors
- **API Error Handling**: Comprehensive error responses with user feedback
- **Toast Notifications**: User-friendly error and success messages

### Logging
- **Structured Logging**: JSON-formatted logs with context
- **Environment-aware**: Different log levels for dev/prod
- **Error Tracking**: Automatic error capture and reporting

### Performance
- **Image Optimization**: Next.js Image component with WebP/AVIF
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: SWR for intelligent data caching
- **Compression**: Gzip compression enabled

### Security
- **Security Headers**: XSS protection, content type sniffing prevention
- **Token Management**: Secure token storage and refresh
- **Input Validation**: Zod schema validation
- **HTTPS Enforcement**: Production security headers

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Fix linting issues
npm run lint:fix

# Pre-build validation
npm run build:check
```

## 📦 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment-specific Builds

```bash
# Development
NEXT_PUBLIC_ENV=development npm run build

# Staging  
NEXT_PUBLIC_ENV=staging npm run build

# Production
NEXT_PUBLIC_ENV=production npm run build
```

## 🔍 Monitoring

### Logging
- Development: Console output with colors and formatting
- Production: Structured JSON logs (integrate with your logging service)

### Error Tracking
- Integrate with Sentry, LogRocket, or similar services
- Automatic error capture with context and stack traces

### Performance
- Core Web Vitals monitoring
- API response time tracking
- User interaction analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use proper error handling with logger
- Add proper loading states
- Write meaningful commit messages
- Test on multiple devices/browsers

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issues for bugs and feature requests
- **API Documentation**: Available at `/api/docs` (if API docs are served)

## 🔄 Changelog

### v1.0.0 (Production Ready)
- ✅ Complete TypeScript implementation
- ✅ Production error handling and logging
- ✅ Security headers and optimizations
- ✅ Comprehensive testing setup
- ✅ Performance optimizations
- ✅ Mobile-responsive design
- ✅ Authentication and authorization
- ✅ Real-time cart management
- ✅ Order tracking system
- ✅ Delivery partner dashboard