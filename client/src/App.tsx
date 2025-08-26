import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import Navigation from "@/components/navigation";
import HomePage from "@/pages/home";
import AuthPage from "@/pages/auth";
import BookingPage from "@/pages/booking";
import TicketsPage from "@/pages/tickets";
import TransactionsPage from "@/pages/transactions";
import EmployeeDashboard from "@/pages/employee-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/booking" component={BookingPage} />
        <Route path="/tickets" component={TicketsPage} />
        <Route path="/transactions" component={TransactionsPage} />
        <Route path="/dashboard" component={EmployeeDashboard} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
