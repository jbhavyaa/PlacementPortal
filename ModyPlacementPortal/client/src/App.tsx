import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/dashboard-layout";
import { isAuthenticated, getAuthUser } from "@/lib/auth";

import Login from "@/pages/login";
import StudentHome from "@/pages/student/home";
import StudentJobs from "@/pages/student/jobs";
import StudentForums from "@/pages/student/forums";
import StudentProfile from "@/pages/student/profile";
import AdminJobs from "@/pages/admin/jobs";
import AdminForums from "@/pages/admin/forums";
import AdminAnalysis from "@/pages/admin/analysis";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/login" component={Login} />

      {/* Root redirect based on authentication */}
      <Route path="/">
        {() => {
          if (!isAuthenticated()) {
            return <Redirect to="/login" />;
          }
          const user = getAuthUser();
          if (user?.role === "admin") {
            return <Redirect to="/admin/jobs" />;
          }
          return <Redirect to="/student/home" />;
        }}
      </Route>

      {/* Student Routes */}
      <Route path="/student/home">
        <DashboardLayout requireRole="student">
          <StudentHome />
        </DashboardLayout>
      </Route>

      <Route path="/student/jobs">
        <DashboardLayout requireRole="student">
          <StudentJobs />
        </DashboardLayout>
      </Route>

      <Route path="/student/forums">
        <DashboardLayout requireRole="student">
          <StudentForums />
        </DashboardLayout>
      </Route>

      <Route path="/student/profile">
        <DashboardLayout requireRole="student">
          <StudentProfile />
        </DashboardLayout>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/jobs">
        <DashboardLayout requireRole="admin">
          <AdminJobs />
        </DashboardLayout>
      </Route>

      <Route path="/admin/forums">
        <DashboardLayout requireRole="admin">
          <AdminForums />
        </DashboardLayout>
      </Route>

      <Route path="/admin/analysis">
        <DashboardLayout requireRole="admin">
          <AdminAnalysis />
        </DashboardLayout>
      </Route>

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
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
