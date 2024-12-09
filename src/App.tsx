import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Combine from "./pages/combine";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";  // Correction de l'import
import { ThemeProvider } from "./contexts/theme-provider";
import { LoadingSpinner } from "@/components/LoadingSpinner";

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
              {/* Protéger les routes qui nécessitent une authentification */}
              <Route 
                path="/combine" 
                element={
                  <ProtectedRoute>
                    <Combine />
                  </ProtectedRoute>
                } 
              />
              {/* Rediriger la racine vers /combine si authentifié, sinon vers /login */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Navigate to="/combine" replace />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Composant pour protéger les routes
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default App;