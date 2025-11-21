import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Job } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MapPin, Calendar, DollarSign, Search, Briefcase } from "lucide-react";
import { format } from "date-fns";

export default function StudentJobs() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: jobs, isLoading } = useQuery<(Job & { isEligible: boolean; hasApplied: boolean })[]>({
    queryKey: ["/api/jobs/eligible"],
  });

  const applyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return apiRequest("POST", "/api/applications", { jobId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/eligible"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Application submitted!",
        description: "Your application has been submitted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Application failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const filteredJobs = jobs?.filter((job) =>
    job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Job Opportunities</h1>
        <p className="text-muted-foreground">
          Browse and apply to jobs matching your profile
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
            data-testid="input-search-jobs"
          />
        </div>
      </div>

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredJobs && filteredJobs.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6" data-testid="jobs-grid">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              className={`hover-elevate ${!job.isEligible ? "opacity-60" : ""}`}
              data-testid={`job-card-${job.id}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{job.companyName}</CardTitle>
                    <CardDescription className="text-base font-medium text-foreground">
                      {job.position}
                    </CardDescription>
                  </div>
                  {!job.isEligible && (
                    <Badge variant="secondary" data-testid={`badge-not-eligible-${job.id}`}>
                      Not Eligible
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </Badge>
                  {job.salary && (
                    <Badge variant="outline" className="gap-1">
                      <DollarSign className="h-3 w-3" />
                      {job.salary}
                    </Badge>
                  )}
                  <Badge variant="outline" className="gap-1">
                    CGPA ≥ {job.minCgpa}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1">
                  {job.eligibleCourses?.map((course) => (
                    <Badge key={course} variant="secondary" className="text-xs">
                      {course}
                    </Badge>
                  ))}
                  {job.eligibleBranches?.map((branch) => (
                    <Badge key={branch} variant="secondary" className="text-xs">
                      {branch}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Deadline: {format(new Date(job.deadline), "MMM dd, yyyy")}
                </div>
              </CardContent>

              <CardFooter>
                {job.hasApplied ? (
                  <Button disabled className="w-full" data-testid={`button-applied-${job.id}`}>
                    Applied
                  </Button>
                ) : (
                  <Button
                    onClick={() => applyMutation.mutate(job.id)}
                    disabled={!job.isEligible || applyMutation.isPending}
                    className="w-full"
                    data-testid={`button-apply-${job.id}`}
                  >
                    {applyMutation.isPending ? "Applying..." : "Apply Now"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "No jobs found matching your search" : "No job opportunities available"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
