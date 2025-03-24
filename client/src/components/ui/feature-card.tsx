
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className = '' }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`feature-card ${className}`}
    >
      <Card className="h-full overflow-hidden relative bg-primary/10 border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-start space-x-4">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="feature-icon absolute inset-0 flex items-center justify-center text-primary text-2xl">
                {icon}
              </div>
              <div className="backup-icon absolute inset-0 flex items-center justify-center text-primary text-2xl">
                {icon}
              </div>
            </div>
            <div>
              <CardTitle className="text-xl text-primary font-medium">{title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm text-foreground/80">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}
