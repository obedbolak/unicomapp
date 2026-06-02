"use client";

export default function HeavyChart() {
  return (
    <div className="w-full h-full min-h-[300px] bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400">
      <div className="text-lg font-semibold text-white mb-2">
        📊 Heavy Chart Component Loaded!
      </div>
      <p className="text-sm text-center max-w-xs">
        This component was completely deferred and only downloaded by the
        browser when it scrolled into view.
      </p>
    </div>
  );
}
