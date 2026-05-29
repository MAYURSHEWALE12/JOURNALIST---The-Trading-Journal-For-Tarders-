import { useApp } from '../context/AppContext';

export function DashboardSkeleton() {
  const { themeClasses } = useApp();

  return (
    <div className="space-y-6 animate-pulse">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`border rounded p-5 space-y-3 ${themeClasses.bgPanel} ${themeClasses.border}`}>
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-white/10 rounded font-mono"></div>
              <div className="h-4 w-4 bg-white/10 rounded-full"></div>
            </div>
            <div className="h-8 w-28 bg-white/15 rounded mt-1"></div>
            <div className="h-2 w-32 bg-white/5 rounded"></div>
          </div>
        ))}
      </div>

      {/* Main Charts & Sidebars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Big Chart Skeleton */}
        <div className={`border rounded p-5 lg:col-span-2 space-y-4 ${themeClasses.bgPanel} ${themeClasses.border}`}>
          <div className="flex justify-between items-center">
            <div className="h-4 w-48 bg-white/10 rounded"></div>
            <div className="h-6 w-20 bg-white/5 rounded"></div>
          </div>
          <div className="h-72 w-full bg-white/5 rounded flex items-end justify-between p-4">
            {[...Array(12)].map((_, idx) => (
              <div
                key={idx}
                className="w-[6%] bg-white/10 rounded-t"
                style={{ height: `${20 + ((idx * 7) % 6) * 12}%` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Side Performance Widget */}
        <div className={`border rounded p-5 space-y-4 ${themeClasses.bgPanel} ${themeClasses.border}`}>
          <div className="h-4 w-32 bg-white/10 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                <div className="h-3 w-16 bg-white/10 rounded"></div>
                <div className="h-3 w-8 bg-white/15 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trades Table Skeleton */}
      <div className={`border rounded p-5 space-y-4 ${themeClasses.bgPanel} ${themeClasses.border}`}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="h-4 w-36 bg-white/10 rounded"></div>
          <div className="h-8 w-48 bg-white/5 rounded"></div>
        </div>
        <div className="space-y-3 mt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-white/[0.04] last:border-0">
              <div className="flex items-center space-x-3 w-1/3">
                <div className="h-8 w-8 bg-white/10 rounded-full"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-20 bg-white/15 rounded"></div>
                  <div className="h-2 w-12 bg-white/5 rounded"></div>
                </div>
              </div>
              <div className="h-3 w-16 bg-white/10 rounded"></div>
              <div className="h-3 w-12 bg-white/15 rounded"></div>
              <div className="h-3 w-16 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  const { themeClasses } = useApp();

  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className={`border rounded p-5 space-y-4 ${themeClasses.bgPanel} ${themeClasses.border}`}>
            <div className="h-4 w-40 bg-white/10 rounded"></div>
            <div className="h-64 w-full bg-white/5 rounded flex items-end justify-center space-x-6 p-4">
              {[...Array(6)].map((_, idx) => (
                <div
                  key={idx}
                  className="w-12 bg-white/10 rounded-t"
                  style={{ height: `${30 + ((idx * 11) % 5) * 12}%` }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={`border rounded p-5 space-y-4 ${themeClasses.bgPanel} ${themeClasses.border}`}>
        <div className="h-4 w-36 bg-white/10 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`p-4 rounded border ${themeClasses.border} ${themeClasses.bgCard} space-y-3`}>
              <div className="h-3 w-20 bg-white/10 rounded"></div>
              <div className="h-6 w-16 bg-white/15 rounded"></div>
              <div className="h-2 w-28 bg-white/5 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TimelineSkeleton() {
  const { themeClasses } = useApp();

  return (
    <div className="space-y-6 animate-pulse">
      {/* Calendar Month Selector Placeholder */}
      <div className={`border rounded p-5 flex justify-between items-center ${themeClasses.bgPanel} ${themeClasses.border}`}>
        <div className="h-4 w-32 bg-white/10 rounded"></div>
        <div className="flex space-x-2">
          <div className="h-8 w-20 bg-white/5 rounded"></div>
          <div className="h-8 w-20 bg-white/5 rounded"></div>
        </div>
      </div>

      {/* Calendar Grid Placeholder */}
      <div className={`border rounded p-5 ${themeClasses.bgPanel} ${themeClasses.border} space-y-4`}>
        <div className="grid grid-cols-7 gap-2 text-center">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-3 w-10 bg-white/10 rounded mx-auto"></div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded border ${themeClasses.border} ${themeClasses.bgCard} flex items-center justify-center`}
            >
              <div className="h-3 w-3 bg-white/5 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TradeDetailSkeleton() {
  const { themeClasses } = useApp();

  return (
    <div className="space-y-6 animate-pulse">
      {/* Back button */}
      <div className="h-8 w-24 bg-white/5 rounded"></div>

      {/* Main card */}
      <div className={`border rounded p-6 space-y-6 ${themeClasses.bgPanel} ${themeClasses.border}`}>
        {/* Header row */}
        <div className="flex justify-between items-start flex-wrap gap-4 pb-6 border-b border-white/[0.04]">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-white/15 rounded"></div>
            <div className="h-4 w-48 bg-white/10 rounded"></div>
          </div>
          <div className="h-8 w-24 bg-white/10 rounded"></div>
        </div>

        {/* Dynamic details grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Screenshot Box */}
            <div className="aspect-video w-full bg-white/5 rounded border border-white/[0.04] flex items-center justify-center">
              <div className="h-8 w-8 bg-white/10 rounded"></div>
            </div>
            
            {/* Carousel strip */}
            <div className="flex space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 w-24 bg-white/5 rounded border border-white/[0.04]"></div>
              ))}
            </div>

            {/* Notes Section */}
            <div className="space-y-3 pt-4">
              <div className="h-4 w-28 bg-white/10 rounded"></div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-white/5 rounded"></div>
                <div className="h-3 w-full bg-white/5 rounded"></div>
                <div className="h-3 w-[80%] bg-white/5 rounded"></div>
              </div>
            </div>
          </div>

          {/* Right sidebar details */}
          <div className={`border rounded p-5 space-y-4 ${themeClasses.bgCard} ${themeClasses.border}`}>
            <div className="h-4 w-24 bg-white/10 rounded"></div>
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                  <div className="h-3 w-16 bg-white/10 rounded"></div>
                  <div className="h-3 w-12 bg-white/15 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
