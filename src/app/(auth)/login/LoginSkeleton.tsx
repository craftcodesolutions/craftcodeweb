'use client';

import { Skeleton } from "@/components/ui/skeleton";

export function LoginSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-1/3" /> {/* title */}
      <Skeleton className="h-10 w-full" /> {/* email input */}
      <Skeleton className="h-10 w-full" /> {/* password input */}
      <Skeleton className="h-10 w-full" /> {/* button */}
    </div>
  );
}
