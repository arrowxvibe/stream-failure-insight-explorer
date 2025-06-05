
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, Filter, X, Plus } from 'lucide-react';
import { StreamFailureEntity, FilterState, OrderByClause } from '@/types/streamFailure';
import { generateMockFailures } from '@/utils/mockData';
import { FiltersSidebar } from './FiltersSidebar';
import { PayloadModal } from './PayloadModal';
import { CreateFailureForm } from './CreateFailureForm';
import { format } from 'date-fns';

const PAGE_SIZE = 200;

export const StreamFailureViewer: React.FC = () => {
  const [failures, setFailures] = useState<StreamFailureEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    orgIds: [],
    failureStatuses: [],
    createdDateRange: {},
    endDateRange: {}
  });
  const [orderBy, setOrderBy] = useState<OrderByClause[]>([
    { field: 'createdDate', direction: 'desc' }
  ]);
  const [selectedPayload, setSelectedPayload] = useState<StreamFailureEntity | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadFailures = useCallback(async (reset: boolean = false) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const page = reset ? 0 : currentPage;
    const newFailures = generateMockFailures(PAGE_SIZE, page * PAGE_SIZE);
    
    // Apply filters (simplified for demo)
    let filteredFailures = newFailures;
    
    if (filters.id) {
      filteredFailures = filteredFailures.filter(f => 
        f.id.toLowerCase().includes(filters.id!.toLowerCase())
      );
    }
    
    if (filters.orgIds.length > 0) {
      filteredFailures = filteredFailures.filter(f => 
        filters.orgIds.includes(f.orgId)
      );
    }
    
    if (filters.failureStatuses.length > 0) {
      filteredFailures = filteredFailures.filter(f => 
        filters.failureStatuses.includes(f.failureStatus)
      );
    }

    // Apply sorting
    if (orderBy.length > 0) {
      const sortClause = orderBy[0];
      filteredFailures.sort((a, b) => {
        let aVal: any = a[sortClause.field as keyof StreamFailureEntity];
        let bVal: any = b[sortClause.field as keyof StreamFailureEntity];
        
        if (sortClause.field.includes('Date')) {
          aVal = new Date(aVal as string).getTime();
          bVal = new Date(bVal as string).getTime();
        }
        
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortClause.direction === 'desc' ? -comparison : comparison;
      });
    }

    if (reset) {
      setFailures(filteredFailures);
      setCurrentPage(1);
    } else {
      setFailures(prev => [...prev, ...filteredFailures]);
      setCurrentPage(prev => prev + 1);
    }
    
    setHasMore(filteredFailures.length === PAGE_SIZE);
    setLoading(false);
  }, [currentPage, filters, orderBy]);

  useEffect(() => {
    loadFailures(true);
  }, [filters, orderBy]);

  const handleSort = (field: string) => {
    setOrderBy(prev => {
      const existing = prev.find(o => o.field === field);
      if (existing) {
        return [{
          field,
          direction: existing.direction === 'asc' ? 'desc' : 'asc'
        }];
      }
      return [{ field, direction: 'asc' }];
    });
  };

  const handleCreateFailure = (newFailure: StreamFailureEntity) => {
    setFailures(prev => [newFailure, ...prev]);
    setShowCreateForm(false);
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

  const activeFiltersCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length;
    if (typeof value === 'object' && value !== null) {
      return count + Object.values(value).filter(v => v !== undefined).length;
    }
    return count + (value ? 1 : 0);
  }, 0);

  return (
    <div className="flex gap-6">
      {/* Filters Sidebar */}
      <div className={`transition-all duration-300 ${showFilters ? 'w-80' : 'w-0 overflow-hidden'}`}>
        <FiltersSidebar 
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({
                  orgIds: [],
                  failureStatuses: [],
                  createdDateRange: {},
                  endDateRange: {}
                })}
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowCreateForm(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Failure
            </Button>
            <div className="text-sm text-gray-600">
              {failures.length} records loaded
            </div>
          </div>
        </div>

        {/* Active Filters Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.id && (
              <Badge variant="outline" className="gap-1">
                ID: {filters.id}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setFilters(prev => ({ ...prev, id: undefined }))}
                />
              </Badge>
            )}
            {filters.orgIds.map(orgId => (
              <Badge key={orgId} variant="outline" className="gap-1">
                Org: {orgId}
                <X 
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    orgIds: prev.orgIds.filter(id => id !== orgId)
                  }))}
                />
              </Badge>
            ))}
            {filters.failureStatuses.map(status => (
              <Badge key={status} variant="outline" className="gap-1">
                Status: {status}
                <X 
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    failureStatuses: prev.failureStatuses.filter(s => s !== status)
                  }))}
                />
              </Badge>
            ))}
          </div>
        )}

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('id')}
                  >
                    ID
                    {orderBy.find(o => o.field === 'id') && (
                      <span className="ml-1">
                        {orderBy.find(o => o.field === 'id')?.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Org ID
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('failureStatus')}
                  >
                    Status
                    {orderBy.find(o => o.field === 'failureStatus') && (
                      <span className="ml-1">
                        {orderBy.find(o => o.field === 'failureStatus')?.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('createdDate')}
                  >
                    Created Date
                    {orderBy.find(o => o.field === 'createdDate') && (
                      <span className="ml-1">
                        {orderBy.find(o => o.field === 'createdDate')?.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('endDate')}
                  >
                    End Date
                    {orderBy.find(o => o.field === 'endDate') && (
                      <span className="ml-1">
                        {orderBy.find(o => o.field === 'endDate')?.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {failures.map((failure) => (
                  <tr key={failure.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {failure.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {failure.orgId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(failure.failureStatus)}>
                        {failure.failureStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(failure.createdDate), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {failure.endDate ? format(new Date(failure.endDate), 'MMM dd, yyyy HH:mm') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPayload(failure)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Payload
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Load More */}
          {hasMore && (
            <div className="p-4 text-center border-t">
              <Button
                onClick={() => loadFailures(false)}
                disabled={loading}
                variant="outline"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Payload Modal */}
      {selectedPayload && (
        <PayloadModal
          failure={selectedPayload}
          onClose={() => setSelectedPayload(null)}
        />
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <CreateFailureForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateFailure}
        />
      )}
    </div>
  );
};
