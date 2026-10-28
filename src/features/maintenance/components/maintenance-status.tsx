'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, CheckCircle2 } from 'lucide-react';

export function MaintenanceStatus() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('Just now');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastChecked(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');
      window.location.reload();
    }, 600);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* System Status Details Box */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 text-left shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            Estimated Duration
          </span>
          <span className="font-semibold text-slate-800">~15–30 minutes</span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Invoice Database & Assets
          </span>
          <span className="font-semibold text-emerald-600">Secure & Intact</span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
          <span className="text-slate-500 font-medium">Last Checked</span>
          <span className="font-mono text-slate-700">{lastChecked}</span>
        </div>
      </div>

      {/* Refresh Button */}
      <Button
        type="button"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium h-11 px-8 rounded-lg shadow-sm inline-flex items-center justify-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span>{isRefreshing ? 'Checking Status...' : 'Check Status Again'}</span>
      </Button>
    </div>
  );
}
