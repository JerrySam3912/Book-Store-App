import React from 'react';

// Book Card Skeleton
export const BookCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="w-full h-64 bg-gray-300"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        <div className="h-6 bg-gray-300 rounded w-1/4"></div>
      </div>
    </div>
  );
};

// Book Grid Skeleton
export const BookGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <BookCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 5 }) => {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
        </td>
      ))}
    </tr>
  );
};

// Order Card Skeleton
export const OrderCardSkeleton = () => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
        <div className="h-6 bg-gray-300 rounded w-20"></div>
      </div>
    </div>
  );
};

// Profile Form Skeleton
export const ProfileFormSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gray-300 rounded w-1/4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 rounded w-1/6"></div>
          <div className="h-10 bg-gray-300 rounded"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 rounded w-1/6"></div>
          <div className="h-10 bg-gray-300 rounded"></div>
        </div>
        <div className="h-10 bg-gray-300 rounded w-32"></div>
      </div>
    </div>
  );
};

// Page Skeleton
export const PageSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-6 bg-gray-300 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 3 }) => {
  return (
    <div className="overflow-x-auto animate-pulse">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-4 py-3">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Default export - Component that accepts type prop
const LoadingSkeleton = ({ type = 'page', ...props }) => {
  switch (type) {
    case 'page':
      return <PageSkeleton {...props} />;
    case 'table':
      return <TableSkeleton {...props} />;
    case 'grid':
      return <BookGridSkeleton {...props} />;
    case 'card':
      return <BookCardSkeleton {...props} />;
    case 'order':
      return <OrderCardSkeleton {...props} />;
    case 'profile':
      return <ProfileFormSkeleton {...props} />;
    default:
      return <PageSkeleton {...props} />;
  }
};

export default LoadingSkeleton;

