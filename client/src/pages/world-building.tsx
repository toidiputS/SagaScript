import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon, MapPinIcon, SearchIcon, MapIcon, Settings2 } from "lucide-react";
import { UnifiedWorldMap } from '@/components/world-building/unified-world-map';

export default function WorldBuilding() {
  const [selectedSeries, setSelectedSeries] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("atlas");

  // Define types for data
  interface Series {
    id: number;
    title: string;
    description?: string;
  }

  // Fetch all series for the dropdown
  const { data: series, isLoading: isLoadingSeries } = useQuery<Series[]>({
    queryKey: ['/api/series'],
  });

  // Locations data placeholder
  const locations: any[] = [];

  return (
    <div className="bg-background text-foreground font-sans min-h-screen flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 pt-4 md:pt-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <MobileNav />

          {/* Page header */}
          <header className="md:flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">World Building</h1>
              <p className="text-muted-foreground mt-1">Create and manage locations for your series</p>
            </div>
          </header>

          {/* Series Selector */}
          <div className="bg-background rounded-lg shadow-sm border border-border p-4 mb-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="series-select" className="block text-sm font-medium text-foreground mb-1">
                  Select Series
                </label>
                <Select
                  onValueChange={(value) => setSelectedSeries(parseInt(value))}
                  value={selectedSeries?.toString()}
                >
                  <SelectTrigger id="series-select" className="w-full">
                    <SelectValue placeholder="Choose a series" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingSeries ? (
                      <SelectItem value="loading" disabled>Loading series...</SelectItem>
                    ) : series && series.length > 0 ? (
                      series.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No series available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="world-building-tabs" className="block text-sm font-medium text-foreground mb-1">
                  View
                </label>
                <Tabs
                  defaultValue="atlas"
                  className="w-full"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  id="world-building-tabs"
                >
                  <TabsList className="w-full bg-background border border-input">
                    <TabsTrigger
                      value="atlas"
                      className="flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                    >
                      <MapIcon className="h-4 w-4 mr-2" />
                      Atlas
                    </TabsTrigger>
                    <TabsTrigger
                      value="list"
                      className="flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                    >
                      <Settings2 className="h-4 w-4 mr-2" />
                      List
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Content based on selection */}
          {!selectedSeries ? (
            <div className="bg-card rounded-lg shadow-sm border border-border p-8 text-center">
              <MapIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h2 className="text-xl font-semibold mb-2">Select a Series</h2>
              <p className="text-muted-foreground mb-6">
                Choose a series to view and manage its world map and locations.
              </p>
            </div>
          ) : (
            <>
              {/* Map Generator Section - Shown when Atlas tab is active */}
              {activeTab === "atlas" && (
                <div className="mb-6">
                  {/* Prominent Map Generator Title */}
                  <div className="bg-primary text-primary-foreground px-4 py-3 rounded-t-lg shadow-lg mb-0 flex items-center">
                    <MapIcon className="h-6 w-6 mr-2" />
                    <h2 className="text-xl font-bold">Fantasy Map Generator</h2>
                  </div>
                  
                  {/* Map Generator Component */}
                  <div className="border-x border-b border-primary/30 rounded-b-lg mb-8">
                    <UnifiedWorldMap selectedSeries={selectedSeries} />
                  </div>
                </div>
              )}

              {/* List View - Shown when List tab is active */}
              {activeTab === "list" && (
                <div className="bg-card rounded-lg shadow-sm border border-border p-8 text-center">
                  <MapPinIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Location List View</h3>
                  <p className="text-muted-foreground mb-6">
                    This is a simplified placeholder for the locations list view.
                  </p>
                </div>
              )}
            </>
          )}
          
          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-border text-muted-foreground text-sm">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div className="mb-4 md:mb-0">
                <p>© 2023 Saga Scribe - The Ultimate Series Author's Companion</p>
                <p className="mt-1">Version 1.0.0</p>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}