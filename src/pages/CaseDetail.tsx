import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCaseDetail, useUpdateStatus } from "../hooks/useCases";
import Loading from "../components/Loading";
import ErrorBlock from "../components/ErrorBlock";
import { useForm } from "react-hook-form";
import type { CaseStatus } from "../type/types";

type FormValues = {
  status: CaseStatus;
  reason?: string;
};

function statusClasses(status: string) {
  const map: Record<string, string> = {
    new: "bg-indigo-100 text-indigo-800",
    in_review: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-rose-100 text-rose-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
}

export default function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const { data, isLoading, isError, refetch } = useCaseDetail(caseId!);
  const mutation = useUpdateStatus(caseId!);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [nonBlockingError, setNonBlockingError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { status: undefined as any, reason: "" },
  });

  const watchedStatus = watch("status");

  useEffect(() => {
    setSuccessMsg(null);
    setNonBlockingError(null);
  }, [watchedStatus]);

  if (isLoading)
    return (
      <div className="p-8">
        <Loading message="Loading case..." />
      </div>
    );
  if (isError)
    return (
      <div className="p-8">
        <ErrorBlock message="Failed to load case" onRetry={() => refetch()} />
      </div>
    );
  if (!data) return <div className="p-8 text-gray-600">Case not found</div>;

  const onSubmit = (vals: FormValues) => {
    setSuccessMsg(null);
    setNonBlockingError(null);

    if (vals.status === data.status) {
      setError("status", {
        type: "manual",
        message: "Pick a different status than current",
      });
      return;
    }
    if (
      vals.status === "rejected" &&
      (!vals.reason || vals.reason.trim().length < 10)
    ) {
      setError("reason", {
        type: "manual",
        message: "Reason must be at least 10 characters",
      });
      return;
    }

    mutation.mutate(vals, {
      onError: (err: any) => {
        if (err?.status === 400 && err.body?.fieldErrors) {
          const fe = err.body.fieldErrors as Record<string, string>;
          if (fe.status)
            setError("status", { type: "server", message: fe.status });
          if (fe.reason)
            setError("reason", { type: "server", message: fe.reason });
        } else if (err?.status === 500) {
          setNonBlockingError(err.body?.message || "Server error");
        } else {
          setNonBlockingError(err?.message || "Unknown error");
        }
      },
      onSuccess: (updated) => {
        setSuccessMsg("Status updated successfully");
        reset({ status: updated.status, reason: "" });
        setTimeout(() => setSuccessMsg(null), 3500);
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link to="/cases" className="text-sm text-indigo-600 hover:underline">
            ← Back to cases
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Case {data.id}
            </h2>
            <p className="text-sm text-gray-500">{data.name}</p>
          </div>
        </div>

        <div className="text-right text-sm text-gray-500">
          <div>{new Date(data.created_at).toLocaleString()}</div>
          <div
            className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${statusClasses(data.status)}`}
          >
            {data.status.replace("_", " ")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="text-sm text-gray-500">Entity</div>
            <div className="text-lg font-semibold text-slate-900 mt-1">
              {data.name}
            </div>

            <div className="mt-4">
              <div className="text-sm text-gray-500">Notes</div>
              <div className="mt-1 text-sm text-gray-700">
                {data.notes || (
                  <span className="text-gray-400 italic">No notes</span>
                )}
              </div>
            </div>

            <hr className="my-4 border-gray-100" />

            <div className="text-sm text-gray-600">
              <strong>History</strong>
              <p className="mt-2 text-gray-500">
                Recent changes would appear here (not implemented in the mock
                API).
              </p>
            </div>
          </div>
        </div>

        <aside className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            Update status
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                New status
              </label>
              <select
                {...register("status", { required: "Select a status" })}
                defaultValue=""
                className={`w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-200`}
              >
                <option value="" disabled>
                  Select status
                </option>
                <option value="new">new</option>
                <option value="in_review">in_review</option>
                <option value="approved">approved</option>
                <option value="rejected">rejected</option>
              </select>
              {errors.status && (
                <div className="text-rose-600 text-sm mt-1">
                  {errors.status.message}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Reason (required only if rejected)
              </label>
              <textarea
                {...register("reason")}
                rows={4}
                placeholder="Explain the reason (min 10 chars if rejected)"
                className="w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-200"
              />
              {errors.reason && (
                <div className="text-rose-600 text-sm mt-1">
                  {errors.reason.message}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={mutation.isPending || isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
              >
                {mutation.isPending || isSubmitting
                  ? "Updating..."
                  : "Update status"}
              </button>

              <button
                type="button"
                onClick={() => {
                  reset();
                  setNonBlockingError(null);
                  setSuccessMsg(null);
                }}
                className="px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
            </div>

            <div className="space-y-2">
              {successMsg && (
                <div className="rounded-md p-3 text-sm bg-emerald-50 text-emerald-800 border border-emerald-100">
                  {successMsg}
                </div>
              )}
              {nonBlockingError && (
                <div className="rounded-md p-3 text-sm bg-rose-50 text-rose-700 border border-rose-100">
                  {nonBlockingError}
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500">
              Note: new status cannot be the same as current. If you select{" "}
              <strong>rejected</strong>, reason is required (min 10 chars).
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
