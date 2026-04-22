import { useMemo, useState } from "react";
import type { UTCTimestamp } from "lightweight-charts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { KLineVolumeChart, type KLinePoint } from "~/components/charts/kline-volume-chart";
import type { TechnicalData } from "~/types/data/stock";

const baseTechnicalData: TechnicalData = {
  tsCode: "000060.SZ",
  tradeDate: "20241104",
  startDate: "20240329",
  latestPrice: 5.05,
  latestPctChg: 0.7984,
  supportLevels: [4.85, 4.6],
  resistanceLevels: [5.1, 5.11],
  technicalScore: 65,
  trendSignal: "uptrend",
  trendStrength: "medium",
  shortTermOutlook: "短期价格可能面临回调压力，RSI与KDJ均提示超买，且价格贴近布林上轨。",
  riskReminder: "关注超买后回撤、放量冲高回落，以及布林带上轨附近波动放大风险。",
  summary:
    "股票整体仍处上升结构，短中期均线维持多头排列，但动能边际放缓。支撑位关注4.85与4.60，阻力位关注5.10与5.11。",
  indicators: {
    ma: "多头排列，短期MA（5/10/20）高于MA60。",
    macd: "DIF与DEA仍在零轴上方，但柱体较短，动能趋缓。",
    rsi: "RSI14=74.29，位于超买区。",
    kdj: "KDJ高位，J值偏高，短线震荡概率提升。",
    boll: "价格接近布林上轨，存在上方压力。",
  },
  stockKlineData: [
    { tradeDate: "20240924", open: 4.19, high: 4.32, low: 4.19, close: 4.3, pctChg: 2.8708, vol: 524542.6 },
    { tradeDate: "20240925", open: 4.35, high: 4.45, low: 4.31, close: 4.31, pctChg: 0.2326, vol: 547220.79 },
    { tradeDate: "20240926", open: 4.31, high: 4.45, low: 4.3, close: 4.45, pctChg: 3.2483, vol: 448165.03 },
    { tradeDate: "20240927", open: 4.5, high: 4.65, low: 4.49, close: 4.58, pctChg: 2.9213, vol: 729388.69 },
    { tradeDate: "20240930", open: 4.75, high: 5.0, low: 4.69, close: 4.96, pctChg: 8.2969, vol: 1492671.02 },
    { tradeDate: "20241008", open: 5.46, high: 5.46, low: 4.96, close: 5.19, pctChg: 4.6371, vol: 1808224.14 },
    { tradeDate: "20241009", open: 5.12, high: 5.12, low: 4.85, close: 4.88, pctChg: -5.973, vol: 1297333.63 },
    { tradeDate: "20241010", open: 4.88, high: 5.05, low: 4.84, close: 4.94, pctChg: 1.2295, vol: 1003091.48 },
    { tradeDate: "20241011", open: 4.95, high: 4.97, low: 4.76, close: 4.83, pctChg: -2.2267, vol: 635344.33 },
    { tradeDate: "20241014", open: 4.84, high: 4.9, low: 4.78, close: 4.86, pctChg: 0.6211, vol: 555722.63 },
    { tradeDate: "20241015", open: 4.83, high: 4.85, low: 4.71, close: 4.71, pctChg: -3.0864, vol: 514130.81 },
    { tradeDate: "20241016", open: 4.69, high: 4.77, low: 4.67, close: 4.73, pctChg: 0.4246, vol: 443849.97 },
    { tradeDate: "20241017", open: 4.75, high: 4.77, low: 4.65, close: 4.65, pctChg: -1.6913, vol: 377919.81 },
    { tradeDate: "20241018", open: 4.63, high: 4.79, low: 4.62, close: 4.72, pctChg: 1.5054, vol: 641331.3 },
    { tradeDate: "20241021", open: 4.73, high: 4.8, low: 4.71, close: 4.74, pctChg: 0.4237, vol: 610999.36 },
    { tradeDate: "20241022", open: 4.71, high: 4.8, low: 4.71, close: 4.8, pctChg: 1.2658, vol: 578261.91 },
    { tradeDate: "20241023", open: 4.8, high: 4.84, low: 4.77, close: 4.8, pctChg: 0, vol: 465532.17 },
    { tradeDate: "20241024", open: 4.78, high: 4.81, low: 4.72, close: 4.8, pctChg: 0, vol: 399884.1 },
    { tradeDate: "20241025", open: 4.79, high: 4.85, low: 4.77, close: 4.83, pctChg: 0.625, vol: 511576.68 },
    { tradeDate: "20241028", open: 4.83, high: 4.94, low: 4.82, close: 4.94, pctChg: 2.2774, vol: 618280.05 },
    { tradeDate: "20241029", open: 4.98, high: 4.99, low: 4.82, close: 4.84, pctChg: -2.0243, vol: 629208.79 },
    { tradeDate: "20241030", open: 4.85, high: 4.92, low: 4.78, close: 4.85, pctChg: 0.2066, vol: 535786.69 },
    { tradeDate: "20241031", open: 4.88, high: 4.94, low: 4.83, close: 4.92, pctChg: 1.4433, vol: 673108.75 },
    { tradeDate: "20241101", open: 4.9, high: 5.14, low: 4.88, close: 5.01, pctChg: 1.8293, vol: 1500505.21 },
    { tradeDate: "20241104", open: 5.08, high: 5.1, low: 4.96, close: 5.05, pctChg: 0.7984, vol: 900503.43 },
  ],
  recentBars: [
    { tradeDate: "20241022", close: 4.8, pctChg: 1.2658, ma5: 4.728, ma10: 4.786, ma20: 4.6015, ma60: 4.2648, rsi14: 63.69, macdDif: 0.155, macdDea: 0.1648, macdHist: -0.0195, k: 29.45, d: 32.33, j: 23.7, bollUpper: 5.2727, bollMid: 4.6015, bollLower: 3.9303 },
    { tradeDate: "20241023", close: 4.8, pctChg: 0, ma5: 4.742, ma10: 4.778, ma20: 4.643, ma60: 4.2748, rsi14: 60.61, macdDif: 0.1506, macdDea: 0.1619, macdHist: -0.0227, k: 36.78, d: 33.81, j: 42.71, bollUpper: 5.2493, bollMid: 4.643, bollLower: 4.0367 },
    { tradeDate: "20241024", close: 4.8, pctChg: 0, ma5: 4.772, ma10: 4.764, ma20: 4.6785, ma60: 4.2873, rsi14: 57.24, macdDif: 0.1454, macdDea: 0.1586, macdHist: -0.0264, k: 45.95, d: 37.86, j: 62.13, bollUpper: 5.229, bollMid: 4.6785, bollLower: 4.128 },
    { tradeDate: "20241025", close: 4.83, pctChg: 0.625, ma5: 4.794, ma10: 4.764, ma20: 4.713, ma60: 4.3007, rsi14: 44.44, macdDif: 0.1421, macdDea: 0.1553, macdHist: -0.0265, k: 61.07, d: 45.59, j: 92.01, bollUpper: 5.2047, bollMid: 4.713, bollLower: 4.2213 },
    { tradeDate: "20241028", close: 4.94, pctChg: 2.2774, ma5: 4.834, ma10: 4.772, ma20: 4.751, ma60: 4.3158, rsi14: 38.1, macdDif: 0.1466, macdDea: 0.1536, macdHist: -0.0139, k: 74.04, d: 55.08, j: 111.98, bollUpper: 5.1832, bollMid: 4.751, bollLower: 4.3188 },
    { tradeDate: "20241029", close: 4.84, pctChg: -2.0243, ma5: 4.842, ma10: 4.785, ma20: 4.778, ma60: 4.3283, rsi14: 47.62, macdDif: 0.1405, macdDea: 0.151, macdHist: -0.0209, k: 69.18, d: 59.78, j: 87.99, bollUpper: 5.1556, bollMid: 4.778, bollLower: 4.4004 },
    { tradeDate: "20241030", close: 4.85, pctChg: 0.2066, ma5: 4.852, ma10: 4.797, ma20: 4.805, ma60: 4.3413, rsi14: 44.3, macdDif: 0.135, macdDea: 0.1478, macdHist: -0.0256, k: 66.84, d: 62.13, j: 76.26, bollUpper: 5.1123, bollMid: 4.805, bollLower: 4.4977 },
    { tradeDate: "20241031", close: 4.92, pctChg: 1.4433, ma5: 4.876, ma10: 4.824, ma20: 4.8285, ma60: 4.3555, rsi14: 56, macdDif: 0.1347, macdDea: 0.1452, macdHist: -0.021, k: 69.56, d: 64.61, j: 79.47, bollUpper: 5.09, bollMid: 4.8285, bollLower: 4.567 },
    { tradeDate: "20241101", close: 5.01, pctChg: 1.8293, ma5: 4.912, ma10: 4.853, ma20: 4.85, ma60: 4.369, rsi14: 59.26, macdDif: 0.14, macdDea: 0.1441, macdHist: -0.0082, k: 69.63, d: 66.28, j: 76.32, bollUpper: 5.0957, bollMid: 4.85, bollLower: 4.6043 },
    { tradeDate: "20241104", close: 5.05, pctChg: 0.7984, ma5: 4.934, ma10: 4.884, ma20: 4.8545, ma60: 4.383, rsi14: 74.29, macdDif: 0.1459, macdDea: 0.1445, macdHist: 0.0028, k: 72.61, d: 68.39, j: 81.05, bollUpper: 5.1117, bollMid: 4.8545, bollLower: 4.5973 },
  ],
};

function variantFromBase(base: TechnicalData, overrides: Partial<TechnicalData>): TechnicalData {
  return {
    ...base,
    ...overrides,
    stockKlineData: overrides.stockKlineData ?? base.stockKlineData,
    recentBars: overrides.recentBars ?? base.recentBars,
    indicators: overrides.indicators ?? base.indicators,
  };
}

const technicalByDateAndStock: Record<string, Record<string, TechnicalData>> = {
  "2024-11-04": {
    "000060.SZ": baseTechnicalData,
    "000027.SZ": variantFromBase(baseTechnicalData, {
      tsCode: "000027.SZ",
      latestPrice: 6.15,
      latestPctChg: -0.42,
      technicalScore: 59,
      trendSignal: "range",
      trendStrength: "low",
      supportLevels: [6.02, 5.88],
      resistanceLevels: [6.28, 6.4],
      shortTermOutlook: "震荡偏弱，短线反弹持续性需观察量能配合。",
      riskReminder: "若跌破6.02，需警惕区间下沿失守风险。",
      summary: "均线纠缠、动能中性偏弱，暂以区间交易思路看待。",
    }),
  },
  "2024-10-31": {
    "000060.SZ": variantFromBase(baseTechnicalData, {
      tradeDate: "20241031",
      latestPrice: 4.92,
      latestPctChg: 1.4433,
      technicalScore: 61,
      shortTermOutlook: "上行斜率放缓，仍处修复通道内。",
    }),
    "000027.SZ": variantFromBase(baseTechnicalData, {
      tsCode: "000027.SZ",
      tradeDate: "20241031",
      latestPrice: 6.08,
      latestPctChg: 0.36,
      technicalScore: 57,
      trendSignal: "range",
      trendStrength: "low",
      supportLevels: [5.95, 5.8],
      resistanceLevels: [6.2, 6.34],
      summary: "中期方向不明朗，关注突破方向再提升仓位。",
    }),
  },
};

export default function StockTechnicalAnalystPage() {
  const dateOptions = Object.keys(technicalByDateAndStock).sort((a, b) => (a > b ? -1 : 1));
  const [selectedDate, setSelectedDate] = useState(dateOptions[0] ?? "");
  const stockOptions = useMemo(() => Object.keys(technicalByDateAndStock[selectedDate] ?? {}), [selectedDate]);
  const [selectedStock, setSelectedStock] = useState(stockOptions[0] ?? "");
  const activeStock = stockOptions.includes(selectedStock) ? selectedStock : stockOptions[0];
  const current = technicalByDateAndStock[selectedDate]?.[activeStock] ?? baseTechnicalData;

  const klineData: KLinePoint[] = useMemo(
    () =>
      current.stockKlineData.map((item) => ({
        time: toUtcTimestamp(item.tradeDate),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.vol,
      })),
    [current.stockKlineData]
  );

  const overlayLevels = useMemo(
    () => [
      ...current.supportLevels.map((value, index) => ({
        title: `S${index + 1} ${value.toFixed(2)}`,
        value,
        color: "#16a34a",
        lineStyle: "dashed" as const,
      })),
      ...current.resistanceLevels.map((value, index) => ({
        title: `R${index + 1} ${value.toFixed(2)}`,
        value,
        color: "#dc2626",
        lineStyle: "dashed" as const,
      })),
    ],
    [current.supportLevels, current.resistanceLevels]
  );

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">个股技术面分析师（stock_technical_analyst）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          对接技术面数据，主图展示K线与成交量并标注支撑/压力位，不再拆分展示指标子图。
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs text-slate-500">选择日期</span>
            <select
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              {dateOptions.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs text-slate-500">选择股票</span>
            <select
              value={activeStock}
              onChange={(event) => setSelectedStock(event.target.value)}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              {stockOptions.map((stock) => (
                <option key={stock} value={stock}>
                  {stock}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="技术评分" value={String(current.technicalScore)} />
        <Metric title="趋势" value={`${current.trendSignal} / ${current.trendStrength}`} />
        <Metric title="最新价格" value={current.latestPrice.toFixed(2)} />
        <Metric
          title="最新涨跌幅"
          value={`${current.latestPctChg >= 0 ? "+" : ""}${current.latestPctChg.toFixed(2)}%`}
          valueClassName={current.latestPctChg >= 0 ? "text-emerald-600" : "text-rose-600"}
        />
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">
            日线K线与成交量（已标注支撑/压力位）（{current.tsCode}，{current.startDate} - {current.tradeDate}）
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pt-3 pb-4">
          <KLineVolumeChart data={klineData} height={380} overlayLevels={overlayLevels} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">图上标注说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pt-3 pb-4 text-sm text-slate-700">
            <ul className="space-y-1">
              <li>- 支撑位：绿色虚线，标注为 S1/S2。</li>
              <li>- 压力位：红色虚线，标注为 R1/R2。</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">指标文字解读</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pt-3 pb-4 text-sm text-slate-700">
            <ul className="space-y-1">
              {Object.entries(current.indicators).map(([key, value]) => (
                <li key={key}>
                  - {key.toUpperCase()}：{value}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">技术面结论与风险</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 pt-3 pb-4 text-sm text-slate-700">
          <p>{current.summary}</p>
          <p>短期展望：{current.shortTermOutlook}</p>
          <p>风险提示：{current.riskReminder}</p>
        </CardContent>
      </Card>
    </section>
  );
}

function toUtcTimestamp(yyyymmdd: string): UTCTimestamp {
  const year = Number(yyyymmdd.slice(0, 4));
  const month = Number(yyyymmdd.slice(4, 6)) - 1;
  const day = Number(yyyymmdd.slice(6, 8));
  return (Date.UTC(year, month, day) / 1000) as UTCTimestamp;
}

function Metric({
  title,
  value,
  valueClassName = "text-slate-700",
}: {
  title: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-sm text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className={`px-4 pt-2 pb-4 text-sm font-medium ${valueClassName}`}>{value}</CardContent>
    </Card>
  );
}
