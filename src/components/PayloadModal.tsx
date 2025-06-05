
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, X } from 'lucide-react';
import { format } from 'date-fns';
import { StreamFailureEntity } from '@/types/streamFailure';
import { useToast } from '@/hooks/use-toast';

interface PayloadModalProps {
  failure: StreamFailureEntity;
  onClose: () => void;
}

export const PayloadModal: React.FC<PayloadModalProps> = ({ failure, onClose }) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Payload has been copied to your clipboard."
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      FAILED: 'bg-red-100 text-red-800',
      RESOLVED: 'bg-green-100 text-green-800',
      ESCALATED: 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderJsonValue = (value: any, depth: number = 0): React.ReactNode => {
    if (value === null) return <span className="text-gray-500">null</span>;
    if (typeof value === 'boolean') return <span className="text-blue-600">{value.toString()}</span>;
    if (typeof value === 'number') return <span className="text-green-600">{value}</span>;
    if (typeof value === 'string') return <span className="text-red-600">"{value}"</span>;
    
    if (Array.isArray(value)) {
      return (
        <div className="ml-4">
          <span className="text-gray-700">[</span>
          {value.map((item, index) => (
            <div key={index} className="ml-4">
              {renderJsonValue(item, depth + 1)}
              {index < value.length - 1 && <span className="text-gray-700">,</span>}
            </div>
          ))}
          <span className="text-gray-700">]</span>
        </div>
      );
    }
    
    if (typeof value === 'object') {
      return (
        <div className="ml-4">
          <span className="text-gray-700">{'{'}</span>
          {Object.entries(value).map(([key, val], index, array) => (
            <div key={key} className="ml-4">
              <span className="text-purple-600">"{key}"</span>
              <span className="text-gray-700">: </span>
              {renderJsonValue(val, depth + 1)}
              {index < array.length - 1 && <span className="text-gray-700">,</span>}
            </div>
          ))}
          <span className="text-gray-700">{'}'}</span>
        </div>
      );
    }
    
    return <span>{String(value)}</span>;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              Failure Details: {failure.id}
              <Badge className={getStatusColor(failure.failureStatus)}>
                {failure.failureStatus}
              </Badge>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-600">Organization ID:</span>
              <p className="text-sm">{failure.orgId}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Created Date:</span>
              <p className="text-sm">{format(new Date(failure.createdDate), 'PPP pp')}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <p className="text-sm">{failure.failureStatus}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">End Date:</span>
              <p className="text-sm">
                {failure.endDate ? format(new Date(failure.endDate), 'PPP pp') : 'Not completed'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">Failure Payload</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(JSON.stringify(failure.failurePayload, null, 2))}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy JSON
            </Button>
          </div>

          <ScrollArea className="h-96 w-full border rounded-lg p-4">
            <div className="font-mono text-sm">
              {renderJsonValue(failure.failurePayload)}
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
