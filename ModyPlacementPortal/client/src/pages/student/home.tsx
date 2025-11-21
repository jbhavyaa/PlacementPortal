import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthUser } from "@/lib/auth";
import { Activity, Notification } from "@shared/schema";
import { Briefcase, MessageSquare, User, Bell, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function StudentHome() {
  const user = getAuthUser();

  const { data: activities, isLoading: loadingActivities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: notifications, isLoading: loadingNotifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const { data: stats } = useQuery<{ eligibleJobs: number }>({
    queryKey: ["/api/students/stats"],
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "application":
        return <Briefcase className="h-5 w-5 text-primary" />;
      case "post":
        return <MessageSquare className="h-5 w-5 text-chart-2" />;
      case "profile_update":
        return <User className="h-5 w-5 text-chart-3" />;
      default:
        return <TrendingUp className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Welcome back, {user?.fullName}!</h1>
        <p className="text-muted-foreground">
          Track your placement journey and stay updated with the latest opportunities.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activities - Center Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          
          {loadingActivities ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-4" data-testid="activities-list">
              {activities.map((activity) => (
                <Card key={activity.id} className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex gap-4 items-start">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-1" data-testid={`activity-description-${activity.id}`}>
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent activities</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Apply to jobs or post on forums to see your activity here
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar - Stats and Notifications */}
        <div className="space-y-6">
          {/* Eligible Opportunities */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Eligible Opportunities</CardTitle>
              <CardDescription>Based on your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="text-5xl font-bold text-primary mb-2" data-testid="eligible-jobs-count">
                  {stats?.eligibleJobs ?? 0}
                </div>
                <p className="text-sm text-muted-foreground">Active job openings</p>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Updates from Admin</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingNotifications ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : notifications && notifications.length > 0 ? (
                <div className="space-y-4" data-testid="notifications-list">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className="pb-4 border-b last:border-0 last:pb-0"
                      data-testid={`notification-${notification.id}`}
                    >
                      <p className="text-sm font-medium mb-1">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
