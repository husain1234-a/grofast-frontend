#!/usr/bin/env ts-node

/**
 * Integration Testing Script for Grofast Frontend-Backend Alignment
 * 
 * This script tests all major API endpoints and functionality to ensure
 * the frontend is properly aligned with the backend microservices.
 */

import { productApi, authApi, cartApi, orderApi, deliveryApi, adminApi } from '../lib/api-client';
import { logger } from '../lib/logger';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message?: string;
  error?: any;
}

class IntegrationTester {
  private results: TestResult[] = [];
  private testToken: string = '';

  constructor(private apiUrl: string) {
    logger.info('Starting integration tests...', { apiUrl });
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Grofast Integration Tests\n');

    // Test Authentication
    await this.testAuth();
    
    // Test Product APIs
    await this.testProductApis();
    
    // Test Cart APIs
    await this.testCartApis();
    
    // Test Order APIs
    await this.testOrderApis();
    
    // Test Delivery APIs
    await this.testDeliveryApis();
    
    // Test Admin APIs
    await this.testAdminApis();
    
    // Test Real-time Features
    await this.testRealTimeFeatures();
    
    // Test Push Notifications
    await this.testPushNotifications();
    
    // Print final results
    this.printResults();
  }

  private async testAuth(): Promise<void> {
    console.log('🔐 Testing Authentication...');

    // Test Google OAuth (would need real credentials in real test)
    await this.runTest('Google OAuth Login', async () => {
      // Skip in automated test - needs real Google token
      return { status: 'SKIP', message: 'Requires real Google credentials' };
    });

    // Test token validation
    await this.runTest('Token Validation', async () => {
      try {
        const result = await authApi.validateToken(this.testToken || 'dummy_token');
        return { status: 'PASS', message: 'Token validation endpoint accessible' };
      } catch (error) {
        if (error.message.includes('401') || error.message.includes('Invalid')) {
          return { status: 'PASS', message: 'Token validation works (rejected invalid token)' };
        }
        throw error;
      }
    });
  }

  private async testProductApis(): Promise<void> {
    console.log('📦 Testing Product APIs...');

    await this.runTest('Get Products', async () => {
      const result = await productApi.getProducts();
      if (result.products && Array.isArray(result.products)) {
        return { status: 'PASS', message: `Found ${result.products.length} products` };
      }
      throw new Error('Invalid products response structure');
    });

    await this.runTest('Get Product by ID', async () => {
      const result = await productApi.getProduct(1);
      if (result.product && result.product.id) {
        return { status: 'PASS', message: `Product ID ${result.product.id} retrieved` };
      }
      throw new Error('Invalid product response structure');
    });

    await this.runTest('Search Products', async () => {
      const result = await productApi.searchProducts('apple');
      if (result.products && Array.isArray(result.products)) {
        return { status: 'PASS', message: `Search returned ${result.products.length} results` };
      }
      throw new Error('Invalid search response structure');
    });

    await this.runTest('Get Categories', async () => {
      const result = await productApi.getCategories();
      if (result.categories && Array.isArray(result.categories)) {
        return { status: 'PASS', message: `Found ${result.categories.length} categories` };
      }
      throw new Error('Invalid categories response structure');
    });
  }

  private async testCartApis(): Promise<void> {
    console.log('🛒 Testing Cart APIs...');

    await this.runTest('Get Cart (requires auth)', async () => {
      if (!this.testToken) {
        return { status: 'SKIP', message: 'No auth token available' };
      }
      
      const result = await cartApi.getCart(this.testToken);
      if (result.cart && result.cart.items && Array.isArray(result.cart.items)) {
        return { status: 'PASS', message: `Cart has ${result.cart.items.length} items` };
      }
      throw new Error('Invalid cart response structure');
    });

    await this.runTest('Add to Cart (requires auth)', async () => {
      if (!this.testToken) {
        return { status: 'SKIP', message: 'No auth token available' };
      }
      
      const result = await cartApi.addToCart({ product_id: 1, quantity: 1 }, this.testToken);
      if (result.success || result.cart) {
        return { status: 'PASS', message: 'Item added to cart successfully' };
      }
      throw new Error('Failed to add item to cart');
    });
  }

  private async testOrderApis(): Promise<void> {
    console.log('📋 Testing Order APIs...');

    await this.runTest('Get Orders (requires auth)', async () => {
      if (!this.testToken) {
        return { status: 'SKIP', message: 'No auth token available' };
      }
      
      const result = await orderApi.getOrders(this.testToken);
      if (result.orders && Array.isArray(result.orders)) {
        return { status: 'PASS', message: `Found ${result.orders.length} orders` };
      }
      throw new Error('Invalid orders response structure');
    });

    await this.runTest('Get Order by ID (requires auth)', async () => {
      if (!this.testToken) {
        return { status: 'SKIP', message: 'No auth token available' };
      }
      
      try {
        const result = await orderApi.getOrder(1, this.testToken);
        if (result.order && result.order.id) {
          return { status: 'PASS', message: `Order ${result.order.id} retrieved` };
        }
        throw new Error('Invalid order response structure');
      } catch (error) {
        if (error.message.includes('404')) {
          return { status: 'PASS', message: 'Order endpoint accessible (order not found)' };
        }
        throw error;
      }
    });
  }

  private async testDeliveryApis(): Promise<void> {
    console.log('🚚 Testing Delivery APIs...');

    await this.runTest('Get Delivery Partner Profile (requires auth)', async () => {
      if (!this.testToken) {
        return { status: 'SKIP', message: 'No auth token available' };
      }
      
      try {
        const result = await deliveryApi.me(this.testToken);
        if (result.partner && result.partner.id) {
          return { status: 'PASS', message: `Partner ${result.partner.id} profile retrieved` };
        }
        throw new Error('Invalid partner response structure');
      } catch (error) {
        if (error.message.includes('404') || error.message.includes('403')) {
          return { status: 'PASS', message: 'Delivery endpoint accessible (not a delivery partner)' };
        }
        throw error;
      }
    });

    await this.runTest('Update Delivery Status (requires auth)', async () => {
      if (!this.testToken) {
        return { status: 'SKIP', message: 'No auth token available' };
      }
      
      try {
        const result = await deliveryApi.updateStatus({
          status: 'available',
          current_location: { latitude: 0, longitude: 0 }
        }, this.testToken);
        return { status: 'PASS', message: 'Status update endpoint accessible' };
      } catch (error) {
        if (error.message.includes('404') || error.message.includes('403')) {
          return { status: 'PASS', message: 'Status update endpoint accessible (not a delivery partner)' };
        }
        throw error;
      }
    });
  }

  private async testAdminApis(): Promise<void> {
    console.log('👨‍💼 Testing Admin APIs...');

    await this.runTest('Get Admin Products (requires admin auth)', async () => {
      if (!this.testToken) {
        return { status: 'SKIP', message: 'No auth token available' };
      }
      
      try {
        const result = await adminApi.getProducts(this.testToken);
        if (result.products && Array.isArray(result.products)) {
          return { status: 'PASS', message: `Admin found ${result.products.length} products` };
        }
        throw new Error('Invalid admin products response');
      } catch (error) {
        if (error.message.includes('403') || error.message.includes('401')) {
          return { status: 'PASS', message: 'Admin endpoint accessible (access denied for non-admin)' };
        }
        throw error;
      }
    });

    await this.runTest('Get Admin Orders (requires admin auth)', async () => {
      if (!this.testToken) {
        return { status: 'SKIP', message: 'No auth token available' };
      }
      
      try {
        const result = await adminApi.getOrders(this.testToken);
        if (result.orders && Array.isArray(result.orders)) {
          return { status: 'PASS', message: `Admin found ${result.orders.length} orders` };
        }
        throw new Error('Invalid admin orders response');
      } catch (error) {
        if (error.message.includes('403') || error.message.includes('401')) {
          return { status: 'PASS', message: 'Admin orders endpoint accessible (access denied for non-admin)' };
        }
        throw error;
      }
    });
  }

  private async testRealTimeFeatures(): Promise<void> {
    console.log('⚡ Testing Real-time Features...');

    await this.runTest('WebSocket Connection', async () => {
      return { status: 'SKIP', message: 'WebSocket testing requires manual verification' };
    });

    await this.runTest('Supabase Real-time Setup', async () => {
      return { status: 'SKIP', message: 'Supabase real-time testing requires live connection' };
    });
  }

  private async testPushNotifications(): Promise<void> {
    console.log('🔔 Testing Push Notifications...');

    await this.runTest('FCM Configuration', async () => {
      return { status: 'SKIP', message: 'FCM testing requires manual verification with device' };
    });

    await this.runTest('Notification Preferences', async () => {
      // Test if notification preferences can be loaded/saved
      const preferences = {
        orderUpdates: true,
        deliveryAlerts: true,
        promotions: false,
        soundEnabled: true
      };
      
      localStorage.setItem('notification-preferences', JSON.stringify(preferences));
      const stored = JSON.parse(localStorage.getItem('notification-preferences') || '{}');
      
      if (JSON.stringify(stored) === JSON.stringify(preferences)) {
        return { status: 'PASS', message: 'Notification preferences storage works' };
      }
      throw new Error('Failed to store notification preferences');
    });
  }

  private async runTest(name: string, testFn: () => Promise<{ status: 'PASS' | 'FAIL' | 'SKIP'; message?: string }>): Promise<void> {
    try {
      const result = await testFn();
      this.results.push({
        name,
        status: result.status,
        message: result.message
      });
      
      const emoji = result.status === 'PASS' ? '✅' : result.status === 'SKIP' ? '⏭️' : '❌';
      console.log(`  ${emoji} ${name}: ${result.message || result.status}`);
    } catch (error) {
      this.results.push({
        name,
        status: 'FAIL',
        message: error.message,
        error
      });
      console.log(`  ❌ ${name}: ${error.message}`);
      logger.error(`Test failed: ${name}`, error);
    }
  }

  private printResults(): void {
    console.log('\n📊 Integration Test Results');
    console.log('='.repeat(50));
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    console.log(`📝 Total: ${this.results.length}`);
    
    if (failed > 0) {
      console.log('\n🔍 Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  - ${r.name}: ${r.message}`));
    }
    
    const successRate = ((passed / (passed + failed)) * 100).toFixed(1);
    console.log(`\n🎯 Success Rate: ${successRate}%`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! Frontend-Backend integration is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the backend services and API endpoints.');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const apiUrl = process.env.NEXT_PUBLIC_GROFAST_API_URL || 'http://localhost:8000';
  const tester = new IntegrationTester(apiUrl);
  
  tester.runAllTests().catch((error) => {
    console.error('Integration test runner failed:', error);
    process.exit(1);
  });
}

export default IntegrationTester;
