// src/components/RevenueChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RevenueChart = ({ monthlyOrders = [] }) => {
  // All months
  const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Create a map from month name to orders count
  const ordersMap = {};
  monthlyOrders.forEach(item => {
    ordersMap[item.month] = item.orders;
  });

  // Fill in all months with data or 0
  const ordersData = allMonths.map(month => ordersMap[month] || 0);

  const data = {
    labels: allMonths,
    datasets: [
      {
        label: 'Orders',
        data: ordersData,
        backgroundColor: 'rgba(147, 51, 234, 0.7)', 
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            return `Orders: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: 'Number of Orders',
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Bar data={data} options={options} />
    </div>
  );
};

export default RevenueChart;