import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCases, getCase, updateCaseStatus } from "../api/mockApi";
import type {
  CaseDetail,
  CaseListItem,
  UpdateStatusPayload,
  ApiError,
} from "../type/types";

export function useCasesList() {
  return useQuery<CaseListItem[], ApiError>({
    queryKey: ["cases"],
    queryFn: getCases,
    staleTime: 1000 * 60,
  });
}

export function useCaseDetail(caseId: string) {
  return useQuery<CaseDetail, ApiError>({
    queryKey: ["case", caseId],
    queryFn: () => getCase(caseId),
    retry: false,
  });
}

type OptimisticContext = {
  prevList?: CaseListItem[] | undefined;
  prevDetail?: CaseDetail | undefined;
};

export function useUpdateStatus(caseId: string) {
  const qc = useQueryClient();

  type NewType = ApiError;

  return useMutation<
    CaseDetail,
    ApiError,
    UpdateStatusPayload,
    OptimisticContext
  >({
    mutationFn: (payload: UpdateStatusPayload) =>
      updateCaseStatus(caseId, payload),

    onMutate: async (
      payload: UpdateStatusPayload,
    ): Promise<OptimisticContext> => {
      await qc.cancelQueries({ queryKey: ["cases"] });
      await qc.cancelQueries({ queryKey: ["case", caseId] });

      const prevList = qc.getQueryData<CaseListItem[]>(["cases"]);
      const prevDetail = qc.getQueryData<CaseDetail>(["case", caseId]);

      if (prevList) {
        qc.setQueryData<CaseListItem[] | undefined>(["cases"], (old) =>
          old?.map((c) =>
            c.id === caseId ? { ...c, status: payload.status } : c,
          ),
        );
      }

      if (prevDetail) {
        qc.setQueryData<CaseDetail | undefined>(["case", caseId], (old) =>
          old ? { ...old, status: payload.status } : old,
        );
      }

      return { prevList, prevDetail };
    },

    onError: (
      _err: NewType,
      _variables: UpdateStatusPayload,
      ctx?: OptimisticContext,
    ) => {
      if (ctx?.prevList) qc.setQueryData(["cases"], ctx.prevList);
      if (ctx?.prevDetail) qc.setQueryData(["case", caseId], ctx.prevDetail);
    },

    onSuccess: (data: CaseDetail) => {
      qc.setQueryData(["case", caseId], data);
      qc.setQueryData<CaseListItem[] | undefined>(["cases"], (old) =>
        old?.map((c) => (c.id === caseId ? { ...c, status: data.status } : c)),
      );
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["cases"] });
      qc.invalidateQueries({ queryKey: ["case", caseId] });
    },
  });
}
