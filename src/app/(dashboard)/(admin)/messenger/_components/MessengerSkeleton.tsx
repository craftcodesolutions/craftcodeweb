'use client';

export default function MessengerSkeleton() {
  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* DECORATORS - GRID BG & GLOW SHAPES */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />

      <main className="flex flex-col w-full h-screen p-4 space-y-4 overflow-hidden">
        {/* Header skeleton */}
        <div className="h-12 bg-slate-800 rounded-lg animate-pulse" />

        {/* Messages area skeleton */}
        <div className="flex-1 space-y-4 overflow-y-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex space-x-4">
              <div className="w-10 h-10 bg-slate-800 rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-slate-800 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>

        {/* Input bar skeleton */}
        <div className="h-12 bg-slate-800 rounded-lg animate-pulse" />
      </main>
    </div>
  );
}