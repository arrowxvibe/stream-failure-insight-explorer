
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FilterState } from '@/types/streamFailure';
import { getAllOrgIds, getAllStatuses } from '@/utils/mockData';

interface FiltersSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  filters,
  onFiltersChange
}) => {
  const orgIds = getAllOrgIds();
  const statuses = getAllStatuses();

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleOrgId = (orgId: string) => {
    const newOrgIds = filters.orgIds.includes(orgId)
      ? filters.orgIds.filter(id => id !== orgId)
      : [...filters.orgIds, orgId];
    updateFilter('orgIds', newOrgIds);
  };

  const toggleStatus = (status: string) => {
    const newStatuses = filters.failureStatuses.includes(status)
      ? filters.failureStatuses.filter(s => s !== status)
      : [...filters.failureStatuses, status];
    updateFilter('failureStatuses', newStatuses);
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ID Filter */}
        <div className="space-y-2">
          <Label htmlFor="id-filter">ID</Label>
          <Input
            id="id-filter"
            placeholder="Search by ID..."
            value={filters.id || ''}
            onChange={(e) => updateFilter('id', e.target.value || undefined)}
          />
        </div>

        {/* Organization ID Filter */}
        <div className="space-y-2">
          <Label>Organization ID</Label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {orgIds.map((orgId) => (
              <div key={orgId} className="flex items-center space-x-2">
                <Checkbox
                  id={`org-${orgId}`}
                  checked={filters.orgIds.includes(orgId)}
                  onCheckedChange={() => toggleOrgId(orgId)}
                />
                <Label htmlFor={`org-${orgId}`} className="text-sm">
                  {orgId}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Failure Status Filter */}
        <div className="space-y-2">
          <Label>Failure Status</Label>
          <div className="space-y-2">
            {statuses.map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={filters.failureStatuses.includes(status)}
                  onCheckedChange={() => toggleStatus(status)}
                />
                <Label htmlFor={`status-${status}`} className="text-sm">
                  {status}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Created Date Range */}
        <div className="space-y-2">
          <Label>Created Date Range</Label>
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.createdDateRange.start && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.createdDateRange.start 
                    ? format(filters.createdDateRange.start, "PPP")
                    : "Start date"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.createdDateRange.start}
                  onSelect={(date) => updateFilter('createdDateRange', {
                    ...filters.createdDateRange,
                    start: date
                  })}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.createdDateRange.end && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.createdDateRange.end 
                    ? format(filters.createdDateRange.end, "PPP")
                    : "End date"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.createdDateRange.end}
                  onSelect={(date) => updateFilter('createdDateRange', {
                    ...filters.createdDateRange,
                    end: date
                  })}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* End Date Range */}
        <div className="space-y-2">
          <Label>End Date Range</Label>
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.endDateRange.start && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDateRange.start 
                    ? format(filters.endDateRange.start, "PPP")
                    : "Start date"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDateRange.start}
                  onSelect={(date) => updateFilter('endDateRange', {
                    ...filters.endDateRange,
                    start: date
                  })}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.endDateRange.end && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDateRange.end 
                    ? format(filters.endDateRange.end, "PPP")
                    : "End date"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDateRange.end}
                  onSelect={(date) => updateFilter('endDateRange', {
                    ...filters.endDateRange,
                    end: date
                  })}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Clear Filters */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onFiltersChange({
            orgIds: [],
            failureStatuses: [],
            createdDateRange: {},
            endDateRange: {}
          })}
        >
          <X className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );
};
