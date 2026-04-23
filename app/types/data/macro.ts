import type { UTCTimestamp } from "lightweight-charts";

export type IndexCode = "000001.SH" | "000016.SH" | "000905.SH" | "399005.SZ" | "399006.SZ";

export type IndexMeta = {
  code: IndexCode;
  name: string;
  indexTrend: "up" | "down" | "neutral";
  turnoverSummary: string;
  volatilitySummary: string;
  marketConclusion: string;
  startPrice: number;
  endPrice: number;
  startVolume: number;
  endVolume: number;
};

export type CandlePoint = {
  day: string;
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  up: boolean;
  volume: number;
};

export type CommodityItem = {
  name: string;
  trend: "up" | "down" | "neutral";
  start: number;
  end: number;
  priceSummary: string;
  macroImplication: string;
};

export type Candle = { o: number; h: number; l: number; c: number };

export type MacroManagerOutput = {
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

export type MetricChartProps = {
  title: string;
  data: Array<Record<string, number | string>>;
  dataKey: string;
  stroke?: string;
  fill?: string;
  xKey?: string;
};
