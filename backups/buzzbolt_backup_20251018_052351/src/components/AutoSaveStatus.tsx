/**
 * Auto-Save Status Component
 * Shows auto-save status and allows manual control
 */

import React, { useState, useEffect } from 'react';
import { useAutoSave } from '@/lib/autoSave';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Save, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Trash2
} from 'lucide-react';

interface AutoSaveStatusProps {
  className?: string;
}

export const AutoSaveStatus: React.FC<AutoSaveStatusProps> = ({ className }) => {
  const { getStatus, setEnabled, forceSave, clearAutoSave } = useAutoSave();
  const [status, setStatus] = useState(getStatus());
  const [isLoading, setIsLoading] = useState(false);

  // Update status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getStatus());
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [getStatus]);

  const handleToggle = (enabled: boolean) => {
    setEnabled(enabled);
    setStatus(getStatus());
  };

  const handleForceSave = async () => {
    setIsLoading(true);
    try {
      await forceSave();
      setStatus(getStatus());
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAutoSave = () => {
    if (confirm('Are you sure you want to clear all auto-save data?')) {
      clearAutoSave();
      setStatus(getStatus());
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getNextSaveTime = () => {
    if (!status.nextSave) return 'Unknown';
    const now = new Date();
    const diff = status.nextSave.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 0) return 'Overdue';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Save className="h-4 w-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Auto-Save</h3>
        </div>
        <Badge 
          variant={status.enabled ? "default" : "secondary"}
          className={status.enabled ? "bg-green-500 text-white" : ""}
        >
          {status.enabled ? "Active" : "Disabled"}
        </Badge>
      </div>

      <div className="space-y-3">
        {/* Auto-save toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={status.enabled}
              onCheckedChange={handleToggle}
            />
            <span className="text-sm text-gray-600">
              Auto-save every 30 minutes
            </span>
          </div>
        </div>

        {/* Status info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-gray-500" />
            <span className="text-gray-600">Last saved:</span>
            <span className="font-medium">
              {formatTime(status.lastSaved)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-gray-500" />
            <span className="text-gray-600">Next save:</span>
            <span className="font-medium">
              {getNextSaveTime()}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleForceSave}
            disabled={isLoading}
            className="flex-1"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Save Now
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClearAutoSave}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {/* Info text */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Auto-save preserves your progress, settings, and game data
          </div>
        </div>
      </div>
    </Card>
  );
};
