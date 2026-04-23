import { http } from "~/lib/http";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  trace_id?: string;
  error_code?: string;
};

export type PageResult<T> = {
  page: number;
  page_size: number;
  total: number;
  items: T[];
};

export type HomeAgentOutputItem = {
  agent: string;
  output: string;
  signal: string;
  updated_at: string;
  to: string;
};

export type HomePortfolioTopPosition = {
  name: string;
  cost_price: number;
  weight: number;
};

export type HomePortfolioReturnPoint = {
  month: string;
  value: number;
};

export type HomePortfolioMetrics = {
  max_drawdown_pct: number;
  total_return_pct: number;
};

export type HomePortfolioSummary = {
  top_positions: HomePortfolioTopPosition[];
  monthly_returns: HomePortfolioReturnPoint[];
  metrics: HomePortfolioMetrics;
};

export const getHomeAgentOutputs = async (params?: {
  page?: number;
  page_size?: number;
}) => {
  const response = await http.get<ApiResponse<PageResult<HomeAgentOutputItem>>>(
    "/api/v1/home/agent-outputs",
    { params }
  );

  return response.data;
};

export const getHomePortfolioSummary = async () => {
  const response = await http.get<ApiResponse<HomePortfolioSummary>>(
    "/api/v1/home/portfolio/summary"
  );

  return response.data;
};
