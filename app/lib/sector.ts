import { http } from "~/lib/http";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  trace_id?: string;
  error_code?: string;
};

export type SectorTrendRow = {
  trade_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  pct_change: number;
  vol: number;
};

export type SectorTrendSeries = {
  ts_code: string;
  name: string;
};

export type SectorTrendData = {
  trade_date: string;
  summary: string;
  conclusion: string;
  leading_themes: string[];
  reversal_opportunities: string[];
  top_risk_sectors: string[];
  highlights: string[];
  market_regime: "mixed" | "trend" | "risk-off";
  series_list: SectorTrendSeries[];
};

export type SectorTrendSeriesDetail = {
  ts_code: string;
  name: string;
  rows: SectorTrendRow[];
};

export type SectorTrendDatesData = {
  dates: string[];
};

export type SectorFlowPoint = {
  name: string;
  net_amount: number;
};

export type SectorDailyRow = {
  trade_date: string;
  ts_code: string;
  name: string;
  lead_stock: string;
  pct_change: number;
  net_amount: number;
};

export type SectorCapitalFlowData = {
  trade_date: string;
  summary: string;
  conclusion: string;
  highlights: string[];
  market_bias: string;
  one_day_net_amount?: number;
  five_day_net_amount?: number;
  twenty_day_net_amount?: number;
  hot_sectors: string[];
  risk_sectors: string[];
  one_day_sector_flow: SectorFlowPoint[];
  one_day_rows: SectorDailyRow[];
};

export type SectorCapitalFlowDatesData = {
  dates: string[];
};

export type SectorManagerData = {
  trade_date: string;
  market_regime: string;
  market_bias: string;
  action_bias: string;
  favored_sectors: string[];
  watchlist_sectors: string[];
  risk_sectors: string[];
  core_signals: string[];
  confidence: number;
  sector_summary: string;
};

export type SectorManagerDatesData = {
  dates: string[];
};

export const getSectorTrendDates = async () => {
  const response = await http.get<ApiResponse<SectorTrendDatesData>>(
    "/api/v1/data/analyst/sector/trend/dates"
  );

  return response.data;
};

export const getSectorTrendByTradeDate = async (tradeDate: string) => {
  const response = await http.get<ApiResponse<SectorTrendData>>(
    `/api/v1/data/analyst/sector/trend/${tradeDate}`
  );

  return response.data;
};

export const getSectorTrendSeriesByCode = async (code: string) => {
  const response = await http.get<ApiResponse<SectorTrendSeriesDetail>>(
    `/api/v1/data/analyst/sector/trend/series/${code}`
  );

  return response.data;
};

export const getSectorCapitalFlowDates = async () => {
  const response = await http.get<ApiResponse<SectorCapitalFlowDatesData>>(
    "/api/v1/data/analyst/sector/capital-flow/dates"
  );

  return response.data;
};

export const getSectorCapitalFlowByTradeDate = async (tradeDate: string) => {
  const response = await http.get<ApiResponse<SectorCapitalFlowData>>(
    `/api/v1/data/analyst/sector/capital-flow/${tradeDate}`
  );

  return response.data;
};

export const getSectorManagerDates = async () => {
  const response = await http.get<ApiResponse<SectorManagerDatesData>>("/api/v1/data/sector/dates");

  return response.data;
};

export const getSectorManagerByTradeDate = async (tradeDate: string) => {
  const response = await http.get<ApiResponse<SectorManagerData>>(`/api/v1/data/sector/${tradeDate}`);

  return response.data;
};
