import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { performCompleteReset, getResetPreview, createBackupBeforeReset, ResetOptions } from '@/lib/resetManager';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const ResetConfirmationModal: React.FC<ResetModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState<'warning' | 'confirm' | 'processing' | 'complete'>('warning');
  const [confirmationText, setConfirmationText] = useState('');
  const [resetItems, setResetItems] = useState<string[]>([]);
  const [backupCreated, setBackupCreated] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setResetItems(getResetPreview());
      setStep('warning');
      setConfirmationText('');
    }
  }, [isOpen]);

  const handleCreateBackup = () => {
    try {
      const backup = createBackupBeforeReset();
      const blob = new Blob([backup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `buzzbolt-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setBackupCreated(true);
      toast.success('Backup created successfully');
    } catch (error) {
      toast.error('Failed to create backup');
    }
  };

  const handleReset = async () => {
    setStep('processing');
    
    try {
      const options: ResetOptions = {
        completeReset: true,
        resetStatistics: true,
        resetGameHistory: true,
        resetAchievements: true,
        resetDailyTasks: true,
        resetTutorials: true
      };

      const result = await performCompleteReset(options);
      
      if (result.success) {
        setStep('complete');
        toast.success('Data reset completed successfully');
        setTimeout(() => {
          onComplete();
          onClose();
        }, 2000);
      } else {
        toast.error('Reset failed: ' + result.errors.join(', '));
        setStep('warning');
      }
    } catch (error) {
      toast.error('Reset operation failed');
      setStep('warning');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Reset All Data
          </CardTitle>
          <CardDescription>
            This action cannot be undone. All your progress will be permanently deleted.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 'warning' && (
            <>
              <div className="space-y-3">
                <h4 className="font-medium text-sm">The following data will be deleted:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {resetItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Create a backup first
                    </p>
                    <p className="text-amber-700 dark:text-amber-300 mt-1">
                      Download your data before resetting in case you want to restore it later.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateBackup}
                  className="mt-3 w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setStep('confirm')}
                  className="flex-1"
                  disabled={resetItems.length === 0}
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Final Confirmation</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Type <strong>RESET</strong> to confirm you want to delete all your data
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Type RESET here"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('warning')} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleReset}
                    disabled={confirmationText !== 'RESET'}
                    className="flex-1"
                  >
                    Delete Everything
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Resetting Data</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Please wait while we reset your data...
                </p>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-green-600">Reset Complete</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  All data has been successfully reset. The page will refresh automatically.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

