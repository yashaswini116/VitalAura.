"use client"

import { Bot, Brain, Heart, Stethoscope, Dumbbell, User, Info, MessageCircle, Star, Sparkles, Eye, Apple, ShieldCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const avatars = [
  {
    id: "drAryanMehta",
    name: "Dr. Aryan Mehta",
    title: "Psychiatrist",
    tags: ["Mental Health", "CBT", "Anxiety"],
    icon: Brain,
    color: "bg-indigo-500",
    tagline: "Empathetic guidance for your mental well-being."
  },
  {
    id: "drPriyaSharma",
    name: "Dr. Priya Sharma",
    title: "Gynecologist",
    tags: ["Women's Health", "PCOS", "Pregnancy"],
    icon: User,
    color: "bg-rose-500",
    tagline: "Expert care for every stage of a woman's life."
  },
  {
    id: "coachRavi",
    name: "Coach Ravi",
    title: "Fitness Expert",
    tags: ["Muscle Gain", "Fat Loss", "HIIT"],
    icon: Dumbbell,
    color: "bg-emerald-500",
    tagline: "High-energy training to crush your goals."
  },
  {
    id: "vaidyaKrishnamurti",
    name: "Vaidya Krishnamurti",
    title: "Ayurveda Expert",
    tags: ["Doshas", "Herbal", "Ancient Wisdom"],
    icon: ShieldCheck,
    color: "bg-amber-600",
    tagline: "Timeless Ayurvedic principles for modern life."
  },
  {
    id: "drSanjayKapoor",
    name: "Dr. Sanjay Kapoor",
    title: "Cardiologist",
    tags: ["Heart Health", "BP", "Cholesterol"],
    icon: Heart,
    color: "bg-red-500",
    tagline: "Evidence-based care for your heart's health."
  },
  {
    id: "drSmile",
    name: "Dr. Smile",
    title: "Dental Expert",
    tags: ["Hygiene", "Braces", "Whitening"],
    icon: Star,
    color: "bg-sky-400",
    tagline: "Practical, friendly advice for a brighter smile."
  },
  {
    id: "drNehaJoshi",
    name: "Dr. Neha Joshi",
    title: "Ophthalmologist",
    tags: ["Eye Strain", "Vision", "Dry Eyes"],
    icon: Eye,
    color: "bg-blue-600",
    tagline: "Specialized care for your vision and eye health."
  },
  {
    id: "nutritionistNora",
    name: "Nutritionist Nora",
    title: "Clinical Dietitian",
    tags: ["Meal Plans", "Diabetes", "Fasting"],
    icon: Apple,
    color: "bg-orange-500",
    tagline: "Science-based nutrition without the fad diets."
  },
  {
    id: "drGenome",
    name: "Dr. Genome",
    title: "Preventive Health",
    tags: ["Longevity", "Biohacking", "Genetics"],
    icon: Bot,
    color: "bg-purple-600",
    tagline: "Future-focused preventive and longevity science."
  },
  {
    id: "drDeviShetty",
    name: "Ask Dr. Devi Shetty",
    title: "Cardiac Surgeon (AI)",
    tags: ["Hope", "Compassion", "Heart Care"],
    icon: Heart,
    color: "bg-rose-700",
    tagline: "Compassionate wisdom inspired by the legendary surgeon."
  },
  {
    id: "drAyesha",
    name: "Dr. Ayesha",
    title: "Dermatologist",
    tags: ["Acne", "Aging", "Skincare"],
    icon: Sparkles,
    color: "bg-pink-400",
    tagline: "Evidence-based skincare and dermatological health."
  }
];

export default function AvatarGallery() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold text-white">Specialist Avatars</h1>
        <p className="text-white/50">Consult with world-class AI specialists 24/7.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {avatars.map((avatar) => (
          <div 
            key={avatar.id}
            className="glass-morphism rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all duration-300 flex flex-col"
          >
            <div className={`h-3 w-full ${avatar.color}`} />
            <div className="p-6 space-y-4 flex-1 flex flex-col">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl ${avatar.color}/20 flex items-center justify-center text-white relative`}>
                  <avatar.icon className="w-8 h-8" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white leading-tight">{avatar.name}</h3>
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">{avatar.title}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {avatar.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-white/5 text-white/60 border-white/5 text-[10px] px-2">
                    {tag}
                  </Badge>
                ))}
              </div>

              <p className="text-sm text-white/60 leading-relaxed flex-1">
                {avatar.tagline}
              </p>

              <div className="pt-4">
                <Button 
                  asChild
                  className="w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 gap-2 font-bold"
                >
                  <Link href={`/doctor?avatar=${avatar.id}`}>
                    <MessageCircle className="w-4 h-4" />
                    CONSULT NOW
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
