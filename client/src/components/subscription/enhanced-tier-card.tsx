
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface TierFeature {
  feature: string;
  value: string | boolean;
  highlight?: boolean;
}

interface EnhancedTierCardProps {
  name: string;
  price: string;
  description: string;
  features: TierFeature[];
  highlight?: boolean;
  buttonText?: string;
  onSelect?: () => void;
}

export function EnhancedTierCard({
  name,
  price,
  description,
  features,
  highlight = false,
  buttonText = "Select Plan",
  onSelect
}: EnhancedTierCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    hover: { 
      y: -10, 
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      transition: { duration: 0.3 }
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      x: 0, 
      transition: { 
        delay: 0.1 + (i * 0.05),
        duration: 0.5
      } 
    })
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`h-full`}
    >
      <Card className={`h-full flex flex-col overflow-hidden relative ${
        highlight ? 'border-primary shadow-lg shadow-primary/20' : ''
      }`}>
        {highlight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
              Popular
            </Badge>
          </motion.div>
        )}
        
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold">{name}</CardTitle>
          <div className="mt-1 flex items-baseline text-3xl font-extrabold">
            {price}
          </div>
          <CardDescription className="mt-2">{description}</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <ul className="space-y-3">
            {features.map((feature, i) => (
              <motion.li 
                key={i}
                custom={i}
                variants={featureVariants}
                initial="hidden"
                animate="visible"
                className={`flex items-start ${
                  feature.feature.startsWith('//') 
                    ? 'mt-4 mb-2 border-t pt-3 font-medium text-primary' 
                    : ''
                }`}
              >
                {!feature.feature.startsWith('//') && (
                  <span className="flex-shrink-0 mr-2 text-primary">
                    <Check size={18} />
                  </span>
                )}
                <span className={`${feature.highlight ? 'text-primary font-medium' : ''}`}>
                  {feature.feature.startsWith('//') 
                    ? feature.feature.substring(3) 
                    : feature.feature}
                  {typeof feature.value === 'string' && feature.feature !== '// Character Development' && 
                   feature.feature !== '// Series Architecture' && 
                   feature.feature !== '// World-Building' && 
                   feature.feature !== '// Productivity' && 
                   feature.feature !== '// AI Assistant' && 
                   feature.feature !== '// Platform & Support' && (
                    <span className="ml-1 text-muted-foreground text-sm">
                      ({feature.value})
                    </span>
                  )}
                </span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={onSelect} 
            className={`w-full ${highlight ? 'bg-primary hover:bg-primary/90' : ''}`}
          >
            {buttonText}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
