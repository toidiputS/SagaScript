import { useState } from "react";
import { useSeries } from "@/hooks/use-series";
import { useWorld } from "@/hooks/use-world";
import { useToast } from "@/hooks/use-toast";
import LocationCard from "@/components/world/location-card";
import LocationForm from "@/components/world/location-form";
import WorldMap from "@/components/world/world-map";
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

  const { 
    locations, 
    isLoadingLocations, 
    addLocation,
    isAddingLocation
  } = useWorld(currentSeries?.id);

  const filteredLocations = locations?.filter(location => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSeriesChange = (seriesId: string) => {
    changeCurrentSeries(parseInt(seriesId));
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
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
                  <span>Add Location</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Location</DialogTitle>
                </DialogHeader>
                <LocationForm 
                  onSubmit={async (data) => {
                    if (!currentSeries) return;
                    try {
                      await addLocation(data);
                      setIsAddLocationDialogOpen(false);
                      toast({
                        title: "Success",
                        description: "Location added successfully",
                      });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to add location",
                        variant: "destructive",
                      });
                    }
                  }}
                  isLoading={isAddingLocation}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-6">
          <Input
            type="search"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="locations">List View</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>

            <TabsContent value="locations" className="mt-6">
              {isLoadingLocations ? (
                <div>Loading locations...</div>
              ) : filteredLocations && filteredLocations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLocations.map((location) => (
                    <LocationCard key={location.id} location={location} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-neutral-600">No locations found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="map" className="mt-6">
              {currentSeries && locations && (
                <WorldMap 
                  locations={locations} 
                  seriesId={currentSeries.id} 
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}