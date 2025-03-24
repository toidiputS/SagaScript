import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/simple-auth';
import Sidebar from '@/components/layout/sidebar';
import MobileNav from '@/components/layout/mobile-menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

// Define types for our subscription plans
interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  description: string;
  features: string[];
  mostPopular?: boolean;
}

export default function SubscriptionsPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: plans, isLoading, error } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/subscription-plans');
        return await res.json();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load subscription plans",
          variant: "destructive"
        });
        throw error;
      }
    }
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  return (
    <div className="bg-background text-foreground font-sans p-4 md:p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <header className="md:flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Subscription Plans</h1>
          <p className="text-muted-foreground mt-1">Choose the plan that best fits your writing journey</p>
        </div>
      </header>

      {/* Subscription Plans */}
      <div className="grid gap-6 md:grid-cols-4 my-8">
        {isLoading ? (
          <div className="col-span-4 flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading subscription plans...</p>
            </div>
          </div>
        ) : !plans || plans.length === 0 ? (
          <div className="col-span-4 bg-background border border-border rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium mb-2 text-foreground">No Plans Available</h3>
            <p className="text-muted-foreground mb-4">There are currently no subscription plans available.</p>
          </div>
        ) : (
          Array.isArray(plans) && plans.map((plan: SubscriptionPlan) => (
            <Card key={plan.id} className={`border hover:shadow-md transition-shadow ${user?.plan === plan.name.toLowerCase() ? 'border-primary' : 'border-border'}`}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{plan.name}</CardTitle>
                  {user?.plan === plan.name.toLowerCase() && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                      Current Plan
                    </Badge>
                  )}
                  {plan.mostPopular && (
                    <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                  )}
                </div>
                <CardDescription className="text-xl font-bold mt-2">
                  {plan.price === 0 
                    ? "Free" 
                    : `$${(plan.price / 100).toFixed(2)}/month`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features && plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full"
                  variant={user?.plan === plan.name.toLowerCase() ? "outline" : "default"}
                  disabled={user?.plan === plan.name.toLowerCase()}
                >
                  {user?.plan === plan.name.toLowerCase() ? 'Current Plan' : 'Select Plan'}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}