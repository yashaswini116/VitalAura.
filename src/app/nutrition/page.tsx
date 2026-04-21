
"use client"

import { useState, useMemo, useEffect } from "react";
import { Utensils, Droplets, Loader2, PlusCircle, MinusCircle, Apple, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analyzeNutrition } from "@/ai/flows/ai-nutrition-analyzer";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, setDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const SAMPLE_MEALS = [
  { id: "m1", food: "Rice", calories: 200, protein: 4, carbs: 45, fat: 1, time: "Lunch" },
  { id: "m2", food: "Eggs", calories: 150, protein: 12, carbs: 1, fat: 10, time: "Breakfast" }
];

export default function NutritionPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [displayMeals, setDisplayMeals] = useState<any[]>(SAMPLE_MEALS);
  const [mealInput, setMealInput] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const logRef = useMemo(() => 
    (db && user?.uid) ? doc(db, "users", user.uid, "healthData", todayStr) : null
  , [db, user?.uid, todayStr]);

  const { data: log, loading } = useDoc(logRef);

  useEffect(() => {
    if (!loading) {
      const dataToUse = (log?.meals && log.meals.length > 0) ? log.meals : SAMPLE_MEALS;
      setDisplayMeals(dataToUse);
      console.log("Using Data (Nutrition):", dataToUse);
    }
  }, [log, loading]);

  const totals = useMemo(() => {
    return displayMeals.reduce((acc, m) => ({
      cal: acc.cal + (m.calories || 0),
      p: acc.p + (m.protein || 0),
      c: acc.c + (m.carbs || 0),
      f: acc.f + (m.fat || 0)
    }), { cal: 0, p: 0, c: 0, f: 0 });
  }, [displayMeals]);

  const handleLogMeal = async () => {
    if (!mealInput.trim() || !user?.uid || !logRef) return;
    setIsLogging(true);
    try {
      const result = await analyzeNutrition({ mealDescription: mealInput });
      const newMeal = {
        id: crypto.randomUUID(),
        food: mealInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...result
      };

      setDoc(logRef, {
        meals: arrayUnion(newMeal),
        updatedAt: serverTimestamp(),
        userId: user.uid
      }, { merge: true }).then(() => {
        setMealInput("");
        toast({ title: "Logged", description: `Added ${result.calories} calories.` });
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Could not analyze meal." });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-1">
        <h1 className="text-4xl font-extrabold text-white">Nutrition</h1>
        <p className="text-white/50">Real-time macro and calorie tracking.</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-morphism p-8 rounded-[3rem] border-white/5 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Calories Today</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-white">{Math.round(totals.cal)}</span>
                <span className="text-xl font-bold text-primary">kcal</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-4 w-full">
              {[{ l: "Protein", v: totals.p, c: "text-emerald-400" }, { l: "Carbs", v: totals.c, c: "text-sky-400" }, { l: "Fat", v: totals.f, c: "text-rose-400" }].map(m => (
                <div key={m.l} className="text-center">
                  <p className={cn("text-[10px] font-bold uppercase", m.c)}>{m.l}</p>
                  <p className="text-lg font-bold text-white">{Math.round(m.v)}g</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <Input value={mealInput} onChange={e => setMealInput(e.target.value)} placeholder="What did you eat?" className="h-16 rounded-2xl glass pr-32" />
            <Button onClick={handleLogMeal} disabled={isLogging} className="absolute right-2 top-2 h-12 bg-primary px-8 rounded-xl">
              {isLogging ? <Loader2 className="animate-spin" /> : "LOG MEAL"}
            </Button>
          </div>
        </div>

        <div className="glass-morphism p-8 rounded-[3rem] border-white/5 text-center flex flex-col justify-center bg-sky-500/5">
          <Droplets className="w-12 h-12 text-sky-400 mx-auto mb-4" />
          <h3 className="text-4xl font-black text-white">{log?.hydration || 0}</h3>
          <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-6">Cups of Water</p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="h-12 w-12 rounded-xl border-white/10" onClick={() => setDoc(logRef!, { hydration: (log?.hydration || 0) + 1 }, { merge: true })}><PlusCircle className="w-6 h-6" /></Button>
          </div>
        </div>
      </section>
      
      <div className="glass-morphism p-8 rounded-[2.5rem] border-white/5">
        <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-6"><Utensils className="w-6 h-6 text-orange-500" /> Today's Meals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayMeals.map((m: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500"><Apple className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm font-bold text-white">{m.food}</p>
                  <p className="text-[10px] text-white/40">{m.time} • {Math.round(m.calories)} kcal</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
