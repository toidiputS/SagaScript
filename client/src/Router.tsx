
import { Switch, Route, useLocation } from "wouter";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import Dashboard from "@/pages/dashboard";
import Series from "@/pages/series";
import Timeline from "@/pages/timeline";
import World from "@/pages/world";
import Stats from "@/pages/stats";
import Settings from "@/pages/settings";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;
  
  return <Component />;
}

export default function Router() {
  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Protected routes */}
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/series" component={() => <ProtectedRoute component={Series} />} />
      <Route path="/timeline" component={() => <ProtectedRoute component={Timeline} />} />
      <Route path="/world" component={() => <ProtectedRoute component={World} />} />
      <Route path="/stats" component={() => <ProtectedRoute component={Stats} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}
