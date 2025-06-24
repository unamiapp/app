'use client';

import { useState } from 'react';

export default function RegisteredUsersGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
      >
        Need help logging in?
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Registered Users Guide</h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-900">How to Log In</h4>
                  <p className="mt-1 text-gray-600">
                    If you're a registered user who created an account during development:
                  </p>
                  <ul className="mt-2 list-disc pl-5 text-gray-600">
                    <li>Enter your registered email address</li>
                    <li>Use password: <span className="font-mono bg-gray-100 px-1 rounded">demo123</span></li>
                    <li>Select your role (parent, school, authority)</li>
                    <li>Click "Sign in"</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">Why This Works</h4>
                  <p className="mt-1 text-gray-600">
                    The system is configured to allow login with the development password for any registered user in the database.
                    This ensures you can access your development data without needing to remember specific passwords.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">Troubleshooting</h4>
                  <p className="mt-1 text-gray-600">
                    If you're unable to log in:
                  </p>
                  <ul className="mt-2 list-disc pl-5 text-gray-600">
                    <li>Verify your email is correctly entered</li>
                    <li>Make sure you're using <span className="font-mono bg-gray-100 px-1 rounded">demo123</span> as the password</li>
                    <li>Check that you've selected the correct role</li>
                    <li>If still having issues, contact the administrator</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}