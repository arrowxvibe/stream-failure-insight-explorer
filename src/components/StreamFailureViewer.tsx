import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, Filter, X, Plus } from 'lucide-react';
import { StreamFailureEntity, FilterState, OrderByClause, convertSupabaseRowToEntity } from '@/types/streamFailure';
import { supabase } from '@/integrations/supabase/client';
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
    { field: 'created_date', direction: 'desc' }
  ]);
  const [selectedPayload, setSelectedPayload] = useState<StreamFailureEntity | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadFailures = useCallback(async (reset: boolean = false) => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('stream_failures')
        .select('*');

      // Apply filters
      if (filters.id) {
        query = query.ilike('id', `%${filters.id}%`);
      }
      
      if (filters.orgIds.length > 0) {
        query = query.in('org_id', filters.orgIds);
      }
      
      if (filters.failureStatuses.length > 0) {
        query = query.in('failure_status', filters.failureStatuses);
      }

      if (filters.createdDateRange.start) {
        query = query.gte('created_date', filters.createdDateRange.start.toISOString());
      }
      
      if (filters.createdDateRange.end) {
        query = query.lte('created_date', filters.createdDateRange.end.toISOString());
      }

      if (filters.endDateRange.start) {
        query = query.gte('end_date', filters.endDateRange.start.toISOString());
      }
      
      if (filters.endDateRange.end) {
        query = query.lte('end_date', filters.endDateRange.end.toISOString());
      }

      // Apply sorting
      if (orderBy.length > 0) {
        const sortClause = orderBy[0];
        query = query.order(sortClause.field, { ascending: sortClause.direction === 'asc' });
      }

      // Apply pagination
      const from = reset ? 0 : currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        console.error('Error loading failures:', error);
        return;
      }

      const newFailures = (data || []).map(convertSupabaseRowToEntity);

      if (reset) {
        setFailures(newFailures);
        setCurrentPage(1);
      } else {
        setFailures(prev => [...prev, ...newFailures]);
        setCurrentPage(prev => prev + 1);
      }
      
      setHasMore(newFailures.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error loading failures:', error);
    } finally {
      setLoading(false);
    }
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

  const handleCreateFailure = async (newFailure: Omit<StreamFailureEntity, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('stream_failures')
        .insert([{
          org_id: newFailure.org_id,
          failure_status: newFailure.failure_status,
          created_date: newFailure.created_date,
          end_date: newFailure.end_date,
          failure_payload: newFailure.failure_payload
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating failure:', error);
        return;
      }

      if (data) {
        const convertedData = convertSupabaseRowToEntity(data);
        setFailures(prev => [convertedData, ...prev]);
      }
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating failure:', error);
    }
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
                    onClick={() => handleSort('failure_status')}
                  >
                    Status
                    {orderBy.find(o => o.field === 'failure_status') && (
                      <span className="ml-1">
                        {orderBy.find(o => o.field === 'failure_status')?.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('created_date')}
                  >
                    Created Date
                    {orderBy.find(o => o.field === 'created_date') && (
                      <span className="ml-1">
                        {orderBy.find(o => o.field === 'created_date')?.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('end_date')}
                  >
                    End Date
                    {orderBy.find(o => o.field === 'end_date') && (
                      <span className="ml-1">
                        {orderBy.find(o => o.field === 'end_date')?.direction === 'asc' ? '↑' : '↓'}
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
                      {failure.org_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(failure.failure_status)}>
                        {failure.failure_status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(failure.created_date), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {failure.end_date ? format(new Date(failure.end_date), 'MMM dd, yyyy HH:mm') : '-'}
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
