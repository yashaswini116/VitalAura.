"use client"

import { useState } from "react";
import { FileText, Upload, Plus, Activity, CheckCircle2, AlertTriangle, ChevronRight, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { analyzeLabReport, AnalyzeLabReportOutput } from "@/ai/flows/lab-report-analyzer-flow";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function LabReports() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const reportsQuery = user ? query(
    collection(db, "users", user.uid, "labReports"),
    orderBy("createdAt", "desc")
  ) : null;
  const { data: reports } = useCollection(reportsQuery);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsAnalyzing(true);
    try {
      // In a real app, we'd upload to Storage. For this prototype, we'll convert to Base64 for Genkit.
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUri = reader.result as string;
        const analysis = await analyzeLabReport({ reportDataUri: dataUri });
        
        await addDoc(collection(db, "users", user.uid, "labReports"), {
          title: file.name.split('.')[0],
          analysis,
          createdAt: serverTimestamp(),
          fileName: file.name
        });

        toast({
          title: "Analysis Complete",
          description: "Your lab report has been interpreted by AI."
        });
      };
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not analyze the report. Please try another file."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-white">Lab Reports</h1>
          <p className="text-white/50 font-medium">AI-powered interpretation of your clinical tests.</p>
        </div>
        <div className="relative">
          <InputFile onFileSelect={handleFileUpload} disabled={isAnalyzing} />
        </div>
      </header>

      {selectedReport ? (
        <ReportDetail report={selectedReport} onBack={() => setSelectedReport(null)} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 px-2">
              <FileText className="w-5 h-5 text-primary" /> Past Reports
            </h3>
            
            <div className="space-y-4">
              {isAnalyzing && (
                <div className="glass-morphism p-8 rounded-[2rem] border-primary/30 flex flex-col items-center justify-center gap-4 animate-pulse">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-sm font-bold text-white uppercase tracking-widest">AI is interpreting your report...</p>
                </div>
              )}

              {reports && reports.length > 0 ? reports.map((r: any) => (
                <div 
                  key={r.id} 
                  onClick={() => setSelectedReport(r)}
                  className="glass-morphism p-6 rounded-[2rem] border-white/5 group hover:border-primary/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-primary transition-colors">{r.title}</h4>
                        <p className="text-xs text-white/40">{r.createdAt?.toDate?.()?.toLocaleDateString() || "Just now"}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">Analyzed</Badge>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-bold text-white/60 uppercase">{r.analysis?.parameters?.length || 0} Parameters</span>
                    </div>
                    <div className="flex-1" />
                    <ChevronRight className="w-5 h-5 text-white/20" />
                  </div>
                </div>
              )) : !isAnalyzing && (
                <div className="text-center py-20 glass rounded-[2rem] opacity-20 border-dashed border-2 border-white/20">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-sm font-medium">No reports uploaded yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-morphism p-8 rounded-[2.5rem] border-primary/20 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mx-auto">
                <Activity className="w-8 h-8" />
              </div>
              <div className="text-center space-y-2">
                <h4 className="font-bold text-white">Report Insight</h4>
                <p className="text-xs text-white/40 leading-relaxed">
                  Upload reports consistently to track your health trends over time. We'll alert you if parameters fluctuate.
                </p>
              </div>
            </div>

            <div className="glass-morphism p-6 rounded-[2rem] border-amber-500/20 space-y-4">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <Info className="w-4 h-4" /> Why upload?
              </h3>
              <p className="text-[10px] text-white/40 leading-relaxed">
                Our AI extracts parameters and provides plain-language explanations. This helps you understand what your numbers actually mean for your health.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InputFile({ onFileSelect, disabled }: { onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void, disabled?: boolean }) {
  return (
    <div className="flex items-center justify-center">
      <label className={cn(
        "h-14 px-8 rounded-2xl bg-emerald-500 text-white font-bold gap-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer flex items-center justify-center transition-all hover:scale-105 active:scale-95",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none"
      )}>
        <Upload className="w-5 h-5" />
        UPLOAD REPORT
        <input type="file" className="hidden" accept="image/*,.pdf" onChange={onFileSelect} disabled={disabled} />
      </label>
    </div>
  );
}

function ReportDetail({ report, onBack }: { report: any, onBack: () => void }) {
  const analysis = report.analysis as AnalyzeLabReportOutput;
  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
      <Button variant="ghost" onClick={onBack} className="text-white/40 hover:text-white mb-2">
        <ChevronRight className="w-4 h-4 rotate-180 mr-2" />
        BACK TO REPORTS
      </Button>

      <div className="glass-morphism p-8 rounded-[3rem] space-y-6">
        <header className="space-y-2">
          <h2 className="text-3xl font-black text-white">{report.title}</h2>
          <p className="text-white/50 text-sm leading-relaxed">{analysis.overallSummary}</p>
        </header>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">Parameters Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.parameters.map((p, i) => (
              <div key={i} className="glass p-5 rounded-2xl border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white">{p.name}</p>
                  <Badge className={cn(
                    "uppercase text-[10px] font-bold tracking-widest",
                    p.status === 'Normal' ? "bg-emerald-500/20 text-emerald-400" :
                    p.status === 'High' ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
                  )}>{p.status}</Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{p.value}</span>
                  <span className="text-xs text-white/40 font-medium">{p.unit}</span>
                  <span className="text-[10px] text-white/20 ml-auto uppercase tracking-tighter">Ref: {p.referenceRange}</span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed italic">"{p.explanation}"</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-[10px] text-white/30 italic text-center">
            {analysis.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
