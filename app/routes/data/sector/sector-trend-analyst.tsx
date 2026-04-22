import { useMemo, useState } from "react";
import type { UTCTimestamp } from "lightweight-charts";
import { KLineVolumeChart, type KLinePoint } from "~/components/charts/kline-volume-chart";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type SectorTrendOutput = {
  summary: string;
  conclusion: string;
  leadingThemes: string[];
  reversalOpportunities: string[];
  topRiskSectors: string[];
  highlights: string[];
  marketRegime: "mixed" | "trend" | "risk-off";
};

type SectorKLineRow = {
  tsCode: string;
  tradeDate: string;
  open: number;
  high: number;
  low: number;
  close: number;
  pctChange: number;
  vol: number;
};

type SectorSeries = {
  tsCode: string;
  name: string;
  rows: SectorKLineRow[];
};

const trendOutputByDate: Record<string, SectorTrendOutput> = {
  "2025-03-20": {
    summary:
      "市场呈现明显的结构性分化，以电信、医疗保健、生物科技和运输为代表的趋势主线持续走强，而部分前期强势的化工和金属板块出现高位转弱迹象。",
    conclusion:
      "综合判断，市场处于趋势延续与板块轮动并存的混合状态。建议继续跟踪电信、医疗等强势主线，同时关注冰雪产业、火电等处于底部修复阶段的板块机会，对短期动量转弱的化工、通信设备等板块保持警惕。",
    leadingThemes: ["无线电信业务Ⅲ", "保健护理机构", "生物科技Ⅲ", "海上运输", "自然景点"],
    reversalOpportunities: ["冰雪产业", "火电", "焦炭加工", "公路铁路运输"],
    topRiskSectors: ["多种化学制品", "商品化工", "通信设备", "化学制品", "铝"],
    highlights: [
      "趋势主线（电信、医疗、生物科技）呈现多周期动量共振，风险等级低。",
      "修复机会主要集中在 base_repair 风格，如冰雪产业、火电，短期动量转正但中长期仍处低位或震荡。",
      "高位风险板块（如多种化学制品、铝）普遍出现5日动量转负，显示短期上涨动能衰竭或面临调整压力。",
      "市场未出现单一主导风格，趋势、修复、风险预警板块并存。",
    ],
    marketRegime: "mixed",
  },
  "2025-03-19": {
    summary: "市场延续结构轮动，防御线相对稳健，成长主线分化增强。",
    conclusion: "建议维持主线跟踪与低位修复并行，控制高位回撤风险。",
    leadingThemes: ["无线电信业务Ⅲ", "生物科技Ⅲ", "保健护理机构"],
    reversalOpportunities: ["火电", "公路铁路运输", "冰雪产业"],
    topRiskSectors: ["商品化工", "通信设备", "铝"],
    highlights: [
      "主线强度仍在，但扩散度下降。",
      "修复板块弹性增加，持续性待确认。",
      "高位品种短期动量回落，注意止盈节奏。",
    ],
    marketRegime: "mixed",
  },
};

const baseRows: SectorKLineRow[] = [
  { tsCode: "865001.TI", tradeDate: "20201231", close: 1664.753, open: 1660.706, high: 1671.229, low: 1649.42, pctChange: 0.5646, vol: 13224.26 },
  { tsCode: "865001.TI", tradeDate: "20201230", close: 1655.407, open: 1644.595, high: 1664.229, low: 1638.11, pctChange: 0.3073, vol: 10815.8 },
  { tsCode: "865001.TI", tradeDate: "20201229", close: 1650.336, open: 1686.162, high: 1686.162, low: 1639.053, pctChange: -1.6263, vol: 11763.17 },
  { tsCode: "865001.TI", tradeDate: "20201228", close: 1677.619, open: 1682.567, high: 1689.898, low: 1667.211, pctChange: 0.6698, vol: 11813.21 },
  { tsCode: "865001.TI", tradeDate: "20201224", close: 1666.457, open: 1663.327, high: 1668.849, low: 1648.792, pctChange: 0.6533, vol: 6571.63 },
  { tsCode: "865001.TI", tradeDate: "20200108", close: 1315.819, open: 1313.452, high: 1323.214, low: 1312.709, pctChange: 0.2567, vol: 33180.86 },
  { tsCode: "865001.TI", tradeDate: "20200107", close: 1312.45, open: 1319.858, high: 1323.185, low: 1311.239, pctChange: -0.679, vol: 20959.51 },
  { tsCode: "865001.TI", tradeDate: "20200106", close: 1321.423, open: 1322.809, high: 1328.027, low: 1314.889, pctChange: -0.5953, vol: 21283.4 },
  { tsCode: "865001.TI", tradeDate: "20200103", close: 1329.337, open: 1309.615, high: 1330.664, low: 1309.281, pctChange: 0.6505, vol: 28610.53 },
  { tsCode: "865001.TI", tradeDate: "20200102", close: 1320.746, open: 1342.622, high: 1343.126, low: 1308.663, pctChange: -1.1273, vol: 26149.74 },
];

function shiftedRows(tsCode: string, priceScale: number, volScale: number): SectorKLineRow[] {
  return baseRows.map((row) => ({
    ...row,
    tsCode,
    open: Number((row.open * priceScale).toFixed(3)),
    high: Number((row.high * priceScale).toFixed(3)),
    low: Number((row.low * priceScale).toFixed(3)),
    close: Number((row.close * priceScale).toFixed(3)),
    vol: Number((row.vol * volScale).toFixed(2)),
  }));
}

const sectorSeriesList: SectorSeries[] = [
  { tsCode: "865001.TI", name: "无线电信业务Ⅲ", rows: baseRows },
  { tsCode: "865112.TI", name: "保健护理机构", rows: shiftedRows("865112.TI", 0.72, 0.85) },
  { tsCode: "865207.TI", name: "生物科技Ⅲ", rows: shiftedRows("865207.TI", 0.89, 1.12) },
  { tsCode: "865309.TI", name: "海上运输", rows: shiftedRows("865309.TI", 1.04, 0.94) },
  { tsCode: "865418.TI", name: "自然景点", rows: shiftedRows("865418.TI", 0.67, 0.9) },
];

export default function SectorTrendAnalystPage() {
  const availableDates = Object.keys(trendOutputByDate).sort((a, b) => (a > b ? -1 : 1));
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  const [selectedCode, setSelectedCode] = useState(sectorSeriesList[0].tsCode);
  const trendOutput = useMemo(
    () => trendOutputByDate[selectedDate] ?? trendOutputByDate[availableDates[0]],
    [availableDates, selectedDate]
  );
  const selectedSeries = useMemo(
    () => sectorSeriesList.find((item) => item.tsCode === selectedCode) ?? sectorSeriesList[0],
    [selectedCode]
  );

  const klineData: KLinePoint[] = useMemo(
    () =>
      [...selectedSeries.rows]
        .sort((a, b) => Number(a.tradeDate) - Number(b.tradeDate))
        .map((row) => ({
          time: toUtcTimestamp(row.tradeDate),
          open: row.open,
          high: row.high,
          low: row.low,
          close: row.close,
          volume: row.vol,
        })),
    [selectedSeries.rows]
  );

  const latest = selectedSeries.rows[0];

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">行业趋势分析师（Sector Trend Analyst）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          结合行业趋势判断与板块日线数据，展示主线、修复机会、风险板块及每个板块的 K 线与成交量变化。
        </p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="sector-trend-date" className="text-sm font-medium text-slate-700">
            选择日期
          </label>
          <select
            id="sector-trend-date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="市场状态" value={trendOutput.marketRegime} />
        <MetricCard title="当前板块" value={selectedSeries.name} />
        <MetricCard title="最近涨跌幅" value={`${latest.pctChange.toFixed(2)}%`} tone={latest.pctChange >= 0 ? "up" : "down"} />
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">结论摘要</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 pt-3 pb-4 text-sm leading-6 text-slate-700">
          <p>{trendOutput.summary}</p>
          <p>{trendOutput.conclusion}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <TagListCard title="趋势主线" items={trendOutput.leadingThemes} variant="secondary" />
        <TagListCard title="修复机会" items={trendOutput.reversalOpportunities} variant="outline" />
        <TagListCard title="风险板块" items={trendOutput.topRiskSectors} variant="destructive" />
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">板块走势可视化</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pt-3 pb-4">
          <div className="flex items-center gap-3">
            <label htmlFor="sector-trend-select" className="text-sm font-medium text-slate-700">
              选择板块
            </label>
            <select
              id="sector-trend-select"
              value={selectedCode}
              onChange={(event) => setSelectedCode(event.target.value)}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              {sectorSeriesList.map((item) => (
                <option key={item.tsCode} value={item.tsCode}>
                  {item.name}（{item.tsCode}）
                </option>
              ))}
            </select>
          </div>
          <div className="border border-slate-200 p-2">
            <p className="mb-2 text-xs text-slate-500">K线与成交量（按时间升序）</p>
            <KLineVolumeChart data={klineData} height={380} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">重点观察</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-3 pb-4">
          <ul className="space-y-1 text-sm leading-6 text-slate-700">
            {trendOutput.highlights.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
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

function MetricCard({
  title,
  value,
  tone = "neutral",
}: {
  title: string;
  value: string;
  tone?: "neutral" | "up" | "down";
}) {
  const textColor = tone === "up" ? "text-emerald-600" : tone === "down" ? "text-rose-600" : "text-slate-700";
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-sm text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className={`px-4 pt-2 pb-4 text-sm font-medium ${textColor}`}>{value}</CardContent>
    </Card>
  );
}

function TagListCard({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "secondary" | "destructive" | "outline";
}) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-base text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-3 pb-4">
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={item} variant={variant}>
              {item}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
