"use client"

import { useState } from "react";
import { 
  Search, 
  Mic, 
  Leaf, 
  Activity, 
  Sparkles, 
  Droplets, 
  Moon, 
  Brain,
  Stethoscope,
  Wind,
  Flower2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { aiWellnessAdvisor, AiWellnessAdvisorOutput } from "@/ai/flows/ai-wellness-advisor-flow";
import { cn } from "@/lib/utils";

const quickTopics = [
  { name: "Skin Glow", icon: Sparkles },
  { name: "Hair Care", icon: Wind },
  { name: "Better Sleep", icon: Moon },
  { name: "Gut Health", icon: Droplets },
  { name: "Stress", icon: Brain },
  { name: "Immunity", icon: Activity },
];

export default function WellnessAdvisor() {
  const [mode, setMode] = useState<"Ayurveda" | "Modern">("Modern");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AiWellnessAdvisorOutput | null>(null);

  const handleAsk = async (text?: string) => {
    const question = text || query;
    if (!question.trim()) return;

    setIsLoading(true);
    setResult(null); // Clear previous
    try {
      const res = await aiWellnessAdvisor({
        question,
        mode,
        doshaType: "Vata-Pitta"
      });
      console.log("AI Result Received:", res);
      setResult(res);
    } catch (e) {
      console.error("Wellness Page Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-white">Wellness Advisor</h1>
        <p className="text-white/50">Your guide to holistic and modern healthy living.</p>
        
        <div className="flex justify-center pt-4">
          <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-auto p-1 glass rounded-2xl">
            <TabsList className="bg-transparent border-0 gap-1 h-12">
              <TabsTrigger 
                value="Ayurveda" 
                className="rounded-xl px-8 h-10 data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all gap-2"
              >
                <Leaf className="w-4 h-4" /> Ayurveda
              </TabsTrigger>
              <TabsTrigger 
                value="Modern" 
                className="rounded-xl px-8 h-10 data-[state=active]:bg-sky-500 data-[state=active]:text-white transition-all gap-2"
              >
                <Stethoscope className="w-4 h-4" /> Modern
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <section className="relative group">
        <div className="relative">
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder={`Ask about ${mode === 'Ayurveda' ? 'herbs, yoga, or routine...' : 'clinical advice, supplements, or diet...'}`}
            className="h-16 pl-14 pr-32 rounded-[2rem] glass border-white/10 text-white text-lg focus:border-primary/50 transition-all"
          />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-primary transition-colors" />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Button size="icon" variant="ghost" className="rounded-full text-white/40 hover:text-white">
              <Mic className="w-5 h-5" />
            </Button>
            <Button 
              onClick={() => handleAsk()}
              disabled={isLoading}
              className={cn(
                "h-10 rounded-xl px-6 font-bold transition-all",
                mode === 'Ayurveda' ? "bg-amber-500 hover:bg-amber-600" : "bg-sky-500 hover:bg-sky-600"
              )}
            >
              {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : "ASK"}
              {isLoading ? "THINKING" : ""}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-4 justify-center">
          {quickTopics.map((topic) => (
            <Button 
              key={topic.name} 
              variant="outline" 
              size="sm" 
              onClick={() => { setQuery(topic.name); handleAsk(topic.name); }}
              className="rounded-full border-white/5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all gap-2"
            >
              <topic.icon className="w-3.5 h-3.5" />
              {topic.name}
            </Button>
          ))}
        </div>
      </section>

      {result ? (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
          {mode === 'Ayurveda' && result.ayurvedaResponse && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WellnessCard 
                title="Dosha Analysis" 
                icon={<Flower2 className="text-amber-400" />}
                content={result.ayurvedaResponse.doshaAnalysis}
              />
              <WellnessCard 
                title="Herbal Remedies" 
                icon={<Leaf className="text-emerald-400" />}
              >
                <div className="space-y-4">
                  {result.ayurvedaResponse.herbs?.map((h, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <p className="font-bold text-amber-200">{h.name}</p>
                      <p className="text-xs text-white/60">{h.benefits}</p>
                      {h.preparation && <p className="text-[10px] text-emerald-400 font-medium">Prep: {h.preparation}</p>}
                    </div>
                  ))}
                </div>
              </WellnessCard>
              <WellnessCard 
                title="Yoga & Pranayama" 
                icon={<Wind className="text-sky-400" />}
              >
                <div className="space-y-2">
                  {result.ayurvedaResponse.yogaAsanas?.map((y, i) => (
                    <div key={i} className="flex items-center justify-between text-sm text-white/80 p-2 rounded-lg hover:bg-white/5 cursor-default group">
                      <span>{y.name}</span>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white" />
                    </div>
                  ))}
                </div>
              </WellnessCard>
              <WellnessCard 
                title="Dinacharya Tips" 
                icon={<Calendar className="text-violet-400" />}
                content={result.ayurvedaResponse.dinacharya}
              />
            </div>
          )}

          {mode === 'Modern' && result.modernResponse && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WellnessCard 
                title="Clinical Explanation" 
                icon={<Activity className="text-sky-400" />}
                content={result.modernResponse.explanation}
              />
              <WellnessCard 
                title="Supplements" 
                icon={<CheckCircle2 className="text-emerald-400" />}
              >
                <div className="space-y-3">
                  {result.modernResponse.ingredients?.map((ing, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="font-bold text-white text-sm">{ing.name}</p>
                      <p className="text-xs text-white/50">{ing.description}</p>
                    </div>
                  ))}
                </div>
              </WellnessCard>
              <WellnessCard 
                title="Lifestyle Changes" 
                icon={<Moon className="text-violet-400" />}
                content={result.modernResponse.lifestyleModifications}
              />
              <WellnessCard 
                title="Dietary Advice" 
                icon={<Activity className="text-rose-400" />}
                content={result.modernResponse.foods}
              />
            </div>
          )}
          
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <p className="text-[10px] text-white/30 italic">
              {result.disclaimer}
            </p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-48 glass animate-pulse rounded-[2rem]" />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4 opacity-30">
          <div className="w-16 h-16 rounded-full glass flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <p className="text-sm font-medium">Ask Dr. Vital anything to get personalized wellness insights.</p>
        </div>
      )}
    </div>
  );
}

function WellnessCard({ title, icon, content, children }: any) {
  return (
    <div className="glass-morphism p-6 rounded-[2rem] space-y-4 border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-bold text-white uppercase tracking-widest text-xs">{title}</h3>
      </div>
      {content && <p className="text-sm text-white/70 leading-relaxed">{content}</p>}
      {children}
    </div>
  );
}
