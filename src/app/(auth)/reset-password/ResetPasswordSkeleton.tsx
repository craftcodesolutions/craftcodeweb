'use client';

import { Skeleton } from "@/components/ui/skeleton";

export function ResetPasswordSkeleton() {
  return (
    <div className="p-6 max-w-md mx-auto space-y-4 bg-[#FFFFFF]/70 dark:bg-[#0B1C2D]/70 border border-[#DCEEEE]/70 dark:border-[#1E3A4A]/70 rounded-lg">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
