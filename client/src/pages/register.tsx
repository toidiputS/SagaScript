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
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Registration form schema
const registerSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Form submission handler
  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsLoading(true);
      setFormError(null);
      
      // Simulate registration
      setTimeout(() => {
        // Mock successful registration
        localStorage.setItem("user", JSON.stringify({
          id: 1,
          username: values.username,
          displayName: values.displayName,
          plan: 'free'
        }));
        
        setIsLoading(false);
        navigate("/");
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground mr-2">
              <i className="ri-quill-pen-line text-xl"></i>
            </div>
            <h1 className="font-serif font-bold text-3xl text-foreground">Saga Scribe</h1>
          </div>
          <p className="mt-2 text-muted-foreground">The Ultimate Series Author's Companion</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Your Account</CardTitle>
            <CardDescription>Start your writing journey today</CardDescription>
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
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Choose a username" {...field} />
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
                        <Input type="password" placeholder="Create a password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="mr-2">Creating account</span>
                      <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin"></div>
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
