
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function QuickNotes() {
  const [notes, setNotes] = useState<string>(() => {
    const saved = localStorage.getItem('quick-notes');
    return saved || '';
  });

  useEffect(() => {
    localStorage.setItem('quick-notes', notes);
  }, [notes]);

  return (
    <Card className="h-full">
      <CardHeader className="border-b border-neutral-200 px-5 py-4">
        <CardTitle className="font-serif font-bold text-lg text-neutral-800">Quick Notes</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <Textarea
          placeholder="Jot down your quick thoughts here..."
          className="min-h-[200px] resize-none"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex justify-end mt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setNotes('')}
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
