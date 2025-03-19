import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import SeriesManagement from "@/pages/series-management";
import Characters from "@/pages/characters";
import WorldBuilding from "@/pages/world-building";
import Timeline from "@/pages/timeline";
import AICompanion from "@/pages/ai-companion";
import { AuthProvider, useAuth } from "@/hooks/use-auth.tsx";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/series">
        <ProtectedRoute component={SeriesManagement} />
      </Route>
      <Route path="/characters">
        <ProtectedRoute component={Characters} />
      </Route>
      <Route path="/world-building">
        <ProtectedRoute component={WorldBuilding} />
      </Route>
      <Route path="/timeline">
        <ProtectedRoute component={Timeline} />
      </Route>
      <Route path="/ai-companion">
        <ProtectedRoute component={AICompanion} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
