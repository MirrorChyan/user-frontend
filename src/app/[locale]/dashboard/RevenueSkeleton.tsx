import { Skeleton } from "@heroui/react";

/** 收益看板按需加载期间的占位骨架 */
export default function RevenueSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <Skeleton className="h-20 w-1/2 rounded-lg" />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-2">
          {[1, 2, 3, 4].map((_, i) => (
            <Skeleton key={i} className="h-60 rounded-lg" />
          ))}
        </div>
        <Skeleton className="min-h-96 rounded-lg lg:col-span-1" />
      </div>
      <Skeleton className="h-96 rounded-lg" />
    </div>
  );
}
