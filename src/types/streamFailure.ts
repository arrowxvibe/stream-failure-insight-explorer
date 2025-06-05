
import { Json } from '@/integrations/supabase/types';

export interface StreamFailureEntity {
  id: string;
  org_id: string;
  failure_status: string;
  created_date: string;
  end_date: string | null;
  failure_payload: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface FirestoreFilter {
  field: string;
  op: '==' | 'in' | '>=' | '<=';
  value: any;
}

export interface OrderByClause {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterState {
  id?: string;
  orgIds: string[];
  failureStatuses: string[];
  createdDateRange: {
    start?: Date;
    end?: Date;
  };
  endDateRange: {
    start?: Date;
    end?: Date;
  };
}

// Helper function to convert Supabase row to StreamFailureEntity
export const convertSupabaseRowToEntity = (row: any): StreamFailureEntity => {
  return {
    id: row.id,
    org_id: row.org_id,
    failure_status: row.failure_status,
    created_date: row.created_date,
    end_date: row.end_date,
    failure_payload: typeof row.failure_payload === 'object' && row.failure_payload !== null 
      ? row.failure_payload as Record<string, any>
      : {},
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};
