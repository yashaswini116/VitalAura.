
"use client"

import { useState, useMemo, useEffect } from "react";
import { Droplets, Sparkles, Plus, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const SAMPLE_STATS = {
  lastPeriod: "2026-04-01",
  cycleLength: 28
};

export default function CycleTrackerPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [displayStats, setDisplayStats] = useState<any>(SAMPLE_STATS);
  const [isLogging, setIsLogging] = useState(false);

  const statsRef = useMemo(() => 
    (db && user?.uid) ? doc(db, "users", user.uid, "periodTracker", "stats") : null
  , [db, user?.uid]);
  
  const { data: stats, loading } = useDoc(statsRef);

  useEffect(() => {
    if (!loading) {
      const dataToUse = stats || SAMPLE_STATS;
      setDisplayStats(dataToUse);
      console.log("Using Data (Cycle):", dataToUse);
    }
  }, [stats, loading]);

  const analysis = useMemo(() => {
    try {
      const lastStart = new Date(displayStats.lastPeriod);
      const nextStart = new Date(lastStart);
      nextStart.setDate(lastStart.getDate() + (displayStats.cycleLength || 28));
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = nextStart.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        daysLeft: diffDays > 0 ? diffDays : 0,
        status: diffDays <= 0 ? "Due Now" : "Tracking",
        lastDate: lastStart.toLocaleDateString()
      };
    } catch (e) {
      return { daysLeft: 0, status: "Tracking", lastDate: "N/A" };
    }
  }, [displayStats]);

  const handleLogPeriod = () => {
    if (!user?.uid || !date || !statsRef) return;
    setIsLogging(true);
    
    const updateData = {
      lastPeriod: date.toISOString().split('T')[0],
      cycleLength: 28,
      updatedAt: serverTimestamp()
    };
    
    setDoc(statsRef, updateData, { merge: true })
      .then(() => toast({ title: "Logged", description: "Your cycle has been updated." }))
      .finally(() => setIsLogging(true));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-white">Cycle Tracker</h1>
        <p className="text-white/50">Smart predictive health monitoring.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-morphism p-8 rounded-[2.5rem] border-rose-500/20 text-center relative overflow-hidden group">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Next Period In</p>
            <h2 className="text-6xl font-black text-white">{analysis.daysLeft}</h2>
            <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">{analysis.status}</p>
            <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-white/30">
              Last Start: {analysis.lastDate}
            </div>
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-rose-500/20 blur-3xl rounded-full" />
          </div>

          <Button onClick={handleLogPeriod} disabled={isLogging} className="w-full h-16 rounded-2xl bg-rose-500 font-bold gap-3 shadow-lg">
            {isLogging ? <Loader2 className="animate-spin" /> : <Droplets className="w-5 h-5" />}
            MARK PERIOD START
          </Button>
        </div>

        <div className="lg:col-span-2 glass-morphism p-6 rounded-[2.5rem] flex flex-col items-center">
          <Calendar mode="single" selected={date} onSelect={setDate} className="w-full text-white" />
        </div>
      </div>
    </div>
  );
}
