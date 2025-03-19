
import { Switch, Route, useLocation } from "wouter";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

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
      <Route path="/" component={() => <div>Home</div>} />
      <Route component={NotFound} />
    </Switch>
  );
}
