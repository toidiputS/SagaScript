import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/simple-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  const [loadingPlans, setLoadingPlans] = useState<{[key: string]: boolean}>({});
  const [activeTab, setActiveTab] = useState('all-plans');

  // Create checkout session mutation
  const createCheckoutSession = useMutation({
    mutationFn: async (planName: string) => {
      const res = await apiRequest('POST', '/api/subscriptions', { planName });
      return await res.json();
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      setLoadingPlans({});
      toast({
        title: 'Error creating checkout session',
        description: error.message || 'An error occurred while setting up the payment process.',
        variant: 'destructive'
      });
    }
  });

  // Handle subscription
  const handleSubscribe = (planName: string) => {
    if (user?.plan === planName.toLowerCase()) {
      toast({
        title: "Already subscribed",
        description: `You are already subscribed to the ${planName} plan.`,
        variant: "default"
      });
      return;
    }
    
    // Set loading state for this plan
    setLoadingPlans(prev => ({...prev, [planName]: true}));
    
    // Create Stripe checkout session and redirect
    createCheckoutSession.mutate(planName);
  };

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
          <div className="mb-6">
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                { value: 'all-plans', label: 'All Plans', shortLabel: 'All', icon: CreditCard },
                { value: 'monthly', label: 'Monthly', shortLabel: 'Month', icon: Sparkles },
                { value: 'yearly', label: 'Yearly (Save 20%)', shortLabel: 'Year', icon: Rocket },
                { value: 'compare', label: 'Compare Features', shortLabel: 'Compare', icon: Crown }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`
                      rounded-[30px] px-4 py-3 text-sm font-medium transition-all duration-300 flex items-center gap-2
                      ${activeTab === tab.value 
                        ? 'bg-primary text-primary-foreground shadow-[10px_10px_20px_rgba(33,150,243,0.2),-10px_-10px_20px_rgba(66,165,245,0.15)] hover:shadow-[15px_15px_25px_rgba(33,150,243,0.25),-15px_-15px_25px_rgba(66,165,245,0.2)]' 
                        : 'bg-card text-card-foreground shadow-[10px_10px_20px_rgba(33,150,243,0.12),-10px_-10px_20px_rgba(66,165,245,0.08)] hover:shadow-[15px_15px_25px_rgba(33,150,243,0.18),-15px_-15px_25px_rgba(66,165,245,0.12)]'
                      }
                      border-0 hover:scale-105
                    `}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="md:hidden">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

            {/* All Plans Content */}
            {activeTab === 'all-plans' && (
              <div className="mt-6">
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
                          disabled={user?.plan === plan.name.toLowerCase() || loadingPlans[plan.name]}
                          onClick={() => handleSubscribe(plan.name)}
                        >
                          {user?.plan === plan.name.toLowerCase() 
                            ? 'Current Plan' 
                            : loadingPlans[plan.name]
                              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                              : 'Select Plan'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              </div>
            )}

            {/* Monthly Plans Content */}
            {activeTab === 'monthly' && (
              <div className="mt-6">
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
                          disabled={user?.plan === plan.name.toLowerCase() || loadingPlans[plan.name]}
                          onClick={() => handleSubscribe(plan.name)}
                        >
                          {user?.plan === plan.name.toLowerCase() 
                            ? 'Current Plan' 
                            : loadingPlans[plan.name]
                              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                              : 'Subscribe Monthly'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              </div>
            )}

            {/* Yearly Plans Content */}
            {activeTab === 'yearly' && (
              <div className="mt-6">
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
                          disabled={user?.plan === plan.name.toLowerCase() || loadingPlans[plan.name]}
                          onClick={() => handleSubscribe(plan.name)}
                        >
                          {user?.plan === plan.name.toLowerCase() 
                            ? 'Current Plan' 
                            : loadingPlans[plan.name]
                              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                              : 'Subscribe Yearly'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              </div>
            )}

            {/* Compare Features Content */}
            {activeTab === 'compare' && (
              <div className="mt-6">
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
                  <div className="flex flex-col items-center mt-6">
                    <p className="text-muted-foreground mb-3">Ready to elevate your writing journey?</p>
                    <Button 
                      variant="default" 
                      className="px-6"
                      onClick={() => {
                        const planName = plans?.find(p => p.mostPopular)?.name || 'wordsmith';
                        handleSubscribe(planName);
                      }}
                      disabled={loadingPlans['wordsmith']}
                    >
                      {loadingPlans['wordsmith'] 
                        ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                        : 'Subscribe Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}