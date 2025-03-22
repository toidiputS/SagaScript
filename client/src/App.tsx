import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Series from "@/pages/series";
import Characters from "@/pages/characters";
import World from "@/pages/world";
import Timeline from "@/pages/timeline";
import Achievements from "@/pages/achievements";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Products from "@/pages/products";
import Checkout from "@/pages/checkout";
import ChapterEditor from "@/pages/chapter-editor";
import Collaboration from "@/pages/collaboration";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import { useState } from "react";
import { SimpleAuthProvider } from "@/contexts/simple-auth";
import { ThemeProvider } from "@/contexts/theme-context";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";

function Router() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  
  // Check if the current route is auth-related
  const isAuthRoute = ['/login', '/register', '/auth'].includes(location);
  
  return (
    <div className="h-screen flex overflow-hidden">
      {!isAuthRoute && (
        <>
          <Sidebar />
          <MobileMenu 
            isOpen={isMobileMenuOpen} 
            onClose={() => setIsMobileMenuOpen(false)} 
          />
          <div className="md:hidden w-full bg-white border-b border-neutral-200 h-16 fixed top-0 z-10 flex items-center px-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="p-2 rounded-md text-neutral-500 hover:text-neutral-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div className="ml-4 flex items-center">
              <span className="font-serif font-bold text-lg">Saga Scribe</span>
            </div>
          </div>
        </>
      )}
      
      <main className={`flex-1 overflow-y-auto bg-neutral-50 ${!isAuthRoute ? 'pt-16 md:pt-0' : ''}`}>
        <Switch>
          {/* Auth routes */}
          <Route path="/auth" component={AuthPage} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          
          {/* Protected routes */}
          <ProtectedRoute path="/" component={() => <Dashboard />} />
          <ProtectedRoute path="/series" component={() => <Series />} />
          <ProtectedRoute path="/characters" component={() => <Characters />} />
          <ProtectedRoute path="/world" component={() => <World />} />
          <ProtectedRoute path="/timeline" component={() => <Timeline />} />
          <ProtectedRoute path="/achievements" component={() => <Achievements />} />
          <ProtectedRoute path="/collaboration" component={() => <Collaboration />} />
          <ProtectedRoute path="/products" component={() => <Products />} />
          <ProtectedRoute path="/checkout" component={() => <Checkout />} />
          <ProtectedRoute path="/chapter-editor" component={() => {
            // Extract bookId from URL
            const params = new URLSearchParams(window.location.search);
            const bookId = params.get("bookId");
            const seriesId = params.get("seriesId");
            
            // If no bookId is provided, redirect to series page or home
            if (!bookId) {
              // If seriesId is available, redirect to that series
              if (seriesId) {
                window.location.href = `/series?id=${seriesId}`;
                return <div>Redirecting...</div>;
              }
              // Otherwise redirect to home
              window.location.href = "/";
              return <div>Redirecting...</div>;
            }
            
            return <ChapterEditor />;
          }} />
          
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleAuthProvider>
        <ThemeProvider>
          <Router />
          <Toaster />
        </ThemeProvider>
      </SimpleAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
