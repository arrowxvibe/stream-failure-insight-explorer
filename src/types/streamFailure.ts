
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
