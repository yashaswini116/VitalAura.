import type {Metadata} from 'next';
import './globals.css';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { BackgroundOrbs } from "@/components/layout/background-orbs";
import { SOSButton } from "@/components/sos/sos-button";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase";
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";

export const metadata: Metadata = {
  title: 'VitalAura | Your Personalized Wellness Journey',
  description: 'AI-powered health and wellness platform.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="theme-color" content="#0a0e27" />
      </head>
      <body className="font-body antialiased min-h-screen">
        <FirebaseClientProvider>
          <BackgroundOrbs />
          <FirebaseErrorListener />
          <SidebarProvider defaultOpen={true}>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <main className="flex-1 relative pb-20 md:pb-0 overflow-x-hidden">
                <div className="container max-w-7xl mx-auto px-4 py-8">
                  {children}
                </div>
              </main>
            </div>
            <BottomNav />
            <SOSButton />
            <Toaster />
          </SidebarProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
