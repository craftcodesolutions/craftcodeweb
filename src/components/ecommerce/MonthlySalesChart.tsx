"use client";

import { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
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

export default function MonthlySalesChart() {
  const [monthlyProjectPercentages, setMonthlyProjectPercentages] = useState<number[]>(Array(12).fill(0));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMonthlyProjectData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/projects?limit=1000');
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.projects && Array.isArray(data.projects)) {
          const monthlyData = Array(12).fill(0);
          const monthlyTotals = Array(12).fill(0);
          
          // Count total projects and completed projects per month with safe handling
          data.projects.forEach((project: Project) => {
            if (project && project.createdAt) {
              try {
                const projectDate = new Date(project.createdAt);
                if (!isNaN(projectDate.getTime())) {
                  const monthIdx = projectDate.getMonth();
                  if (monthIdx >= 0 && monthIdx < 12) {
                    monthlyTotals[monthIdx] += 1;
                    
                    // Count as completed if status is 'completed' or if all milestones are completed
                    const isCompleted = project.status === 'completed' || 
                      (project.milestones && Array.isArray(project.milestones) && project.milestones.length > 0 && 
                       project.milestones.every(milestone => milestone && typeof milestone.completed === 'boolean' && milestone.completed));
                    
                    if (isCompleted) {
                      monthlyData[monthIdx] += 1;
                    }
                  }
                }
              } catch (error) {
                console.warn('Invalid project date:', project.createdAt, error);
              }
            }
          });
          
          // Calculate percentages with safe math
          const percentages = monthlyData.map((completed, index) => {
            const total = monthlyTotals[index];
            if (typeof completed !== 'number' || typeof total !== 'number' || total <= 0) {
              return 0;
            }
            const percentage = Math.round((completed / total) * 100);
            return isNaN(percentage) ? 0 : Math.min(percentage, 100);
          });
          
          setMonthlyProjectPercentages(percentages);
        } else {
          setMonthlyProjectPercentages(Array(12).fill(0));
        }
      } catch (error) {
        console.error('Error fetching monthly project data:', error);
        setMonthlyProjectPercentages(Array(12).fill(0));
      } finally {
        setIsLoading(false);
      }
    };
    fetchMonthlyProjectData();
  }, []);

  const options: ApexOptions = {
    colors: ["#F59E0B"], // amber-500
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#4B5563", // gray-600
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
      labels: {
        colors: "#374151", // gray-700
      },
    },
    yaxis: {
      title: {
        text: undefined,
      },
      labels: {
        style: {
          colors: "#4B5563", // gray-600
        },
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
      type: "solid",
    },
    tooltip: {
      theme: "light",
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}%`,
      },
    },
  };

  const series = [
    {
      name: "Project Completion %",
      data: Array.isArray(monthlyProjectPercentages) && monthlyProjectPercentages.length > 0 
        ? monthlyProjectPercentages.map(val => typeof val === 'number' && !isNaN(val) ? val : 0)
        : Array(12).fill(0),
    },
  ];

  return (
    <div className="overflow-hidden rounded-sm border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-950/90 px-5 pt-5 shadow-xl transition-all duration-300 sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Monthly Project Completion
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="More options"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 p-2 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-sm shadow-xl">
            <DropdownMenuItem
              className="flex w-full font-normal text-left text-gray-700 dark:text-gray-200 rounded-sm hover:bg-amber-100/50 dark:hover:bg-amber-900/30 px-2 py-1.5 cursor-pointer focus:outline-none"
              onClick={() => {}} // Add your view more logic here
            >
              View More
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex w-full font-normal text-left text-gray-700 dark:text-gray-200 rounded-sm hover:bg-amber-100/50 dark:hover:bg-amber-900/30 px-2 py-1.5 cursor-pointer focus:outline-none"
              onClick={() => {}} // Add your delete logic here
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div
          className="-ml-5 min-w-[650px] xl:min-w-full pl-2"
          aria-label="Monthly project completion percentage chart"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-[180px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : (
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
              height={180}
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
          .apexcharts-legend-text {
            fill: #E5E7EB !important; /* gray-200 */
          }
          .apexcharts-gridline {
            stroke: #374151 !important; /* gray-700/50 */
          }
          .apexcharts-series[seriesName="Project Completion %"] {
            fill: #FBBF24 !important; /* amber-400 */
          }
        }
      `}</style>
    </div>
  );
}