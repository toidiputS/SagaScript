
import React from 'react';
import { Edit, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapControlsProps {
  onEditClick: () => void;
  onFullscreenClick: () => void;
  isEditing: boolean;
}

export function MapControls({ onEditClick, onFullscreenClick, isEditing }: MapControlsProps) {
  return (
    <div className="absolute top-2 right-2 flex space-x-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onEditClick}
        title={isEditing ? "Exit Edit Mode" : "Edit Map"}
        className="bg-white/50 hover:bg-white/80"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onFullscreenClick}
        title="Toggle Fullscreen"
        className="bg-white/50 hover:bg-white/80"
      >
        {document.fullscreenElement ? (
          <Minimize className="h-4 w-4" />
        ) : (
          <Maximize className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
