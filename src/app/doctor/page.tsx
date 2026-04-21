
"use client"

import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  Loader2, 
  AlertTriangle, 
  Activity, 
  Plus,
  Thermometer,
  Clock,
  MapPin,
  Stethoscope,
  Pill
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { aiPersonalDoctorConsultation, AIPersonalDoctorConsultationOutput } from "@/ai/flows/ai-personal-doctor-consultation";
import { cn } from "@/lib/utils";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

export default function DoctorChat() {
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc(user ? doc(db, "users", user.uid, "profile", "data") : null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await aiPersonalDoctorConsultation({
        symptomDescription: userMessage,
        patientProfile: {
          name: profile?.name || "User",
          age: profile?.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : 25,
          gender: profile?.gender || "Other",
          heightCm: profile?.height || 170,
          weightKg: profile?.weight || 70,
          bmi: profile?.bmi || 24,
          bloodGroup: profile?.bloodGroup || "Unknown",
          allergies: profile?.allergies || [],
          chronicConditions: profile?.chronicConditions || [],
          currentMedications: profile?.currentMedications ? [profile.currentMedications] : []
        }
      });

      setMessages(prev => [...prev, { role: 'model', response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: "I apologize, I'm having trouble processing that request. Please try again or seek medical attention if this is an emergency." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)]">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary relative">
            <Bot className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Dr. Vital</h1>
            <p className="text-xs text-white/40">Clinical Symptom Analyzer • Online</p>
          </div>
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar mb-6"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
            <div className="w-20 h-20 rounded-[2rem] glass flex items-center justify-center text-white/20 mb-2">
              <Stethoscope className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-white">How can I help you?</h2>
            <p className="text-white/40 text-sm">Describe your symptoms. I'll analyze them based on your clinical profile.</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={cn("flex w-full", m.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] rounded-[1.5rem]",
              m.role === 'user' 
                ? "bg-primary text-white p-4" 
                : "w-full"
            )}>
              {m.role === 'user' ? (
                <p className="text-sm font-medium">{m.content}</p>
              ) : m.response ? (
                <ConsultationResponse response={m.response} />
              ) : (
                <div className="glass p-4 rounded-[1.5rem]">
                  <p className="text-sm text-white/80">{m.content}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="glass p-4 rounded-[1.5rem] flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Running Clinical Analysis...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <Input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your symptoms here..."
          className="h-16 rounded-2xl glass border-white/10 pl-6 pr-16 text-white focus:border-primary/50 transition-all"
        />
        <Button 
          type="submit" 
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-2 h-12 w-12 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all"
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
}

function ConsultationResponse({ response }: { response: AIPersonalDoctorConsultationOutput }) {
  const riskColors = {
    LOW: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
    MODERATE: "border-amber-500/30 bg-amber-500/5 text-amber-400",
    HIGH: "border-red-500/30 bg-red-500/5 text-red-500",
    EMERGENCY: "border-red-600 bg-red-600/20 text-red-600 animate-pulse"
  };

  const riskLevel = response?.riskLevel || "LOW";

  return (
    <div className="space-y-4 w-full">
      <div className={cn("p-4 rounded-2xl border flex items-center justify-between", riskColors[riskLevel as keyof typeof riskColors])}>
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-bold tracking-widest uppercase text-xs">{riskLevel} RISK ASSESSMENT</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass p-5 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Potential Diagnosis
          </h4>
          {response?.diagnosis?.length > 0 ? response.diagnosis.map((d, i) => (
            <div key={i} className="space-y-1">
              <p className="font-bold text-white">{d.condition}</p>
              <p className="text-xs text-white/50 leading-relaxed">{d.explanation}</p>
            </div>
          )) : (
            <p className="text-xs text-white/40">No specific diagnosis determined.</p>
          )}
        </div>

        <div className="glass p-5 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Recommended Care
          </h4>
          <ul className="space-y-2">
            {response?.immediateActions?.length > 0 ? response.immediateActions.map((a, i) => (
              <li key={i} className="text-xs text-white/70 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                {a}
              </li>
            )) : (
              <li className="text-xs text-white/40">No immediate actions suggested.</li>
            )}
          </ul>
        </div>
      </div>

      {response?.medications && response.medications.length > 0 && (
        <div className="glass p-5 rounded-2xl space-y-4">
          <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <Pill className="w-4 h-4 text-secondary" /> Suggested OTC Support
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {response.medications.map((m, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="font-bold text-sm text-white">{m.name}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-[10px] text-white/40">
                    <Thermometer className="w-3 h-3" /> {m.dosage}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-white/40">
                    <Clock className="w-3 h-3" /> {m.frequency}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {riskLevel !== 'LOW' && (
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <p className="text-xs font-medium text-white/80">Nearest clinics found based on your location.</p>
          </div>
          <Button size="sm" className="bg-primary text-white h-8 text-[10px] font-bold uppercase px-4">Find Clinics</Button>
        </div>
      )}

      <p className="text-[10px] text-white/30 italic text-center px-6">
        {response?.disclaimer || "Consult a healthcare professional for medical advice."}
      </p>
    </div>
  );
}
