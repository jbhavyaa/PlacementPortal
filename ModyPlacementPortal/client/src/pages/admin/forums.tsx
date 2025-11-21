import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ForumPost } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MessageSquare, Calendar, Building2, Briefcase, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminForums() {
  const { toast } = useToast();

  const { data: posts, isLoading } = useQuery<ForumPost[]>({
    queryKey: ["/api/forum-posts"],
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/forum-posts/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts"] });
      toast({
        title: "Post deleted!",
        description: "The forum post has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Forums Moderation</h1>
        <p className="text-muted-foreground">
          Review and moderate student interview experiences
        </p>
      </div>

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

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        data-testid={`button-delete-${post.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Post</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this forum post? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deletePostMutation.mutate(post.id)}
                          data-testid={`button-confirm-delete-${post.id}`}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
            <p className="text-muted-foreground">No forum posts to moderate</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
