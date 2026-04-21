"use client"

import { useEffect, useState, useMemo } from "react";
import { 
  Footprints, 
  Heart, 
  Droplets, 
  Moon, 
  Flame, 
  Wind, 
  Zap, 
  Activity,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { generateHealthInsight } from "@/ai/flows/ai-health-insight-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

export default function Dashboard() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  
  const profileRef = useMemo(() => 
    (db && user?.uid) ? doc(db, "users", user.uid, "profile", "data") : null
  , [db, user?.uid]);
  
  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  const todayDate = useMemo(() => new Date().toISOString().split('T')[0], []);
  const healthRef = useMemo(() => 
    (db && user?.uid) ? doc(db, "users", user.uid, "healthData", todayDate) : null
  , [db, user?.uid, todayDate]);

  const { data: dailyLog } = useDoc(healthRef);
  
  const [insight, setInsight] = useState<string>("Analyzing your vitals for today...");
  const [vitalScore, setVitalScore] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Defer dynamic value updates to client-side only
    const scoreTimer = setTimeout(() => setVitalScore(84), 500);
    
    const loadInsight = async () => {
      try {
        const res = await generateHealthInsight({ 
          healthDataSummary: `User has walked 8k steps, heart rate avg 72, hydration ${dailyLog?.hydration || 0} cups.` 
        });
        setInsight(res.insight);
      } catch (e) {
        setInsight("Your hydration is looking good today! Keep hitting your daily goal of 8 cups.");
      }
    };
    
    if (isMounted) loadInsight();

    return () => clearTimeout(scoreTimer);
  }, [isMounted, dailyLog?.hydration]);

  if (!isMounted || authLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-white/20 animate-pulse font-bold tracking-widest uppercase text-xs">Vitalizing Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Good Morning, {profile?.name || "Vitalist"} 🌟</h1>
          <p className="text-white/50 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3 glass px-4 py-2 rounded-2xl">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-white/70">Synced Live</span>
          <Button variant="ghost" size="sm" className="h-8 text-[10px] text-primary hover:text-primary hover:bg-primary/10 font-bold uppercase tracking-wider">
            Sync Now
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden p-8 rounded-[2rem] glass-morphism border-white/10 flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="80" cy="80" r="70" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
            <circle
              cx="80" cy="80" r="70"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * vitalScore) / 100}
              className="text-primary transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-extrabold text-white">{vitalScore}</span>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">VitalScore</span>
          </div>
        </div>
        
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Your health is thriving!</h2>
            <p className="text-white/60 max-w-md">You've hit {vitalScore}% of your daily wellness goals. Complete more goals to hit today's targets.</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 hover:bg-primary/30 py-1 px-3">🔥 12 Day Streak</Badge>
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20 py-1 px-3">🏆 Heart Hero</Badge>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Steps Today" value="8,432" unit={`/ ${profile?.stepGoal || "10k"}`} icon={<Footprints />} 
          trend="+12%" trendDirection="up" color="primary"
        >
          <Progress value={84} className="h-1.5 bg-white/5" />
        </MetricCard>

        <MetricCard 
          title="Heart Rate" value="72" unit="BPM" icon={<Heart />} 
          trend="Stable" trendDirection="neutral" color="rose-500"
        >
          <div className="h-10 flex items-end gap-1">
            {[40, 60, 45, 80, 55, 70, 65, 75, 50, 60].map((h, i) => (
              <div key={i} className="flex-1 bg-rose-500/30 rounded-t-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
        </MetricCard>

        <MetricCard title="Sleep" value="7.5" unit="Hrs" icon={<Moon />} trend="Optimal" color="indigo-400" />
        
        <MetricCard title="Hydration" value={dailyLog?.hydration || 0} unit={`/ ${profile?.waterGoal || 8} cups`} icon={<Droplets />} color="sky-400">
          <div className="flex gap-1">
            {[...Array(profile?.waterGoal || 8)].map((_, i) => (
              <div key={i} className={cn("w-2 h-4 rounded-sm", i < (dailyLog?.hydration || 0) ? "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]" : "bg-white/10")} />
            ))}
          </div>
        </MetricCard>
      </section>

      <section className="glass-morphism border-primary/20 p-6 rounded-[2rem] relative overflow-hidden group">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary animate-pulse">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">AI Health Insight</h3>
            <p className="text-white/70 leading-relaxed italic">"{insight}"</p>
          </div>
        </div>
      </section>
    </div>
  );
}
