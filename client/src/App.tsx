import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import AgentOnboarding from "@/pages/AgentOnboarding";
import TestPage from "@/pages/TestPage";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AgentProvider } from "./contexts/AgentContext";
import { SystemProvider } from "./contexts/SystemContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/onboarding" component={AgentOnboarding} />
      <Route path="/tests" component={TestPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SystemProvider>
          <AgentProvider>
            <Router />
            <Toaster />
          </AgentProvider>
        </SystemProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
