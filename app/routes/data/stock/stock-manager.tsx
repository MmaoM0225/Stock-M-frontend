import { useMemo, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { StockManagerSummary } from "~/types/data/stock";

const managerByDateAndStock: Record<string, Record<string, StockManagerSummary>> = {
  "2025-04-10": {
    "000519.SZ": {
      tsCode: "000519.SZ",
      success: true,
      overallScore: 48,
      confidence: "中",
      selectionReason: "基本面偏弱与技术面震荡的综合评估结果。",
      riskLevel: "高",
      componentScores: { fundamental: 45, technical: 55 },
      actionSignal: "watch",
      signalReason: "基本面存在显著盈利与现金流风险，技术面方向不明，需等待基本面改善或技术面突破的明确信号。",
      keyPoints: [
        "基本面核心矛盾突出：资产负债表健康（低杠杆、高现金），但利润表与现金流量表表现堪忧（增收不增利、经营现金流为负、依赖融资）。",
        "技术面呈区间震荡格局：价格在16.5-18.1区间内整理，短期指标与中期指标信号矛盾，趋势不明。",
        "估值偏高且市场情绪偏热：当前估值处于较高水平，交易活跃，已包含对高增长的乐观预期。",
        "股东回报吸引力低：无现金分红计划，历史股息率较低，公司资源优先用于业务扩张。",
        "资产结构存在潜在风险：存货占比高，可能存在减值或周转风险；负债增速快于资产增速。",
      ],
      risks: [
        "盈利与增长质量风险：收入增长但核心利润亏损，成本控制或定价能力存疑。",
        "现金流断裂风险：经营现金流持续为负，自由现金流紧张，依赖外部融资。",
        "高估值回调风险：若业绩无法兑现，股价可能出现较大回调。",
        "业务与运营风险：订单波动、存货减值及高研发投入侵蚀短期利润。",
      ],
      summary:
        "中兵红箭呈现显著的财务结构性矛盾：稳健资产负债表与疲弱盈利及现金流并存。技术面区间震荡，多空力量暂时平衡。后续重点跟踪盈利修复、现金流改善及技术面放量突破。",
    },
  },
};

export default function StockManagerPage() {
  const dateOptions = Object.keys(managerByDateAndStock).sort((a, b) => (a > b ? -1 : 1));
  const [selectedDate, setSelectedDate] = useState(dateOptions[0] ?? "");
  const stockOptions = useMemo(() => Object.keys(managerByDateAndStock[selectedDate] ?? {}), [selectedDate]);
  const [selectedStock, setSelectedStock] = useState(stockOptions[0] ?? "");
  const activeStock = stockOptions.includes(selectedStock) ? selectedStock : stockOptions[0];
  const summary = managerByDateAndStock[selectedDate]?.[activeStock] ?? managerByDateAndStock["2025-04-10"]["000519.SZ"];

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">个股综合经理（stock_manager）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">聚合基本面与技术面评分，输出交易信号、关键观点与风险提示。</p>
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
        <Metric title="综合评分" value={String(summary.overallScore)} />
        <Metric title="置信度" value={summary.confidence} />
        <Metric title="动作信号" value={summary.actionSignal} valueClassName="text-amber-600" />
        <Metric title="风险等级" value={summary.riskLevel} valueClassName="text-rose-600" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">组件评分</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pt-3 pb-4 text-sm text-slate-700">
            <ScoreBar label="基本面" value={summary.componentScores.fundamental} colorClassName="bg-blue-500" />
            <ScoreBar label="技术面" value={summary.componentScores.technical} colorClassName="bg-violet-500" />
            <p>动作信号原因：{summary.selectionReason}</p>
            <p>信号解释：{summary.signalReason}</p>
          </CardContent>
        </Card>

        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">关键标签</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pt-3 pb-4 text-sm text-slate-700">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">ts_code: {summary.tsCode}</Badge>
              <Badge variant="outline">success: {String(summary.success)}</Badge>
              <Badge variant="outline">action: {summary.actionSignal}</Badge>
              <Badge variant="outline">risk: {summary.riskLevel}</Badge>
            </div>
            <p>{summary.summary}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">关键结论</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-3 pb-4 text-sm text-slate-700">
            <ul className="space-y-1">
              {summary.keyPoints.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">主要风险</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-3 pb-4 text-sm text-slate-700">
            <ul className="space-y-1">
              {summary.risks.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
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

function ScoreBar({ label, value, colorClassName }: { label: string; value: number; colorClassName: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className="font-medium">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 w-full bg-slate-100">
        <div className={`h-2 ${colorClassName}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}
