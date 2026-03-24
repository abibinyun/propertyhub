import { Skeleton } from '@/components/ui/skeleton';

function CardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-border/60">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-4 pt-3 border-t border-border/50">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <>
      {/* Header skeleton */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-5">
          <Skeleton className="h-3 w-48 mb-4" />
          <Skeleton className="h-8 w-72 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      <div className="bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Sidebar skeleton */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-border/60 p-5 space-y-4">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2 flex-wrap">
                  {[40, 32, 32, 32, 40].map((w, i) => (
                    <Skeleton key={i} className={`h-7 w-${w} rounded-lg`} />
                  ))}
                </div>
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-4 w-28" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-9 rounded-lg" />
                  <Skeleton className="h-9 rounded-lg" />
                </div>
                <Skeleton className="h-10 rounded-lg" />
              </div>
            </div>

            {/* Grid skeleton */}
            <div className="flex-1">
              <Skeleton className="h-12 w-full rounded-xl mb-5" />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
