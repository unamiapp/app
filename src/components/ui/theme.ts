// Common theme colors and styles for consistent UI
export const theme = {
  colors: {
    primary: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    success: {
      light: '#d1fae5',
      main: '#10b981',
      dark: '#065f46',
    },
    warning: {
      light: '#fef3c7',
      main: '#f59e0b',
      dark: '#92400e',
    },
    error: {
      light: '#fee2e2',
      main: '#ef4444',
      dark: '#b91c1c',
    },
    info: {
      light: '#dbeafe',
      main: '#3b82f6',
      dark: '#1e40af',
    },
    dashboard: {
      sidebar: '#1e293b',
      header: '#ffffff',
      card: '#ffffff',
      cardHeader: '#f8fafc',
      accent: '#6366f1',
      hover: '#f1f5f9',
      border: '#e2e8f0',
    }
  },
  
  // Common button styles
  button: {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    outline: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700',
  },
  
  // Common form input styles
  input: 'shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md',
  
  // Common card styles
  card: 'bg-white shadow-md rounded-lg border border-gray-200',
  cardHeader: 'px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200',
  cardBody: 'px-4 py-5 sm:p-6',
  cardFooter: 'px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200',
  
  // Common text styles
  text: {
    heading: 'text-2xl font-semibold text-gray-900',
    subheading: 'text-lg font-medium text-gray-900',
    body: 'text-sm text-gray-700',
    muted: 'text-sm text-gray-500',
  },
  
  // Common spacing
  spacing: {
    section: 'mt-8',
    element: 'mt-4',
  },

  // Dashboard specific styles
  dashboard: {
    sidebar: 'bg-slate-800 text-white',
    sidebarLink: 'text-gray-300 hover:bg-slate-700 hover:text-white',
    sidebarLinkActive: 'bg-slate-900 text-white',
    header: 'bg-white shadow-sm border-b border-gray-200',
    statCard: 'bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden',
    actionCard: 'bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200',
  }
};