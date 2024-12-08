import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Combine from "./pages/combine";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";  // Correction de l'import
import { ThemeProvider } from "./contexts/theme-provider";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Événement auth:', event, session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <AuthGuard>
                  <Combine />  {/* On met Combine comme page principale */}
                </AuthGuard>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;