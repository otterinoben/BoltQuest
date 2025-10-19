import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Camera, 
  Zap, 
  Target, 
  Trophy, 
  Brain,
  TrendingUp,
  DollarSign,
  Megaphone,
  Settings,
  CheckCircle2,
  X
} from "lucide-react";
import { toast } from "sonner";
import { createUserProfile, saveUserProfile, updateUserProfile, getUserProfile } from "@/lib/userStorage";
import { Category } from "@/types/game";
import { BaselineAssessment } from './onboarding/BaselineAssessment';
import { BaselineResults, saveBaselineResults, initializeDefaultElo } from '@/lib/baselineAssessment';

interface SimpleUserSetupProps {
  onComplete: () => void;
}

const AVATAR_COLORS = [
  { name: "Custom Upload", value: "custom", bg: "bg-gradient-to-br from-gray-100 to-gray-200", icon: "📷" },
  { name: "Blue", value: "#3b82f6", bg: "bg-blue-500" },
  { name: "Green", value: "#10b981", bg: "bg-emerald-500" },
  { name: "Purple", value: "#8b5cf6", bg: "bg-violet-500" },
  { name: "Red", value: "#ef4444", bg: "bg-red-500" },
  { name: "Orange", value: "#f97316", bg: "bg-orange-500" },
  { name: "Pink", value: "#ec4899", bg: "bg-pink-500" },
];

const INTERESTS: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: "tech", label: "Technology", icon: <Settings className="h-4 w-4" /> },
  { id: "business", label: "Business", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "marketing", label: "Marketing", icon: <Megaphone className="h-4 w-4" /> },
  { id: "finance", label: "Finance", icon: <DollarSign className="h-4 w-4" /> },
];

const SimpleUserSetup: React.FC<SimpleUserSetupProps> = ({ onComplete }) => {
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_COLORS[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<Category[]>([]);
  const [customInterests, setCustomInterests] = useState<string[]>([]);
  const [newCustomInterest, setNewCustomInterest] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [userId, setUserId] = useState<string>("");

  const handleInterestToggle = (interest: Category) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleAddCustomInterest = () => {
    const trimmed = newCustomInterest.trim();
    if (trimmed && !customInterests.includes(trimmed)) {
      setCustomInterests(prev => [...prev, trimmed]);
      setNewCustomInterest("");
    }
  };

  const handleRemoveCustomInterest = (interest: string) => {
    setCustomInterests(prev => prev.filter(i => i !== interest));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomInterest();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomImage(result);
        setSelectedAvatar(AVATAR_COLORS[0]); // Set to custom upload option
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAssessmentComplete = (results: BaselineResults) => {
    saveBaselineResults(userId, results);
    toast.success("Assessment complete!", {
      description: `Welcome to BoltQuest! Your starting ELO: ${Math.round(Object.values(results.recommendedElo).reduce((sum, elo) => sum + elo, 0) / Object.values(results.recommendedElo).length)}`
    });
    onComplete();
  };

  const handleAssessmentSkip = () => {
    initializeDefaultElo(userId, selectedInterests);
    toast.success("Welcome to BoltQuest!", {
      description: "You can take the assessment anytime from settings."
    });
    onComplete();
  };

  const handleSubmit = async () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    if (selectedInterests.length === 0 && customInterests.length === 0) {
      toast.error("Please select at least one interest or add custom interests");
      return;
    }

    setIsLoading(true);
    
    try {
      // Create user profile with just username first
      const userProfile = createUserProfile(username.trim());
      console.log('Created base profile:', userProfile);
      
      // Update the profile with avatar and preferences
      const updatedProfile = {
        ...userProfile,
        avatar: customImage || selectedAvatar.value,
        preferences: {
          ...userProfile.preferences,
          interests: selectedInterests,
          customInterests: customInterests,
          timerDuration: 20,
          hintsEnabled: false,
        }
      };
      console.log('Updated profile:', updatedProfile);

      // Save the profile
      const success = saveUserProfile(updatedProfile);
      console.log('Save result:', success);
      
      if (success) {
        toast.success("Profile created!", {
          description: "Let's establish your baseline knowledge..."
        });
        
        // Store user ID and show assessment
        setUserId(updatedProfile.id);
        setShowAssessment(true);
      } else {
        console.error('Profile save failed - validation or storage error');
        toast.error("Failed to create profile. Please try again.");
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show baseline assessment if profile created
  if (showAssessment) {
    return (
      <BaselineAssessment
        selectedInterests={selectedInterests}
        userId={userId}
        onComplete={handleAssessmentComplete}
        onSkip={handleAssessmentSkip}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md mx-auto transition-all duration-300 ease-in-out">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to BoltQuest!</CardTitle>
          <CardDescription>
            Let's set up your profile to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Enter Your Name</Label>
            <Input
              id="username"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Avatar Selection */}
          <div className="space-y-3">
            <Label>Choose Your Avatar</Label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((color) => (
                <div key={color.name} className="relative">
                  <button
                    onClick={() => {
                      setSelectedAvatar(color);
                      if (color.value !== 'custom') {
                        setCustomImage(null);
                      }
                    }}
                    className={`w-12 h-12 rounded-full ${color.bg} border-2 transition-all flex items-center justify-center ${
                      selectedAvatar.value === color.value 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-transparent hover:border-primary/50'
                    }`}
                    title={color.name}
                  >
                    {color.value === 'custom' ? (
                      <span className="text-lg">{color.icon}</span>
                    ) : customImage && selectedAvatar.value === 'custom' ? (
                      <img 
                        src={customImage} 
                        alt="Custom avatar" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : null}
                  </button>
                  {color.value === 'custom' && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Camera className="h-4 w-4" />
              <span>Click the camera icon to upload a custom image</span>
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <Label>Your Interests</Label>
            <div className="grid grid-cols-2 gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => handleInterestToggle(interest.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                    selectedInterests.includes(interest.id)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {interest.icon}
                  <span className="text-sm">{interest.label}</span>
                  {selectedInterests.includes(interest.id) && (
                    <CheckCircle2 className="h-4 w-4 ml-auto" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="custom-interests">Custom Interests (optional)</Label>
              
              {/* Add Custom Interest Input */}
              <div className="flex gap-2">
                <Input
                  id="custom-interests"
                  placeholder="e.g., AI, Photography, Gaming"
                  value={newCustomInterest}
                  onChange={(e) => setNewCustomInterest(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddCustomInterest}
                  disabled={!newCustomInterest.trim() || customInterests.includes(newCustomInterest.trim())}
                  size="sm"
                  variant="outline"
                >
                  Add
                </Button>
              </div>
              
              {/* Display Added Custom Interests */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Your custom interests:</p>
                <div className="min-h-[60px] max-h-[120px] overflow-y-auto border rounded-md p-2 bg-gray-50/50 transition-all duration-200 ease-in-out">
                  {customInterests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {customInterests.map((interest, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                        >
                          <span>{interest}</span>
                          <button
                            onClick={() => handleRemoveCustomInterest(interest)}
                            className="hover:text-destructive ml-1"
                            type="button"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No custom interests added yet</p>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Type an interest and press Enter or click Add. You can use only custom interests if you prefer!
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !username.trim() || (selectedInterests.length === 0 && customInterests.length === 0)}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating Profile...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Get Started
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleUserSetup;
