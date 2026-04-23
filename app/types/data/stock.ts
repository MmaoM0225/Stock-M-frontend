export type StockItem = {
  tsCode: string;
  name: string;
  industry: string;
  close: number;
  pe: number;
  peTtm: number;
  pb: number;
  totalMv: number;
  circMv: number;
  turnoverRate: number;
  volumeRatio: number;
  dvRatio: number;
  psTtm: number;
};

export type TemplateRule = {
  minMarketCap: number;
  maxPe: number;
  maxPb: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

export type StockManagerSummary = {
  tsCode: string;
  success: boolean;
  overallScore: number;
  confidence: string;
  selectionReason: string;
  riskLevel: string;
  componentScores: {
    fundamental: number;
    technical: number;
  };
  actionSignal: string;
  signalReason: string;
  keyPoints: string[];
  risks: string[];
  summary: string;
};

export type PoolCandidate = {
  tsCode: string;
  name: string;
  industry: string;
  overallScore: number;
  actionSignal: string;
  riskLevel: string;
  selectionReason: string;
  analyzeError: string | null;
};

export type PoolDetail = {
  tsCode: string;
  name: string;
  industry: string;
  stockManagerSummary: {
    overallScore: number;
    confidence: string;
    actionSignal: string;
    riskLevel: string;
    keyPoints: string[];
    risks: string[];
    summary: string;
  };
  error: string | null;
};

export type PoolManagerResult = {
  tradeDate: string;
  poolSize: number;
  analyzedCount: number;
  analyzeSuccessCount: number;
  analyzeErrorCount: number;
  summaryText: string;
  candidateStocks: PoolCandidate[];
  topStocks: PoolCandidate[];
  perStock: PoolDetail[];
};

export type StockKline = {
  tradeDate: string;
  open: number;
  high: number;
  low: number;
  close: number;
  pctChg: number;
  vol: number;
};

export type RecentBar = {
  tradeDate: string;
  close: number;
  pctChg: number;
  ma5: number;
  ma10: number;
  ma20: number;
  ma60: number;
  rsi14: number;
  macdDif: number;
  macdDea: number;
  macdHist: number;
  k: number;
  d: number;
  j: number;
  bollUpper: number;
  bollMid: number;
  bollLower: number;
};

export type TechnicalData = {
  tsCode: string;
  tradeDate: string;
  startDate: string;
  latestPrice: number;
  latestPctChg: number;
  supportLevels: number[];
  resistanceLevels: number[];
  technicalScore: number;
  trendSignal: string;
  trendStrength: string;
  shortTermOutlook: string;
  riskReminder: string;
  summary: string;
  indicators: Record<string, string>;
  stockKlineData: StockKline[];
  recentBars: RecentBar[];
};
