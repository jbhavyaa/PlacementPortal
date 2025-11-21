import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, signupSchema, type LoginData, type SignupData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { setAuthToken, setAuthUser } from "@/lib/auth";
import { GraduationCap } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const form = useForm<SignupData>({
    resolver: zodResolver(isSignup ? signupSchema : loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "student",
      fullName: "",
    },
  });

  // Update form resolver when switching between signup and login
  useEffect(() => {
    form.clearErrors();
    // The form values are already reset by the toggle button handler
  }, [isSignup, form]);

  const onSubmit = async (data: SignupData | LoginData) => {
    setIsLoading(true);
    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const response = await apiRequest("POST", endpoint, data);

      if (response.token && response.user) {
        setAuthToken(response.token);
        setAuthUser(response.user);
        
        toast({
          title: isSignup ? "Account created!" : "Welcome back!",
          description: `Successfully ${isSignup ? "registered" : "logged in"} as ${data.role}`,
        });

        if (data.role === "student") {
          setLocation("/student/home");
        } else {
          setLocation("/admin/jobs");
        }
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md" key={isSignup ? "signup" : "login"}>
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold">
              {isSignup ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-base">
              Mody University of Science and Technology
              <br />
              Placement Portal
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Role</Label>
                <RadioGroup
                  value={form.watch("role")}
                  onValueChange={(value) => form.setValue("role", value as "student" | "admin")}
                  className="flex gap-4"
                  data-testid="radio-role"
                >
                  <div className="flex items-center space-x-2 flex-1">
                    <RadioGroupItem value="student" id="student" data-testid="radio-student" />
                    <Label htmlFor="student" className="font-normal cursor-pointer flex-1 py-3">
                      Student
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 flex-1">
                    <RadioGroupItem value="admin" id="admin" data-testid="radio-admin" />
                    <Label htmlFor="admin" className="font-normal cursor-pointer flex-1 py-3">
                      Admin
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    {...form.register("fullName")}
                    className="h-12"
                    data-testid="input-fullname"
                  />
                  {form.formState.errors.fullName && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.fullName.message}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...form.register("email")}
                  className="h-12"
                  data-testid="input-email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password (min 6 characters)"
                  {...form.register("password")}
                  className="h-12"
                  data-testid="input-password"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => {
              const newIsSignup = !isSignup;
              setIsSignup(newIsSignup);
              // Reset form with new resolver
              form.reset({
                email: "",
                password: "",
                role: "student",
                fullName: "",
              });
            }}
            data-testid="button-toggle-mode"
          >
            {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
