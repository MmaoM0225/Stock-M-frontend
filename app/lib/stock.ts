import { http } from "~/lib/http";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  trace_id?: string;
  error_code?: string;
};

export type ScreenerFilteredStock = {
  ts_code: string;
  name: string;
  industry: string;
  close: number;
  pe: number;
  pe_ttm: number;
  pb: number;
  total_mv: number;
  circ_mv: number;
  turnover_rate: number;
  volume_ratio: number;
  dv_ratio: number;
  ps_ttm: number;
};

export type ScreenerSectorTemplatePlanEntry = {
  template_id: string;
  overrides: Record<string, unknown>;
  confidence: number;
};

export type ScreenerData = {
  trade_date: string;
  total_count: number;
  filter_summary: string;
  applied_filters: string[];
  sector_distribution: Record<string, number>;
  sector_template_applied: Record<string, string>;
  sector_pick_counts: Record<string, number>;
  sector_template_plan?: Record<string, ScreenerSectorTemplatePlanEntry>;
  filtered_stocks: ScreenerFilteredStock[];
};

export type ScreenerDatesData = {
  dates: string[];
};

export type FundamentalTsCodesData = {
  ts_codes: string[];
};

export type FundamentalDatesData = {
  ts_code: string;
  dates: string[];
};

export type FundamentalCompany = {
  name: string;
  exchange: string;
  chairman: string;
  manager: string;
  secretary: string;
  province: string;
  city: string;
  employees: number;
  website: string;
  email: string;
  main_business: string;
};

export type FundamentalFetchStatus = {
  company_info: number;
  valuation: number;
  income: number;
  cashflow: number;
  balancesheet: number;
  dividend: number;
  complete_success: boolean;
};

export type FundamentalReduceResult = {
  overall_score: number;
  rating_label: string;
  confidence: string;
  valuation_view: string;
  summary: string;
  key_conclusions: string[];
  major_risks: string[];
};

export type FundamentalValuationPoint = {
  date: string;
  close: number;
  pe_ttm: number;
  pb: number;
};

export type FundamentalIncomePoint = {
  period: string;
  revenue: number;
  net_profit: number;
  op_margin: number;
  net_margin: number;
};

export type FundamentalCashflowPoint = {
  period: string;
  cfo: number;
  cfi: number;
  cff: number;
  fcf: number;
};

export type FundamentalLiabilityPoint = {
  period: string;
  assets: number;
  liab: number;
  debt_to_assets: number;
};

export type FundamentalDividendYieldPoint = {
  date: string;
  dv_ratio: number;
  dv_ttm: number;
};

export type FundamentalData = {
  ts_code: string;
  trade_date: string;
  company: FundamentalCompany;
  fetch_status: FundamentalFetchStatus;
  reduce_result: FundamentalReduceResult;
  valuation_trend: FundamentalValuationPoint[];
  income_trend: FundamentalIncomePoint[];
  cashflow_trend: FundamentalCashflowPoint[];
  liability_trend: FundamentalLiabilityPoint[];
  dividend_yield_trend: FundamentalDividendYieldPoint[];
};

export type TechnicalTsCodesData = {
  ts_codes: string[];
};

export type TechnicalDatesData = {
  ts_code: string;
  dates: string[];
};

export type TechnicalKlineRow = {
  trade_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  pct_chg: number;
  vol: number;
};

export type TechnicalRecentBar = {
  trade_date: string;
  close: number;
  pct_chg: number;
  ma5?: number;
  ma10?: number;
  ma20?: number;
  ma60?: number;
  rsi14?: number;
  macd_dif?: number;
  macd_dea?: number;
  macd_hist?: number;
  k?: number;
  d?: number;
  j?: number;
  boll_upper?: number;
  boll_mid?: number;
  boll_lower?: number;
};

export type TechnicalData = {
  ts_code: string;
  trade_date: string;
  start_date: string;
  latest_price: number;
  latest_pct_chg: number;
  support_levels: number[];
  resistance_levels: number[];
  technical_score: number;
  trend_signal: string;
  trend_strength: string;
  short_term_outlook: string;
  risk_reminder: string;
  summary: string;
  indicators: Record<string, string>;
  stock_kline_data: TechnicalKlineRow[];
  recent_bars: TechnicalRecentBar[];
};

export type StockManagerTsCodesData = {
  ts_codes: string[];
};

export type StockManagerDatesData = {
  ts_code: string;
  dates: string[];
};

export type StockManagerData = {
  ts_code: string;
  trade_date: string;
  success: boolean;
  overall_score: number;
  confidence: string;
  selection_reason: string;
  risk_level: string;
  component_scores: {
    fundamental: number;
    technical: number;
  };
  action_signal: string;
  signal_reason: string;
  key_points: string[];
  risks: string[];
  summary: string;
};

export type StockPoolDatesData = {
  dates: string[];
};

export type StockPoolCandidate = {
  ts_code: string;
  name: string;
  industry: string;
  overall_score: number;
  action_signal: string;
  risk_level: string;
  selection_reason: string;
  analyze_error: string | null;
};

export type StockPoolPerStock = {
  ts_code: string;
  name: string;
  industry: string;
  stock_manager_summary: {
    overall_score: number;
    confidence: string;
    action_signal: string;
    risk_level: string;
    key_points: string[];
    risks: string[];
    summary: string;
  };
  error: string | null;
};

export type StockPoolData = {
  trade_date: string;
  pool_size: number;
  analyzed_count: number;
  analyze_success_count: number;
  analyze_error_count: number;
  summary_text: string;
  candidate_stocks: StockPoolCandidate[];
  top_stocks: StockPoolCandidate[];
  per_stock: StockPoolPerStock[];
};

export type PortfolioDecisionDatesData = {
  dates: string[];
};

export type PortfolioDecisionVersionsData = {
  versions: string[];
};

export type PortfolioDecisionAssetRow = {
  rank: string;
  asset_name: string;
  ts_code: string | null;
  market_value: number;
  position: string;
  position_change: string;
  total_return: string;
  total_pnl: number;
  asset_type: string;
  shares: number | string;
  cost_price: number | null;
  action: string;
  open_price: number | null;
};

export type PortfolioDecisionOperationRow = {
  asset_name: string;
  ts_code: string | null;
  action: string;
  old_position: string;
  new_position: string;
  position_change: string;
  execution_price: number | null;
  target_amount: number;
  actual_amount: number;
  shares: number;
  cost_price: number | null;
  reason: string;
};

export type PortfolioDecisionData = {
  strategy?: string;
  trade_date: string;
  portfolio_table: PortfolioDecisionAssetRow[];
  operation_reason_table: PortfolioDecisionOperationRow[];
  decision_summary: string;
  meta: {
    initial_capital: number;
    total_capital: number;
    source_portfolio_path: string;
    generated_at: string;
  };
};

export type PortfolioSnapshotDatesData = {
  dates: string[];
};

export type PortfolioSnapshotMetrics = {
  annualized_return_pct: number;
  sharpe_ratio: number;
  max_drawdown_pct: number;
  one_week_return_pct: number;
  one_month_return_pct: number;
};

export type PortfolioSnapshotPosition = {
  ts_code: string;
  name: string;
  industry: string;
  weight: number;
  shares: number;
  cost_price: number;
  latest_price: number;
};

export type PortfolioSnapshotData = {
  trade_date: string;
  metrics: PortfolioSnapshotMetrics;
  positions: PortfolioSnapshotPosition[];
};

export type PortfolioHistoryPoint = {
  date: string;
  net_value: number;
  daily_return_pct: number;
  drawdown_pct: number;
};

export type PortfolioHistoryData = {
  series: PortfolioHistoryPoint[];
};

export const getScreenerDates = async () => {
  const response = await http.get<ApiResponse<ScreenerDatesData>>("/api/v1/data/screener/dates");

  return response.data;
};

export const getScreenerByTradeDate = async (tradeDate: string) => {
  const response = await http.get<ApiResponse<ScreenerData>>(`/api/v1/data/screener/${tradeDate}`);

  return response.data;
};

export const getFundamentalTsCodes = async () => {
  const response = await http.get<ApiResponse<FundamentalTsCodesData>>("/api/v1/data/fundamental/ts_codes");

  return response.data;
};

export const getFundamentalDatesByCode = async (tsCode: string) => {
  const response = await http.get<ApiResponse<FundamentalDatesData>>(`/api/v1/data/fundamental/${tsCode}/dates`);

  return response.data;
};

export const getFundamentalByCodeAndDate = async (tsCode: string, tradeDate: string) => {
  const response = await http.get<ApiResponse<FundamentalData>>(`/api/v1/data/fundamental/${tsCode}/${tradeDate}`);

  return response.data;
};

export const getTechnicalTsCodes = async () => {
  const response = await http.get<ApiResponse<TechnicalTsCodesData>>("/api/v1/data/technical/ts_codes");

  return response.data;
};

export const getTechnicalDatesByCode = async (tsCode: string) => {
  const response = await http.get<ApiResponse<TechnicalDatesData>>(`/api/v1/data/technical/${tsCode}/dates`);

  return response.data;
};

export const getTechnicalByCodeAndDate = async (tsCode: string, tradeDate: string) => {
  const response = await http.get<ApiResponse<TechnicalData>>(`/api/v1/data/technical/${tsCode}/${tradeDate}`);

  return response.data;
};

export const getStockManagerTsCodes = async () => {
  const response = await http.get<ApiResponse<StockManagerTsCodesData>>("/api/v1/data/stock/ts_codes");

  return response.data;
};

export const getStockManagerDatesByCode = async (tsCode: string) => {
  const response = await http.get<ApiResponse<StockManagerDatesData>>(`/api/v1/data/stock/${tsCode}/dates`);

  return response.data;
};

export const getStockManagerByCodeAndDate = async (tsCode: string, tradeDate: string) => {
  const response = await http.get<ApiResponse<StockManagerData>>(`/api/v1/data/stock/${tsCode}/${tradeDate}`);

  return response.data;
};

export const getStockPoolDates = async () => {
  const response = await http.get<ApiResponse<StockPoolDatesData>>("/api/v1/data/stock-pool/dates");

  return response.data;
};

export const getStockPoolByTradeDate = async (tradeDate: string) => {
  const response = await http.get<ApiResponse<StockPoolData>>(`/api/v1/data/stock-pool/${tradeDate}`);

  return response.data;
};

export const getPortfolioDecisionDates = async () => {
  const response = await http.get<ApiResponse<PortfolioDecisionDatesData>>("/api/v1/data/portfolio/dates");

  return response.data;
};

export const getPortfolioDecisionByTradeDate = async (tradeDate: string) => {
  const response = await http.get<ApiResponse<PortfolioDecisionData>>(`/api/v1/data/portfolio/${tradeDate}`);

  return response.data;
};

export const getPortfolioDecisionVersions = async () => {
  const response = await http.get<ApiResponse<PortfolioDecisionVersionsData>>("/api/v1/data/portfolio/versions");

  return response.data;
};

export const getPortfolioDecisionDatesByVersion = async (version: string) => {
  const response = await http.get<ApiResponse<PortfolioDecisionDatesData>>(`/api/v1/data/portfolio/${version}/dates`);

  return response.data;
};

export const getPortfolioDecisionByVersionAndTradeDate = async (version: string, tradeDate: string) => {
  const response = await http.get<ApiResponse<PortfolioDecisionData>>(`/api/v1/data/portfolio/${version}/${tradeDate}`);

  return response.data;
};

export const getPortfolioSnapshotDatesByVersion = async (version: string) => {
  const response = await http.get<ApiResponse<PortfolioSnapshotDatesData>>(`/api/v1/data/portfolio/${version}/dates`);

  return response.data;
};

export const getPortfolioSnapshotByVersionAndTradeDate = async (version: string, tradeDate: string) => {
  const normalizedTradeDate = normalizeCompactDate(tradeDate);
  const response = await http.get<ApiResponse<PortfolioSnapshotData>>(`/api/v1/portfolio/${version}/${normalizedTradeDate}`);

  return response.data;
};

export const getPortfolioHistoryByVersion = async (version: string, startDate?: string, endDate?: string) => {
  const response = await http.get<ApiResponse<PortfolioHistoryData>>(`/api/v1/portfolio/${version}/history`, {
    params: {
      start_date: startDate ? normalizeCompactDate(startDate) : undefined,
      end_date: endDate ? normalizeCompactDate(endDate) : undefined,
    },
  });

  return response.data;
};

function normalizeCompactDate(value: string) {
  return value.replaceAll("-", "");
}
