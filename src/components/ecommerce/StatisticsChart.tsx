"use client";
import React, { useState, useEffect } from "react";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";
import dynamic from "next/dynamic";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[310px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
    </div>
  ),
});

interface Payment {
  _id: string;
  amount: number;
  status: string;
  createdAt: string;
  customer?: {
    reference: string;
  };
}

interface MonthlyData {
  month: string;
  sales: number;
  revenue: number;
}

export default function StatisticsChart() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');

  // Fetch payment data for statistics
  useEffect(() => {
    const fetchStatisticsData = async () => {
      setIsLoading(true);
      try {
        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1); // Start of current year
        const endDate = new Date(); // Current date

        // Fetch all successful payments for the current year
        const response = await fetch(`/api/payments?status=success&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=10000`);
        const data = await response.json();

        if (data.payments) {
          // Group payments by month
          const monthlyStats = new Map<string, { sales: number; revenue: number }>();
          
          // Initialize all months with 0 values
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          months.forEach(month => {
            monthlyStats.set(month, { sales: 0, revenue: 0 });
          });

          // Process payments and group by month
          data.payments.forEach((payment: Payment) => {
            const paymentDate = new Date(payment.createdAt);
            const monthName = months[paymentDate.getMonth()];
            const current = monthlyStats.get(monthName) || { sales: 0, revenue: 0 };
            
            monthlyStats.set(monthName, {
              sales: current.sales + 1, // Count of sales
              revenue: current.revenue + (payment.amount || 0) // Total revenue
            });
          });

          // Convert to array format for chart
          const chartData = months.map(month => ({
            month,
            sales: monthlyStats.get(month)?.sales || 0,
            revenue: Math.round((monthlyStats.get(month)?.revenue || 0) / 100) // Convert to hundreds for better display
          }));

          setMonthlyData(chartData);
        }
      } catch (error) {
        console.error('Error fetching statistics data:', error);
        // Fallback to default data
        setMonthlyData([
          { month: 'Jan', sales: 0, revenue: 0 },
          { month: 'Feb', sales: 0, revenue: 0 },
          { month: 'Mar', sales: 0, revenue: 0 },
          { month: 'Apr', sales: 0, revenue: 0 },
          { month: 'May', sales: 0, revenue: 0 },
          { month: 'Jun', sales: 0, revenue: 0 },
          { month: 'Jul', sales: 0, revenue: 0 },
          { month: 'Aug', sales: 0, revenue: 0 },
          { month: 'Sep', sales: 0, revenue: 0 },
          { month: 'Oct', sales: 0, revenue: 0 },
          { month: 'Nov', sales: 0, revenue: 0 },
          { month: 'Dec', sales: 0, revenue: 0 }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatisticsData();
  }, [selectedPeriod]);

  const options: ApexOptions = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#F59E0B", "#4B5563"], // Sales: amber-500, Revenue: gray-600 (light mode)
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "straight",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light", // Use light or dark shade based on mode
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: ["#D97706", "#374151"], // amber-600, gray-700 (light mode)
        opacityFrom: 0.55,
        opacityTo: 0,
        stops: [0, 100],
      },
    },
    markers: {
      size: 0,
      strokeColors: "#FFFFFF", // White, as in Header
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      x: {
        format: "dd MMM yyyy",
      },
      theme: "light", // Default to light, overridden in dark mode via CSS or dynamic theming
    },
    xaxis: {
      type: "category",
      categories: monthlyData.map(item => item.month),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      labels: {
        style: {
          colors: "#4B5563", // gray-600 (light mode)
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#4B5563"], // gray-600 (light mode)
        },
      },
      title: {
        text: "",
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  const series = [
    {
      name: "Sales",
      data: monthlyData.map(item => item.sales),
    },
    {
      name: "Revenue",
      data: monthlyData.map(item => item.revenue),
    },
  ];

  return (
    <div className="rounded-sm border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-950/90 px-5 pb-5 pt-5 shadow-xl transition-all duration-300 sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Statistics
          </h3>
          <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm">
            Monthly sales and revenue data from successful payments
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-auto">
            <button
              onClick={() => setSelectedPeriod(selectedPeriod)}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm bg-amber-100/50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50 rounded-sm hover:bg-amber-200/50 dark:hover:bg-amber-800/30 disabled:opacity-50 transition-colors duration-200 font-medium cursor-pointer shadow-sm whitespace-nowrap"
            >
              {isLoading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>
          <div className="w-full sm:w-auto flex justify-center">
            <ChartTab value={selectedPeriod} onChange={setSelectedPeriod} />
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={310}
          />
        </div>
      </div>

      {/* Dynamic dark mode chart styling */}
      <style jsx>{`
        @media (prefers-color-scheme: dark) {
          .apexcharts-tooltip {
            background: #111827 !important; /* gray-900 */
            color: #E5E7EB !important; /* gray-200 */
            border-color: #374151 !important; /* gray-700 */
          }
          .apexcharts-xaxis-label {
            fill: #D1D5DB !important; /* gray-300 */
          }
          .apexcharts-yaxis-label {
            fill: #D1D5DB !important; /* gray-300 */
          }
          .apexcharts-series[seriesName="Sales"] {
            fill: url(#sales-gradient-dark) !important;
          }
          .apexcharts-series[seriesName="Revenue"] {
            fill: url(#revenue-gradient-dark) !important;
          }
        }
        #sales-gradient-dark {
          stop-color: #FBBF24; /* amber-400 */
          stop-opacity: 0.55;
        }
        #revenue-gradient-dark {
          stop-color: #D1D5DB; /* gray-300 */
          stop-opacity: 0.55;
        }
      `}</style>
    </div>
  );
}