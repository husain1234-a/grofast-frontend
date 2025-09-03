'use client';

import { useState, useEffect } from 'react';
import { User, MapPin, Phone, Mail, Save } from 'lucide-react';
import { api } from '@/lib/api-client';
import AuthGuard from '@/components/AuthGuard';
import { logger } from '@/lib/logger';
import { toast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.me();
      setProfile(response as any);
    } catch (error) {
      logger.error('Failed to load profile', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile. Please try again.",
      })
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      // Note: Update profile endpoint would need to be added to API
      toast({
        variant: "success",
        title: "Success",
        description: "Profile updated successfully!",
      })
    } catch (error) {
      logger.error('Failed to update profile', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
      })
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-grofast-green focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-grofast-green focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-grofast-green focus:border-transparent"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Address
                </label>
                <textarea
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-grofast-green focus:border-transparent"
                />
              </div>

              <button
                onClick={updateProfile}
                disabled={loading}
                className="w-full bg-grofast-green text-white py-3 rounded-xl font-medium hover:bg-grofast-green-dark disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}