import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCasesList } from "../hooks/useCases";
import Loading from "../components/Loading";
import ErrorBlock from "../components/ErrorBlock";
import type { CaseListItem } from "../type/types";

function statusClasses(status: string) {
  const map: Record<string, string> = {
    new: "bg-indigo-100 text-indigo-800",
    in_review: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-rose-100 text-rose-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`${statusClasses(status)} inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function CaseRow({ item }: { item: CaseListItem }) {
  return (
    <tr className="hover:bg-white">
      <td className="px-6 py-4 align-top">
        <Link
          className="text-indigo-600 font-semibold hover:underline"
          to={`/cases/${item.id}`}
        >
          {item.id}
        </Link>
        <div className="text-sm text-gray-500 mt-1">{item.name}</div>
      </td>

      <td className="px-6 py-4 align-top">
        <StatusPill status={item.status} />
      </td>

      <td className="px-6 py-4 align-top text-sm text-gray-500">
        {new Date(item.created_at).toLocaleString()}
      </td>
    </tr>
  );
}

export default function CasesList() {
  const { data, isLoading, isError, refetch } = useCasesList();
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = filter.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q),
    );
  }, [data, filter]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-400 text-white flex items-center justify-center font-bold shadow">
              CW
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Cases Workflow
              </h1>
              <p className="text-sm text-gray-500">
                Manage case lifecycle & approvals
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>

          <button
            onClick={() => refetch()}
            className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
          >
            New case
          </button>
        </div>
      </header>

      <section className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:max-w-md">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg w-full border border-gray-100">
              <svg
                className="w-4 h-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M21 21l-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="11"
                  cy="11"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                aria-label="Search cases"
                placeholder="Search by id, name or status"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8">
              <Loading message="Loading cases..." />
            </div>
          ) : isError ? (
            <div className="p-6">
              <ErrorBlock
                message="Failed to load cases"
                onRetry={() => refetch()}
              />
            </div>
          ) : !data || data.length === 0 ? (
            <div className="p-6 text-gray-500">No cases found.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Case
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map((item) => (
                  <CaseRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
