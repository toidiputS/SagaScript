import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useLocation } from 'wouter';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
    }
    
    setIsProcessing(false);
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Complete your purchase</CardTitle>
        <CardDescription>Enter your payment details below</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <PaymentElement />
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!stripe || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Complete Payment"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  
  // Get item info from URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const productId = searchParams.get('productId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (!productId || !amount) {
      toast({
        title: "Missing product information",
        description: "Product ID and amount are required to proceed with checkout.",
        variant: "destructive"
      });
      setLocation('/'); // Redirect to home page
      return;
    }
    
    // Create PaymentIntent as soon as the page loads
    setIsLoading(true);
    apiRequest("POST", "/api/create-payment-intent", { 
      items: [{ id: productId }], 
      amount: parseFloat(amount)
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      })
      .catch((error) => {
        toast({
          title: "Error creating payment",
          description: error.message || "An error occurred while setting up the payment process.",
          variant: "destructive"
        });
        setIsLoading(false);
      });
  }, [productId, amount]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Unable to initialize payment</h1>
        <p className="mb-6">There was a problem setting up the checkout process. Please try again later.</p>
        <Button onClick={() => setLocation('/')}>Return to Home</Button>
      </div>
    );
  }
  
  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <div className="container mx-auto py-12 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}