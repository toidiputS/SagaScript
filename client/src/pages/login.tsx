import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from "wouter";
import { SagaScriptLogoCompact } from "@/components/ui/sagascript-logo";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize form with validation mode onChange
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onChange",  // This will validate as the user types
  });

  // Form submission handler
  const onSubmit = async (values: LoginFormValues) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setFormError(null);
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      navigate("/");
      
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        {/* Theme toggle removed temporarily */}
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 flex items-center justify-center text-primary mr-2">
              <SagaScriptLogoCompact size={48} className="text-primary" />
            </div>
            <h1 className="font-serif font-bold text-3xl">
              <span className="text-foreground">SagaScript</span>
              <span className="text-[#00A3FF]">Life</span>
            </h1>
          </div>
          <p className="mt-2 text-muted-foreground">The Ultimate Series Author's Companion</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login to Your Account</CardTitle>
            <CardDescription>Continue your writing journey</CardDescription>
          </CardHeader>
          <CardContent>
            {formError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
                {formError}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2">Logging in</span>
                      <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin"></div>
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
