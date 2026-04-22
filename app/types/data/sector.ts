export type SectorTrendOutput = {
  summary: string;
  conclusion: string;
  leadingThemes: string[];
  reversalOpportunities: string[];
  topRiskSectors: string[];
  highlights: string[];
  marketRegime: "mixed" | "trend" | "risk-off";
};

export type SectorKLineRow = {
  tsCode: string;
  tradeDate: string;
  open: number;
  high: number;
  low: number;
  close: number;
  pctChange: number;
  vol: number;
};

export type SectorSeries = {
  tsCode: string;
  name: string;
  rows: SectorKLineRow[];
};

export type SectorFlowPoint = {
  name: string;
  netAmount: number;
};

export type SectorDailyRow = {
  tradeDate: string;
  tsCode: string;
  name: string;
  leadStock: string;
  pctChange: number;
  netAmount: number;
};
