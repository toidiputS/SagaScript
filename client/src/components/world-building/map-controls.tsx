
import React from 'react';
import { Edit, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapControlsProps {
  onEditClick: () => void;
  onFullscreenClick: () => void;
}

export function MapControls({ onEditClick, onFullscreenClick }: MapControlsProps) {
  return (
    <div className="absolute top-4 right-4 flex gap-2 z-10">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onEditClick} 
        className="bg-slate-800/70 hover:bg-slate-700 text-white"
        title="Edit Map"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onFullscreenClick} 
        className="bg-slate-800/70 hover:bg-slate-700 text-white"
        title="Fullscreen"
      >
        <Maximize className="h-4 w-4" />
      </Button>
    </div>
  );
}
