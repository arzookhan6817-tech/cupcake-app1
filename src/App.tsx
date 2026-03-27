import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {user ? <Dashboard /> : <Login />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AppRouter />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
