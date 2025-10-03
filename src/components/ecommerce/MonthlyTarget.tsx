/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dynamically import the ReactApexChart component with loading fallback
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[330px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
    </div>
  ),
});

interface TargetData {
  currentProgress: number;
  target: number;
  completedProjects: number;
  todayProjects: number;
  percentageChange: number;
  message: string;
}

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

const MonthlyTarget = () => {
  const [targetData, setTargetData] = useState<TargetData>({
    currentProgress: 75.55,
    target: 20,
    completedProjects: 15,
    todayProjects: 3,
    percentageChange: 10,
    message: "You completed 3 projects today, it's higher than last month. Keep up your good work!"
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Fetch real project data
  useEffect(() => {
    const fetchProjectData = async () => {
      setIsLoading(true);
      try {
        // Get current date and calculate date ranges
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        
        // Calculate previous period dates
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevQuarter = new Date(now.getFullYear(), Math.floor((now.getMonth() - 3) / 3) * 3, 1);
        const prevYear = new Date(now.getFullYear() - 1, 0, 1);

        // Determine date range based on selected period
        let startDate, endDate, prevStartDate, prevEndDate;
        if (selectedPeriod === 'month') {
          startDate = startOfMonth;
          endDate = now;
          prevStartDate = prevMonth;
          prevEndDate = startOfMonth;
        } else if (selectedPeriod === 'quarter') {
          startDate = startOfQuarter;
          endDate = now;
          prevStartDate = prevQuarter;
          prevEndDate = startOfQuarter;
        } else {
          startDate = startOfYear;
          endDate = now;
          prevStartDate = prevYear;
          prevEndDate = startOfYear;
        }

        // Fetch all projects
        const response = await fetch('/api/projects?limit=1000');
        const data = await response.json();
        
        if (data.projects) {
          // Filter projects by current period
          const currentProjects = data.projects.filter((project: Project) => {
            const projectDate = new Date(project.createdAt);
            return projectDate >= startDate && projectDate <= endDate;
          });
          
          // Filter projects by previous period
          const prevProjects = data.projects.filter((project: Project) => {
            const projectDate = new Date(project.createdAt);
            return projectDate >= prevStartDate && projectDate < prevEndDate;
          });

          // Calculate completed projects in current period
          const completedProjects = currentProjects.filter((project: Project) => {
            return project.status === 'completed' || 
              (project.milestones && project.milestones.length > 0 && 
               project.milestones.every(milestone => milestone.completed));
          }).length;

          // Calculate completed projects in previous period
          const prevCompletedProjects = prevProjects.filter((project: Project) => {
            return project.status === 'completed' || 
              (project.milestones && project.milestones.length > 0 && 
               project.milestones.every(milestone => milestone.completed));
          }).length;

          // Calculate today's completed projects
          const todayProjects = data.projects.filter((project: Project) => {
            const projectDate = new Date(project.createdAt);
            const isToday = projectDate >= today;
            const isCompleted = project.status === 'completed' || 
              (project.milestones && project.milestones.length > 0 && 
               project.milestones.every(milestone => milestone.completed));
            return isToday && isCompleted;
          }).length;

          // Calculate percentage change
          const percentageChange = prevCompletedProjects > 0 ? 
            ((completedProjects - prevCompletedProjects) / prevCompletedProjects) * 100 : 0;

          // Set target based on period
          const target = selectedPeriod === 'month' ? 20 : selectedPeriod === 'quarter' ? 60 : 120;
          
          // Calculate progress percentage based on completed projects vs target
          const currentProgress = target > 0 ? Math.min(100, (completedProjects / target) * 100) : 0;

          setTargetData({
            currentProgress: Math.round(currentProgress * 10) / 10,
            target: target,
            completedProjects: completedProjects,
            todayProjects: todayProjects,
            percentageChange: Math.round(percentageChange * 10) / 10,
            message: percentageChange > 0 
              ? `You completed ${todayProjects} projects today, it's ${Math.abs(percentageChange).toFixed(1)}% higher than last ${selectedPeriod}. Keep up your good work!`
              : `You completed ${todayProjects} projects today, it's ${Math.abs(percentageChange).toFixed(1)}% lower than last ${selectedPeriod}. Let's improve!`
          });
        }

      } catch (error) {
        console.error('Error fetching project data:', error);
        setTargetData({
          currentProgress: 0,
          target: selectedPeriod === 'month' ? 20 : selectedPeriod === 'quarter' ? 60 : 120,
          completedProjects: 0,
          todayProjects: 0,
          percentageChange: 0,
          message: "Unable to fetch project data. Please try again later."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [selectedPeriod]);

  const series = [targetData.currentProgress];
  const options: ApexOptions = {
    colors: [targetData.currentProgress >= 80 ? "#F59E0B" : targetData.currentProgress >= 60 ? "#F59E0B" : "#4B5563"], // amber-500 or gray-600
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
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
      }
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E5E7EB/50", // gray-200/50
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: targetData.currentProgress >= 80 ? "#F59E0B" : targetData.currentProgress >= 60 ? "#F59E0B" : "#4B5563", // amber-500 or gray-600
            formatter: function (val) {
              return val.toFixed(1) + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        shadeIntensity: 0.5,
        gradientToColors: [targetData.currentProgress >= 80 ? "#D97706" : targetData.currentProgress >= 60 ? "#D97706" : "#374151"], // amber-600 or gray-700
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.8,
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: "round",
    },
    labels: [`${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}ly Progress`],
  };

  return (
    <div className="rounded-sm border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-950/90 shadow-xl transition-all duration-300">
      <div className="px-5 pt-5 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-sm pb-11 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Project Target
            </h3>
            <p className="mt-1 font-normal text-gray-600 dark:text-gray-300 text-sm">
              Target you’ve set for each month
            </p>
          </div>
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
                onClick={() => {
                  setSelectedPeriod(selectedPeriod);
                }}
              >
                Refresh Data
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex w-full font-normal text-left text-gray-700 dark:text-gray-200 rounded-sm hover:bg-amber-100/50 dark:hover:bg-amber-900/30 px-2 py-1.5 cursor-pointer focus:outline-none"
                onClick={() => {
                  console.log('Exporting data:', targetData);
                }}
              >
                Export Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="relative">
          <div className="max-h-[330px]">
            <ReactApexChart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>
          <span className={`absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full px-3 py-1 text-xs font-medium ${
            targetData.percentageChange > 0 
              ? 'bg-amber-200/80 text-amber-800 dark:bg-amber-800/60 dark:text-amber-200'
              : 'bg-red-100/30 text-red-600 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {targetData.percentageChange > 0 ? '+' : ''}{targetData.percentageChange}%
          </span>
        </div>
        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-600 dark:text-gray-300 sm:text-base">
          {targetData.message}
        </p>
      </div>
      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-gray-600 dark:text-gray-300 text-sm sm:text-sm">
            Target
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
            {targetData.target}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.26816 13.6632C7.4056 13.8192 7.60686 13.9176 7.8311 13.9176C7.83148 13.9176 7.83187 13.9176 7.83226 13.9176C8.02445 13.9178 8.21671 13.8447 8.36339 13.6981L12.3635 9.70076C12.6565 9.40797 12.6567 8.9331 12.3639 8.6401C12.0711 8.34711 11.5962 8.34694 11.3032 8.63973L8.5811 11.36L8.5811 2.5C8.5811 2.08579 8.24531 1.75 7.8311 1.75C7.41688 1.75 7.0811 2.08579 7.0811 2.5L7.0811 11.3556L4.36354 8.63975C4.07055 8.34695 3.59568 8.3471 3.30288 8.64009C3.01008 8.93307 3.01023 9.40794 3.30321 9.70075L7.26816 13.6632Z"
                fill="#DC2626" // red-600
              />
            </svg>
          </p>
        </div>
        <div className="w-px bg-gray-200/50 dark:bg-gray-700/50 h-7"></div>
        <div>
          <p className="mb-1 text-center text-gray-600 dark:text-gray-300 text-sm sm:text-sm">
            Completed
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
            {targetData.completedProjects}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z"
                fill="#F59E0B" // amber-500
              />
            </svg>
          </p>
        </div>
        <div className="w-px bg-gray-200/50 dark:bg-gray-700/50 h-7"></div>
        <div>
          <p className="mb-1 text-center text-gray-600 dark:text-gray-300 text-sm sm:text-sm">
            Today
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
            {targetData.todayProjects}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z"
                fill="#F59E0B" // amber-500
              />
            </svg>
          </p>
        </div>
      </div>

      {/* Dynamic dark mode chart styling */}
      <style jsx>{`
        @media (prefers-color-scheme: dark) {
          .apexcharts-radialbar-track path {
            fill: #374151; /* gray-700/50 */
          }
          .apexcharts-datalabel {
            fill: #FFFFFF !important; /* white */
          }
          .apexcharts-series[seriesName="${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}ly Progress"] {
            fill: url(#progress-gradient-dark) !important;
          }
        }
        #progress-gradient-dark {
          stop-color: ${targetData.currentProgress >= 60 ? '#FBBF24' : '#D1D5DB'}; /* amber-400 or gray-300 */
          stop-opacity: 1;
        }
        #progress-gradient-dark stop:last-child {
          stop-color: ${targetData.currentProgress >= 60 ? '#D97706' : '#374151'}; /* amber-600 or gray-700 */
          stop-opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

export default MonthlyTarget;