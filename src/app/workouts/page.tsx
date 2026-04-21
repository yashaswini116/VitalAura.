
"use client"

import { useState } from "react";
import { Dumbbell, Youtube, Play, Clock, Flame, Zap, Trophy, Calendar, CheckCircle2, Search, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateWorkoutPlan, AiWorkoutPlannerOutput } from "@/ai/flows/ai-workout-planner";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, setDoc, collection, serverTimestamp, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const categories = [
  { id: "strength", name: "Strength Training", icon: Dumbbell, color: "bg-orange-500", count: 12 },
  { id: "yoga", name: "Yoga & Flexibility", icon: Zap, color: "bg-emerald-500", count: 8 },
  { id: "dance", name: "Dance Fitness", icon: Trophy, color: "bg-pink-500", count: 6 },
  { id: "hula", name: "Hula Hoop", icon: Flame, color: "bg-amber-500", count: 4 },
];

const staticWorkouts = [
  {
    id: "hula-1",
    title: "Hula Hoop for Beginners",
    duration: "15 min",
    difficulty: "Easy",
    calories: 120,
    category: "Hula Hoop",
    image: "https://picsum.photos/seed/hula1/400/225"
  },
  {
    id: "strength-1",
    title: "Upper Body Strength",
    duration: "45 min",
    difficulty: "Medium",
    calories: 350,
    category: "Strength Training",
    image: "https://picsum.photos/seed/str1/400/225"
  }
];

export default function Workouts() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("all");
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoggingWorkout, setIsLoggingWorkout] = useState<string | null>(null);

  const { data: profile } = useDoc(user ? doc(db, "users", user.uid, "profile", "data") : null);
  const { data: currentPlan } = useDoc(user ? doc(db, "users", user.uid, "plans", "current") : null);

  const handleGeneratePlan = async () => {
    if (!user) return;
    setIsGenerating(true);
    try {
      const plan = await generateWorkoutPlan({
        primaryGoal: (profile?.goals?.[0] as any) || "General Fitness",
        daysAvailablePerWeek: profile?.daysAvailable || 4,
        sessionDurationMinutes: profile?.sessionDuration || 45,
        equipmentAvailable: (profile?.equipment as any) || "None",
        fitnessLevel: (profile?.fitnessLevel as any) || "Beginner",
        preferredWorkoutTypes: profile?.goals?.slice(0, 3) || ["STRENGTH TRAINING"]
      });
      
      await setDoc(doc(db, "users", user.uid, "plans", "current"), {
        ...plan,
        createdAt: serverTimestamp()
      });

      setIsPlannerOpen(false);
      toast({ title: "Plan Generated", description: "Your 4-week personalized journey is ready." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to generate plan." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogWorkout = async (workout: any) => {
    if (!user) return;
    setIsLoggingWorkout(workout.id);
    try {
      await setDoc(doc(db, "users", user.uid, "workouts", new Date().toISOString()), {
        workoutId: workout.id,
        title: workout.title,
        calories: workout.calories,
        duration: workout.duration,
        timestamp: serverTimestamp()
      });
      toast({ title: "Workout Logged", description: `Way to go! Logged ${workout.title}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to log workout." });
    } finally {
      setIsLoggingWorkout(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Workout Hub</h1>
          <p className="text-white/50 font-medium">Smash your goals with professional guided sessions.</p>
        </div>
        <Button 
          onClick={() => setIsPlannerOpen(true)}
          className="h-14 px-8 rounded-2xl bg-primary text-white font-bold gap-3 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:scale-105 transition-transform"
        >
          <Sparkles className="w-5 h-5" />
          AI PLANNER
        </Button>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div 
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "glass-morphism p-4 rounded-2xl cursor-pointer hover:border-primary/50 transition-all group border",
              activeCategory === cat.id ? "border-primary bg-primary/10" : "border-white/5"
            )}
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white", cat.color)}>
              <cat.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-white">{cat.name}</h3>
            <p className="text-[10px] text-white/40 uppercase font-bold mt-1">{cat.count} Sessions</p>
          </div>
        ))}
      </section>

      {currentPlan && (
        <section className="glass-morphism p-8 rounded-[3rem] border-primary/20 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white">Your 4-Week Journey</h2>
            <Badge className="bg-emerald-500/20 text-emerald-400">Active Plan</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {currentPlan.plan?.map((week: any, idx: number) => (
              <div key={idx} className="glass p-4 rounded-2xl border-white/5 space-y-2">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Week {week.week}</p>
                <p className="text-xs text-white/60 line-clamp-2">{week.description || "Focus on building endurance."}</p>
                <Button variant="ghost" className="w-full text-[10px] font-bold h-8 hover:bg-white/5">VIEW WEEK</Button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 px-2">
            Recommended for You
            <Badge className="bg-primary/20 text-primary border-primary/20">AI Tailored</Badge>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staticWorkouts.map((w) => (
            <div key={w.id} className="glass-morphism rounded-3xl overflow-hidden group">
              <div className="relative aspect-video">
                <img src={w.image} alt={w.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-12 h-12 text-white fill-current" />
                </div>
                <Badge className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border-white/10">{w.category}</Badge>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{w.title}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-white/40 uppercase">
                      <Clock className="w-3 h-3" /> {w.duration}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-white/40 uppercase">
                      <Flame className="w-3 h-3" /> {w.calories} Kcal
                    </span>
                  </div>
                </div>
                <Button 
                  disabled={isLoggingWorkout === w.id}
                  onClick={() => handleLogWorkout(w)}
                  className="w-full rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold gap-2"
                >
                  {isLoggingWorkout === w.id ? <Loader2 className="animate-spin" /> : "LOG WORKOUT"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isPlannerOpen} onOpenChange={setIsPlannerOpen}>
        <DialogContent className="glass border-white/10 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white">AI Workout Planner</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6 text-center">
            <p className="text-sm text-white/60 leading-relaxed">
              Based on your profile, we'll generate a personalized 4-week progressive plan targeting 
              <span className="text-primary font-bold"> {profile?.goals?.[0] || "General Fitness"}</span>.
            </p>
            <Button 
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="w-full h-16 rounded-2xl bg-primary text-white font-bold text-lg gap-3"
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : <><Sparkles className="w-6 h-6" /> GENERATE JOURNEY</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
