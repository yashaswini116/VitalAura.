
"use client"

import { useState, useMemo, useEffect } from "react";
import { Pill, Plus, Calendar, CheckCircle2, Loader2, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const SAMPLE_MEDS = [
  { id: "s1", name: "Dolo 500", dosage: "500mg", time: "09:00" },
  { id: "s2", name: "Vitamin C", dosage: "250mg", time: "20:00" }
];

export default function MedicationsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [displayMeds, setDisplayMeds] = useState<any[]>(SAMPLE_MEDS);
  const [isAdding, setIsAdding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", time: "09:00" });

  const medsQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, "users", user.uid, "medications"), orderBy("createdAt", "desc"));
  }, [user?.uid, db]);

  const { data: meds, loading } = useCollection(medsQuery);

  useEffect(() => {
    if (!loading) {
      const dataToUse = (meds && meds.length > 0) ? meds : SAMPLE_MEDS;
      setDisplayMeds(dataToUse);
      console.log("Using Data (Medications):", dataToUse);
    }
  }, [meds, loading]);

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !db) return;
    
    setIsAdding(true);
    const medData = {
      ...newMed,
      createdAt: serverTimestamp(),
      takenToday: false
    };

    addDoc(collection(db, "users", user.uid, "medications"), medData)
      .then(() => {
        setIsDialogOpen(false);
        setNewMed({ name: "", dosage: "", time: "09:00" });
        toast({ title: "Success", description: "Medication added to your schedule." });
      })
      .finally(() => setIsAdding(false));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Medications</h1>
          <p className="text-white/50">Your daily treatment schedule.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-14 px-8 rounded-2xl bg-primary text-white font-bold gap-3 shadow-lg">
              <Plus className="w-5 h-5" />
              ADD NEW
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/10 sm:max-w-md bg-[#0a0e27]/95 text-white">
            <DialogHeader><DialogTitle>New Medication</DialogTitle></DialogHeader>
            <form onSubmit={handleAddMed} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input required value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} placeholder="e.g., Metformin" className="glass" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dosage</Label>
                  <Input value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} placeholder="500mg" className="glass" />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" value={newMed.time} onChange={e => setNewMed({...newMed, time: e.target.value})} className="glass" />
                </div>
              </div>
              <Button type="submit" disabled={isAdding} className="w-full h-14 bg-primary font-bold">
                {isAdding ? <Loader2 className="animate-spin" /> : "SAVE MEDICATION"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <section className="glass-morphism p-8 rounded-[2.5rem] border-white/5 space-y-6">
        <div className="space-y-4">
          {displayMeds.map((m: any, idx: number) => (
            <div key={m.id || idx} className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/[0.08]">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Pill className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white text-base">{m.name}</h4>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-white/40 font-bold uppercase">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.time}</span>
                  <span>{m.dosage}</span>
                </div>
              </div>
              <CheckCircle2 className="w-6 h-6 text-white/10" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
