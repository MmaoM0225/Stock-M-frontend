import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Position = {
  tsCode: string;
  name: string;
  industry: string;
  weight: number;
  shares: number;
  costPrice: number;
  latestPrice: number;
};
type OrderedPosition = Position & {
  rank: number;
  positionSize: number;
  displayName: string;
};
type IndustryDistribution = {
  industry: string;
  totalWeight: number;
  displayName: string;
};

type ReturnPoint = {
  date: string;
  netValue: number;
  dailyReturnPct: number;
  drawdownPct: number;
};

const positionsByDate: Record<string, Position[]> = {
  "2026-04-22": [
    { tsCode: "600519.SH", name: "贵州茅台", industry: "白酒", weight: 16.2, shares: 100, costPrice: 1420.0, latestPrice: 1498.5 },
    { tsCode: "601088.SH", name: "中国神华", industry: "煤炭", weight: 14.5, shares: 1300, costPrice: 46.45, latestPrice: 49.11 },
    { tsCode: "600988.SH", name: "赤峰黄金", industry: "贵金属", weight: 12.9, shares: 1600, costPrice: 35.77, latestPrice: 40.3 },
    { tsCode: "601919.SH", name: "中远海控", industry: "航运", weight: 11.7, shares: 4000, costPrice: 15.74, latestPrice: 15.77 },
    { tsCode: "000858.SZ", name: "五粮液", industry: "白酒", weight: 9.1, shares: 400, costPrice: 102.8, latestPrice: 105.4 },
    { tsCode: "600406.SH", name: "国电南瑞", industry: "电力设备", weight: 7.6, shares: 1400, costPrice: 28.95, latestPrice: 29.22 },
    { tsCode: "605589.SH", name: "圣泉集团", industry: "化工", weight: 6.9, shares: 1300, costPrice: 31.9, latestPrice: 33.92 },
  ],
  "2026-04-15": [
    { tsCode: "600519.SH", name: "贵州茅台", industry: "白酒", weight: 14.4, shares: 100, costPrice: 1420.0, latestPrice: 1462.0 },
    { tsCode: "601088.SH", name: "中国神华", industry: "煤炭", weight: 13.2, shares: 1200, costPrice: 46.1, latestPrice: 48.2 },
    { tsCode: "600988.SH", name: "赤峰黄金", industry: "贵金属", weight: 10.8, shares: 1400, costPrice: 35.6, latestPrice: 38.7 },
    { tsCode: "601919.SH", name: "中远海控", industry: "航运", weight: 12.5, shares: 4000, costPrice: 15.74, latestPrice: 16.1 },
    { tsCode: "000858.SZ", name: "五粮液", industry: "白酒", weight: 8.6, shares: 350, costPrice: 102.8, latestPrice: 103.6 },
    { tsCode: "600406.SH", name: "国电南瑞", industry: "电力设备", weight: 8.1, shares: 1400, costPrice: 28.95, latestPrice: 28.8 },
    { tsCode: "605589.SH", name: "圣泉集团", industry: "化工", weight: 6.2, shares: 1200, costPrice: 31.5, latestPrice: 32.4 },
  ],
  "2026-04-08": [
    { tsCode: "600519.SH", name: "贵州茅台", industry: "白酒", weight: 13.3, shares: 90, costPrice: 1416.0, latestPrice: 1441.2 },
    { tsCode: "601088.SH", name: "中国神华", industry: "煤炭", weight: 12.4, shares: 1000, costPrice: 45.7, latestPrice: 47.3 },
    { tsCode: "600988.SH", name: "赤峰黄金", industry: "贵金属", weight: 9.9, shares: 1300, costPrice: 35.4, latestPrice: 37.6 },
    { tsCode: "601919.SH", name: "中远海控", industry: "航运", weight: 11.6, shares: 3600, costPrice: 15.6, latestPrice: 15.8 },
    { tsCode: "000858.SZ", name: "五粮液", industry: "白酒", weight: 8.2, shares: 300, costPrice: 102.1, latestPrice: 101.7 },
    { tsCode: "600406.SH", name: "国电南瑞", industry: "电力设备", weight: 7.5, shares: 1300, costPrice: 28.7, latestPrice: 28.9 },
    { tsCode: "605589.SH", name: "圣泉集团", industry: "化工", weight: 5.8, shares: 1100, costPrice: 31.1, latestPrice: 31.9 },
  ],
};

const historyReturns: ReturnPoint[] = [
  { date: "2026-04-14", netValue: 1.017, dailyReturnPct: 0.52, drawdownPct: -0.72 },
  { date: "2026-04-15", netValue: 1.011, dailyReturnPct: -0.59, drawdownPct: -1.31 },
  { date: "2026-04-16", netValue: 1.026, dailyReturnPct: 1.48, drawdownPct: -0.12 },
  { date: "2026-04-17", netValue: 1.034, dailyReturnPct: 0.78, drawdownPct: 0 },
  { date: "2026-04-18", netValue: 1.029, dailyReturnPct: -0.48, drawdownPct: -0.48 },
  { date: "2026-04-19", netValue: 1.041, dailyReturnPct: 1.16, drawdownPct: 0 },
  { date: "2026-04-20", netValue: 1.046, dailyReturnPct: 0.48, drawdownPct: 0 },
  { date: "2026-04-21", netValue: 1.039, dailyReturnPct: -0.67, drawdownPct: -0.67 },
  { date: "2026-04-22", netValue: 1.051, dailyReturnPct: 1.15, drawdownPct: 0 },
];

const oneWeekReturnPct = 2.87;
const oneMonthReturnPct = 7.64;
const sharpeRatio = 1.42;
const maxDrawdownPct = -4.93;
const annualizedReturnPct = 15.6;
const chartColors = ["#0f766e", "#0369a1", "#16a34a", "#9333ea", "#f59e0b", "#ef4444", "#334155"];

export default function PortfolioPage() {
  const availablePositionDates = Object.keys(positionsByDate).sort((a, b) => (a > b ? -1 : 1));
  const [selectedPositionDate, setSelectedPositionDate] = useState(availablePositionDates[0] ?? "");
  const activePositions = useMemo(
    () => positionsByDate[selectedPositionDate] ?? positionsByDate[availablePositionDates[0]] ?? [],
    [availablePositionDates, selectedPositionDate]
  );
  const sortedPositions = useMemo(
    () =>
      [...activePositions]
        .sort((a, b) => b.weight - a.weight)
        .map((item, index) => ({
          ...item,
          rank: index + 1,
          positionSize: item.shares * item.latestPrice,
          displayName: `${index + 1}. ${item.name}`,
        })),
    [activePositions]
  );
  const totalReturnSeries = useMemo(
    () =>
      historyReturns.map((row) => ({
        ...row,
        totalReturnPct: (row.netValue - 1) * 100,
      })),
    []
  );
  const industryDistribution = useMemo(() => {
    const industryWeightMap = activePositions.reduce<Record<string, number>>((acc, item) => {
      acc[item.industry] = (acc[item.industry] ?? 0) + item.weight;
      return acc;
    }, {});

    return Object.entries(industryWeightMap)
      .map(([industry, totalWeight]) => ({ industry, totalWeight }))
      .sort((a, b) => b.totalWeight - a.totalWeight)
      .map((item, index) => ({
        ...item,
        displayName: `${index + 1}. ${item.industry}`,
      }));
  }, [activePositions]);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-10 pt-0">
      <section className="space-y-6 border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">收益与持仓</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              展示组合当前全部持仓与核心绩效指标，包括历史收益、夏普比率、最大回撤及阶段收益表现。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="position-date" className="text-sm font-medium text-slate-700">
              持仓日期
            </label>
            <select
              id="position-date"
              value={selectedPositionDate}
              onChange={(event) => setSelectedPositionDate(event.target.value)}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              {availablePositionDates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <Metric title="历史收益(年化)" value={`${annualizedReturnPct.toFixed(2)}%`} valueClassName="text-emerald-600" />
          <Metric title="夏普比率" value={sharpeRatio.toFixed(2)} />
          <Metric title="最大回撤" value={`${maxDrawdownPct.toFixed(2)}%`} valueClassName="text-rose-600" />
          <Metric title="近一周收益" value={`${oneWeekReturnPct.toFixed(2)}%`} valueClassName="text-emerald-600" />
          <Metric title="近一月收益" value={`${oneMonthReturnPct.toFixed(2)}%`} valueClassName="text-emerald-600" />
        </div>

        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">总收益率</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px] px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={totalReturnSeries} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, "总收益率"]} />
                <Line type="monotone" dataKey="totalReturnPct" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-none py-0">
            <CardHeader className="px-4 pt-4 pb-0">
              <CardTitle className="text-base text-slate-900">持仓占比柱状图</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px] px-2 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedPositions} layout="vertical" margin={{ top: 8, right: 12, left: 30, bottom: 10 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `${value}%`} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis type="category" dataKey="displayName" width={110} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                  <Bar dataKey="weight" radius={[0, 2, 2, 0]}>
                    {sortedPositions.map((item, index) => (
                      <Cell key={item.tsCode} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-none py-0">
            <CardHeader className="px-4 pt-4 pb-0">
              <CardTitle className="text-base text-slate-900">行业分布图</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px] px-2 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={industryDistribution}
                    dataKey="totalWeight"
                    nameKey="industry"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    label={(item) => {
                      const payload = item.payload as IndustryDistribution | undefined;
                      return payload ? `${payload.industry} ${payload.totalWeight.toFixed(1)}%` : "";
                    }}
                  >
                    {industryDistribution.map((item, index) => (
                      <Cell key={item.industry} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">全部持仓</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pt-3 pb-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">排名</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">代码</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">名称</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">行业</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">持仓占比</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">持仓股数</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">成本价</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">最新价</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">浮动收益</th>
                </tr>
              </thead>
              <tbody>
                {sortedPositions.map((item) => {
                  const pnlPct = ((item.latestPrice - item.costPrice) / item.costPrice) * 100;
                  return (
                    <tr key={item.tsCode} className="hover:bg-slate-50/70">
                      <td className="border-b border-slate-100 px-3 py-2">{item.rank}</td>
                      <td className="border-b border-slate-100 px-3 py-2">{item.tsCode}</td>
                      <td className="border-b border-slate-100 px-3 py-2">{item.name}</td>
                      <td className="border-b border-slate-100 px-3 py-2">{item.industry}</td>
                      <td className="border-b border-slate-100 px-3 py-2 text-right">{item.weight.toFixed(2)}%</td>
                      <td className="border-b border-slate-100 px-3 py-2 text-right">{item.shares.toLocaleString()}</td>
                      <td className="border-b border-slate-100 px-3 py-2 text-right">{item.costPrice.toFixed(2)}</td>
                      <td className="border-b border-slate-100 px-3 py-2 text-right">{item.latestPrice.toFixed(2)}</td>
                      <td
                        className={`border-b border-slate-100 px-3 py-2 text-right font-medium ${
                          pnlPct >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {pnlPct >= 0 ? "+" : ""}
                        {pnlPct.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
        </Card>

        <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">历史收益</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pt-3 pb-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">日期</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">净值</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">单日收益</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">回撤</th>
                </tr>
              </thead>
              <tbody>
                {historyReturns.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-50/70">
                    <td className="border-b border-slate-100 px-3 py-2">{row.date}</td>
                    <td className="border-b border-slate-100 px-3 py-2 text-right">{row.netValue.toFixed(3)}</td>
                    <td
                      className={`border-b border-slate-100 px-3 py-2 text-right font-medium ${
                        row.dailyReturnPct >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {row.dailyReturnPct >= 0 ? "+" : ""}
                      {row.dailyReturnPct.toFixed(2)}%
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-right text-rose-600">{row.drawdownPct.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        </Card>
      </section>
    </main>
  );
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
