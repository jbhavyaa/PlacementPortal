import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ForumPost, insertForumPostSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MessageSquare, Calendar, Building2, Briefcase } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function StudentForums() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: posts, isLoading } = useQuery<ForumPost[]>({
    queryKey: ["/api/forum-posts"],
  });

  const form = useForm({
    resolver: zodResolver(insertForumPostSchema),
    defaultValues: {
      companyName: "",
      position: "",
      experience: "",
      interviewDate: undefined,
      tags: [],
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/forum-posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Post created!",
        description: "Your interview experience has been shared.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createPostMutation.mutate(data);
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Forums</h1>
          <p className="text-muted-foreground">
            Share and read interview experiences
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-post">
              <MessageSquare className="mr-2 h-4 w-4" />
              Share Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Share Interview Experience</DialogTitle>
              <DialogDescription>
                Help your peers by sharing your interview experience
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Interview Experience * (min 20 characters)</Label>
                  <Textarea
                    id="experience"
                    placeholder="Share your interview rounds, questions asked, overall experience..."
                    className="min-h-[200px] resize-none"
                    {...form.register("experience")}
                    data-testid="input-experience"
                  />
                  {form.formState.errors.experience && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.experience.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interviewDate">Interview Date (optional)</Label>
                  <Input
                    id="interviewDate"
                    type="date"
                    {...form.register("interviewDate")}
                    data-testid="input-interview-date"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel-post"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPostMutation.isPending}
                  data-testid="button-submit-post"
                >
                  {createPostMutation.isPending ? "Posting..." : "Share Experience"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Posts Feed */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-6" data-testid="posts-list">
          {posts.map((post) => (
            <Card key={post.id} className="hover-elevate" data-testid={`post-${post.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      {post.companyName}
                    </CardTitle>
                    <CardDescription className="text-base font-medium text-foreground flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {post.position}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span>By {post.authorName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm whitespace-pre-wrap" data-testid={`post-experience-${post.id}`}>
                  {post.experience}
                </p>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No interview experiences yet</p>
            <p className="text-sm text-muted-foreground">
              Be the first to share your interview experience!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
