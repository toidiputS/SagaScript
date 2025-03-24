import React from 'react';
import { SUBSCRIPTION_TIERS, TIER_DISPLAY } from '@/lib/subscription';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react'; // Assuming this icon is used

export default function SubscriptionTiersPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">All Subscription Tiers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const tierInfo = TIER_DISPLAY[tier];
          return (
            <Card key={tier} className="flex flex-col h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <i className={`${tierInfo.icon} text-2xl ${tierInfo.color}`}></i>
                  <Badge variant="outline">{tier}</Badge>
                </div>
                <CardTitle>{tierInfo.name}</CardTitle>
                <CardDescription>{tierInfo.description}</CardDescription>
                <div className="mt-4 text-2xl font-bold">
                  ${tierInfo.price.toFixed(2)}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="list-none space-y-3">
                  {tierInfo.features?.map((feature, index) => (
                    <li key={index} className={`text-sm ${feature.startsWith('//') ? 'font-semibold text-primary mt-4' : 'flex items-start'}`}>
                      {feature.startsWith('//') ? (
                        feature.replace('//', '')
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2 text-primary shrink-0" />
                          <span>{feature}</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}