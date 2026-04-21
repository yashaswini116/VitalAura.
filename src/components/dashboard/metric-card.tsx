"use client"

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  color?: string;
  children?: ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  icon,
  trend,
  trendDirection,
  color = "primary",
  children,
  className
}: MetricCardProps) {
  return (
    <Card className={cn("glass-morphism border-white/10 overflow-hidden group hover:scale-[1.02] transition-transform duration-300", className)}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
            `bg-${color}/20 text-${color}`
          )}>
            {icon}
          </div>
          {trend && (
            <div className={cn(
              "text-[10px] font-bold px-2 py-1 rounded-full",
              trendDirection === 'up' ? "bg-emerald-500/20 text-emerald-400" : 
              trendDirection === 'down' ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/60"
            )}>
              {trend}
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
            {unit && <span className="text-white/40 text-sm">{unit}</span>}
          </div>
        </div>

        {children && <div className="mt-4">{children}</div>}
      </div>
      
      {/* Decorative inner glow */}
      <div className={cn(
        "absolute -bottom-10 -right-10 w-24 h-24 blur-3xl opacity-20 pointer-events-none",
        `bg-${color}`
      )} />
    </Card>
  );
}