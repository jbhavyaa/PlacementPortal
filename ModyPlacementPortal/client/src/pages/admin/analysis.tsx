import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Briefcase, FileText, TrendingUp, UserCheck } from "lucide-react";

interface AnalyticsData {
  totalStudents: number;
  totalJobs: number;
  totalApplications: number;
  totalPosts: number;
  averageCGPA: number;
  topCourses: Array<{ course: string; count: number }>;
  topBranches: Array<{ branch: string; count: number }>;
  recentApplications: number;
}

export default function AdminAnalysis() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
  });

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon,
    testId 
  }: { 
    title: string; 
    value: string | number; 
    description: string; 
    icon: any;
    testId: string;
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription className="text-sm font-medium">{title}</CardDescription>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1" data-testid={testId}>{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of placement portal statistics and insights
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : analytics ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Students"
              value={analytics.totalStudents}
              description="Registered on platform"
              icon={Users}
              testId="stat-total-students"
            />
            <StatCard
              title="Active Jobs"
              value={analytics.totalJobs}
              description="Open opportunities"
              icon={Briefcase}
              testId="stat-total-jobs"
            />
            <StatCard
              title="Applications"
              value={analytics.totalApplications}
              description="Total submitted"
              icon={UserCheck}
              testId="stat-total-applications"
            />
            <StatCard
              title="Forum Posts"
              value={analytics.totalPosts}
              description="Interview experiences"
              icon={FileText}
              testId="stat-total-posts"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Distribution by Course</CardTitle>
                <CardDescription>Breakdown of enrolled courses</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.topCourses && analytics.topCourses.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.topCourses.map((item) => (
                      <div key={item.course} className="flex items-center justify-between">
                        <span className="font-medium">{item.course}</span>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{
                                width: `${(item.count / analytics.totalStudents) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No data available
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Distribution by Branch</CardTitle>
                <CardDescription>Breakdown of enrolled branches</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.topBranches && analytics.topBranches.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.topBranches.map((item) => (
                      <div key={item.branch} className="flex items-center justify-between">
                        <span className="font-medium">{item.branch}</span>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-chart-2"
                              style={{
                                width: `${(item.count / analytics.totalStudents) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Average CGPA
                </CardTitle>
                <CardDescription>Overall student performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-primary" data-testid="stat-average-cgpa">
                  {analytics.averageCGPA.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">Out of 10.00</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Applications in last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-chart-2" data-testid="stat-recent-applications">
                  {analytics.recentApplications}
                </div>
                <p className="text-sm text-muted-foreground mt-2">New applications submitted</p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
