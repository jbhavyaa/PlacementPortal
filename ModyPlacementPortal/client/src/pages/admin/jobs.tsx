import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Job, insertJobSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Briefcase } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const COURSES = ["B.Tech", "M.Tech", "MBA", "MCA", "B.Sc", "M.Sc"];
const BRANCHES = ["CSE", "ECE", "ME", "CE", "EE", "IT", "Others"];

export default function AdminJobs() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const form = useForm({
    resolver: zodResolver(insertJobSchema),
    defaultValues: {
      companyName: "",
      position: "",
      description: "",
      location: "",
      salary: "",
      minCgpa: "",
      eligibleCourses: [],
      eligibleBranches: [],
      deadline: "",
      postedBy: "",
      isActive: true,
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/jobs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Job created!",
        description: "The job posting has been created successfully.",
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PUT", `/api/jobs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Job updated!",
        description: "The job posting has been updated successfully.",
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/jobs/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Job deleted!",
        description: "The job posting has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      form.reset({
        companyName: job.companyName,
        position: job.position,
        description: job.description,
        location: job.location,
        salary: job.salary || "",
        minCgpa: job.minCgpa,
        eligibleCourses: job.eligibleCourses || [],
        eligibleBranches: job.eligibleBranches || [],
        deadline: format(new Date(job.deadline), "yyyy-MM-dd"),
        postedBy: job.postedBy,
        isActive: job.isActive,
      });
      setSelectedCourses(job.eligibleCourses || []);
      setSelectedBranches(job.eligibleBranches || []);
    } else {
      setEditingJob(null);
      form.reset();
      setSelectedCourses([]);
      setSelectedBranches([]);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingJob(null);
    form.reset();
    setSelectedCourses([]);
    setSelectedBranches([]);
  };

  const onSubmit = (data: any) => {
    const jobData = {
      ...data,
      eligibleCourses: selectedCourses,
      eligibleBranches: selectedBranches,
    };

    if (editingJob) {
      updateJobMutation.mutate({ id: editingJob.id, data: jobData });
    } else {
      createJobMutation.mutate(jobData);
    }
  };

  const toggleCourse = (course: string) => {
    setSelectedCourses((prev) =>
      prev.includes(course) ? prev.filter((c) => c !== course) : [...prev, course]
    );
  };

  const toggleBranch = (branch: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branch) ? prev.filter((b) => b !== branch) : [...prev, branch]
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Job Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage job postings
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} data-testid="button-add-job">
              <Plus className="mr-2 h-4 w-4" />
              Add New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingJob ? "Edit Job" : "Add New Job"}</DialogTitle>
              <DialogDescription>
                {editingJob ? "Update job posting details" : "Create a new job posting for students"}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="e.g., Google"
                    {...form.register("companyName")}
                    data-testid="input-company-name"
                  />
                  {form.formState.errors.companyName && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.companyName.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    placeholder="e.g., Software Engineer"
                    {...form.register("position")}
                    data-testid="input-position"
                  />
                  {form.formState.errors.position && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.position.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Bangalore, India"
                    {...form.register("location")}
                    data-testid="input-location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salary Package</Label>
                  <Input
                    id="salary"
                    placeholder="e.g., 12-15 LPA"
                    {...form.register("salary")}
                    data-testid="input-salary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minCgpa">Minimum CGPA *</Label>
                  <Input
                    id="minCgpa"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 7.5"
                    {...form.register("minCgpa")}
                    data-testid="input-min-cgpa"
                  />
                  {form.formState.errors.minCgpa && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.minCgpa.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    {...form.register("deadline")}
                    data-testid="input-deadline"
                  />
                  {form.formState.errors.deadline && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.deadline.message as string}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, requirements..."
                  className="min-h-[120px] resize-none"
                  {...form.register("description")}
                  data-testid="input-description"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.description.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Eligible Courses *</Label>
                <div className="grid grid-cols-3 gap-3">
                  {COURSES.map((course) => (
                    <div key={course} className="flex items-center space-x-2">
                      <Checkbox
                        id={`course-${course}`}
                        checked={selectedCourses.includes(course)}
                        onCheckedChange={() => toggleCourse(course)}
                        data-testid={`checkbox-course-${course}`}
                      />
                      <Label htmlFor={`course-${course}`} className="font-normal cursor-pointer">
                        {course}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedCourses.length === 0 && (
                  <p className="text-sm text-destructive">Select at least one course</p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Eligible Branches *</Label>
                <div className="grid grid-cols-3 gap-3">
                  {BRANCHES.map((branch) => (
                    <div key={branch} className="flex items-center space-x-2">
                      <Checkbox
                        id={`branch-${branch}`}
                        checked={selectedBranches.includes(branch)}
                        onCheckedChange={() => toggleBranch(branch)}
                        data-testid={`checkbox-branch-${branch}`}
                      />
                      <Label htmlFor={`branch-${branch}`} className="font-normal cursor-pointer">
                        {branch}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedBranches.length === 0 && (
                  <p className="text-sm text-destructive">Select at least one branch</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createJobMutation.isPending ||
                    updateJobMutation.isPending ||
                    selectedCourses.length === 0 ||
                    selectedBranches.length === 0
                  }
                  data-testid="button-save-job"
                >
                  {createJobMutation.isPending || updateJobMutation.isPending
                    ? "Saving..."
                    : editingJob
                    ? "Update Job"
                    : "Create Job"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="space-y-4" data-testid="jobs-list">
          {jobs.map((job) => (
            <Card key={job.id} className="hover-elevate" data-testid={`job-${job.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{job.companyName}</CardTitle>
                    <CardDescription className="text-base font-medium text-foreground">
                      {job.position}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleOpenDialog(job)}
                      data-testid={`button-edit-${job.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => deleteJobMutation.mutate(job.id)}
                      disabled={deleteJobMutation.isPending}
                      data-testid={`button-delete-${job.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">CGPA ≥ {job.minCgpa}</Badge>
                  <Badge variant="outline">Deadline: {format(new Date(job.deadline), "MMM dd, yyyy")}</Badge>
                  {job.salary && <Badge variant="outline">{job.salary}</Badge>}
                  <Badge variant={job.isActive ? "default" : "secondary"}>
                    {job.isActive ? "Active" : "Inactive"}
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
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No jobs posted yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first job posting to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
