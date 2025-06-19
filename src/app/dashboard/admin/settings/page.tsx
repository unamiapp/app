'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function AdminSettings() {
  const { userProfile, loading } = useAuth();
  const [systemSettings, setSystemSettings] = useState({
    enableUserRegistration: true,
    requireEmailVerification: true,
    autoApproveSchools: false,
    autoApproveAuthorities: false,
    dataRetentionDays: 90,
  });
  const [notificationSettings, setNotificationSettings] = useState({
    sendAlertEmails: true,
    sendDailyReports: true,
    sendWeeklyReports: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSystemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, value, type } = e.target;
    setSystemSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
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
          <h1 className="text-2xl font-semibold text-slate-900">System Settings</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage system-wide settings and configurations.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Admin Information</h3>
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
            <h3 className="text-lg font-medium text-gray-900">System Configuration</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Enable User Registration</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="enableUserRegistration"
                    id="enableUserRegistration"
                    checked={systemSettings.enableUserRegistration}
                    onChange={handleSystemChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="enableUserRegistration"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      systemSettings.enableUserRegistration ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Require Email Verification</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="requireEmailVerification"
                    id="requireEmailVerification"
                    checked={systemSettings.requireEmailVerification}
                    onChange={handleSystemChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="requireEmailVerification"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      systemSettings.requireEmailVerification ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Auto-Approve Schools</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="autoApproveSchools"
                    id="autoApproveSchools"
                    checked={systemSettings.autoApproveSchools}
                    onChange={handleSystemChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="autoApproveSchools"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      systemSettings.autoApproveSchools ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Auto-Approve Authorities</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="autoApproveAuthorities"
                    id="autoApproveAuthorities"
                    checked={systemSettings.autoApproveAuthorities}
                    onChange={handleSystemChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="autoApproveAuthorities"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      systemSettings.autoApproveAuthorities ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data Retention (days)</label>
                <input
                  type="number"
                  name="dataRetentionDays"
                  value={systemSettings.dataRetentionDays}
                  onChange={handleSystemChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Send Alert Emails</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="sendAlertEmails"
                    id="sendAlertEmails"
                    checked={notificationSettings.sendAlertEmails}
                    onChange={handleNotificationChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="sendAlertEmails"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      notificationSettings.sendAlertEmails ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Send Daily Reports</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="sendDailyReports"
                    id="sendDailyReports"
                    checked={notificationSettings.sendDailyReports}
                    onChange={handleNotificationChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="sendDailyReports"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      notificationSettings.sendDailyReports ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Send Weekly Reports</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="sendWeeklyReports"
                    id="sendWeeklyReports"
                    checked={notificationSettings.sendWeeklyReports}
                    onChange={handleNotificationChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="sendWeeklyReports"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      notificationSettings.sendWeeklyReports ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">System Maintenance</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Backup Database
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear Cache
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reset System
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
              <LoadingSpinner size="small" color="primary" className="mr-2" />
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