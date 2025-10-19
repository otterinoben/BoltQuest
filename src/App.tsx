import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TutorialProvider } from "@/contexts/TutorialContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AudioProvider } from "@/contexts/AudioContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TestingProvider } from "@/contexts/TestingContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { TestingPanel } from "@/components/TestingPanel";
import TutorialManager from "@/components/tutorial/TutorialManager";
import MobileHeader from "@/components/MobileHeader";
import AdminDebugPanel from "@/components/AdminDebugPanel";
import Dashboard from "./pages/Dashboard";
import Play from "./pages/Play";
import Game from "./pages/Game";
import Shop from "./pages/Shop";
import Referrals from "./pages/Referrals";
import Community from "./pages/Community";
import Leaderboards from "./pages/Leaderboards";
import Achievements from "./pages/Achievements";
import DailyTasks from "./pages/DailyTasks";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Preferences from "./pages/Preferences";
import Help from "./pages/Help";
import Testing from "./pages/Testing";
import WhatsNew from "./pages/WhatsNew";
import BaselineTest from "./pages/BaselineTest";
import NotFound from "./pages/NotFound";
import { hasUserProfile } from "@/lib/userStorage";
import { useEffect, useState } from "react";
import SimpleUserSetup from "@/components/SimpleUserSetup";

const queryClient = new QueryClient();

const App = () => {
  const [showUserSetup, setShowUserSetup] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has a profile
    const checkUserProfile = () => {
      try {
        const hasProfile = hasUserProfile();
        setShowUserSetup(!hasProfile);
      } catch (error) {
        console.error('Error checking user profile:', error);
        setShowUserSetup(true);
      }
    };

    checkUserProfile();
  }, []);

  // Show loading state while checking user profile
  if (showUserSetup === null) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground">Loading BoltQuest...</p>
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AudioProvider>
            <LanguageProvider>
              <TutorialProvider>
                <TestingProvider>
                  <UserDataProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      {showUserSetup ? (
                        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
                          <SimpleUserSetup 
                            onComplete={() => setShowUserSetup(false)}
                          />
                        </div>
                      ) : (
                        <SidebarProvider>
                          <div className="flex min-h-screen w-full">
                            <AppSidebar />
                            <div className="flex-1 flex flex-col relative">
                              <MobileHeader />
                              <main className="flex-1">
                                <Routes>
                                  <Route path="/" element={<Dashboard />} />
                                  <Route path="/play" element={<Play />} />
                                  <Route path="/game" element={<Game />} />
                                  <Route path="/shop" element={<Shop />} />
                                  <Route path="/referrals" element={<Referrals />} />
                                  <Route path="/community" element={<Community />} />
                                  <Route path="/leaderboards" element={<Leaderboards />} />
                                  <Route path="/achievements" element={<Achievements />} />
                                  <Route path="/daily-tasks" element={<DailyTasks />} />
                                  <Route path="/analytics" element={<Analytics />} />
                                  <Route path="/profile" element={<Profile />} />
                                  <Route path="/preferences" element={<Preferences />} />
                                  <Route path="/help" element={<Help />} />
                                  <Route path="/testing" element={<Testing />} />
                                  <Route path="/whats-new" element={<WhatsNew />} />
                                  <Route path="/baseline-test" element={<BaselineTest />} />
                                  <Route path="*" element={<NotFound />} />
                                </Routes>
                              </main>
                            </div>
                          </div>
                        </SidebarProvider>
                      )}
                      <TutorialManager pageId="dashboard" />
                      <TestingPanel />
                      <AdminDebugPanel />
                    </BrowserRouter>
                  </UserDataProvider>
                </TestingProvider>
              </TutorialProvider>
            </LanguageProvider>
          </AudioProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;