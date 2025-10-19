import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, Camera } from "lucide-react";
import { toast } from "sonner";
import { updateUserAvatar } from "@/lib/userStorage";

interface AvatarUploadProps {
  currentAvatar?: string;
  username: string;
  onAvatarChange: (avatar: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  currentAvatar, 
  username, 
  onAvatarChange 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB");
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64
      const base64 = await convertToBase64(file);
      
      // Update avatar in storage
      const success = updateUserAvatar(base64);
      
      if (success) {
        onAvatarChange(base64);
        toast.success("Avatar updated successfully!");
      } else {
        toast.error("Failed to update avatar");
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAvatar = () => {
    const success = updateUserAvatar('');
    if (success) {
      onAvatarChange('');
      toast.success("Avatar removed");
    } else {
      toast.error("Failed to remove avatar");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24 border-4 border-accent">
          {currentAvatar ? (
            <AvatarImage 
              src={currentAvatar} 
              alt={`${username}'s avatar`}
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="text-2xl font-bold bg-gradient-primary text-primary-foreground">
              {getInitials(username)}
            </AvatarFallback>
          )}
        </Avatar>
        
        {/* Upload overlay */}
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
             onClick={() => fileInputRef.current?.click()}>
          <Camera className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
        
        {currentAvatar && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveAvatar}
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
            Remove
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground text-center max-w-48">
        Upload a profile picture. Max size: 2MB. Supported formats: JPG, PNG, GIF
      </p>
    </div>
  );
};

export default AvatarUpload;



