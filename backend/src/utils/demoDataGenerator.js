// src/utils/demoDataGenerator.js
// Demo data generator for analytics dashboard
// Used when USE_DEMO_DATA=true for presentation/demo purposes

/**
 * Generate last 12 months array
 */
function getLast12Months() {
  const months = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.push(monthStr);
  }
  
  return months;
}

/**
 * Generate demo sales by category data
 */
function generateSalesByCategory() {
  const categories = [
    { category: 'Business', orders: 145, quantity: 320, revenue: 12500.50 },
    { category: 'Technology', orders: 98, quantity: 210, revenue: 8900.75 },
    { category: 'Fiction', orders: 156, quantity: 380, revenue: 11200.25 },
    { category: 'Horror', orders: 67, quantity: 145, revenue: 5400.00 },
    { category: 'Adventure', orders: 89, quantity: 195, revenue: 7200.50 },
    { category: 'Marketing', orders: 45, quantity: 98, revenue: 3800.25 },
  ];
  
  return categories;
}

/**
 * Generate demo revenue trends (12 months)
 */
function generateRevenueTrends() {
  const months = getLast12Months();
  const baseRevenue = 8000;
  const baseOrders = 45;
  
  return months.map((month, index) => {
    // Simulate growth trend with some variation
    const growthFactor = 1 + (index * 0.08); // 8% growth per month
    const variation = 0.85 + Math.random() * 0.3; // ±15% variation
    
    // Add peak in months 10-11 (holiday season)
    const peakFactor = (index >= 10) ? 1.4 : 1.0;
    
    const revenue = Math.round(baseRevenue * growthFactor * variation * peakFactor);
    const orders = Math.round(baseOrders * growthFactor * variation * peakFactor);
    
    return {
      month,
      orders,
      revenue: parseFloat(revenue.toFixed(2)),
      itemsSold: orders * 2.5 + Math.floor(Math.random() * 20)
    };
  });
}

/**
 * Generate demo monthly orders (12 months) - for Overview tab
 * Format: [{ month: 'Jan', orders: 25 }, ...]
 */
function generateMonthlyOrders() {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const baseOrders = 20;
  
  return monthNames.map((month, index) => {
    // Simulate growth trend with some variation
    const growthFactor = 1 + (index * 0.1); // 10% growth per month
    const variation = 0.8 + Math.random() * 0.4; // ±20% variation
    
    // Add peak in months 10-11 (holiday season)
    const peakFactor = (index >= 10) ? 1.5 : 1.0;
    
    const orders = Math.round(baseOrders * growthFactor * variation * peakFactor);
    
    return {
      month,
      orders: Math.max(5, orders) // Minimum 5 orders per month
    };
  });
}

/**
 * Generate demo user growth (12 months)
 */
function generateUserGrowth() {
  const months = getLast12Months();
  const baseUsers = 25;
  
  return months.map((month, index) => {
    // Simulate growth with some spikes
    const growthFactor = 1 + (index * 0.12); // 12% growth per month
    const variation = 0.7 + Math.random() * 0.6; // ±30% variation
    
    // Add spike in months 2, 6, 10 (marketing campaigns)
    const spikeFactor = ([2, 6, 10].includes(index)) ? 1.5 : 1.0;
    
    const newUsers = Math.round(baseUsers * growthFactor * variation * spikeFactor);
    
    return {
      month,
      newUsers: Math.max(10, newUsers) // Minimum 10 users
    };
  });
}

/**
 * Generate demo order status distribution
 */
function generateOrderStatusDistribution() {
  return [
    { status: 'COMPLETED', count: 420, revenue: 125000.50 },
    { status: 'SHIPPED', count: 85, revenue: 25000.75 },
    { status: 'PAID', count: 45, revenue: 15000.25 },
    { status: 'PENDING', count: 32, revenue: 8500.00 },
    { status: 'CANCELLED', count: 18, revenue: 0 }
  ];
}

/**
 * Generate demo top customers
 */
function generateTopCustomers(limit = 10) {
  const names = [
    'John Smith', 'Emily Johnson', 'Michael Brown', 'Sarah Davis', 'David Wilson',
    'Jessica Martinez', 'Christopher Anderson', 'Ashley Taylor', 'Matthew Thomas', 'Amanda Jackson'
  ];
  
  return names.slice(0, limit).map((name, index) => ({
    id: index + 1,
    username: name.toLowerCase().replace(' ', '_'),
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    name,
    totalOrders: 15 + Math.floor(Math.random() * 20),
    totalSpent: parseFloat((500 + Math.random() * 2000).toFixed(2))
  })).sort((a, b) => b.totalSpent - a.totalSpent);
}

/**
 * Generate demo top selling books
 */
function generateTopSellingBooks(limit = 10) {
  const books = [
    { title: 'Atomic Habits', author: 'James Clear', totalSold: 245, revenue: 4900.00 },
    { title: 'The Hobbit', author: 'J.R.R. Tolkien', totalSold: 189, revenue: 2362.50 },
    { title: 'How to Grow Your Online Store', author: 'John Doe', totalSold: 156, revenue: 3120.00 },
    { title: 'Mastering SEO in 2024', author: 'Jane Smith', totalSold: 134, revenue: 4020.00 },
    { title: 'Top 10 Fiction Books This Year', author: 'Book Review Team', totalSold: 128, revenue: 1920.00 },
    { title: 'Best eCommerce Platforms', author: 'Tech Expert', totalSold: 112, revenue: 4480.00 },
    { title: 'The First Days', author: 'Horror Writer', totalSold: 98, revenue: 4900.00 },
    { title: 'The Hunger Games', author: 'Suzanne Collins', totalSold: 87, revenue: 1522.50 },
    { title: 'Harry Potter and the Order of the Phoenix', author: 'J.K. Rowling', totalSold: 76, revenue: 1368.00 },
    { title: 'Pride and Prejudice', author: 'Jane Austen', totalSold: 65, revenue: 975.00 },
  ];
  
  return books.slice(0, limit).map((book, index) => ({
    id: index + 1,
    title: book.title,
    author: book.author,
    imageUrl: `book-${index + 1}.png`,
    totalSold: book.totalSold,
    revenue: book.revenue
  }));
}

/**
 * Generate demo analytics summary
 */
function generateAnalyticsSummary() {
  return {
    totalRevenue: 173500.50,
    totalOrders: 600,
    totalUsers: 450,
    totalBooks: 120,
    monthRevenue: 18500.75
  };
}

module.exports = {
  generateSalesByCategory,
  generateRevenueTrends,
  generateUserGrowth,
  generateOrderStatusDistribution,
  generateTopCustomers,
  generateTopSellingBooks,
  generateAnalyticsSummary,
  generateMonthlyOrders
};
