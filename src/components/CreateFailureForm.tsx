
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StreamFailureEntity } from '@/types/streamFailure';
import { supabase } from '@/integrations/supabase/client';

interface CreateFailureFormProps {
  onClose: () => void;
  onSubmit: (failure: Omit<StreamFailureEntity, 'id' | 'created_at' | 'updated_at'>) => void;
}

export const CreateFailureForm: React.FC<CreateFailureFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    orgId: '',
    failureStatus: '',
    failurePayload: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgIds, setOrgIds] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        // Get unique org IDs
        const { data: orgData } = await supabase
          .from('stream_failures')
          .select('org_id')
          .order('org_id');
        
        const uniqueOrgIds = [...new Set(orgData?.map(item => item.org_id) || [])];
        setOrgIds(uniqueOrgIds);

        // Get unique statuses
        const { data: statusData } = await supabase
          .from('stream_failures')
          .select('failure_status')
          .order('failure_status');
        
        const uniqueStatuses = [...new Set(statusData?.map(item => item.failure_status) || [])];
        setStatuses(uniqueStatuses);
      } catch (error) {
        console.error('Error loading options:', error);
      }
    };

    loadOptions();
  }, []);

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

      const newFailure = {
        org_id: formData.orgId,
        failure_status: formData.failureStatus,
        created_date: new Date().toISOString(),
        end_date: null,
        failure_payload: payload
      };

      onSubmit(newFailure);
    } catch (error) {
      console.error('Error creating failure:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <SelectItem value="new-org">Add New Organization</SelectItem>
                </SelectContent>
              </Select>
              {formData.orgId === 'new-org' && (
                <Input
                  placeholder="Enter new organization ID"
                  onChange={(e) => setFormData(prev => ({ ...prev, orgId: e.target.value }))}
                />
              )}
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
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="PROCESSING">PROCESSING</SelectItem>
                  <SelectItem value="FAILED">FAILED</SelectItem>
                  <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                  <SelectItem value="ESCALATED">ESCALATED</SelectItem>
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
