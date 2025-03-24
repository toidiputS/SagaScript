import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Character } from "@shared/schema";
import { AICharacterImage } from "./ai-character-image";

// Placeholder for TooltipHelper component -  You'll need to implement this
const TooltipHelper = ({ content, side }: { content: string; side: string }) => (
  <span title={content} className={`tooltip-${side}`}>{/* Custom styling needed */}</span>
);


interface CharacterFormProps {
  onSubmit: (data: Omit<Character, "id" | "createdAt" | "updatedAt">) => void;
  isSubmitting?: boolean;
  initialData?: Partial<Character>;
  mode?: "create" | "edit";
}

export default function CharacterForm({
  onSubmit,
  isSubmitting = false,
  initialData = {},
  mode = "create"
}: CharacterFormProps) {
  const [formData, setFormData] = useState<Partial<Character>>({
    name: "",
    role: "supporting",
    age: "",
    occupation: "",
    status: "alive",
    description: "",
    appearance: "",
    personality: "",
    goals: "",
    backstory: "",
    bookAppearances: [],
    isProtagonist: false,
    avatar: "",
    ...initialData
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      return; // Form validation - name is required
    }

    // Pass the form data to parent
    onSubmit(formData as Omit<Character, "id" | "createdAt" | "updatedAt">);
  };

  // Handle book appearance changes
  const handleBookAppearanceChange = (bookNumber: number, checked: boolean) => {
    // Convert from Json type to proper array and ensure it's an array
    const currentAppearances = Array.isArray(formData.bookAppearances) 
      ? [...formData.bookAppearances] 
      : [];

    if (checked && !currentAppearances.includes(bookNumber)) {
      setFormData({
        ...formData,
        bookAppearances: [...currentAppearances, bookNumber].sort((a, b) => a - b)
      });
    } else if (!checked && currentAppearances.includes(bookNumber)) {
      setFormData({
        ...formData,
        bookAppearances: currentAppearances.filter(num => num !== bookNumber)
      });
    }
  };

  // Check if a book is in the appearances array
  const isBookInAppearances = (bookNumber: number) => {
    // Ensure bookAppearances is treated as an array
    const appearances = Array.isArray(formData.bookAppearances) 
      ? formData.bookAppearances 
      : [];
    return appearances.includes(bookNumber);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Character name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              value={formData.age || ""}
              onChange={(e) => setFormData({...formData, age: e.target.value})}
              placeholder="Character age"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status || "alive"}
              onValueChange={(value) => setFormData({...formData, status: value})}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alive">Alive</SelectItem>
                <SelectItem value="deceased">Deceased</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar</Label>
            <div className="relative w-80 h-80"> {/*Larger Avatar Box*/}
              <AICharacterImage description={formData.description || ''} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role || "supporting"}
              onValueChange={(value) => setFormData({...formData, role: value})}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="protagonist">Protagonist</SelectItem>
                <SelectItem value="antagonist">Antagonist</SelectItem>
                <SelectItem value="supporting">Supporting</SelectItem>
                <SelectItem value="mentor">Mentor</SelectItem>
                <SelectItem value="comic_relief">Comic Relief</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              value={formData.occupation || ""}
              onChange={(e) => setFormData({...formData, occupation: e.target.value})}
              placeholder="Character occupation"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
          <Checkbox 
            id="isProtagonist" 
            checked={formData.isProtagonist}
            onCheckedChange={(checked) => setFormData({...formData, isProtagonist: checked as boolean})}
          />
          <Label htmlFor="isProtagonist">Main character</Label>
        </div>


      {/* Book Appearances */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Book Appearances</h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((bookNum) => (
            <div key={bookNum} className="flex items-center space-x-2">
              <Checkbox 
                id={`book-${bookNum}`} 
                checked={isBookInAppearances(bookNum)}
                onCheckedChange={(checked) => handleBookAppearanceChange(bookNum, checked as boolean)}
              />
              <Label htmlFor={`book-${bookNum}`}>Book {bookNum}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Character Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Character Details</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="General description of the character"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appearance">Physical Appearance</Label>
            <Textarea
              id="appearance"
              value={formData.appearance || ""}
              onChange={(e) => setFormData({...formData, appearance: e.target.value})}
              placeholder="Notable physical characteristics"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center mb-1">
              <Label htmlFor="personality">Personality</Label>
              <TooltipHelper 
                content="Describe your character's traits, habits, quirks, strengths, and flaws. What makes them unique or memorable?"
                side="right"
              />
            </div>
            <Textarea
              id="personality"
              value={formData.personality || ""}
              onChange={(e) => setFormData({...formData, personality: e.target.value})}
              placeholder="Character's personality traits"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Goals & Motivations</Label>
            <Textarea
              id="goals"
              value={formData.goals || ""}
              onChange={(e) => setFormData({...formData, goals: e.target.value})}
              placeholder="What drives this character?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center mb-1">
              <Label htmlFor="backstory">Backstory</Label>
              <TooltipHelper 
                content="Detail the character's history before your story begins. What events shaped them? What secrets do they keep?"
                side="right"
              />
            </div>
            <Textarea
              id="backstory"
              value={formData.backstory || ""}
              onChange={(e) => setFormData({...formData, backstory: e.target.value})}
              placeholder="Character's history and background"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Submit buttons */}
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "create" ? "Creating..." : "Updating..."
            : mode === "create" ? "Create Character" : "Update Character"
          }
        </Button>
      </div>
    </form>
  );
}