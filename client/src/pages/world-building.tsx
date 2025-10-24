import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { PlusIcon, MapPinIcon, SearchIcon, MapIcon, Settings2 } from "lucide-react";
import { DirectMapGenerator } from "@/components/map-generator/direct-map-generator";

export default function WorldBuilding() {
  const { user } = useAuth();
  const [selectedSeries, setSelectedSeries] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("atlas");
  const [showMapDialog, setShowMapDialog] = useState(false);

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
                <div className="flex gap-3 justify-center">
                  {[
                    { value: 'atlas', label: 'Atlas', icon: MapIcon },
                    { value: 'list', label: 'List', icon: Settings2 }
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`
                          rounded-[30px] px-6 py-3 text-sm font-medium transition-all duration-300 flex items-center gap-2
                          ${activeTab === tab.value 
                            ? 'bg-primary text-primary-foreground shadow-[10px_10px_20px_rgba(33,150,243,0.2),-10px_-10px_20px_rgba(66,165,245,0.15)] hover:shadow-[15px_15px_25px_rgba(33,150,243,0.25),-15px_-15px_25px_rgba(66,165,245,0.2)]' 
                            : 'bg-card text-card-foreground shadow-[10px_10px_20px_rgba(33,150,243,0.12),-10px_-10px_20px_rgba(66,165,245,0.08)] hover:shadow-[15px_15px_25px_rgba(33,150,243,0.18),-15px_-15px_25px_rgba(66,165,245,0.12)]'
                          }
                          border-0 hover:scale-105
                        `}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Content based on selection */}
          {!selectedSeries ? (
            <div className="rounded-[30px] bg-card text-card-foreground shadow-[15px_15px_30px_rgba(59,130,246,0.15),-15px_-15px_30px_rgba(147,197,253,0.1)] hover:shadow-[20px_20px_40px_rgba(59,130,246,0.2),-20px_-20px_40px_rgba(147,197,253,0.15)] transition-shadow duration-300 p-8 text-center">
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
                <>
                  {/* World Map Section with Map Generator Button */}
                  <Card className="mb-8">
                    <CardHeader className="flex flex-row items-center justify-between bg-primary text-primary-foreground rounded-t-lg">
                      <CardTitle className="flex items-center">
                        <MapIcon className="h-5 w-5 mr-2" />
                        World Map
                      </CardTitle>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => setShowMapDialog(true)}
                      >
                        Generate Fantasy Map
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="relative w-full min-h-[300px] flex items-center justify-center p-6">
                        {/* This is where the current world map would be displayed */}
                        <div className="text-center p-8 border-2 border-dashed rounded-lg w-full h-full flex flex-col items-center justify-center">
                          <MapIcon className="h-16 w-16 mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground max-w-md mx-auto">
                            No map has been created for this series yet. 
                            Click the "Generate Fantasy Map" button above to create a custom map for your world.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Map Generator Dialog */}
                  <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Fantasy Map Generator</DialogTitle>
                      </DialogHeader>
                      {selectedSeries && (
                        <DirectMapGenerator seriesId={selectedSeries} />
                      )}
                    </DialogContent>
                  </Dialog>

                  {/* Location Cards Section */}
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Series Locations</h3>
                      <Button 
                        size="sm" 
                        variant="outline"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Location
                      </Button>
                    </div>

                    <div className="rounded-[30px] bg-card text-card-foreground shadow-[15px_15px_30px_rgba(59,130,246,0.15),-15px_-15px_30px_rgba(147,197,253,0.1)] hover:shadow-[20px_20px_40px_rgba(59,130,246,0.2),-20px_-20px_40px_rgba(147,197,253,0.15)] transition-shadow duration-300 p-8 text-center">
                      <MapPinIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="text-lg font-semibold mb-2">No Locations Found</h3>
                      <p className="text-muted-foreground mb-6">
                        This series doesn't have any locations yet.
                      </p>
                      <Button>
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Location
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* List View - Shown when List tab is active */}
              {activeTab === "list" && (
                <div className="rounded-[30px] bg-card text-card-foreground shadow-[15px_15px_30px_rgba(59,130,246,0.15),-15px_-15px_30px_rgba(147,197,253,0.1)] hover:shadow-[20px_20px_40px_rgba(59,130,246,0.2),-20px_-20px_40px_rgba(147,197,253,0.15)] transition-shadow duration-300 p-8 text-center">
                  <MapPinIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Location List View</h3>
                  <p className="text-muted-foreground mb-6">
                    This is the list view for managing your locations.
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