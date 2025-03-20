
import Router from "./Router";
import { AuthProvider } from "./hooks/use-auth";

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
