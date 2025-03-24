import { useState } from "react";
import { Link, Redirect } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { useSimpleAuth } from "@/contexts/simple-auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { BookOpen, Brain, Globe, Users, Sparkles, PenTool, BookText, BrainCircuit, Clock, Candle } from "lucide-react";
import { motion } from "framer-motion"; // Added for animations


// Define the login schema
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Define the registration schema
const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  displayName: z.string().min(1, { message: "Display name is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const cardVariants = {
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
};

const iconVariants = {
  hover: {
    scale: 1.1,
    opacity: 0.7,
    transition: { duration: 0.3 },
  },
};

const textVariants = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.3 },
  }
};



export default function AuthPage() {
  const auth = useSimpleAuth();
  const { user, isLoading } = auth;
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  console.log("Auth Page - Simple Auth state:", {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading
  });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex min-h-screen overflow-hidden relative bg-gradient-to-br from-background to-secondary/30">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-primary/10 font-serif opacity-30 animate-float"
            style={{
              fontSize: `${Math.random() * 2 + 2}rem`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 20 + 10}s`,
            }}
          >
            {["📝", "📚", "🖋️", "✨", "💭", "📖", "🌍", "🧠", "⏱️", "📊"][i % 10]}
          </div>
        ))}
      </div>

      {/* Theme switcher in top-right corner */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeSwitcher />
      </div>

      <div className="flex flex-col lg:flex-row w-full">
        {/* Auth form */}
        <div className="flex flex-col w-full lg:w-1/2 px-6 py-12 justify-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-md w-full mx-auto"
          > {/* Added motion.div for animation */}
            <div className="text-center mb-8">
              <div className="inline-block relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-lg blur opacity-30 animate-pulse"></div>
                <h1 className="text-4xl font-serif font-bold text-foreground relative">Saga Script Life</h1>
              </div>
              <p className="text-muted-foreground mt-2">Your ultimate writing companion</p>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
              <TabsList className="grid grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm />
              </TabsContent>

              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Feature showcase */}
        <div className="w-full lg:w-1/2 bg-primary text-primary-foreground p-12 hidden lg:flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80 z-0"></div>

          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-4xl font-serif font-bold mb-8 animate-fadeIn">Craft Your Epic Tales</h2>

            <div className="grid grid-cols-2 gap-6">
              <AnimatedFeatureCard
                icon={<BookOpen className="h-8 w-8" />}
                title="Series Architecture"
                description="Build complex series with interconnected plots and timelines"
              />

              <AnimatedFeatureCard
                icon={<Users className="h-8 w-8" />}
                title="Character Evolution"
                description="Track character growth, relationships, and development arcs"
              />

              <AnimatedFeatureCard
                icon={<Globe className="h-8 w-8" />}
                title="World-Building"
                description="Create immersive worlds with detailed cultures, maps and histories"
              />

              <AnimatedFeatureCard
                icon={<BrainCircuit className="h-8 w-8" />}
                title="AI Writing Assistant"
                description="Get intelligent suggestions for plot, character, and dialogue"
              />

              <AnimatedFeatureCard
                icon={<Clock className="h-8 w-8" />}
                title="Productivity Tools"
                description="Set goals, track progress, and maintain writing streaks"
              />

              <AnimatedFeatureCard
                icon={<Sparkles className="h-8 w-8" />}
                title="Multimedia Integration"
                description="Add images, maps, and audio to enhance your worlds"
              />
            </div>

            <div className="mt-12 bg-primary-foreground/10 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-primary-foreground/90 italic">
                "Saga Script Life transformed my writing process completely. The series planning tools helped me map out my trilogy with confidence!"
                <span className="block mt-2 text-right font-semibold">— Published Author</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function AnimatedFeatureCard({ icon, title, description }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="bg-white/10 backdrop-blur-sm rounded-lg p-4 transition-all duration-300 hover:bg-white/20 hover:translate-y-[-4px]"
    >
      <motion.div variants={iconVariants} whileHover="hover" className="text-primary-foreground mb-2">
        {icon}
      </motion.div>
      <motion.h3 variants={textVariants} whileHover="hover" className="font-semibold text-lg mb-1">{title}</motion.h3>
      <motion.p variants={textVariants} whileHover="hover" className="text-primary-foreground/80 text-sm">{description}</motion.p>
    </motion.div>
  );
}

function LoginForm() {
  const auth = useSimpleAuth();
  const [isPending, setIsPending] = useState(false);

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Submit handler
  const onSubmit = async (values: LoginFormValues) => {
    try {
      console.log("Submitting login form with values:", values);
      setIsPending(true);
      await auth.login(values);
    } catch (error) {
      console.error("Login submission error:", error);
      // Error is handled in the auth context with toasts
    } finally {
      setIsPending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative z-10"
    >
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
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
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
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
        <CardFooter className="flex flex-col space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-center text-muted-foreground"
          >
            By continuing, you agree to our <Button variant="link" className="p-0 h-auto">Terms of Service</Button> and <Button variant="link" className="p-0 h-auto">Privacy Policy</Button>
          </motion.div>
          <motion.div whileHover={{ rotate: 10 }} className="absolute bottom-2 right-2">
            <ThemeSwitcher />
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

function RegisterForm() {
  const auth = useSimpleAuth();
  const [isPending, setIsPending] = useState(false);

  // Initialize form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      displayName: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Submit handler
  const onSubmit = async (values: RegisterFormValues) => {
    try {
      console.log("Submitting registration form with values:", values);
      setIsPending(true);
      await auth.register(values);
    } catch (error) {
      console.error("Registration submission error:", error);
      // Error is handled in the auth context with toasts
    } finally {
      setIsPending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative z-10"
    >
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Join the Saga Script Life community</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
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
                      <Input type="password" placeholder="••••••" {...field} />
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
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
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
        <CardFooter className="flex flex-col space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-center text-muted-foreground"
          >
            By continuing, you agree to our <Button variant="link" className="p-0 h-auto">Terms of Service</Button> and <Button variant="link" className="p-0 h-auto">Privacy Policy</Button>
          </motion.div>
          <motion.div whileHover={{ rotate: 10 }} className="absolute bottom-2 right-2">
            <ThemeSwitcher />
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}