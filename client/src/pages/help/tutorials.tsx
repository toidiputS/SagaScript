
import React from 'react';
import { NextPage } from 'next';
import Layout from '@/components/layout/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, PenTool, Users, Book } from 'lucide-react';

const TutorialsPage: NextPage = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Tutorials</h1>
        <p className="text-muted-foreground mb-8">Learn how to use Saga Scribe with step-by-step tutorials</p>
        
        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="writing">Writing</TabsTrigger>
            <TabsTrigger value="worldbuilding">Worldbuilding</TabsTrigger>
            <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="getting-started" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <div>
                    <CardTitle>Creating Your First Series</CardTitle>
                    <CardDescription>Learn how to set up your first book series</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>This tutorial walks you through the process of creating your first series, setting up books within it, and organizing your content effectively.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Book className="h-5 w-5" />
                  <div>
                    <CardTitle>Navigating the Dashboard</CardTitle>
                    <CardDescription>Get familiar with the Saga Scribe interface</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>Learn how to navigate through the various sections of Saga Scribe, from the writing editor to character sheets and worldbuilding tools.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="writing" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  <div>
                    <CardTitle>Using the Editor</CardTitle>
                    <CardDescription>Master the writing interface</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>This guide covers all the features of our rich text editor, including formatting, comments, and revision history.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="worldbuilding" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  <div>
                    <CardTitle>Character Development</CardTitle>
                    <CardDescription>Create compelling characters</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>Learn how to use character sheets, relationship maps, and AI suggestions to create deep, consistent characters.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="collaboration" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Users className="h-5 w-5" />
                  <div>
                    <CardTitle>Inviting Collaborators</CardTitle>
                    <CardDescription>Work with co-authors and editors</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>This tutorial shows you how to invite others to collaborate on your series, set permissions, and manage the collaborative workflow.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TutorialsPage;
