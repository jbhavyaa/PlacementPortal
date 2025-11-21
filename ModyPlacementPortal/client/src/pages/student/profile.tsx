import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { StudentProfile, insertStudentProfileSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Upload, FileText, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COURSES = ["B.Tech", "M.Tech", "MBA", "MCA", "B.Sc", "M.Sc"];
const BRANCHES = ["CSE", "ECE", "ME", "CE", "EE", "IT", "Others"];

export default function StudentProfilePage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const { data: profile, isLoading } = useQuery<StudentProfile>({
    queryKey: ["/api/students/profile"],
  });

  const form = useForm({
    resolver: zodResolver(insertStudentProfileSchema),
    defaultValues: {
      course: "",
      branch: "",
      cgpa: "",
      graduationYear: new Date().getFullYear() + 1,
      phone: "",
      linkedin: "",
      github: "",
      skills: [],
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        course: profile.course,
        branch: profile.branch,
        cgpa: profile.cgpa,
        graduationYear: profile.graduationYear,
        phone: profile.phone || "",
        linkedin: profile.linkedin || "",
        github: profile.github || "",
      });
      setSkills(profile.skills || []);
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", "/api/students/profile", { ...data, skills });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("resume", file);
      
      const response = await fetch("/api/students/resume", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload resume");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students/profile"] });
      toast({
        title: "Resume uploaded!",
        description: "Your resume has been uploaded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      uploadResumeMutation.mutate(file);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Resume & Profile</h1>
        <p className="text-muted-foreground">
          Keep your profile updated to get matched with relevant opportunities
        </p>
      </div>

      <div className="space-y-6">
        {/* Academic Details */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Details</CardTitle>
            <CardDescription>Your educational information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course">Course *</Label>
                  <Select
                    value={form.watch("course")}
                    onValueChange={(value) => form.setValue("course", value)}
                  >
                    <SelectTrigger data-testid="select-course">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSES.map((course) => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.course && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.course.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch *</Label>
                  <Select
                    value={form.watch("branch")}
                    onValueChange={(value) => form.setValue("branch", value)}
                  >
                    <SelectTrigger data-testid="select-branch">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.branch && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.branch.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cgpa">CGPA * (0-10)</Label>
                  <Input
                    id="cgpa"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 8.5"
                    {...form.register("cgpa")}
                    data-testid="input-cgpa"
                  />
                  {form.formState.errors.cgpa && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.cgpa.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year *</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    placeholder="e.g., 2025"
                    {...form.register("graduationYear", { valueAsNumber: true })}
                    data-testid="input-graduation-year"
                  />
                  {form.formState.errors.graduationYear && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.graduationYear.message as string}
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
                {updateProfileMutation.isPending ? "Saving..." : "Save Academic Details"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact & Links */}
        <Card>
          <CardHeader>
            <CardTitle>Contact & Professional Links</CardTitle>
            <CardDescription>How recruiters can reach you</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 1234567890"
                    {...form.register("phone")}
                    data-testid="input-phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/yourprofile"
                    {...form.register("linkedin")}
                    data-testid="input-linkedin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github">GitHub Profile</Label>
                  <Input
                    id="github"
                    placeholder="https://github.com/yourusername"
                    {...form.register("github")}
                    data-testid="input-github"
                  />
                </div>
              </div>

              <Button type="submit" disabled={updateProfileMutation.isPending} data-testid="button-save-contact">
                {updateProfileMutation.isPending ? "Saving..." : "Save Contact Details"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Add your technical and soft skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                data-testid="input-skill"
              />
              <Button type="button" onClick={addSkill} data-testid="button-add-skill">
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="cursor-pointer hover-elevate"
                  onClick={() => removeSkill(skill)}
                  data-testid={`skill-${skill}`}
                >
                  {skill} ×
                </Badge>
              ))}
            </div>

            <Button
              onClick={() => updateProfileMutation.mutate(form.getValues())}
              disabled={updateProfileMutation.isPending}
              data-testid="button-save-skills"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Skills"}
            </Button>
          </CardContent>
        </Card>

        {/* Resume Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Resume Upload</CardTitle>
            <CardDescription>Upload your latest resume (PDF only, max 5MB)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.resumeUrl ? (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Resume uploaded</p>
                    <p className="text-sm text-muted-foreground">Click below to update</p>
                  </div>
                </div>
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                  data-testid="link-view-resume"
                >
                  View Resume
                </a>
              </div>
            ) : null}

            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                data-testid="input-file-resume"
              />
              
              {uploadResumeMutation.isPending ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                  <p className="text-sm text-muted-foreground">Uploading resume...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="button-upload-resume"
                    >
                      {profile?.resumeUrl ? "Upload New Resume" : "Upload Resume"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">PDF format, max 5MB</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
