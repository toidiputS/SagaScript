import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface AvatarUploadProps {
  currentAvatar?: string;
  displayName: string;
  onUpload: (file: File) => void;
  isUploading?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function AvatarUpload({
  currentAvatar,
  displayName,
  onUpload,
  isUploading = false,
  className = "",
  size = "md",
}: AvatarUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24", 
    lg: "w-32 h-32",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, GIF, etc.)",
        variant: "destructive",
      });
      return false;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const resizeImage = (file: File, maxWidth: number = 400, maxHeight: number = 400, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and resize image
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    if (!validateFile(file)) return;

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);

      // Resize image
      const resizedFile = await resizeImage(file);
      
      // Upload resized file
      onUpload(resizedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error processing image",
        description: "Failed to process the selected image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div
        className={`relative cursor-pointer group ${
          isDragOver ? 'ring-4 ring-primary ring-opacity-50' : ''
        }`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Avatar className={`${sizeClasses[size]} border-4 border-background shadow-lg`}>
          <AvatarImage 
            src={previewUrl || currentAvatar} 
            alt={`${displayName}'s avatar`}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        
        {/* Upload Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          {isUploading ? (
            <i className="ri-loader-line text-white text-xl animate-spin" />
          ) : (
            <div className="text-center">
              <i className="ri-camera-line text-white text-xl mb-1" />
              <p className="text-white text-xs">
                {currentAvatar ? 'Change' : 'Upload'}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Drag and Drop Hint */}
      {isDragOver && (
        <div className="absolute inset-0 border-2 border-dashed border-primary rounded-full bg-primary/10 flex items-center justify-center">
          <p className="text-primary text-sm font-medium">Drop image here</p>
        </div>
      )}
    </div>
  );
}

// Standalone upload button component
interface AvatarUploadButtonProps {
  onUpload: (file: File) => void;
  isUploading?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export function AvatarUploadButton({
  onUpload,
  isUploading = false,
  variant = "outline",
  size = "sm",
}: AvatarUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return false;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onUpload(file);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isUploading}
      >
        {isUploading ? (
          <i className="ri-loader-line mr-2 animate-spin" />
        ) : (
          <i className="ri-upload-line mr-2" />
        )}
        {isUploading ? 'Uploading...' : 'Upload Avatar'}
      </Button>
    </>
  );
}