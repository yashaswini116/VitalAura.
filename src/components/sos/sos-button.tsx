"use client"

import { useState, useEffect } from "react";
import { AlertCircle, X, MapPin, Phone, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && countdown > 0 && !isAlertActive && !isCancelled) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && !isAlertActive && !isCancelled) {
      triggerSOS();
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown, isAlertActive, isCancelled]);

  const triggerSOS = () => {
    setIsAlertActive(true);
    // In real app, trigger SMS/WhatsApp APIs here via Server Actions
    console.log("SOS Triggered: Location sent to emergency contacts");
  };

  const handleCancel = () => {
    setIsCancelled(true);
    setIsOpen(false);
    setCountdown(5);
    setIsAlertActive(false);
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setIsCancelled(false);
          setCountdown(5);
        }}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-800 shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center justify-center text-white font-bold transition-transform hover:scale-110 active:scale-95 group"
      >
        <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-pulse-ring" />
        <span className="relative z-10 text-lg">SOS</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md glass border-red-500/30 overflow-hidden">
          {!isAlertActive ? (
            <div className="text-center py-6">
              <div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto mb-6 relative">
                <span className="text-4xl font-bold text-red-500">{countdown}</span>
                <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-25" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-red-500 mb-2">Emergency Alert</DialogTitle>
                <p className="text-white/60 mb-8">
                  Alerting emergency contacts and dispatching location in {countdown} seconds...
                </p>
              </DialogHeader>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="w-full h-12 rounded-xl border-white/10 hover:bg-white/10 text-white"
              >
                CANCEL ALERT
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 animate-pulse">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <div>
                  <h3 className="font-bold text-red-500">SOS ACTIVE</h3>
                  <p className="text-sm text-red-500/80">Contacts notified via SMS & WhatsApp</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button className="h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-white gap-3 font-bold text-lg">
                  <Phone className="w-6 h-6" />
                  CALL 112
                </Button>
                <Button variant="outline" className="h-16 rounded-2xl border-white/10 hover:bg-white/5 text-white gap-3">
                  <MapPin className="w-6 h-6" />
                  NEARBY
                </Button>
              </div>

              <div className="p-4 rounded-2xl glass space-y-3">
                <h4 className="text-xs font-semibold text-white/40 uppercase">My Emergency Medical ID</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] text-white/40">Blood Group</span>
                    <span className="font-bold">O+ Positive</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/40">Conditions</span>
                    <span className="font-bold">Asthma</span>
                  </div>
                </div>
                <div className="pt-2">
                  <span className="block text-[10px] text-white/40">Allergies</span>
                  <span className="font-bold">Penicillin, Peanuts</span>
                </div>
              </div>

              <Button 
                onClick={handleCancel}
                className="w-full h-12 rounded-xl bg-white text-black hover:bg-white/90 font-bold"
              >
                I AM SAFE - CANCEL SOS
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}