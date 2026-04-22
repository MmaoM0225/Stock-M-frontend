import { http } from "~/lib/http";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  trace_id?: string;
  error_code?: string;
};

export type MacroMetricPoint = {
  month: string;
  value: number;
};

export type MacroGdpPoint = {
  quarter: string;
  value: number;
};

export type MacroEconomistLlmOutput = {
  growth_signal: string;
  inflation_signal: string;
  liquidity_signal: string;
  macro_regime: string;
  equity_market_bias: string;
  bond_market_bias: string;
  commodity_bias: string;
  liquidity_summary: string;
  conclusion: string;
};

export type MacroEconomistData = {
  trade_date: string;
  lpr_data: MacroMetricPoint[];
  cpi_data: MacroMetricPoint[];
  sf_data: MacroMetricPoint[];
  pmi_data: MacroMetricPoint[];
  m2_data: MacroMetricPoint[];
  gdp_data: MacroGdpPoint[];
  llm_output: MacroEconomistLlmOutput;
};

export type MacroEconomistDatesData = {
  dates: string[];
};

export type MarketSentimentSeriesPoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type MarketSentimentIndexItem = {
  code: string;
  name: string;
  index_trend: "up" | "down" | "neutral";
  turnover_summary: string;
  volatility_summary: string;
  market_conclusion: string;
  start_price: number;
  end_price: number;
  start_volume: number;
  end_volume: number;
  market_series: MarketSentimentSeriesPoint[];
};

export type MarketSentimentOutput = {
  index_trend: string;
  market_sentiment: string;
  volume_signal: string;
  volatility_signal: string;
  sentiment_summary: string;
};

export type MarketSentimentData = {
  trade_date: string;
  index_items: MarketSentimentIndexItem[];
  sentiment_output: MarketSentimentOutput;
};

export type MarketSentimentDatesData = {
  dates: string[];
};

export type CommoditySeriesPoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type CommodityItemData = {
  name: string;
  trend: "up" | "down" | "neutral";
  start: number;
  end: number;
  price_summary: string;
  macro_implication: string;
  market_series: CommoditySeriesPoint[];
};

export type CommodityOutputSummary = {
  overall_trend: string;
  commodity_market_trend: string;
  macro_signals: {
    growth_signal: string;
    inflation_signal: string;
    risk_sentiment: string;
  };
  macro_summary: string;
};

export type CommodityData = {
  trade_date: string;
  commodity_items: CommodityItemData[];
  output_summary: CommodityOutputSummary;
};

export type CommodityDatesData = {
  dates: string[];
};

export type NewsEvent = {
  source: string;
  type: string;
  summary: string;
  industry: string[];
  sentiment: "positive" | "negative" | "neutral";
  impact_level: number;
};

export type NewsSectorImpact = {
  sentiment: "bullish" | "bearish" | "neutral";
  confidence: number;
  reason: string[];
};

export type NewsMacroEnvironment = {
  liquidity: string;
  policy_bias: string;
  global_risk: string;
  market_sentiment: string;
};

export type NewsAnalystData = {
  date: string;
  events: NewsEvent[];
  sector_impacts: Record<string, NewsSectorImpact>;
  macro_environment: NewsMacroEnvironment;
};

export type NewsAnalystDatesData = {
  dates: string[];
};

export type MacroManagerData = {
  trade_date: string;
  market_regime: string;
  market_direction: string;
  target_position: string;
  focus_industry_sectors: string[];
  focus_concept_sectors: string[];
  avoid_sectors: string[];
  macro_themes: string[];
  risk_factors: string[];
  confidence: number;
  macro_summary: string;
};

export type MacroManagerDatesData = {
  dates: string[];
};

export const getMacroEconomistDates = async () => {
  const response = await http.get<ApiResponse<MacroEconomistDatesData>>(
    "/api/v1/data/analyst/macro/economist/dates"
  );

  return response.data;
};

export const getMacroEconomistByTradeDate = async (tradeDate: string) => {
  const response = await http.get<ApiResponse<MacroEconomistData>>(
    `/api/v1/data/analyst/macro/economist/${tradeDate}`
  );

  return response.data;
};

export const getMarketSentimentDates = async () => {
  const response = await http.get<ApiResponse<MarketSentimentDatesData>>(
    "/api/v1/data/analyst/macro/market-sentiment/dates"
  );

  return response.data;
};

export const getMarketSentimentByTradeDate = async (tradeDate: string) => {
  const response = await http.get<ApiResponse<MarketSentimentData>>(
    `/api/v1/data/analyst/macro/market-sentiment/${tradeDate}`
  );

  return response.data;
};

export const getCommodityDates = async () => {
  const response = await http.get<ApiResponse<CommodityDatesData>>(
    "/api/v1/data/analyst/macro/commodity/dates"
  );

  return response.data;
};

export const getCommodityByTradeDate = async (tradeDate: string) => {
  const response = await http.get<ApiResponse<CommodityData>>(
    `/api/v1/data/analyst/macro/commodity/${tradeDate}`
  );

  return response.data;
};

export const getNewsAnalystDates = async () => {
  const response = await http.get<ApiResponse<NewsAnalystDatesData>>(
    "/api/v1/data/analyst/macro/news/dates"
  );

  return response.data;
};

export const getNewsAnalystByTradeDate = async (tradeDate: string) => {
  const response = await http.get<ApiResponse<NewsAnalystData>>(
    `/api/v1/data/analyst/macro/news/${tradeDate}`
  );

  return response.data;
};

export const getMacroManagerDates = async () => {
  const response = await http.get<ApiResponse<MacroManagerDatesData>>(
    "/api/v1/data/macro/dates"
  );

  return response.data;
};

export const getMacroManagerByTradeDate = async (tradeDate: string) => {
  const response = await http.get<ApiResponse<MacroManagerData>>(
    `/api/v1/data/macro/${tradeDate}`
  );

  return response.data;
};
