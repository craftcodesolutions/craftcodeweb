'use client';

import { Skeleton } from "@/components/ui/skeleton";

export function LoginSkeleton() {
  return (
    <div className="p-6 space-y-6 bg-[#FFFFFF]/70 dark:bg-[#0B1C2D]/70 border border-[#DCEEEE]/70 dark:border-[#1E3A4A]/70 rounded-lg">
      <Skeleton className="h-8 w-1/3" /> {/* title */}
      <Skeleton className="h-10 w-full" /> {/* email input */}
      <Skeleton className="h-10 w-full" /> {/* password input */}
      <Skeleton className="h-10 w-full" /> {/* button */}
    </div>
  );
}
