import type {
  CaseDetail,
  CaseListItem,
  CaseStatus,
  UpdateStatusPayload,
} from "../type/types";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const now = Date.now();
const initialCases: CaseDetail[] = Array.from({ length: 8 }).map((_, i) => {
  const id = `case-${i + 1}`;
  const created_at = new Date(now - i * 24 * 60 * 60 * 1000).toISOString();
  const statuses: CaseStatus[] = ["new", "in_review", "approved", "rejected"];
  const status = statuses[i % statuses.length];
  return {
    id,
    name: `Entity ${i + 1}`,
    status,
    created_at,
    notes: i % 3 === 0 ? `Notes for ${id}` : "",
  };
});

const store: { cases: CaseDetail[] } = {
  cases: initialCases.map((c) => ({ ...c })),
};

export const MOCK_CONFIG = {
  failureRate: 0.08,
  randomDelayMin: 400,
  randomDelayMax: 1000,
};

function randDelay() {
  const { randomDelayMin, randomDelayMax } = MOCK_CONFIG;
  return (
    randomDelayMin +
    Math.floor(Math.random() * Math.max(0, randomDelayMax - randomDelayMin))
  );
}

function maybeServerError(): boolean {
  return Math.random() < MOCK_CONFIG.failureRate;
}

export async function getCases(): Promise<CaseListItem[]> {
  await sleep(randDelay());
  if (maybeServerError()) {
    const err: any = new Error("Server error");
    err.status = 500;
    throw err;
  }
  return store.cases.map(({ id, name, status, created_at }) => ({
    id,
    name,
    status,
    created_at,
  }));
}

export async function getCase(id: string): Promise<CaseDetail> {
  await sleep(randDelay());
  const found = store.cases.find((c) => c.id === id);
  if (!found) {
    const err: any = new Error("Not found");
    err.status = 404;
    throw err;
  }
  if (maybeServerError()) {
    const err: any = new Error("Server error");
    err.status = 500;
    throw err;
  }
  return { ...found };
}

type FieldErrorsResponse = {
  fieldErrors?: Record<string, string>;
  message?: string;
};

export async function updateCaseStatus(
  id: string,
  payload: UpdateStatusPayload,
): Promise<CaseDetail> {
  await sleep(800 + Math.floor(Math.random() * 700));

  const foundIndex = store.cases.findIndex((c) => c.id === id);
  if (foundIndex === -1) {
    const err: any = new Error("Not found");
    err.status = 404;
    throw err;
  }

  const current = store.cases[foundIndex];
  const errors: FieldErrorsResponse = { fieldErrors: {} };

  if (payload.status === current.status) {
    errors.fieldErrors = {
      ...(errors.fieldErrors || {}),
      status: "Status must change",
    };
  }

  if (payload.status === "rejected") {
    if (!payload.reason || payload.reason.trim().length < 10) {
      errors.fieldErrors = {
        ...(errors.fieldErrors || {}),
        reason: "Reason is required and must be at least 10 characters",
      };
    }
  }

  if (errors.fieldErrors && Object.keys(errors.fieldErrors).length > 0) {
    const err: any = new Error("Validation failed");
    err.status = 400;
    err.body = { fieldErrors: errors.fieldErrors };
    throw err;
  }

  if (maybeServerError()) {
    const err: any = new Error("Something went wrong");
    err.status = 500;
    err.body = { message: "Something went wrong" };
    throw err;
  }

  const updated: CaseDetail = {
    ...current,
    status: payload.status,
  };
  store.cases[foundIndex] = {
    ...updated,
    notes: current.notes || "",
  };

  return { ...store.cases[foundIndex] };
}
