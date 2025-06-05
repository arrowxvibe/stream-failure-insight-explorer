
export interface StreamFailureEntity {
  id: string;
  orgId: string;
  failureStatus: string;
  createdDate: string;
  endDate: string | null;
  failurePayload: Record<string, any>;
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
