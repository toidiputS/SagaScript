import { useEffect, useRef, useState } from "react";
import { useCharacters } from "@/hooks/use-characters";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Character, CharacterRelationship } from "@shared/schema";

interface RelationshipMapProps {
  characters: Character[];
  seriesId: number;
  initialZoom?: number;
}

// Type for relationship connection data
interface ConnectionData {
  source: number;
  target: number;
  type: string;
  description?: string;
}

const relationshipTypes = [
  { value: "ally", label: "Ally", color: "#B4C6FC" },
  { value: "enemy", label: "Enemy", color: "#FCA5A5" },
  { value: "family", label: "Family", color: "#86EFAC" },
  { value: "romantic", label: "Romantic", color: "#818CF8" },
  { value: "conflict", label: "Conflict", color: "#F87171" },
  { value: "mentor", label: "Mentor", color: "#FAC858" },
  { value: "professional", label: "Professional", color: "#60A5FA" },
];

export default function RelationshipMap({ characters, seriesId, initialZoom = 1 }: RelationshipMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { relationships, isLoadingRelationships } = useCharacters(seriesId);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  const [isAddRelationshipOpen, setIsAddRelationshipOpen] = useState(false);
  const [isCharacterDialogOpen, setIsCharacterDialogOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [hoveredRelationship, setHoveredRelationship] = useState<CharacterRelationship | null>(null);
  const [newRelationship, setNewRelationship] = useState<ConnectionData>({
    source: 0,
    target: 0,
    type: "ally",
    description: "",
  });
  
  // Create a mapping of character IDs to positions in a circle
  const getCharacterPosition = (index: number, total: number, radius: number, centerX: number, centerY: number) => {
    const angle = (index / total) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y };
  };

  // Create new relationship mutation
  const addRelationshipMutation = useMutation({
    mutationFn: async (data: {
      sourceCharacterId: number;
      targetCharacterId: number;
      relationshipType: string;
      description?: string;
    }) => {
      const res = await apiRequest("POST", "/api/character-relationships", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', seriesId, 'character-relationships'] });
      setIsAddRelationshipOpen(false);
      toast({
        title: "Relationship added",
        description: "The character relationship has been created",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create relationship",
        variant: "destructive",
      });
    },
  });

  // Get relationship color by type
  const getRelationshipColor = (type: string) => {
    const relation = relationshipTypes.find(r => r.value === type);
    return relation ? relation.color : "#CCCCCC";
  };

  // Handle adding a new relationship
  const handleAddRelationship = () => {
    if (newRelationship.source === newRelationship.target) {
      toast({
        title: "Invalid relationship",
        description: "A character cannot have a relationship with themselves",
        variant: "destructive",
      });
      return;
    }

    addRelationshipMutation.mutate({
      sourceCharacterId: newRelationship.source,
      targetCharacterId: newRelationship.target,
      relationshipType: newRelationship.type,
      description: newRelationship.description,
    });
  };

  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };
  
  // Handle character click to show details
  const handleCharacterClick = (character: Character) => {
    setSelectedCharacter(character);
    setIsCharacterDialogOpen(true);
  };
  
  // Update zoom level when initialZoom prop changes
  useEffect(() => {
    if (initialZoom !== zoomLevel) {
      setZoomLevel(initialZoom);
    }
  }, [initialZoom]);

  return (
    <div className="relative">
      {/* Map container */}
      <div className="p-5 flex justify-center items-center" style={{ height: "400px" }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 800 350"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center" }}
        >
          {/* Render relationships */}
          {relationships && characters.length > 0 && relationships.map((relationship) => {
            const sourceChar = characters.find(c => c.id === relationship.sourceCharacterId);
            const targetChar = characters.find(c => c.id === relationship.targetCharacterId);
            
            if (!sourceChar || !targetChar) return null;
            
            const sourceIndex = characters.findIndex(c => c.id === sourceChar.id);
            const targetIndex = characters.findIndex(c => c.id === targetChar.id);
            
            const sourcePos = getCharacterPosition(sourceIndex, characters.length, 120, 400, 175);
            const targetPos = getCharacterPosition(targetIndex, characters.length, 120, 400, 175);
            
            // Find relationship type display name
            const relationshipType = relationshipTypes.find(r => r.value === relationship.relationshipType);
            
            return (
              <g key={relationship.id}>
                <line 
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke={getRelationshipColor(relationship.relationshipType)}
                  strokeWidth="3"
                  strokeDasharray={relationship.relationshipType === "conflict" || relationship.relationshipType === "romantic" ? "5,5" : "none"}
                  className="cursor-pointer hover:stroke-[5px] transition-all duration-200"
                  onMouseEnter={() => setHoveredRelationship(relationship)}
                  onMouseLeave={() => setHoveredRelationship(null)}
                />
                
                {hoveredRelationship && hoveredRelationship.id === relationship.id && (
                  <g>
                    {/* Relationship tooltip background with shadow */}
                    <filter id={`shadow-${relationship.id}`} x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.15" />
                    </filter>
                    <rect
                      x={(sourcePos.x + targetPos.x) / 2 - 80}
                      y={(sourcePos.y + targetPos.y) / 2 - 30}
                      width="160"
                      height={relationship.description ? "60" : "30"}
                      rx="4"
                      fill="white"
                      stroke="#e5e7eb"
                      filter={`url(#shadow-${relationship.id})`}
                    />
                    <text
                      x={(sourcePos.x + targetPos.x) / 2}
                      y={(sourcePos.y + targetPos.y) / 2 - 10}
                      textAnchor="middle"
                      fill="#374151"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {sourceChar.name} → {targetChar.name}
                    </text>
                    <text
                      x={(sourcePos.x + targetPos.x) / 2}
                      y={(sourcePos.y + targetPos.y) / 2 + 10}
                      textAnchor="middle"
                      fill="#4b5563"
                      fontSize="11"
                    >
                      {relationshipType?.label || relationship.relationshipType}
                    </text>
                    {relationship.description && (
                      <text
                        x={(sourcePos.x + targetPos.x) / 2}
                        y={(sourcePos.y + targetPos.y) / 2 + 30}
                        textAnchor="middle"
                        fill="#6b7280"
                        fontSize="10"
                      >
                        {relationship.description.length > 30 
                          ? relationship.description.substring(0, 30) + "..." 
                          : relationship.description}
                      </text>
                    )}
                  </g>
                )}
              </g>
            );
          })}
          
          {/* Render character nodes */}
          {characters.map((character, index) => {
            const pos = getCharacterPosition(index, characters.length, 120, 400, 175);
            const isProtagonist = character.isProtagonist;
            
            return (
              <g 
                key={character.id}
                onClick={() => handleCharacterClick(character)}
                style={{ cursor: "pointer" }}
                className="character-node"
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isProtagonist ? 40 : 30}
                  fill={isProtagonist ? "#3B82F6" : character.role === "antagonist" ? "#EF4444" : "#4F46E5"}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={isProtagonist ? "14" : "12"}
                  fontWeight="bold"
                >
                  {character.name.split(" ")[0]}
                </text>
              </g>
            );
          })}
          
          {/* Legend */}
          <g transform="translate(20,20)">
            {relationshipTypes.map((type, index) => (
              <g key={type.value} transform={`translate(0,${index * 25})`}>
                <rect width="15" height="15" fill={type.color} />
                <text x="25" y="12" fontSize="12" fill="#6B7280">{type.label}</text>
              </g>
            ))}
          </g>
        </svg>
      </div>
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <button 
          className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 bg-white"
          onClick={handleZoomIn}
        >
          <i className="ri-zoom-in-line"></i>
        </button>
        <button 
          className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 bg-white"
          onClick={handleZoomOut}
        >
          <i className="ri-zoom-out-line"></i>
        </button>
        
        <Dialog open={isAddRelationshipOpen} onOpenChange={setIsAddRelationshipOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <i className="ri-add-line"></i>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Character Relationship</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Source Character</Label>
                <Select
                  value={newRelationship.source.toString()}
                  onValueChange={(value) => {
                    const sourceId = parseInt(value);
                    // Reset target if it's the same as the new source
                    if (sourceId === newRelationship.target) {
                      setNewRelationship({
                        ...newRelationship, 
                        source: sourceId,
                        target: 0
                      });
                    } else {
                      setNewRelationship({...newRelationship, source: sourceId});
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select character" />
                  </SelectTrigger>
                  <SelectContent>
                    {characters.map((character) => (
                      <SelectItem key={character.id} value={character.id.toString()}>
                        {character.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Target Character</Label>
                <Select
                  value={newRelationship.target ? newRelationship.target.toString() : undefined}
                  onValueChange={(value) => setNewRelationship({...newRelationship, target: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select character" />
                  </SelectTrigger>
                  <SelectContent>
                    {characters
                      .filter(character => character.id !== newRelationship.source) // Filter out the source character
                      .map((character) => (
                        <SelectItem key={character.id} value={character.id.toString()}>
                          {character.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Relationship Type</Label>
                <Select
                  value={newRelationship.type}
                  onValueChange={(value) => setNewRelationship({...newRelationship, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship type" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  value={newRelationship.description || ""}
                  onChange={(e) => setNewRelationship({...newRelationship, description: e.target.value})}
                  placeholder="Describe the relationship"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button 
                  onClick={handleAddRelationship} 
                  disabled={addRelationshipMutation.isPending || !newRelationship.source || !newRelationship.target}
                >
                  {addRelationshipMutation.isPending ? "Adding..." : "Add Relationship"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Character Details Dialog */}
      <Dialog open={isCharacterDialogOpen} onOpenChange={setIsCharacterDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedCharacter && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-4">
                  {selectedCharacter.avatar ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img 
                        src={selectedCharacter.avatar} 
                        alt={selectedCharacter.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                      <i className="ri-user-line text-xl"></i>
                    </div>
                  )}
                  <DialogTitle className="text-xl">{selectedCharacter.name}</DialogTitle>
                </div>
                {selectedCharacter.isProtagonist && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Protagonist
                    </span>
                  </div>
                )}
                {selectedCharacter.role === 'antagonist' && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Antagonist
                    </span>
                  </div>
                )}
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-medium text-neutral-500">Role</div>
                  <div className="col-span-2">{selectedCharacter.role || "Not specified"}</div>
                  
                  <div className="font-medium text-neutral-500">Status</div>
                  <div className="col-span-2">{selectedCharacter.status || "Not specified"}</div>
                  
                  <div className="font-medium text-neutral-500">Age</div>
                  <div className="col-span-2">{selectedCharacter.age || "Not specified"}</div>
                  
                  <div className="font-medium text-neutral-500">Occupation</div>
                  <div className="col-span-2">{selectedCharacter.occupation || "Not specified"}</div>
                </div>
                
                {selectedCharacter.description && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-neutral-500 mb-1">Biography</h4>
                    <p className="text-sm">{selectedCharacter.description}</p>
                  </div>
                )}
                
                {selectedCharacter.appearance && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-neutral-500 mb-1">Appearance</h4>
                    <p className="text-sm">{selectedCharacter.appearance}</p>
                  </div>
                )}
                
                {selectedCharacter.personality && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-neutral-500 mb-1">Personality</h4>
                    <p className="text-sm">{selectedCharacter.personality}</p>
                  </div>
                )}
                
                {selectedCharacter.backstory && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-neutral-500 mb-1">Backstory</h4>
                    <p className="text-sm">{selectedCharacter.backstory}</p>
                  </div>
                )}
                
                {selectedCharacter.goals && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-neutral-500 mb-1">Goals</h4>
                    <p className="text-sm">{selectedCharacter.goals}</p>
                  </div>
                )}
                
                <div className="flex justify-end pt-4">
                  <Button onClick={() => setIsCharacterDialogOpen(false)}>Close</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
