"use client"

import {
  LayoutDashboard,
  Stethoscope,
  Leaf,
  Users,
  Dumbbell,
  Menu
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const mobileNav = [
  { name: "Home", icon: LayoutDashboard, href: "/" },
  { name: "Doctor", icon: Stethoscope, href: "/doctor" },
  { name: "Wellness", icon: Leaf, href: "/wellness" },
  { name: "Avatars", icon: Users, href: "/avatars" },
  { name: "Fit", icon: Dumbbell, href: "/workouts" },
  { name: "More", icon: Menu, href: "/settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/10 px-2 pb-6 pt-3">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {mobileNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300 px-3 py-2 rounded-xl relative",
                isActive ? "text-primary" : "text-white/40"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "drop-shadow-[0_0_8px_rgba(124,58,237,0.8)]")} />
              <span className="text-[10px] font-semibold">{item.name}</span>
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(124,58,237,1)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}