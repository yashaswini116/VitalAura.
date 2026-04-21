"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Target, 
  ArrowRight, 
  Check, 
  ChevronLeft,
  Camera,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useFirestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";

const GOALS = [
  "Lose Weight", "Build Muscle", "Better Sleep", "Manage Stress", 
  "Improve Stamina", "Healthy Skin", "Hormonal Balance", "Quit Smoking", 
  "Manage Diabetes", "General Fitness"
];

const CONDITIONS = [
  "Diabetes", "Hypertension", "Asthma", "Thyroid", "PCOD", "None"
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    height: 170,
    weight: 70,
    bloodGroup: "",
    allergies: [] as string[],
    chronicConditions: [] as string[],
    currentMedications: "",
    goals: [] as string[],
    activityLevel: "Moderately Active",
    stepGoal: 10000,
    waterGoal: 8
  });

  const bmi = (formData.weight / ((formData.height / 100) ** 2)).toFixed(1);
  const bmiCategory = parseFloat(bmi) < 18.5 ? "Underweight" : parseFloat(bmi) < 25 ? "Normal" : "Overweight";

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!user || !db) return;
    try {
      await setDoc(doc(db, "users", user.uid, "profile", "data"), {
        ...formData,
        bmi: parseFloat(bmi),
        createdAt: new Date().toISOString()
      });
      router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) 
        ? prev.goals.filter(g => g !== goal) 
        : [...prev.goals, goal]
    }));
  };

  const toggleCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(condition) 
        ? prev.chronicConditions.filter(c => c !== condition) 
        : [...prev.chronicConditions, condition]
    }));
  };

  return (
    <div className="max-w-2xl mx-auto min-h-[80vh] flex flex-col justify-center py-12 px-4 animate-in fade-in duration-700">
      
      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mb-12">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={cn(
            "h-1.5 rounded-full transition-all duration-500",
            step === i ? "w-8 bg-primary" : "w-2 bg-white/10"
          )} />
        ))}
      </div>

      <div className="glass-morphism rounded-[2.5rem] p-8 md:p-12 space-y-8 relative overflow-hidden">
        
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
            <header className="space-y-2">
              <h1 className="text-3xl font-extrabold text-white">Welcome to VitalAura ✨</h1>
              <p className="text-white/50">Let's start with the basics to personalize your journey.</p>
            </header>
            
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className="w-24 h-24 rounded-3xl glass flex items-center justify-center text-white/20 relative group cursor-pointer hover:border-primary/50 transition-all">
                  <Camera className="w-8 h-8" />
                  <div className="absolute inset-0 bg-primary/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Upload Profile Photo</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="John Doe" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="glass h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input 
                    type="date" 
                    value={formData.dob}
                    onChange={e => setFormData({...formData, dob: e.target.value})}
                    className="glass h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select onValueChange={v => setFormData({...formData, gender: v})}>
                    <SelectTrigger className="glass h-12 rounded-xl">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
            <header className="space-y-2">
              <h1 className="text-3xl font-extrabold text-white">Body & Medical Details</h1>
              <p className="text-white/50">Your vitals help us calculate accurate health scores.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Height (cm)</Label>
                    <span className="text-primary font-bold">{formData.height} cm</span>
                  </div>
                  <Input 
                    type="range" min="100" max="250" 
                    value={formData.height}
                    onChange={e => setFormData({...formData, height: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Weight (kg)</Label>
                    <span className="text-primary font-bold">{formData.weight} kg</span>
                  </div>
                  <Input 
                    type="range" min="30" max="200" 
                    value={formData.weight}
                    onChange={e => setFormData({...formData, weight: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="glass p-6 rounded-3xl flex flex-col items-center justify-center text-center space-y-2 border-primary/20 bg-primary/5">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Calculated BMI</span>
                <span className="text-4xl font-black text-white">{bmi}</span>
                <Badge className={cn(
                  "uppercase text-[10px] font-bold tracking-widest",
                  bmiCategory === "Normal" ? "bg-emerald-500" : "bg-amber-500"
                )}>{bmiCategory}</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Chronic Conditions</Label>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map(c => (
                  <Badge 
                    key={c}
                    onClick={() => toggleCondition(c)}
                    className={cn(
                      "h-10 px-4 rounded-xl cursor-pointer transition-all",
                      formData.chronicConditions.includes(c) ? "bg-primary text-white" : "bg-white/5 text-white/40 border-white/10"
                    )}
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
            <header className="space-y-2">
              <h1 className="text-3xl font-extrabold text-white">Your Health Goals</h1>
              <p className="text-white/50">Select what matters most to you right now.</p>
            </header>

            <div className="grid grid-cols-2 gap-3">
              {GOALS.map(goal => (
                <div 
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group",
                    formData.goals.includes(goal) ? "bg-primary/20 border-primary text-white" : "bg-white/5 border-white/5 text-white/40 hover:border-white/20"
                  )}
                >
                  <span className="text-sm font-bold">{goal}</span>
                  {formData.goals.includes(goal) && <Check className="w-4 h-4 text-primary" />}
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4">
              <Label>Activity Level</Label>
              <Select onValueChange={v => setFormData({...formData, activityLevel: v})}>
                <SelectTrigger className="glass h-12 rounded-xl">
                  <SelectValue placeholder="Moderately Active" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sedentary">Sedentary</SelectItem>
                  <SelectItem value="Lightly Active">Lightly Active</SelectItem>
                  <SelectItem value="Moderately Active">Moderately Active</SelectItem>
                  <SelectItem value="Very Active">Very Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
            <header className="space-y-2">
              <h1 className="text-3xl font-extrabold text-white">Daily Targets</h1>
              <p className="text-white/50">Set your baseline habits to track success.</p>
            </header>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label className="flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Daily Step Goal</Label>
                  <span className="text-primary font-bold">{formData.stepGoal.toLocaleString()} steps</span>
                </div>
                <Input 
                  type="range" min="2000" max="20000" step="500"
                  value={formData.stepGoal}
                  onChange={e => setFormData({...formData, stepGoal: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-400" /> Daily Water Goal</Label>
                  <span className="text-sky-400 font-bold">{formData.waterGoal} cups</span>
                </div>
                <Input 
                  type="range" min="4" max="20" 
                  value={formData.waterGoal}
                  onChange={e => setFormData({...formData, waterGoal: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">You're All Set!</p>
                <p className="text-[10px] text-white/40">Your personalized plan is ready to be generated.</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-8 border-t border-white/10">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            disabled={step === 1}
            className="text-white/40 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            BACK
          </Button>
          
          {step < 4 ? (
            <Button 
              onClick={handleNext}
              className="h-14 px-8 rounded-2xl bg-primary text-white font-bold gap-3 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              CONTINUE
              <ArrowRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              className="h-14 px-8 rounded-2xl bg-emerald-500 text-white font-bold gap-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              FINISH SETUP
              <Check className="w-5 h-5" />
            </Button>
          )}
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[120px] -z-10 rounded-full" />
      </div>
    </div>
  );
}
