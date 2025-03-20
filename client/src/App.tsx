import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AuthProvider } from "./hooks/use-auth";
import { ThemeProvider } from "./contexts/theme-context";
import Router from "./Router";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Router />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}