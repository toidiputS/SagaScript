
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Minimize, Maximize } from "lucide-react";

export default function FloatingNotes() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('widget-notes');
    return saved || '';
  });

  useEffect(() => {
    localStorage.setItem('widget-notes', notes);
  }, [notes]);

  if (isMinimized) {
    return (
      <Button
        className="fixed bottom-4 right-4 z-50 shadow-lg"
        onClick={() => setIsMinimized(false)}
      >
        <Maximize className="h-4 w-4 mr-2" />
        Quick Notes
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <div className="flex items-center justify-between p-2 border-b">
        <span className="text-sm font-medium">Quick Notes Widget</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsMinimized(true)}
          >
            <Minimize className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsMinimized(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-3">
        <Textarea
          placeholder="Quick thoughts..."
          className="min-h-[150px] resize-none"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </Card>
  );
}
