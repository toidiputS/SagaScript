import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/simple-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CreditCard, Rocket, Crown, Sparkles } from 'lucide-react';

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

  // Format plan name for display
  const formatPlanName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="bg-background text-foreground font-sans min-h-screen flex">
      <main className="flex-1 pt-4">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          

          {/* Page header */}
          <header className="md:flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Subscription Plans</h1>
              <p className="text-muted-foreground mt-1">Choose the plan that best fits your writing journey</p>
            </div>
          </header>

          {/* Tabs for different views */}
          <Tabs defaultValue="all-plans" className="mb-6">
            <TabsList className="w-full md:w-auto grid grid-cols-4">
              <TabsTrigger value="all-plans" className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">All Plans</span>
                <span className="md:hidden">All</span>
              </TabsTrigger>
              <TabsTrigger value="monthly" className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Monthly</span>
                <span className="md:hidden">Month</span>
              </TabsTrigger>
              <TabsTrigger value="yearly" className="flex items-center">
                <Rocket className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Yearly (Save 20%)</span>
                <span className="md:hidden">Year</span>
              </TabsTrigger>
              <TabsTrigger value="compare" className="flex items-center">
                <Crown className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Compare Features</span>
                <span className="md:hidden">Compare</span>
              </TabsTrigger>
            </TabsList>

            {/* All Plans Content */}
            <TabsContent value="all-plans" className="mt-6">
              <div className="grid gap-6 md:grid-cols-4">
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
                          <CardTitle>{formatPlanName(plan.name)}</CardTitle>
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
            </TabsContent>

            {/* Monthly Plans Content */}
            <TabsContent value="monthly" className="mt-6">
              <div className="grid gap-6 md:grid-cols-4">
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
                          <CardTitle>{formatPlanName(plan.name)}</CardTitle>
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
                          {user?.plan === plan.name.toLowerCase() ? 'Current Plan' : 'Subscribe Monthly'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Yearly Plans Content */}
            <TabsContent value="yearly" className="mt-6">
              <div className="grid gap-6 md:grid-cols-4">
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
                  Array.isArray(plans) && plans.filter(plan => plan.price > 0).map((plan: SubscriptionPlan) => (
                    <Card key={plan.id} className={`border hover:shadow-md transition-shadow ${user?.plan === plan.name.toLowerCase() ? 'border-primary' : 'border-border'}`}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>{formatPlanName(plan.name)}</CardTitle>
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
                            : <>
                                <span className="line-through text-muted-foreground text-base mr-2">${(plan.price / 100).toFixed(2)}/mo</span>
                                <span>${((plan.price * 0.8) / 100).toFixed(2)}/mo</span>
                              </>
                          }
                        </CardDescription>
                        <p className="text-sm text-primary mt-1">
                          Billed annually at ${((plan.price * 0.8 * 12) / 100).toFixed(2)}
                        </p>
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
                          {user?.plan === plan.name.toLowerCase() ? 'Current Plan' : 'Subscribe Yearly'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Compare Features Content */}
            <TabsContent value="compare" className="mt-6">
              <Card className="border">
                <CardHeader>
                  <CardTitle>Plan Comparison</CardTitle>
                  <CardDescription>Compare all available plans and their features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium text-muted-foreground">Feature</th>
                          {isLoading ? (
                            <th className="text-center p-3 font-medium">
                              <Loader2 className="h-5 w-5 animate-spin inline" />
                            </th>
                          ) : !plans || plans.length === 0 ? (
                            <th className="text-center p-3 font-medium">No Plans</th>
                          ) : (
                            Array.isArray(plans) && plans.map((plan: SubscriptionPlan) => (
                              <th key={plan.id} className="text-center p-3 font-medium">
                                {formatPlanName(plan.name)}
                                <div className="text-xs font-normal mt-1">
                                  {plan.price === 0 ? "Free" : `$${(plan.price / 100).toFixed(2)}/mo`}
                                </div>
                              </th>
                            ))
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Common features to compare */}
                        {["Series Limit", "Books per Series", "Characters per Series", "AI Suggestions", 
                          "Timeline Tools", "World Building", "Collaboration", "Export Options"].map((feature, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-3 text-foreground">{feature}</td>
                            {isLoading ? (
                              <td className="text-center p-2">
                                <div className="h-5 w-5 animate-pulse bg-muted rounded-full mx-auto"></div>
                              </td>
                            ) : !plans || plans.length === 0 ? (
                              <td className="text-center p-2">-</td>
                            ) : (
                              Array.isArray(plans) && plans.map((plan: SubscriptionPlan) => {
                                // Simulate different feature levels based on plan
                                let value = '';
                                if (feature === "Series Limit") {
                                  value = plan.name === "apprentice" ? "3" : 
                                         plan.name === "wordsmith" ? "10" : 
                                         plan.name === "loremaster" ? "25" : "Unlimited";
                                } else if (feature === "Books per Series") {
                                  value = plan.name === "apprentice" ? "5" : 
                                         plan.name === "wordsmith" ? "15" : "Unlimited";
                                } else if (feature === "Characters per Series") {
                                  value = plan.name === "apprentice" ? "10" : 
                                         plan.name === "wordsmith" ? "50" : 
                                         plan.name === "loremaster" ? "100" : "Unlimited";
                                } else if (feature === "AI Suggestions") {
                                  value = plan.name === "apprentice" ? "Basic" : 
                                         plan.name === "wordsmith" ? "Standard" : "Advanced";
                                } else if (feature === "Timeline Tools") {
                                  value = plan.name === "apprentice" ? "Basic" : 
                                         plan.name === "wordsmith" ? "Advanced" : "Premium";
                                } else if (feature === "World Building") {
                                  value = plan.name === "apprentice" ? "Limited" : 
                                         plan.name === "wordsmith" ? "Standard" : "Advanced";
                                } else if (feature === "Collaboration") {
                                  value = plan.name === "apprentice" ? "-" : 
                                         plan.name === "wordsmith" ? "Basic" : "Full Access";
                                } else if (feature === "Export Options") {
                                  value = plan.name === "apprentice" ? "PDF, TXT" : 
                                         plan.name === "wordsmith" ? "PDF, DOCX, TXT" : "All Formats";
                                }
                                
                                return (
                                  <td key={plan.id} className="text-center p-2">
                                    {value === "-" ? (
                                      <span className="text-red-500">✗</span>
                                    ) : (
                                      <span>{value}</span>
                                    )}
                                  </td>
                                );
                              })
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-center mt-6">
                    <Button variant="default" className="px-6">
                      Subscribe Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}