import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { clearAuth, getAuthUser } from "@/lib/auth";
import { User, LogOut } from "lucide-react";

export function AppNavbar() {
  const [, setLocation] = useLocation();
  const user = getAuthUser();

  const handleLogout = () => {
    clearAuth();
    setLocation("/login");
  };

  const handleBasicDetails = () => {
    if (user?.role === "student") {
      setLocation("/student/profile");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <h1 className="text-lg font-semibold text-foreground">
          Mody University of Science and Technology – Placement Portal
        </h1>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            data-testid="button-profile-menu"
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {user ? getInitials(user.fullName) : "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {user?.role === "student" && (
            <DropdownMenuItem onClick={handleBasicDetails} data-testid="menu-basic-details">
              <User className="mr-2 h-4 w-4" />
              Basic Details
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
