// src/utils/exportUtils.js

/**
 * Convert array of objects to CSV string
 */
export const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) return '';

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create header row
  const headerRow = csvHeaders.join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header] || '';
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export orders to CSV
 */
export const exportOrders = (orders) => {
  const csvData = orders.map(order => ({
    'Order ID': order.id,
    'User Email': order.email || order.user?.email || '',
    'Total Price': order.totalPrice || 0,
    'Status': order.status || '',
    'Payment Status': order.paymentStatus || '',
    'Payment Method': order.paymentMethod || '',
    'Created At': order.createdAt || '',
  }));
  
  const csv = convertToCSV(csvData);
  downloadCSV(csv, `orders_${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * Export users to CSV
 */
export const exportUsers = (users) => {
  const csvData = users.map(user => ({
    'User ID': user.id,
    'Username': user.username || '',
    'Email': user.email || '',
    'Name': user.name || '',
    'Phone': user.phone || '',
    'Role': user.role || '',
    'Status': user.isActive ? 'Active' : 'Inactive',
    'Created At': user.createdAt || '',
  }));
  
  const csv = convertToCSV(csvData);
  downloadCSV(csv, `users_${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * Export books to CSV
 */
export const exportBooks = (books) => {
  const csvData = books.map(book => ({
    'Book ID': book.id,
    'Title': book.title || '',
    'Author': book.author || '',
    'Price': book.price || 0,
    'Stock': book.stock || 0,
    'Category': book.category?.name || '',
    'Created At': book.createdAt || '',
  }));
  
  const csv = convertToCSV(csvData);
  downloadCSV(csv, `books_${new Date().toISOString().split('T')[0]}.csv`);
};

