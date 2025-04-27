import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import PointsFarming from "@/pages/PointsFarming";
import Predictions from "@/pages/Predictions";
import Watchtime from "@/pages/Watchtime";
import Settings from "@/pages/Settings";
import { apiRequest } from "./lib/queryClient";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await apiRequest('GET', '/api/auth/status');
        const data = await response.json();
        
        setIsAuthenticated(data.isAuthenticated);
        if (data.isAuthenticated) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  if (isAuthenticated === null) {
    // Loading state
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/points-farming" component={PointsFarming} />
        <Route path="/predictions" component={Predictions} />
        <Route path="/watchtime" component={Watchtime} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
