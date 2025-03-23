import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Crown, Gift, Info, Lightbulb, Palette, ShieldCheck } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  benefits: string[];
}

export default function ProductsPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Sample premium products available for one-time purchase
  const products: Product[] = [
    {
      id: 'custom-theme-pack',
      name: 'Custom Theme Pack',
      description: 'Unlock 5 additional custom themes for your writing environment',
      price: 4.99,
      icon: <Palette className="w-10 h-10 text-purple-500" />,
      benefits: [
        'Dark Academia theme',
        'Enchanted Forest theme',
        'Sci-Fi Futuristic theme',
        'Nautical Adventure theme',
        'Medieval Fantasy theme',
      ]
    },
    {
      id: 'writers-toolkit',
      name: 'Writer\'s Essential Toolkit',
      description: 'A collection of templates and writing aids to improve your storytelling',
      price: 9.99,
      icon: <BookOpen className="w-10 h-10 text-blue-500" />,
      benefits: [
        'Character development worksheets',
        'Plot structure templates',
        'Scene planning guides',
        'Dialogue enhancement tips',
        'World-building questionnaires',
      ]
    },
    {
      id: 'inspiration-pack',
      name: 'Inspiration Pack',
      description: 'Get unstuck with a curated collection of writing prompts and exercises',
      price: 7.99,
      icon: <Lightbulb className="w-10 h-10 text-yellow-500" />,
      benefits: [
        '100 writing prompts for various genres',
        'Creativity exercises',
        'Story starters',
        'Character situation scenarios',
        'Plot twist suggestions',
      ]
    },
    {
      id: 'premium-support',
      name: 'Premium Support (1 month)',
      description: 'Get priority support and personalized assistance for your writing projects',
      price: 14.99,
      icon: <ShieldCheck className="w-10 h-10 text-green-500" />,
      benefits: [
        'Priority email support',
        'One-on-one consultation session',
        'Technical troubleshooting assistance',
        'Feature request prioritization',
        'Expedited bug fixes',
      ]
    },
    {
      id: 'gift-subscription',
      name: 'Gift Subscription Card',
      description: 'Give the gift of writing to a friend or loved one',
      price: 19.99,
      icon: <Gift className="w-10 h-10 text-red-500" />,
      benefits: [
        'One month of Wordsmith tier access',
        'Personalized gift message',
        'Digital gift card delivery',
        'No recurring charges',
        'Perfect for birthdays or holidays',
      ]
    },
  ];

  const handlePurchase = (product: Product) => {
    // Allow viewing products without being logged in
    // Just redirect to checkout - the ProtectedRoute there will handle auth
    setLocation(`/checkout?productId=${product.id}&amount=${product.price}`);
  };

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Premium Products</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Enhance your writing experience with our premium products. These one-time purchases give you access to additional features and resources.
        </p>
      </div>

      {/* Notification banner removed since users are already logged in */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </div>
                <div className="rounded-full bg-muted p-2 shrink-0">
                  {product.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-2xl font-bold mb-4">${product.price.toFixed(2)}</p>
              <div className="space-y-2">
                {product.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <Crown className="h-4 w-4 mr-2 text-primary" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handlePurchase(product)}
              >
                Purchase Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}