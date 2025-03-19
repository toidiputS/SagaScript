import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Location } from "@shared/schema";

interface LocationFormProps {
  onSubmit: (data: Omit<Location, "id" | "createdAt" | "updatedAt">) => void;
  isSubmitting?: boolean;
  initialData?: Partial<Location>;
  mode?: "create" | "edit";
}

export default function LocationForm({
  onSubmit,
  isSubmitting = false,
  initialData = {},
  mode = "create"
}: LocationFormProps) {
  // Initialize form data with defaults or initial data
  const [formData, setFormData] = useState<Partial<Location>>({
    name: "",
    locationType: "general",
    description: "",
    importance: "secondary",
    mapCoordinates: null,
    bookAppearances: [],
    image: "",
    ...initialData
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      return; // Form validation - name is required
    }
    
    // Pass the form data to parent
    onSubmit(formData as Omit<Location, "id" | "createdAt" | "updatedAt">);
  };

  // Handle book appearance changes
  const handleBookAppearanceChange = (bookNumber: number, checked: boolean) => {
    const currentAppearances = [...(formData.bookAppearances as number[] || [])];
    
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
    return (formData.bookAppearances as number[] || []).includes(bookNumber);
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
              placeholder="Location name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="locationType">Location Type</Label>
            <Select
              value={formData.locationType || "general"}
              onValueChange={(value) => setFormData({...formData, locationType: value})}
            >
              <SelectTrigger id="locationType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="town">Town</SelectItem>
                <SelectItem value="village">Village</SelectItem>
                <SelectItem value="castle">Castle/Fortress</SelectItem>
                <SelectItem value="forest">Forest/Jungle</SelectItem>
                <SelectItem value="mountain">Mountain/Range</SelectItem>
                <SelectItem value="ocean">Ocean/Sea</SelectItem>
                <SelectItem value="river">River/Lake</SelectItem>
                <SelectItem value="desert">Desert</SelectItem>
                <SelectItem value="island">Island</SelectItem>
                <SelectItem value="cave">Cave/Dungeon</SelectItem>
                <SelectItem value="ruins">Ruins</SelectItem>
                <SelectItem value="general">General Location</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="importance">Importance</Label>
            <Select
              value={formData.importance || "secondary"}
              onValueChange={(value) => setFormData({...formData, importance: value})}
            >
              <SelectTrigger id="importance">
                <SelectValue placeholder="Select importance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Main Setting</SelectItem>
                <SelectItem value="secondary">Secondary Location</SelectItem>
                <SelectItem value="minor">Minor Mention</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={formData.image || ""}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              placeholder="URL to location image"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Describe this location"
            rows={4}
          />
        </div>
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

      {/* Map coordinates section - note: actual placement happens on the map view */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Map Information</h3>
        
        <div className="text-sm text-neutral-600">
          {formData.mapCoordinates ? (
            <p className="flex items-center">
              <i className="ri-map-pin-fill text-primary mr-2"></i>
              This location is placed on the map. You can reposition it by using the "Place on Map" button in the map view.
            </p>
          ) : (
            <p className="flex items-center">
              <i className="ri-map-pin-line text-neutral-500 mr-2"></i>
              This location is not yet placed on the map. Use the dropdown in the map view to place it.
            </p>
          )}
        </div>
      </div>

      {/* Submit buttons */}
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "create" ? "Creating..." : "Updating..."
            : mode === "create" ? "Create Location" : "Update Location"
          }
        </Button>
      </div>
    </form>
  );
}
