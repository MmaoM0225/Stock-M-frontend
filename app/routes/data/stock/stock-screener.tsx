import { useMemo, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { StockItem, TemplateRule } from "~/types/data/stock";

const templateLibrary: Record<string, TemplateRule> = {
  value_defensive: { minMarketCap: 150e8, maxPe: 18, maxPb: 2.5, sortBy: "dv_ratio", sortOrder: "desc" },
  quality_growth: { minMarketCap: 80e8, maxPe: 45, maxPb: 8, sortBy: "pe", sortOrder: "asc" },
  cyclical_rebound: { minMarketCap: 60e8, maxPe: 30, maxPb: 3.5, sortBy: "pb", sortOrder: "asc" },
  theme_momentum: { minMarketCap: 40e8, maxPe: 100, maxPb: 15, sortBy: "volume_ratio", sortOrder: "desc" },
  fallback_balanced: { minMarketCap: 70e8, maxPe: 60, maxPb: 10, sortBy: "total_mv", sortOrder: "desc" },
};

const screenerByDate = {
  "2025-03-20": {
    totalCount: 12,
    filterSummary: "从 5152 只股票中筛选出 12 只",
    appliedFilters: [
      "板块:黄金,贵金属,贵金属Ⅲ,贵重金属与矿石,贵重金属与矿石(A股),冰雪产业,火电,公路铁路运输",
      "剔除ST",
      "市值:80亿-",
      "最多12只",
      "排序:total_mv(倒序)",
    ],
    sectorDistribution: { 小金属: 1, 全国地产: 1, 其他建材: 1, 服饰: 1, 火力发电: 4, 铁路: 1, 路桥: 2, 百货: 1 },
    sectorTemplateApplied: {
      黄金: "value_defensive",
      贵金属: "value_defensive",
      "贵金属Ⅲ": "value_defensive",
      贵重金属与矿石: "cyclical_rebound",
      "贵重金属与矿石(A股)": "cyclical_rebound",
      冰雪产业: "fallback_balanced",
      火电: "value_defensive",
      公路铁路运输: "value_defensive",
    },
    sectorPickCounts: { "贵重金属与矿石(A股)": 1, 冰雪产业: 4, 火电: 4, 公路铁路运输: 3 },
    filteredStocks: [
      { tsCode: "600459.SH", name: "贵研铂业", industry: "小金属", close: 13.98, pe: 26.1396, peTtm: 22.0192, pb: 1.6869, totalMv: 1063852.246, circMv: 1045295.25, turnoverRate: 0.4974, volumeRatio: 1.01, dvRatio: 1.1804, psTtm: 0.2261 },
      { tsCode: "000002.SZ", name: "万科A", industry: "全国地产", close: 9.82, pe: 5.18, peTtm: 6.1056, pb: 0.4633, totalMv: 11715956.7005, circMv: 9541767.2051, turnoverRate: 0.6772, volumeRatio: 0.91, dvRatio: 6.8727, psTtm: 0.2567 },
      { tsCode: "002271.SZ", name: "东方雨虹", industry: "其他建材", close: 17.76, pe: 21.0951, peTtm: 15.8667, pb: 1.5458, totalMv: 4472792.4032, circMv: 3543997.3369, turnoverRate: 1.3055, volumeRatio: 0.8, dvRatio: 0.5568, psTtm: 1.3474 },
      { tsCode: "600177.SH", name: "雅戈尔", industry: "服饰", close: 6.52, pe: 5.9555, peTtm: 8.46, pb: 0.8001, totalMv: 3017979.5384, circMv: 3017979.5384, turnoverRate: 0.2929, volumeRatio: 1.1, dvRatio: 7.6599, psTtm: 3.1927 },
      { tsCode: "001286.SZ", name: "陕西能源", industry: "火力发电", close: 8.51, pe: 12.9121, peTtm: 12.0419, pb: 1.386, totalMv: 3191250, circMv: 638250, turnoverRate: 2.0754, volumeRatio: 1.04, dvRatio: 4.1128, psTtm: 1.631 },
      { tsCode: "600157.SH", name: "永泰能源", industry: "火力发电", close: 1.36, pe: 15.8262, peTtm: 15.1699, pb: 0.6597, totalMv: 3021615.9237, circMv: 3021615.9237, turnoverRate: 0.9019, volumeRatio: 0.87, dvRatio: 0, psTtm: 0.9849 },
      { tsCode: "000027.SZ", name: "深圳能源", industry: "火力发电", close: 6.2, pe: 13.4157, peTtm: 8.5489, pb: 0.9675, totalMv: 2949581.7479, circMv: 2949581.7479, turnoverRate: 0.4409, volumeRatio: 0.53, dvRatio: 2.2581, psTtm: 0.7357 },
      { tsCode: "601006.SH", name: "大秦铁路", industry: "铁路", close: 7.39, pe: 10.3939, peTtm: 10.1218, pb: 0.863, totalMv: 11637265.5153, circMv: 11637265.5153, turnoverRate: 0.7062, volumeRatio: 1.12, dvRatio: 6.2559, psTtm: 1.496 },
      { tsCode: "001965.SZ", name: "招商公路", industry: "路桥", close: 9.96, pe: 12.8153, peTtm: 11.1652, pb: 1.0971, totalMv: 6229128.5923, circMv: 6229128.5923, turnoverRate: 0.4029, volumeRatio: 1.26, dvRatio: 4.1108, psTtm: 6.6573 },
      { tsCode: "600377.SH", name: "宁沪高速", industry: "路桥", close: 10.98, pe: 14.853, peTtm: 11.8909, pb: 1.6355, totalMv: 5531446.755, circMv: 4174796.9351, turnoverRate: 0.2664, volumeRatio: 0.94, dvRatio: 4.1894, psTtm: 3.5965 },
      { tsCode: "600655.SH", name: "豫园股份", industry: "百货", close: 6.06, pe: 6.1712, peTtm: 4.5778, pb: 0.6493, totalMv: 2361033.9657, circMv: 2353844.0557, turnoverRate: 0.2469, volumeRatio: 1.05, dvRatio: 5.7516, psTtm: 0.4198 },
      { tsCode: "600863.SH", name: "华能蒙电", industry: "火力发电", close: 4.11, pe: 15.2244, peTtm: 11.2531, pb: 1.698, totalMv: 2682550.8903, circMv: 2682550.8903, turnoverRate: 1.134, volumeRatio: 0.62, dvRatio: 3.9903, psTtm: 1.1759 },
    ],
  },
  "2025-03-19": {
    totalCount: 10,
    filterSummary: "从 5150 只股票中筛选出 10 只",
    appliedFilters: ["板块同上", "剔除ST", "市值:80亿-", "最多12只", "排序:total_mv(倒序)"],
    sectorDistribution: { 火力发电: 4, 路桥: 2, 铁路: 1, 小金属: 1, 服饰: 1, 百货: 1 },
    sectorTemplateApplied: { 黄金: "value_defensive", 贵金属: "value_defensive", 冰雪产业: "fallback_balanced", 火电: "value_defensive", 公路铁路运输: "value_defensive" },
    sectorPickCounts: { 冰雪产业: 3, 火电: 4, 公路铁路运输: 3 },
    filteredStocks: [
      { tsCode: "601006.SH", name: "大秦铁路", industry: "铁路", close: 7.34, pe: 10.2, peTtm: 10, pb: 0.86, totalMv: 11500000, circMv: 11500000, turnoverRate: 0.68, volumeRatio: 1.08, dvRatio: 6.21, psTtm: 1.49 },
      { tsCode: "001965.SZ", name: "招商公路", industry: "路桥", close: 9.9, pe: 12.7, peTtm: 11.1, pb: 1.09, totalMv: 6200000, circMv: 6200000, turnoverRate: 0.4, volumeRatio: 1.19, dvRatio: 4.08, psTtm: 6.6 },
      { tsCode: "600377.SH", name: "宁沪高速", industry: "路桥", close: 10.9, pe: 14.7, peTtm: 11.8, pb: 1.62, totalMv: 5500000, circMv: 4160000, turnoverRate: 0.25, volumeRatio: 0.91, dvRatio: 4.16, psTtm: 3.56 },
      { tsCode: "001286.SZ", name: "陕西能源", industry: "火力发电", close: 8.43, pe: 12.8, peTtm: 11.9, pb: 1.37, totalMv: 3160000, circMv: 632000, turnoverRate: 1.98, volumeRatio: 1.01, dvRatio: 4.08, psTtm: 1.61 },
      { tsCode: "600157.SH", name: "永泰能源", industry: "火力发电", close: 1.35, pe: 15.7, peTtm: 15, pb: 0.66, totalMv: 3000000, circMv: 3000000, turnoverRate: 0.88, volumeRatio: 0.84, dvRatio: 0, psTtm: 0.97 },
      { tsCode: "000027.SZ", name: "深圳能源", industry: "火力发电", close: 6.16, pe: 13.3, peTtm: 8.5, pb: 0.96, totalMv: 2930000, circMv: 2930000, turnoverRate: 0.43, volumeRatio: 0.5, dvRatio: 2.23, psTtm: 0.73 },
      { tsCode: "600863.SH", name: "华能蒙电", industry: "火力发电", close: 4.07, pe: 15.1, peTtm: 11.2, pb: 1.69, totalMv: 2660000, circMv: 2660000, turnoverRate: 1.09, volumeRatio: 0.6, dvRatio: 3.95, psTtm: 1.17 },
      { tsCode: "600655.SH", name: "豫园股份", industry: "百货", close: 6.02, pe: 6.1, peTtm: 4.55, pb: 0.65, totalMv: 2340000, circMv: 2335000, turnoverRate: 0.24, volumeRatio: 1.02, dvRatio: 5.7, psTtm: 0.42 },
      { tsCode: "600177.SH", name: "雅戈尔", industry: "服饰", close: 6.48, pe: 5.9, peTtm: 8.4, pb: 0.8, totalMv: 3000000, circMv: 3000000, turnoverRate: 0.29, volumeRatio: 1.08, dvRatio: 7.6, psTtm: 3.16 },
      { tsCode: "600459.SH", name: "贵研铂业", industry: "小金属", close: 13.88, pe: 26.1, peTtm: 21.9, pb: 1.68, totalMv: 1050000, circMv: 1030000, turnoverRate: 0.49, volumeRatio: 0.98, dvRatio: 1.15, psTtm: 0.23 },
    ],
  },
};

const sectorTemplatePlan = {
  黄金: { templateId: "value_defensive", overrides: {}, confidence: 0.7 },
  贵金属: { templateId: "value_defensive", overrides: {}, confidence: 0.7 },
  "贵金属Ⅲ": { templateId: "value_defensive", overrides: {}, confidence: 0.65 },
  贵重金属与矿石: { templateId: "cyclical_rebound", overrides: {}, confidence: 0.6 },
  "贵重金属与矿石(A股)": { templateId: "cyclical_rebound", overrides: {}, confidence: 0.6 },
  冰雪产业: { templateId: "fallback_balanced", overrides: {}, confidence: 0.4 },
  火电: { templateId: "value_defensive", overrides: {}, confidence: 0.75 },
  公路铁路运输: { templateId: "value_defensive", overrides: {}, confidence: 0.8 },
  家庭装潢零售: { templateId: "fallback_balanced", overrides: { min_market_cap: 5000000000 }, confidence: 0.55 },
};

export default function DataScreenerPage() {
  const availableDates = Object.keys(screenerByDate).sort((a, b) => (a > b ? -1 : 1));
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  const currentData = useMemo(() => screenerByDate[selectedDate as keyof typeof screenerByDate], [selectedDate]);

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">股票筛选分析师（stock_screener）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">对接接口：GET /api/v1/data/screener/{`{trade_date}`}，展示筛选结果、板块模板映射和入选股票列表。</p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="screener-date" className="text-sm font-medium text-slate-700">选择日期</label>
          <select id="screener-date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400">
            {availableDates.map((date) => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="筛选数量" value={`${currentData.totalCount} 只`} />
        <InfoCard title="筛选摘要" value={currentData.filterSummary} />
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">模板库（5套）</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-3 pb-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(templateLibrary).map(([templateId, rule]) => (
              <div key={templateId} className="border border-slate-200 p-3 text-sm text-slate-700">
                <p className="font-medium text-slate-900">{templateId}</p>
                <p className="mt-1">min_market_cap: {formatYi(rule.minMarketCap)}</p>
                <p>max_pe: {rule.maxPe}</p>
                <p>max_pb: {rule.maxPb}</p>
                <p>
                  sort: {rule.sortBy} {rule.sortOrder}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0"><CardTitle className="text-base text-slate-900">已应用筛选条件</CardTitle></CardHeader>
        <CardContent className="px-4 pt-3 pb-4"><ul className="space-y-1 text-sm leading-6 text-slate-700">{currentData.appliedFilters.map((item) => <li key={item}>- {item}</li>)}</ul></CardContent>
      </Card>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0"><CardTitle className="text-base text-slate-900">板块分布与入选数量</CardTitle></CardHeader>
        <CardContent className="px-4 pt-3 pb-4">
          <div className="flex flex-wrap gap-2">{Object.entries(currentData.sectorDistribution).map(([sector, count]) => <Badge key={sector} variant="outline">{sector}: {count}</Badge>)}</div>
          <div className="mt-3 flex flex-wrap gap-2">{Object.entries(currentData.sectorPickCounts).map(([sector, count]) => <Badge key={sector} variant="secondary">入选 {sector}: {count}</Badge>)}</div>
        </CardContent>
      </Card>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0"><CardTitle className="text-base text-slate-900">模板映射与参数（含 Override 示例）</CardTitle></CardHeader>
        <CardContent className="px-4 pt-3 pb-4">
          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-700"><tr><th className="border-b border-slate-200 px-3 py-2 text-left font-medium">板块</th><th className="border-b border-slate-200 px-3 py-2 text-left font-medium">模板</th><th className="border-b border-slate-200 px-3 py-2 text-right font-medium">min_market_cap</th><th className="border-b border-slate-200 px-3 py-2 text-right font-medium">max_pe</th><th className="border-b border-slate-200 px-3 py-2 text-right font-medium">max_pb</th><th className="border-b border-slate-200 px-3 py-2 text-left font-medium">sort</th><th className="border-b border-slate-200 px-3 py-2 text-left font-medium">overrides</th></tr></thead>
              <tbody>
                {Object.entries(currentData.sectorTemplateApplied).map(([sector, templateId]) => {
                  const plan = sectorTemplatePlan[sector as keyof typeof sectorTemplatePlan];
                  const baseRule = templateLibrary[templateId as keyof typeof templateLibrary];
                  const overrideText = plan?.overrides && Object.keys(plan.overrides).length ? JSON.stringify(plan.overrides) : "-";
                  return <tr key={`${sector}-${templateId}`} className="text-slate-700"><td className="border-b border-slate-100 px-3 py-2">{sector}</td><td className="border-b border-slate-100 px-3 py-2">{templateId}</td><td className="border-b border-slate-100 px-3 py-2 text-right">{formatYi(baseRule.minMarketCap)}</td><td className="border-b border-slate-100 px-3 py-2 text-right">{baseRule.maxPe}</td><td className="border-b border-slate-100 px-3 py-2 text-right">{baseRule.maxPb}</td><td className="border-b border-slate-100 px-3 py-2">{baseRule.sortBy} {baseRule.sortOrder}</td><td className="border-b border-slate-100 px-3 py-2">{overrideText}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0"><CardTitle className="text-base text-slate-900">入选股票清单</CardTitle></CardHeader>
        <CardContent className="px-4 pt-3 pb-4">
          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full min-w-[1280px] border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-700"><tr><th className="border-b border-slate-200 px-3 py-2 text-left font-medium">ts_code</th><th className="border-b border-slate-200 px-3 py-2 text-left font-medium">name</th><th className="border-b border-slate-200 px-3 py-2 text-left font-medium">industry</th><th className="border-b border-slate-200 px-3 py-2 text-right font-medium">close</th><th className="border-b border-slate-200 px-3 py-2 text-right font-medium">pe</th><th className="border-b border-slate-200 px-3 py-2 text-right font-medium">pe_ttm</th><th className="border-b border-slate-200 px-3 py-2 text-right font-medium">pb</th><th className="border-b border-slate-200 px-3 py-2 text-right font-medium">total_mv</th><th className="border-b border-slate-200 px-3 py-2 text-right font-medium">circ_mv</th><th className="border-b border-slate-200 px-3 py-2 text-right font-medium">turnover_rate</th><th className="border-b border-slate-200 px-3 py-2 text-right font-medium">volume_ratio</th><th className="border-b border-slate-200 px-3 py-2 text-right font-medium">dv_ratio</th><th className="border-b border-slate-200 px-3 py-2 text-right font-medium">ps_ttm</th></tr></thead>
              <tbody>
                {currentData.filteredStocks.map((stock) => (
                  <tr key={stock.tsCode} className="text-slate-700">
                    <td className="border-b border-slate-100 px-3 py-2">{stock.tsCode}</td><td className="border-b border-slate-100 px-3 py-2">{stock.name}</td><td className="border-b border-slate-100 px-3 py-2">{stock.industry}</td><td className="border-b border-slate-100 px-3 py-2 text-right">{stock.close.toFixed(2)}</td><td className="border-b border-slate-100 px-3 py-2 text-right">{stock.pe.toFixed(2)}</td><td className="border-b border-slate-100 px-3 py-2 text-right">{stock.peTtm.toFixed(2)}</td><td className="border-b border-slate-100 px-3 py-2 text-right">{stock.pb.toFixed(2)}</td><td className="border-b border-slate-100 px-3 py-2 text-right">{stock.totalMv.toLocaleString()}</td><td className="border-b border-slate-100 px-3 py-2 text-right">{stock.circMv.toLocaleString()}</td><td className="border-b border-slate-100 px-3 py-2 text-right">{stock.turnoverRate.toFixed(2)}</td><td className="border-b border-slate-100 px-3 py-2 text-right">{stock.volumeRatio.toFixed(2)}</td><td className="border-b border-slate-100 px-3 py-2 text-right">{stock.dvRatio.toFixed(2)}</td><td className="border-b border-slate-100 px-3 py-2 text-right">{stock.psTtm.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0"><CardTitle className="text-sm text-slate-900">{title}</CardTitle></CardHeader>
      <CardContent className="px-4 pt-2 pb-4 text-sm font-medium text-slate-700">{value}</CardContent>
    </Card>
  );
}

function formatYi(value: number) {
  return `${(value / 1e8).toFixed(0)}亿`;
}
