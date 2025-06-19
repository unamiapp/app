'use client';

import React from 'react';
import { UserRole } from '@/types/user';

interface MockDashboardProps {
  role: UserRole;
}

export default function MockDashboard({ role }: MockDashboardProps) {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-slate-900">{role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Welcome! This is your dashboard.
          </p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-white overflow-hidden shadow-md rounded-xl border border-slate-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 bg-indigo-500 rounded-md p-3`}>
                  <div className="h-6 w-6 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">Stat {item}</dt>
                    <dd>
                      <div className="text-lg font-medium text-slate-900">{item * 10}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-4 py-4 sm:px-6 border-t border-slate-200">
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  View details
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Actions and Recent Activity */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <h2 className="text-lg font-medium text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <a
                key={item}
                href="#"
                className="relative rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-slate-300 hover:shadow-md"
              >
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-slate-900">Action {item}</p>
                  <p className="text-sm text-slate-500">Quick action description</p>
                </div>
              </a>
            ))}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <h2 className="text-lg font-medium text-slate-900 mb-4">Recent Activity</h2>
          <div className="rounded-md border border-slate-200">
            <ul className="divide-y divide-slate-200">
              {[1, 2, 3, 4, 5].map((item) => (
                <li key={item} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        Activity {item}
                      </p>
                      <p className="sm:ml-2 flex-shrink-0 flex">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          Info
                        </span>
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="text-sm text-slate-500">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    This is a description of activity {item}.
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}