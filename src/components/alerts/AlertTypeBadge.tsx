'use client';

interface AlertTypeBadgeProps {
  alertType: string | undefined;
  className?: string;
}

export default function AlertTypeBadge({ alertType, className = '' }: AlertTypeBadgeProps) {
  const type = alertType || 'general';
  
  switch (type.toLowerCase()) {
    case 'missing':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ${className}`}>
          Missing
        </span>
      );
    case 'emergency':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 ${className}`}>
          Emergency
        </span>
      );
    case 'medical':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${className}`}>
          Medical
        </span>
      );
    case 'school':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 ${className}`}>
          School
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      );
  }
}