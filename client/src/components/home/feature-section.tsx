
import React from 'react';
import { FeatureCard } from "@/components/ui/feature-card";
import { BookOpen, Users, Globe, Sparkles, Clock, Image } from "lucide-react";

export function FeatureSection() {
  const features = [
    {
      icon: <BookOpen />,
      title: "Series Architecture",
      description: "Build complex series with interconnected plots and timelines"
    },
    {
      icon: <Users />,
      title: "Character Evolution",
      description: "Track character growth, relationships, and development arcs"
    },
    {
      icon: <Globe />,
      title: "World-Building",
      description: "Create immersive worlds with detailed cultures, maps and histories"
    },
    {
      icon: <Sparkles />,
      title: "AI Writing Assistant",
      description: "Get intelligent suggestions for plot, character, and dialogue"
    },
    {
      icon: <Clock />,
      title: "Productivity Tools",
      description: "Set goals, track progress, and maintain writing streaks"
    },
    {
      icon: <Image />,
      title: "Multimedia Integration",
      description: "Add images, maps, and audio to enhance your worlds"
    }
  ];

  return (
    <section className="py-12 px-4 md:py-24">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Powerful Features for Creative Writers</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
