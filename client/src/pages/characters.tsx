import { useState } from "react";
import { useSeries } from "@/hooks/use-series";
import { useCharacters } from "@/hooks/use-characters";
import { useToast } from "@/hooks/use-toast";
import CharacterCard from "@/components/characters/character-card";
import CharacterForm from "@/components/characters/character-form";
import RelationshipMap from "@/components/characters/relationship-map";
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
import { type Character } from "@shared/schema";

export default function CharactersPage() {
  const { toast } = useToast();
  const { allSeries, currentSeries, changeCurrentSeries } = useSeries();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddCharacterDialogOpen, setIsAddCharacterDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("main");
  const [relationshipMapZoom, setRelationshipMapZoom] = useState(1);
  
  // Use characters hook with current series ID
  const { 
    characters, 
    isLoadingCharacters, 
    addCharacter,
    isAddingCharacter
  } = useCharacters(currentSeries?.id);

  // Filter characters based on search query and active tab
  const filteredCharacters = characters?.filter(character => {
    const matchesSearch = character.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "main") {
      return matchesSearch && character.isProtagonist;
    } else if (activeTab === "supporting") {
      return matchesSearch && !character.isProtagonist && character.role !== "minor";
    } else if (activeTab === "minor") {
      return matchesSearch && character.role === "minor";
    }
    
    return matchesSearch;
  });

  // Handle series selection change
  const handleSeriesChange = (seriesId: string) => {
    changeCurrentSeries(parseInt(seriesId));
  };

  // Handle character creation
  const handleAddCharacter = (characterData: Omit<Character, "id" | "createdAt" | "updatedAt">) => {
    if (!currentSeries) {
      toast({
        title: "No series selected",
        description: "Please select a series first",
        variant: "destructive",
      });
      return;
    }

    // The mutation handler now handles bookAppearances type compatibility
    addCharacter({
      ...characterData,
      seriesId: currentSeries.id,
    });
    
    setIsAddCharacterDialogOpen(false);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Characters Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-neutral-800">Characters</h1>
            <p className="text-neutral-600 mt-1">Manage the people of your literary world</p>
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
            
            <div className="relative">
              <Input
                type="text"
                placeholder="Search characters..."
                className="pl-10 pr-4 py-2 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-neutral-400">
                <i className="ri-search-line"></i>
              </div>
            </div>
            
            <Dialog 
              open={isAddCharacterDialogOpen} 
              onOpenChange={setIsAddCharacterDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-dark text-white">
                  <i className="ri-user-add-line mr-2"></i>
                  <span>New Character</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Character</DialogTitle>
                </DialogHeader>
                <CharacterForm 
                  onSubmit={handleAddCharacter} 
                  isSubmitting={isAddingCharacter}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Character Type Tabs */}
        <div className="border-b border-neutral-200 mb-6">
          <Tabs defaultValue="main" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex">
              <TabsTrigger value="main" className="px-4 py-2">Main Characters</TabsTrigger>
              <TabsTrigger value="supporting" className="px-4 py-2">Supporting Characters</TabsTrigger>
              <TabsTrigger value="minor" className="px-4 py-2">Minor Characters</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Character Grid */}
        {!currentSeries ? (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
            <div className="text-neutral-500 mb-4">
              <i className="ri-user-star-line text-4xl"></i>
            </div>
            <h3 className="text-lg font-medium mb-2">No Series Selected</h3>
            <p className="text-neutral-600 mb-4">Please select a series to manage its characters</p>
          </div>
        ) : isLoadingCharacters ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredCharacters && filteredCharacters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredCharacters.map((character) => (
              <CharacterCard 
                key={character.id} 
                character={character} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
            <div className="text-neutral-500 mb-4">
              <i className="ri-user-star-line text-4xl"></i>
            </div>
            <h3 className="text-lg font-medium mb-2">No Characters Found</h3>
            <p className="text-neutral-600 mb-4">
              {searchQuery 
                ? "No characters match your search criteria" 
                : `No ${activeTab} characters in this series yet`}
            </p>
            <Button 
              onClick={() => setIsAddCharacterDialogOpen(true)}
              className="bg-primary hover:bg-primary-dark text-white"
            >
              <i className="ri-user-add-line mr-2"></i> Create Character
            </Button>
          </div>
        )}

        {/* Character Relationship Map */}
        {currentSeries && characters && characters.length > 0 && (
          <div className="mt-12">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
              <div className="border-b border-neutral-200 px-5 py-4 flex justify-between items-center">
                <h2 className="font-serif font-bold text-lg text-neutral-800">Character Relationship Map</h2>
                <div className="flex space-x-2">
                  <button 
                    className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500"
                    onClick={() => setRelationshipMapZoom(prev => Math.min(prev + 0.2, 2))}
                  >
                    <i className="ri-zoom-in-line"></i>
                  </button>
                  <button 
                    className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500"
                    onClick={() => setRelationshipMapZoom(prev => Math.max(prev - 0.2, 0.5))}
                  >
                    <i className="ri-zoom-out-line"></i>
                  </button>
                  <button 
                    className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500"
                    onClick={() => setRelationshipMapZoom(1)}
                    title="Reset zoom"
                  >
                    <i className="ri-fullscreen-line"></i>
                  </button>
                </div>
              </div>
              <div className="p-0">
                <RelationshipMap 
                  characters={characters} 
                  seriesId={currentSeries.id}
                  initialZoom={relationshipMapZoom}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
