import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MetricChartProps } from "~/types/data/macro";

const macroDataByDate = {
  "2026-04-21": {
    lprData: [
      { month: "11月", value: 3.55 },
      { month: "12月", value: 3.5 },
      { month: "1月", value: 3.45 },
      { month: "2月", value: 3.45 },
      { month: "3月", value: 3.4 },
    ],
    cpiData: [
      { month: "11月", value: 0.6 },
      { month: "12月", value: 0.4 },
      { month: "1月", value: 0.3 },
      { month: "2月", value: 0.2 },
      { month: "3月", value: 0.1 },
    ],
    sfData: [
      { month: "11月", value: 1.8 },
      { month: "12月", value: 2.1 },
      { month: "1月", value: 2.4 },
      { month: "2月", value: 2.5 },
      { month: "3月", value: 2.8 },
    ],
    pmiData: [
      { month: "11月", value: 49.8 },
      { month: "12月", value: 49.5 },
      { month: "1月", value: 49.3 },
      { month: "2月", value: 49.2 },
      { month: "3月", value: 49.1 },
    ],
    m2Data: [
      { month: "11月", value: 9.8 },
      { month: "12月", value: 9.5 },
      { month: "1月", value: 9.3 },
      { month: "2月", value: 9.1 },
      { month: "3月", value: 8.9 },
    ],
    gdpData: [
      { quarter: "Q2", value: 5.1 },
      { quarter: "Q3", value: 5.0 },
      { quarter: "Q4", value: 5.0 },
      { quarter: "Q1", value: 4.9 },
    ],
    llmOutput: {
      growth_signal: "strong",
      inflation_signal: "falling",
      liquidity_signal: "loose",
      macro_regime: "growth",
      equity_market_bias: "bullish",
      bond_market_bias: "bullish",
      commodity_bias: "neutral",
      liquidity_summary: "货币政策宽松，LPR下调，但M2增速有所放缓。",
      conclusion: "经济保持稳健增长，通胀压力较低，流动性环境总体宽松。",
    },
  },
  "2026-04-20": {
    lprData: [
      { month: "11月", value: 3.6 },
      { month: "12月", value: 3.55 },
      { month: "1月", value: 3.5 },
      { month: "2月", value: 3.45 },
      { month: "3月", value: 3.45 },
    ],
    cpiData: [
      { month: "11月", value: 0.8 },
      { month: "12月", value: 0.6 },
      { month: "1月", value: 0.5 },
      { month: "2月", value: 0.4 },
      { month: "3月", value: 0.3 },
    ],
    sfData: [
      { month: "11月", value: 1.6 },
      { month: "12月", value: 1.9 },
      { month: "1月", value: 2.2 },
      { month: "2月", value: 2.3 },
      { month: "3月", value: 2.5 },
    ],
    pmiData: [
      { month: "11月", value: 50.1 },
      { month: "12月", value: 49.9 },
      { month: "1月", value: 49.6 },
      { month: "2月", value: 49.4 },
      { month: "3月", value: 49.2 },
    ],
    m2Data: [
      { month: "11月", value: 10.1 },
      { month: "12月", value: 9.9 },
      { month: "1月", value: 9.7 },
      { month: "2月", value: 9.4 },
      { month: "3月", value: 9.2 },
    ],
    gdpData: [
      { quarter: "Q2", value: 5.0 },
      { quarter: "Q3", value: 4.9 },
      { quarter: "Q4", value: 4.9 },
      { quarter: "Q1", value: 4.8 },
    ],
    llmOutput: {
      growth_signal: "moderate",
      inflation_signal: "cooling",
      liquidity_signal: "neutral-loose",
      macro_regime: "recovery",
      equity_market_bias: "bullish",
      bond_market_bias: "neutral",
      commodity_bias: "neutral",
      liquidity_summary: "流动性总体偏松，社融延续改善，货币增速小幅回落。",
      conclusion: "经济处于温和修复阶段，风险偏好改善但仍需关注内需恢复斜率。",
    },
  },
};

export default function MacroEconomistPage() {
  const availableDates = Object.keys(macroDataByDate).sort((a, b) =>
    a > b ? -1 : 1
  );
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  const currentData = useMemo(
    () => macroDataByDate[selectedDate as keyof typeof macroDataByDate],
    [selectedDate]
  );

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">
          宏观经济分析师（Macro Economist）
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          基于 LPR、CPI、社融、PMI、M2 与 GDP 的宏观监测结果，输出增长、通胀与流动性信号。
        </p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="macro-date" className="text-sm font-medium text-slate-700">
            选择日期
          </label>
          <select
            id="macro-date"
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
        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-sm text-slate-900">增长信号</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-2 pb-4 text-sm text-emerald-700">
            {currentData.llmOutput.growth_signal}
          </CardContent>
        </Card>
        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-sm text-slate-900">通胀信号</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-2 pb-4 text-sm text-blue-700">
            {currentData.llmOutput.inflation_signal}
          </CardContent>
        </Card>
        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-sm text-slate-900">流动性信号</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-2 pb-4 text-sm text-violet-700">
            {currentData.llmOutput.liquidity_signal}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MetricLineCard title="LPR（%）" data={currentData.lprData} dataKey="value" stroke="#0284c7" />
        <MetricLineCard title="CPI（%）" data={currentData.cpiData} dataKey="value" stroke="#2563eb" />
        <MetricBarCard title="社融（万亿）" data={currentData.sfData} dataKey="value" fill="#0d9488" />
        <MetricLineCard title="PMI" data={currentData.pmiData} dataKey="value" stroke="#7c3aed" />
        <MetricLineCard title="M2（%）" data={currentData.m2Data} dataKey="value" stroke="#ca8a04" />
        <MetricBarCard
          title="GDP（季度同比，%）"
          data={currentData.gdpData}
          dataKey="value"
          xKey="quarter"
          fill="#059669"
        />
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">LLM 综合结论</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pt-3 pb-4 text-sm text-slate-700">
          <p>数据日期：{selectedDate}</p>
          <p>宏观状态：{currentData.llmOutput.macro_regime}</p>
          <p>权益偏好：{currentData.llmOutput.equity_market_bias}</p>
          <p>债券偏好：{currentData.llmOutput.bond_market_bias}</p>
          <p>商品偏好：{currentData.llmOutput.commodity_bias}</p>
          <p>流动性摘要：{currentData.llmOutput.liquidity_summary}</p>
          <p className="font-medium text-slate-900">结论：{currentData.llmOutput.conclusion}</p>
        </CardContent>
      </Card>
    </section>
  );
}

function MetricLineCard({ title, data, dataKey, stroke = "#2563eb", xKey = "month" }: MetricChartProps) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-sm text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-56 px-3 pt-3 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis dataKey={xKey} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function MetricBarCard({ title, data, dataKey, fill = "#0ea5e9", xKey = "month" }: MetricChartProps) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-sm text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-56 px-3 pt-3 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis dataKey={xKey} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey={dataKey} fill={fill} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
