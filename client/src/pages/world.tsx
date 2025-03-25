import { useState } from "react";
import { useSeries } from "@/hooks/use-series";
import { useWorld } from "@/hooks/use-world";
import { useToast } from "@/hooks/use-toast";
import LocationCard from "@/components/world/location-card";
import LocationForm from "@/components/world/location-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Location } from "@shared/schema";

export default function WorldPage() {
  const { toast } = useToast();
  const { allSeries, currentSeries, changeCurrentSeries } = useSeries();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddLocationDialogOpen, setIsAddLocationDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("locations");
  
  // Use world hook with current series ID
  const { 
    locations, 
    isLoadingLocations, 
    addLocation,
    isAddingLocation
  } = useWorld(currentSeries?.id);

  // Filter locations based on search query
  const filteredLocations = locations?.filter(location => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle series selection change
  const handleSeriesChange = (seriesId: string) => {
    changeCurrentSeries(parseInt(seriesId));
  };

  // Handle location creation
  const handleAddLocation = (locationData: Omit<Location, "id" | "createdAt" | "updatedAt">) => {
    if (!currentSeries) {
      toast({
        title: "No series selected",
        description: "Please select a series first",
        variant: "destructive",
      });
      return;
    }

    addLocation({
      ...locationData,
      seriesId: currentSeries.id,
    });
    
    setIsAddLocationDialogOpen(false);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* World Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-neutral-800">World Building</h1>
            <p className="text-neutral-600 mt-1">Craft the universe of your series</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
            {allSeries && allSeries.length > 0 && (
              <Select 
                value={currentSeries?.id.toString()} 
                onValueChange={handleSeriesChange}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select series" />
                </SelectTrigger>
                <SelectContent>
                  {allSeries.map((series) => (
                    <SelectItem key={series.id} value={series.id.toString()}>
                      {series.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Dialog 
              open={isAddLocationDialogOpen} 
              onOpenChange={setIsAddLocationDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-dark text-white">
                  <i className="ri-add-line mr-2"></i>
                  <span>New Element</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Location</DialogTitle>
                </DialogHeader>
                <LocationForm 
                  onSubmit={handleAddLocation} 
                  isSubmitting={isAddingLocation}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-neutral-200 mb-6">
          <Tabs defaultValue="locations" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex overflow-x-auto pb-1 hide-scrollbar">
              <TabsTrigger value="locations" className="px-4 py-2 whitespace-nowrap">Locations</TabsTrigger>
              <TabsTrigger value="cultures" className="px-4 py-2 whitespace-nowrap">Cultures</TabsTrigger>
              <TabsTrigger value="magic" className="px-4 py-2 whitespace-nowrap">Magic Systems</TabsTrigger>
              <TabsTrigger value="flora" className="px-4 py-2 whitespace-nowrap">Flora & Fauna</TabsTrigger>
              <TabsTrigger value="technology" className="px-4 py-2 whitespace-nowrap">Technology</TabsTrigger>
              <TabsTrigger value="politics" className="px-4 py-2 whitespace-nowrap">Politics</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* World Map - removed as requested */}

        {/* Search bar - only show for locations */}
        {activeTab === "locations" && (
          <div className="mb-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search locations..."
                className="pl-10 pr-4 py-2 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-neutral-400">
                <i className="ri-search-line"></i>
              </div>
            </div>
          </div>
        )}

        {/* Locations Grid - only show for locations tab */}
        {activeTab === "locations" && (
          <>
            {!currentSeries ? (
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
                <div className="text-neutral-500 mb-4">
                  <i className="ri-map-pin-line text-4xl"></i>
                </div>
                <h3 className="text-lg font-medium mb-2">No Series Selected</h3>
                <p className="text-neutral-600 mb-4">Please select a series to manage its locations</p>
              </div>
            ) : isLoadingLocations ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredLocations && filteredLocations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredLocations.map((location) => (
                  <LocationCard 
                    key={location.id} 
                    location={location} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
                <div className="text-neutral-500 mb-4">
                  <i className="ri-map-pin-line text-4xl"></i>
                </div>
                <h3 className="text-lg font-medium mb-2">No Locations Found</h3>
                <p className="text-neutral-600 mb-4">
                  {searchQuery 
                    ? "No locations match your search criteria" 
                    : "No locations in this series yet"}
                </p>
                <Button 
                  onClick={() => setIsAddLocationDialogOpen(true)}
                  className="bg-primary hover:bg-primary-dark text-white"
                >
                  <i className="ri-add-line mr-2"></i> Create Location
                </Button>
              </div>
            )}
          </>
        )}

        {/* Other tabs - placeholder content */}
        {activeTab !== "locations" && (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
            <div className="text-neutral-500 mb-4">
              <i className="ri-tools-line text-4xl"></i>
            </div>
            <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
            <p className="text-neutral-600 mb-4">
              This feature is currently under development. Please check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
