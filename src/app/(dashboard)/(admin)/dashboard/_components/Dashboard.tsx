import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import DemographicCard from "@/components/ecommerce/DemographicCard";

export const metadata: Metadata = {
  title: "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Ecommerce() {
  return (
    <div className="min-h-screen w-full relative">
      {/* Background with gradient and blur, inspired by Header */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-200/80 to-amber-400/80 dark:from-amber-900/40 dark:to-amber-800/40 transition-all duration-500 blur-xl" />
      <div className="relative min-h-screen w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200/30 dark:border-gray-800/30 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-7">
              {/* EcommerceMetrics as a card */}
              <div className="p-6 bg-white/90 dark:bg-gray-950/90 rounded-sm shadow-xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300">
                <EcommerceMetrics />
              </div>
              {/* MonthlySalesChart as a card */}
              <div className="p-6 bg-white/90 dark:bg-gray-950/90 rounded-sm shadow-xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300">
                <MonthlySalesChart />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-5">
              {/* MonthlyTarget as a card */}
              <div className="p-6 bg-white/90 dark:bg-gray-950/90 rounded-sm shadow-xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300">
                <MonthlyTarget />
              </div>
            </div>

            <div className="col-span-12">
              {/* StatisticsChart as a card */}
              <div className="p-6 bg-white/90 dark:bg-gray-950/90 rounded-sm shadow-xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300">
                <StatisticsChart />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-5">
              {/* DemographicCard as a card */}
              <div className="p-6 bg-white/90 dark:bg-gray-950/90 rounded-sm shadow-xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300">
                <DemographicCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}