import { useCallback, useState } from "react";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { http } from "~/lib/http";

type UseRequestState<TData> = {
  data: TData | null;
  error: string;
  loading: boolean;
};

type UseRequestResult<TData, TPayload> = UseRequestState<TData> & {
  execute: (payload?: TPayload) => Promise<TData>;
  reset: () => void;
};

type UseRequestOptions<TPayload> = Omit<AxiosRequestConfig<TPayload>, "url" | "method" | "data"> & {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
};

export function useRequest<TData = unknown, TPayload = unknown>(
  options: UseRequestOptions<TPayload>
): UseRequestResult<TData, TPayload> {
  const [state, setState] = useState<UseRequestState<TData>>({
    data: null,
    error: "",
    loading: false,
  });

  const reset = useCallback(() => {
    setState({ data: null, error: "", loading: false });
  }, []);

  const execute = useCallback(
    async (payload?: TPayload) => {
      setState((prev) => ({ ...prev, loading: true, error: "" }));

      try {
        const response: AxiosResponse<TData> = await http.request<TData, AxiosResponse<TData>, TPayload>({
          ...options,
          url: options.url,
          method: options.method ?? "GET",
          data: payload,
        });

        setState({ data: response.data, error: "", loading: false });
        return response.data;
      } catch (error) {
        const message = axios.isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message || error.message || "请求失败，请稍后重试。"
          : error instanceof Error
            ? error.message
            : "请求失败，请稍后重试。";

        setState((prev) => ({ ...prev, error: message, loading: false }));
        throw error;
      }
    },
    [options]
  );

  return {
    ...state,
    execute,
    reset,
  };
}
