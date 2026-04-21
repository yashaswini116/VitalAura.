"use client"

import {
  LayoutDashboard,
  Stethoscope,
  Leaf,
  Users,
  Dumbbell,
  Settings,
  Pill,
  Calendar,
  Utensils,
  FileText
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "AI Doctor", icon: Stethoscope, href: "/doctor" },
  { name: "Wellness", icon: Leaf, href: "/wellness" },
  { name: "Specialists", icon: Users, href: "/avatars" },
  { name: "Workouts", icon: Dumbbell, href: "/workouts" },
  { name: "Medications", icon: Pill, href: "/medications" },
  { name: "Cycle", icon: Calendar, href: "/cycle" },
  { name: "Nutrition", icon: Utensils, href: "/nutrition" },
  { name: "Lab Reports", icon: FileText, href: "/lab-reports" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="hidden md:flex border-r border-white/10 bg-black/20 backdrop-blur-xl">
      <SidebarHeader className="p-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center relative">
            <span className="text-white font-bold text-xl">V</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-logo-pulse" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">VitalAura</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-white/40 uppercase tracking-widest">
            Menu
          </SidebarGroupLabel>
          <SidebarMenu className="px-2 py-2 gap-1">
            {navigation.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-6 rounded-xl transition-all duration-300",
                    pathname === item.href 
                      ? "bg-primary/20 text-primary shadow-[0_0_20px_rgba(124,58,237,0.3)] border border-primary/30" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-white/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="w-full text-white/60 hover:text-white hover:bg-white/5">
              <Link href="/settings">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}