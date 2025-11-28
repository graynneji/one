import { CrudAdapter, ReadOptions } from "@/adapter/crudAdapter";
import { CrudService } from "@/services/crudService";
import { Client } from "@/utils/client";
import { queryClient } from "@/utils/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

const client = new Client();
const crudAdapter = new CrudAdapter(client);
const crudService = new CrudService(crudAdapter);

export function useCrudCreate<T>(
  table: string,
  invalidateKeys?: any[] | any[][]
) {
  return useMutation({
    mutationFn: (payload: Partial<T>) => crudService.create(table, payload),
    onSuccess: () => {
      if (Array.isArray(invalidateKeys?.[0])) {
        (invalidateKeys as any[][]).forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: (invalidateKeys as any[]) ?? [table],
        });
      }
    },
  });
}

export function useGetAll(
  table: string,
  options?: { orderBy?: string; ascending?: boolean },
  column: string = "*",
  shouldRetry: boolean = false,
  staleTime?: number,
  gcTime?: number,
  refetchOnWindowFocus: boolean = true,
  refetchOnReconnect: boolean = true,
  refetchOnMount: boolean = true
) {
  return useQuery({
    queryKey: [table, JSON.stringify(options), column],
    queryFn: async ({ queryKey }) => {
      const [table, options, column] = queryKey as [string, string, string];
      const data = await crudService.read(table, JSON.parse(options), column);
      return data ?? { result: [], error: null };
    },
    retry: shouldRetry ? 3 : false,
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    refetchOnReconnect,
    refetchOnMount,
  });
}

export function useGetById<T>(
  table: string,
  filters: Partial<T>,
  column: string,
  enabled: boolean = true,
  options?: ReadOptions,
  staleTime?: number,
  gcTime?: number,
  refetchOnWindowFocus: boolean = true,
  refetchOnReconnect: boolean = true,
  refetchOnMount: boolean = true
) {
  return useQuery({
    queryKey: [table, JSON.stringify(filters), column, JSON.stringify(options)],
    queryFn: async ({ queryKey }) => {
      const [table, filter, column, options] = queryKey as [
        string,
        string,
        string,
        string
      ];
      const data = await crudService.getUserById<T>(
        table,
        JSON.parse(filter),
        column,
        JSON.parse(options)
      );
      return data ?? { result: [], count: 0 };
    },
    enabled,
    retry: true,
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    refetchOnReconnect,
    refetchOnMount,
  });
}

export function useUpdateCrud<T>(
  table: string,
  invalidateKeys?: any[] | any[][]
) {
  return useMutation({
    mutationFn: (vars: {
      payload: Partial<T>;
      column?: string;
      id?: string | number;
    }) => {
      return crudService.updateUser(table, vars.payload, vars.column, vars.id);
    },
    onSuccess: () => {
      if (Array.isArray(invalidateKeys?.[0])) {
        (invalidateKeys as any[][]).forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: (invalidateKeys as any[]) ?? [table],
        });
      }
    },
  });
}

export function useDeleteCrud(table: string, invalidateKeys?: any[] | any[][]) {
  return useMutation({
    mutationFn: (id: string | number) => crudService.deleteUser(table, id),
    onSuccess: () => {
      if (Array.isArray(invalidateKeys?.[0])) {
        (invalidateKeys as any[][]).forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: (invalidateKeys as any[]) ?? [table],
        });
      }
    },
  });
}

export function useRpc<T>(fn: string, invalidateKey?: any[]) {
  return useMutation({
    mutationFn: (params: Partial<T>) => crudService.rpcCall(fn, params),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: invalidateKey ?? [] }),
  });
}
export async function useSpecialLikes(
  table: string,
  filters: any,
  column: string,
  options?: ReadOptions
): Promise<{ result: any[]; count: number }> {
  const res = await crudService.getUserById(table, filters, column, {
    ...options,
    // count: "exact",
  });
  return res ?? { result: [], count: 0 };
}

export function useMarkMessagesRead(table: string, invalidateKey?: any[]) {
  return useMutation({
    mutationFn: async (vars: { senderId: string; receiverId: string }) => {
      try {
        await crudService.markMessagesRead(
          table,
          vars.senderId,
          vars.receiverId
        );
      } catch (err) {
        throw err;
      }
    },
    retry: Infinity,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: invalidateKey ?? [table] }),
  });
}
