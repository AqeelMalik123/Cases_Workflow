// src/type/types.ts
export type CaseStatus = "new" | "in_review" | "approved" | "rejected";

export type CaseListItem = {
  id: string;
  name: string;
  status: CaseStatus;
  created_at: string; // ISO string
};

export type CaseDetail = CaseListItem & {
  notes?: string;
};

export type UpdateStatusPayload = {
  status: CaseStatus;
  reason?: string;
};

/**
 * Error shapes returned by the mock API
 */
export type FieldErrors = Record<string, string> | undefined;

export type ApiErrorBody = {
  fieldErrors?: FieldErrors;
  message?: string;
};

export type ApiError = {
  status?: number;
  body?: ApiErrorBody;
  // optional top-level message
  message?: string;
} & Error;
