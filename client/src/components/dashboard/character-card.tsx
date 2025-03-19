import React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CharacterCardProps = {
  character: any;
};

export default function CharacterCard({ character }: CharacterCardProps) {
  // Determine background and icon color based on character role
  const getRoleStyles = (role: string) => {
    switch (role) {
      case 'protagonist':
        return { bg: 'bg-primary/10', textColor: 'text-primary' };
      case 'antagonist':
        return { bg: 'bg-accent/10', textColor: 'text-accent' };
      default:
        return { bg: 'bg-neutral-100', textColor: 'text-neutral-600' };
    }
  };

  const roleStyles = getRoleStyles(character.role);
  
  // Format completeness label
  const getCompletenessLabel = (completeness: number) => {
    if (completeness >= 80) return "Complete";
    if (completeness >= 50) return "In Progress";
    return "Basic Info";
  };

  // Get completeness label styles
  const getCompletenessStyles = (completeness: number) => {
    if (completeness >= 80) return "bg-secondary/10 text-secondary";
    if (completeness >= 50) return "bg-accent/10 text-accent";
    return "bg-neutral-100 text-neutral-600";
  };

  const completenessLabel = getCompletenessLabel(character.completeness);
  const completenessStyles = getCompletenessStyles(character.completeness);

  return (
    <div className="bg-white rounded-lg shadow-card border border-neutral-200 p-4 flex items-center hover:border-primary/50 transition-colors">
      <div className={`h-14 w-14 rounded-full ${roleStyles.bg} flex items-center justify-center ${roleStyles.textColor} mr-4 flex-shrink-0`}>
        {character.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-neutral-900">{character.name}</h3>
            <p className="text-sm text-neutral-500">
              {character.role.charAt(0).toUpperCase() + character.role.slice(1)}
              {character.occupation ? ` • ${character.occupation}` : ''}
            </p>
          </div>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${completenessStyles}`}>
              {completenessLabel}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm">
          {character.bookAppearances && character.bookAppearances.length > 0 ? (
            <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-600 mr-2">
              {character.bookAppearances.length === 1 
                ? `Book ${character.bookAppearances[0]}` 
                : `Books ${character.bookAppearances.join(', ')}`}
            </span>
          ) : (
            <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-600 mr-2">
              No books assigned
            </span>
          )}
          <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full text-primary mr-2">
            {character.arcs} {character.arcs === 1 ? 'Arc' : 'Arcs'}
          </span>
        </div>
      </div>
    </div>
  );
}
