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

interface Project {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  milestones: Array<{
    name: string;
    completed: boolean;
    date: string;
  }>;
}

interface MonthlyData {
  month: string;
  completedProjects: number;
  totalProjects: number;
}

export default function StatisticsChart() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');

  // Fetch project data for statistics
  useEffect(() => {
    const fetchStatisticsData = async () => {
      setIsLoading(true);
      try {
        const currentYear = new Date().getFullYear();

        // Fetch all projects for the current year
        const response = await fetch('/api/projects?limit=1000');
        const data = await response.json();

        if (data.projects) {
          // Group projects by month
          const monthlyStats = new Map<string, { completedProjects: number; totalProjects: number }>();
          
          // Initialize all months with 0 values
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          months.forEach(month => {
            monthlyStats.set(month, { completedProjects: 0, totalProjects: 0 });
          });

          // Process projects and group by month (filter by current year)
          data.projects.forEach((project: Project) => {
            const projectDate = new Date(project.createdAt);
            
            // Only include projects from current year
            if (projectDate.getFullYear() === currentYear) {
              const monthName = months[projectDate.getMonth()];
              const current = monthlyStats.get(monthName) || { completedProjects: 0, totalProjects: 0 };
              
              // Check if project is completed
              const isCompleted = project.status === 'completed' || 
                (project.milestones && project.milestones.length > 0 && 
                 project.milestones.every(milestone => milestone.completed));
              
              monthlyStats.set(monthName, {
                completedProjects: current.completedProjects + (isCompleted ? 1 : 0),
                totalProjects: current.totalProjects + 1
              });
            }
          });

          // Convert to array format for chart
          const chartData = months.map(month => ({
            month,
            completedProjects: monthlyStats.get(month)?.completedProjects || 0,
            totalProjects: monthlyStats.get(month)?.totalProjects || 0
          }));

          setMonthlyData(chartData);
        }
      } catch (error) {
        console.error('Error fetching statistics data:', error);
        // Fallback to default data
        setMonthlyData([
          { month: 'Jan', completedProjects: 0, totalProjects: 0 },
          { month: 'Feb', completedProjects: 0, totalProjects: 0 },
          { month: 'Mar', completedProjects: 0, totalProjects: 0 },
          { month: 'Apr', completedProjects: 0, totalProjects: 0 },
          { month: 'May', completedProjects: 0, totalProjects: 0 },
          { month: 'Jun', completedProjects: 0, totalProjects: 0 },
          { month: 'Jul', completedProjects: 0, totalProjects: 0 },
          { month: 'Aug', completedProjects: 0, totalProjects: 0 },
          { month: 'Sep', completedProjects: 0, totalProjects: 0 },
          { month: 'Oct', completedProjects: 0, totalProjects: 0 },
          { month: 'Nov', completedProjects: 0, totalProjects: 0 },
          { month: 'Dec', completedProjects: 0, totalProjects: 0 }
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
    colors: ["#F59E0B", "#4B5563"], // Completed: amber-500, Total: gray-600 (light mode)
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
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
      categories: monthlyData && monthlyData.length > 0 ? monthlyData.map(item => item?.month || '') : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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
      name: "Completed Projects",
      data: monthlyData && monthlyData.length > 0 ? monthlyData.map(item => item?.completedProjects || 0) : Array(12).fill(0),
    },
    {
      name: "Total Projects",
      data: monthlyData && monthlyData.length > 0 ? monthlyData.map(item => item?.totalProjects || 0) : Array(12).fill(0),
    },
  ];

  return (
    <div className="rounded-sm border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-950/90 px-5 pb-5 pt-5 shadow-xl transition-all duration-300 sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Project Statistics
          </h3>
          <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm">
            Monthly project completion and total project data
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
          {isLoading ? (
            <div className="flex items-center justify-center h-[310px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : (
            <ReactApexChart
              options={options}
              series={series}
              type="area"
              height={310}
              key={`chart-${monthlyData.length}`}
            />
          )}
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
          .apexcharts-series[seriesName="Completed Projects"] {
            fill: url(#completed-gradient-dark) !important;
          }
          .apexcharts-series[seriesName="Total Projects"] {
            fill: url(#total-gradient-dark) !important;
          }
        }
        #completed-gradient-dark {
          stop-color: #FBBF24; /* amber-400 */
          stop-opacity: 0.55;
        }
        #total-gradient-dark {
          stop-color: #D1D5DB; /* gray-300 */
          stop-opacity: 0.55;
        }
      `}</style>
    </div>
  );
}