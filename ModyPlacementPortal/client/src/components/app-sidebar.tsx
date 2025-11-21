import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, Briefcase, MessageSquare, FileText, BarChart3 } from "lucide-react";
import { getAuthUser } from "@/lib/auth";

export function AppSidebar() {
  const [location] = useLocation();
  const user = getAuthUser();
  const isAdmin = user?.role === "admin";
  const baseRoute = isAdmin ? "/admin" : "/student";

  const studentMenuItems = [
    {
      title: "Home",
      url: `${baseRoute}/home`,
      icon: Home,
      testId: "nav-home",
    },
    {
      title: "Jobs",
      url: `${baseRoute}/jobs`,
      icon: Briefcase,
      testId: "nav-jobs",
    },
    {
      title: "Forums",
      url: `${baseRoute}/forums`,
      icon: MessageSquare,
      testId: "nav-forums",
    },
    {
      title: "Resume",
      url: `${baseRoute}/profile`,
      icon: FileText,
      testId: "nav-resume",
    },
  ];

  const adminMenuItems = [
    {
      title: "Jobs",
      url: `${baseRoute}/jobs`,
      icon: Briefcase,
      testId: "nav-jobs",
    },
    {
      title: "Forums",
      url: `${baseRoute}/forums`,
      icon: MessageSquare,
      testId: "nav-forums",
    },
    {
      title: "Analysis",
      url: `${baseRoute}/analysis`,
      icon: BarChart3,
      testId: "nav-analysis",
    },
  ];

  const menuItems = isAdmin ? adminMenuItems : studentMenuItems;

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <a href={item.url} data-testid={item.testId}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
