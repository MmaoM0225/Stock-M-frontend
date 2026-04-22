import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SectorDailyRow, SectorFlowPoint } from "~/types/data/sector";

const sectorAgentOutputByDate = {
  "2025-03-20": {
  summary:
    "整体市场资金呈净流出状态，融资融券、深股通、沪股通等大盘指数类板块持续大幅流出，资金流向集中在光通信、CPO、光纤、F5G、光刻机等科技创新板块，且这些板块在5日、10日、20日窗口中出现资本异动，显示资金短期偏好。",
  conclusion:
    "市场资金面偏空，建议谨慎操作，规避融资融券、深股通、沪股通、国企改革、储能、绿色电力、华为概念、人工智能、机器人概念、光伏概念等持续流出板块；对光通信、CPO、光纤、F5G、光刻机等热点板块可适度关注，但需注意整体流动性不足。",
  highlights: [
    "1日窗口净流出约-882万元，融资融券净流出-472万元为最大流出项",
    "5日窗口净流出扩大至约-2529万元，融资融券、深股通、国企改革流出居前",
    "10日、20日窗口融资融券净流出分别为-3792万元、-9564万元，持续大幅流出",
    "共封装光学(CPO)、光纤概念、F5G概念、光刻机在5日、10日、20日均出现资本异动（capital_spike）",
    "5G、芯片概念、数据中心、液冷服务器、6G概念、量子科技、东数西算(算力)等在1日窗口表现强势",
  ],
  marketBias: "bearish",
  hotSectors: [
    "共封装光学(CPO)",
    "光纤概念",
    "F5G概念",
    "光刻机",
    "5G",
    "芯片概念",
    "数据中心",
    "液冷服务器",
    "6G概念",
    "量子科技",
    "东数西算(算力)",
  ],
  riskSectors: [
    "融资融券",
    "深股通",
    "沪股通",
    "国企改革",
    "储能",
    "绿色电力",
    "华为概念",
    "人工智能",
    "机器人概念",
    "光伏概念",
    "新能源汽车",
    "锂电池概念",
    "一带一路",
    "DeepSeek概念",
    "同花顺漂亮100",
    "证金持股",
  ],
  },
  "2025-03-19": {
    summary: "资金面整体仍偏弱，权重方向延续流出，科技细分维持活跃。",
    conclusion: "短线继续防御，关注具备连续异动的科技板块，控制高波动风险。",
    highlights: [
      "1日窗口净流出约-730万元，权重板块拖累明显",
      "5日窗口净流出约-2100万元，趋势未扭转",
      "CPO、光纤、光刻机等方向维持强势净流入",
    ],
    marketBias: "bearish",
    hotSectors: ["共封装光学(CPO)", "光纤概念", "光刻机", "5G", "数据中心"],
    riskSectors: ["融资融券", "深股通", "沪股通", "国企改革", "储能", "绿色电力", "人工智能"],
  },
};

const oneDaySectorFlowByDate: Record<string, SectorFlowPoint[]> = {
  "2025-03-20": [
    { name: "融资融券", netAmount: -472 },
    { name: "深股通", netAmount: -310 },
    { name: "沪股通", netAmount: -228 },
    { name: "国企改革", netAmount: -145 },
    { name: "储能", netAmount: -96 },
    { name: "绿色电力", netAmount: -88 },
    { name: "共封装光学(CPO)", netAmount: 186 },
    { name: "光纤概念", netAmount: 168 },
    { name: "F5G概念", netAmount: 154 },
    { name: "光刻机", netAmount: 149 },
    { name: "5G", netAmount: 133 },
    { name: "芯片概念", netAmount: 122 },
    { name: "数据中心", netAmount: 116 },
    { name: "液冷服务器", netAmount: 98 },
  ],
  "2025-03-19": [
    { name: "融资融券", netAmount: -425 },
    { name: "深股通", netAmount: -276 },
    { name: "沪股通", netAmount: -201 },
    { name: "国企改革", netAmount: -132 },
    { name: "储能", netAmount: -90 },
    { name: "共封装光学(CPO)", netAmount: 173 },
    { name: "光纤概念", netAmount: 151 },
    { name: "光刻机", netAmount: 142 },
    { name: "5G", netAmount: 127 },
    { name: "数据中心", netAmount: 109 },
  ],
};

const oneDayRowsByDate: Record<string, SectorDailyRow[]> = {
  "2025-03-20": [
    { tradeDate: "2025-03-20", tsCode: "885748.TI", name: "可燃冰", leadStock: "海默科技", pctChange: 4.76, netAmount: 1 },
    { tradeDate: "2025-03-20", tsCode: "886008.TI", name: "减速器", leadStock: "大叶股份", pctChange: 2.6, netAmount: -8 },
    { tradeDate: "2025-03-20", tsCode: "885426.TI", name: "海工装备", leadStock: "天海防务", pctChange: 2.56, netAmount: 23 },
    { tradeDate: "2025-03-20", tsCode: "885372.TI", name: "页岩气", leadStock: "海默科技", pctChange: 2.21, netAmount: 10 },
    { tradeDate: "2025-03-20", tsCode: "886000.TI", name: "一体化压铸", leadStock: "今飞凯达", pctChange: 1.78, netAmount: 9 },
  ],
  "2025-03-19": [
    { tradeDate: "2025-03-19", tsCode: "885881.TI", name: "云办公", leadStock: "*ST鹏博", pctChange: -1.36, netAmount: -9 },
    { tradeDate: "2025-03-19", tsCode: "885947.TI", name: "DRG/DIP", leadStock: "国新健康", pctChange: -1.38, netAmount: -5 },
    { tradeDate: "2025-03-19", tsCode: "885975.TI", name: "电子身份证", leadStock: "拓尔思", pctChange: -1.4, netAmount: -11 },
    { tradeDate: "2025-03-19", tsCode: "885874.TI", name: "云游戏", leadStock: "*ST鹏博", pctChange: -1.75, netAmount: -23 },
    { tradeDate: "2025-03-19", tsCode: "886091.TI", name: "华为手机", leadStock: "凯格精机", pctChange: -2.25, netAmount: -18 },
  ],
};

export default function SectorCapitalFlowAnalystPage() {
  const availableDates = Object.keys(sectorAgentOutputByDate).sort((a, b) => (a > b ? -1 : 1));
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  const sectorAgentOutput = useMemo(
    () => sectorAgentOutputByDate[selectedDate as keyof typeof sectorAgentOutputByDate],
    [selectedDate]
  );
  const sortedFlow = useMemo(
    () => [...(oneDaySectorFlowByDate[selectedDate] ?? oneDaySectorFlowByDate[availableDates[0]])].sort((a, b) => a.netAmount - b.netAmount),
    [availableDates, selectedDate]
  );
  const oneDayRows = useMemo(
    () => oneDayRowsByDate[selectedDate] ?? oneDayRowsByDate[availableDates[0]],
    [availableDates, selectedDate]
  );

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">板块资金流分析师（Sector Capital Flow Analyst）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          对接接口：GET /api/v1/data/sector/{`{trade_date}`}，当前页面展示最近一天的资金净额可视化与策略摘要。
        </p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="sector-capital-date" className="text-sm font-medium text-slate-700">
            选择日期
          </label>
          <select
            id="sector-capital-date"
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

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="市场偏向" value={sectorAgentOutput.marketBias} tone="bearish" />
        <MetricCard title="1日净额" value="-882 万元" />
        <MetricCard title="5日净额" value="-2529 万元" />
        <MetricCard title="20日净额" value="-9564 万元" />
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">1日窗口资金净额分布（万元）</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-3 pb-4">
          <div className="h-[460px] border border-slate-200 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedFlow} layout="vertical" margin={{ top: 4, right: 16, left: 24, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                <ReferenceLine x={0} stroke="#94a3b8" />
                <Tooltip
                  formatter={(value: number) => [`${Number(value).toLocaleString()} 万元`, "净额"]}
                  contentStyle={{ borderRadius: 0, borderColor: "#cbd5e1" }}
                />
                <Bar dataKey="netAmount" radius={[0, 0, 0, 0]}>
                  {sortedFlow.map((item) => (
                    <Cell key={item.name} fill={item.netAmount >= 0 ? "#16a34a" : "#dc2626"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            红色表示净流出，绿色表示净流入。可见融资融券、深股通、沪股通等权重方向拖累明显，而 CPO、光纤、F5G、光刻机等科技方向承接增量资金。
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <TagListCard title="热点板块（可跟踪）" items={sectorAgentOutput.hotSectors} variant="secondary" />
        <TagListCard title="风险板块（建议规避）" items={sectorAgentOutput.riskSectors} variant="destructive" />
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">最近一天样本数据（节选）</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-3 pb-4">
          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">trade_date</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">ts_code</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">板块</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">龙头</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">涨跌幅(%)</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">净额(万元)</th>
                </tr>
              </thead>
              <tbody>
                {oneDayRows.map((row) => (
                  <tr key={`${row.tsCode}-${row.name}`} className="text-slate-700">
                    <td className="border-b border-slate-100 px-3 py-2">{row.tradeDate}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{row.tsCode}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{row.name}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{row.leadStock}</td>
                    <td
                      className={`border-b border-slate-100 px-3 py-2 text-right ${row.pctChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {row.pctChange.toFixed(2)}
                    </td>
                    <td
                      className={`border-b border-slate-100 px-3 py-2 text-right font-medium ${row.netAmount >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {row.netAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">LLM 结论摘要</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pt-3 pb-4 text-sm leading-6 text-slate-700">
          <p>{sectorAgentOutput.summary}</p>
          <p>{sectorAgentOutput.conclusion}</p>
          <ul className="space-y-1">
            {sectorAgentOutput.highlights.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}

function MetricCard({
  title,
  value,
  tone = "neutral",
}: {
  title: string;
  value: string;
  tone?: "neutral" | "bearish";
}) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-sm text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className={`px-4 pt-2 pb-4 text-sm font-medium ${tone === "bearish" ? "text-rose-600" : "text-slate-700"}`}>
        {value}
      </CardContent>
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
  variant: "secondary" | "destructive";
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
