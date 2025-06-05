
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StreamFailureEntity } from '@/types/streamFailure';
import { getAllOrgIds, getAllStatuses } from '@/utils/mockData';

interface CreateFailureFormProps {
  onClose: () => void;
  onSubmit: (failure: StreamFailureEntity) => void;
}

export const CreateFailureForm: React.FC<CreateFailureFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    orgId: '',
    failureStatus: '',
    failurePayload: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Parse the payload JSON
      let payload;
      try {
        payload = JSON.parse(formData.failurePayload || '{}');
      } catch {
        payload = { message: formData.failurePayload };
      }

      const newFailure: StreamFailureEntity = {
        id: `failure-${Date.now()}`,
        orgId: formData.orgId,
        failureStatus: formData.failureStatus,
        createdDate: new Date().toISOString(),
        endDate: null,
        failurePayload: payload
      };

      onSubmit(newFailure);
    } catch (error) {
      console.error('Error creating failure:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const orgIds = getAllOrgIds();
  const statuses = getAllStatuses();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Stream Failure</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orgId">Organization ID</Label>
              <Select 
                value={formData.orgId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, orgId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {orgIds.map(orgId => (
                    <SelectItem key={orgId} value={orgId}>
                      {orgId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="failureStatus">Failure Status</Label>
              <Select 
                value={formData.failureStatus} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, failureStatus: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="failurePayload">Failure Payload (JSON)</Label>
            <Textarea
              id="failurePayload"
              value={formData.failurePayload}
              onChange={(e) => setFormData(prev => ({ ...prev, failurePayload: e.target.value }))}
              placeholder='{"errorCode": "CONN_TIMEOUT", "message": "Connection timeout", "deviceId": "device-123"}'
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Failure'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
