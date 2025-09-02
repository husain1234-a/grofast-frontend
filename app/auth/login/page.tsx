'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight } from 'lucide-react';
import { api, setStoredToken } from '@/lib/api-client';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sendOtp = async () => {
    setLoading(true);
    try {
      // In real implementation, this would call Firebase Auth
      // For now, just move to OTP step
      setStep('otp');
    } catch (error) {
      console.error('Failed to send OTP:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      // Mock Firebase token for demo
      const mockFirebaseToken = 'mock-firebase-token-' + Date.now();
      const response = await api.verifyOtp({ firebase_id_token: mockFirebaseToken });
      setStoredToken(mockFirebaseToken);
      router.push('/');
    } catch (error) {
      console.error('Failed to verify OTP:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-grofast-green to-grofast-green-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-grofast-green mb-2">GroFast</h1>
          <p className="text-gray-600">India's last minute app</p>
        </div>

        {step === 'phone' ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your mobile number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-grofast-green focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={sendOtp}
              disabled={loading || phone.length !== 10}
              className="w-full bg-grofast-green text-white py-3 rounded-xl font-medium hover:bg-grofast-green-dark disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Sending...' : 'Send OTP'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP sent to {phone}
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-grofast-green focus:border-transparent text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>
            <button
              onClick={verifyOtp}
              disabled={loading || otp.length !== 6}
              className="w-full bg-grofast-green text-white py-3 rounded-xl font-medium hover:bg-grofast-green-dark disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button
              onClick={() => setStep('phone')}
              className="w-full text-grofast-green py-2 text-sm"
            >
              Change number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}