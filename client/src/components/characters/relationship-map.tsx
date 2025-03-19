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

export default function RelationshipMap({ characters, seriesId }: RelationshipMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { relationships, isLoadingRelationships } = useCharacters(seriesId);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAddRelationshipOpen, setIsAddRelationshipOpen] = useState(false);
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
            
            return (
              <line 
                key={relationship.id}
                x1={sourcePos.x}
                y1={sourcePos.y}
                x2={targetPos.x}
                y2={targetPos.y}
                stroke={getRelationshipColor(relationship.relationshipType)}
                strokeWidth="3"
                strokeDasharray={relationship.relationshipType === "conflict" || relationship.relationshipType === "romantic" ? "5,5" : "none"}
              />
            );
          })}
          
          {/* Render character nodes */}
          {characters.map((character, index) => {
            const pos = getCharacterPosition(index, characters.length, 120, 400, 175);
            const isProtagonist = character.isProtagonist;
            
            return (
              <g key={character.id}>
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
                  onValueChange={(value) => setNewRelationship({...newRelationship, source: parseInt(value)})}
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
                  value={newRelationship.target.toString()}
                  onValueChange={(value) => setNewRelationship({...newRelationship, target: parseInt(value)})}
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
    </div>
  );
}
