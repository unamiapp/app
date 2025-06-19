'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function ParentSettings() {
  const { userProfile, loading } = useAuth();
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    appNotifications: true,
  });
  const [privacySettings, setPrivacySettings] = useState({
    shareLocationWithSchool: true,
    shareLocationWithAuthorities: true,
    shareProfileWithCommunity: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPrivacySettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" color="primary" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage your account settings and preferences.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Profile Information</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                  {userProfile?.displayName || 'Not set'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                  {userProfile?.email || 'Not set'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 capitalize">
                  {userProfile?.role || 'Not set'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Notification Settings</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Email Alerts</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="emailAlerts"
                    id="emailAlerts"
                    checked={notificationSettings.emailAlerts}
                    onChange={handleNotificationChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="emailAlerts"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      notificationSettings.emailAlerts ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">SMS Alerts</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="smsAlerts"
                    id="smsAlerts"
                    checked={notificationSettings.smsAlerts}
                    onChange={handleNotificationChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="smsAlerts"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      notificationSettings.smsAlerts ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">App Notifications</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="appNotifications"
                    id="appNotifications"
                    checked={notificationSettings.appNotifications}
                    onChange={handleNotificationChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="appNotifications"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      notificationSettings.appNotifications ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Privacy Settings</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Share Location with School</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="shareLocationWithSchool"
                    id="shareLocationWithSchool"
                    checked={privacySettings.shareLocationWithSchool}
                    onChange={handlePrivacyChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="shareLocationWithSchool"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      privacySettings.shareLocationWithSchool ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Share Location with Authorities</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="shareLocationWithAuthorities"
                    id="shareLocationWithAuthorities"
                    checked={privacySettings.shareLocationWithAuthorities}
                    onChange={handlePrivacyChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="shareLocationWithAuthorities"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      privacySettings.shareLocationWithAuthorities ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Share Profile with Community</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="shareProfileWithCommunity"
                    id="shareProfileWithCommunity"
                    checked={privacySettings.shareProfileWithCommunity}
                    onChange={handlePrivacyChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="shareProfileWithCommunity"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      privacySettings.shareProfileWithCommunity ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Account Security</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Change Password
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Enable Two-Factor Authentication
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isSaving ? (
            <>
              <LoadingSpinner size="small" color="white" className="mr-2" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>

      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #68D391;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #68D391;
        }
        .toggle-checkbox {
          right: 0;
          z-index: 1;
          border-color: #D1D5DB;
          transition: all 0.3s;
        }
        .toggle-label {
          transition: background-color 0.3s;
        }
      `}</style>
    </div>
  );
}