import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { DecisionResult } from "~/types/data/decision";

const decisionByStrategyAndDate: Record<string, Record<string, DecisionResult>> = {
  "202401-202604_7d_for_once_ver1.3": {
    "2026-03-16": {
      strategy: "202401-202604_7d_for_once_ver1.3",
    tradeDate: "20260316",
    portfolioTable: [
      { rank: "1", assetName: "赤峰黄金", tsCode: "600988.SH", marketValue: 64480, position: "7.44%", positionChange: "3.14%", totalReturn: "12.66%", totalPnL: 7247.97, assetType: "个股", shares: 1600, costPrice: 35.77, action: "加仓", openPrice: 40.3 },
      { rank: "2", assetName: "中国神华", tsCode: "601088.SH", marketValue: 63843, position: "7.37%", positionChange: "2.16%", totalReturn: "5.73%", totalPnL: 3460, assetType: "个股", shares: 1300, costPrice: 46.4485, action: "加仓", openPrice: 49.11 },
      { rank: "3", assetName: "中远海控", tsCode: "601919.SH", marketValue: 63080, position: "7.28%", positionChange: "3.34%", totalReturn: "0.21%", totalPnL: 132, assetType: "个股", shares: 4000, costPrice: 15.737, action: "加仓", openPrice: 15.77 },
      { rank: "4", assetName: "贵州茅台", tsCode: "600519.SH", marketValue: 142000, position: "16.38%", positionChange: "16.38%", totalReturn: "0.00%", totalPnL: 0, assetType: "个股", shares: 100, costPrice: 1420, action: "建仓", openPrice: 1420 },
      { rank: "5", assetName: "五粮液", tsCode: "000858.SZ", marketValue: 41120, position: "4.74%", positionChange: "4.74%", totalReturn: "0.00%", totalPnL: 0, assetType: "个股", shares: 400, costPrice: 102.8, action: "建仓", openPrice: 102.8 },
      { rank: "6", assetName: "国电南瑞", tsCode: "600406.SH", marketValue: 40908, position: "4.72%", positionChange: "-0.56%", totalReturn: "0.93%", totalPnL: 378, assetType: "个股", shares: 1400, costPrice: 28.95, action: "减仓", openPrice: 29.22 },
      { rank: "7", assetName: "圣泉集团", tsCode: "605589.SH", marketValue: 44096, position: "5.09%", positionChange: "-0.60%", totalReturn: "6.33%", totalPnL: 2626, assetType: "个股", shares: 1300, costPrice: 31.9, action: "减仓", openPrice: 33.92 },
      { rank: "-", assetName: "待投资现金", tsCode: null, marketValue: 407203, position: "46.98%", positionChange: "-11.68%", totalReturn: "0.00%", totalPnL: 0, assetType: "其他", shares: "-", costPrice: null, action: "-", openPrice: null },
    ],
    operationReasonTable: [
      { assetName: "紫金矿业", tsCode: "601899.SH", action: "清仓", oldPosition: "2.19%", newPosition: "0.00%", positionChange: "-2.19%", executionPrice: 35.04, targetAmount: 0, actualAmount: 0, shares: 0, costPrice: null, reason: "基本面增长遇阻且技术面处于强下跌趋势，同时属于规避板块，执行清仓。" },
      { assetName: "潍柴动力", tsCode: "000338.SZ", action: "清仓", oldPosition: "6.56%", newPosition: "0.00%", positionChange: "-6.56%", executionPrice: 24.82, targetAmount: 0, actualAmount: 0, shares: 0, costPrice: null, reason: "技术面显著走弱，基本面与技术面背离，按规则转为清仓处理。" },
      { assetName: "杭氧股份", tsCode: "002430.SZ", action: "清仓", oldPosition: "6.36%", newPosition: "0.00%", positionChange: "-6.36%", executionPrice: 31.74, targetAmount: 0, actualAmount: 0, shares: 0, costPrice: null, reason: "股价跌破关键均线且无反转信号，按风控约束清仓。" },
      { assetName: "鹏鼎控股", tsCode: "002938.SZ", action: "清仓", oldPosition: "2.46%", newPosition: "0.00%", positionChange: "-2.46%", executionPrice: 50.89, targetAmount: 0, actualAmount: 0, shares: 0, costPrice: null, reason: "技术趋势偏弱叠加估值偏高与现金流压力，执行清仓。" },
      { assetName: "赤峰黄金", tsCode: "600988.SH", action: "加仓", oldPosition: "4.30%", newPosition: "7.44%", positionChange: "3.14%", executionPrice: 40.3, targetAmount: 61675.25, actualAmount: 64480, shares: 1600, costPrice: 35.77, reason: "基本面优秀且符合避险主题，技术面长期趋势未破坏，执行加仓。" },
      { assetName: "中国神华", tsCode: "601088.SH", action: "加仓", oldPosition: "5.21%", newPosition: "7.37%", positionChange: "2.16%", executionPrice: 49.11, targetAmount: 61675.25, actualAmount: 63843, shares: 1300, costPrice: 46.4485, reason: "高股息与稳健财务特征明显，技术面强势，上调配置比例。" },
      { assetName: "中远海控", tsCode: "601919.SH", action: "加仓", oldPosition: "3.94%", newPosition: "7.28%", positionChange: "3.34%", executionPrice: 15.77, targetAmount: 61675.25, actualAmount: 63080, shares: 4000, costPrice: 15.737, reason: "低估值高分红且财务稳健，技术面向好，作为防御资产加仓。" },
      { assetName: "贵州茅台", tsCode: "600519.SH", action: "建仓", oldPosition: "0.00%", newPosition: "16.38%", positionChange: "16.38%", executionPrice: 1420, targetAmount: 38547.03, actualAmount: 142000, shares: 100, costPrice: 1420, reason: "核心消费资产，基本面质量高，技术面短期转强，首次建仓。" },
      { assetName: "五粮液", tsCode: "000858.SZ", action: "建仓", oldPosition: "0.00%", newPosition: "4.74%", positionChange: "4.74%", executionPrice: 102.8, targetAmount: 38547.03, actualAmount: 41120, shares: 400, costPrice: 102.8, reason: "现金牛属性明显，估值与分红较优，作为消费方向分散建仓。" },
      { assetName: "国电南瑞", tsCode: "600406.SH", action: "减仓", oldPosition: "5.28%", newPosition: "4.72%", positionChange: "-0.56%", executionPrice: 29.22, targetAmount: 40705.67, actualAmount: 40908, shares: 1400, costPrice: 28.95, reason: "未触发主动操作，系统按目标仓位区间自动微调减仓。" },
      { assetName: "圣泉集团", tsCode: "605589.SH", action: "减仓", oldPosition: "5.69%", newPosition: "5.09%", positionChange: "-0.60%", executionPrice: 33.92, targetAmount: 43866.52, actualAmount: 44096, shares: 1300, costPrice: 31.9, reason: "未触发主动操作，系统按目标仓位区间自动微调减仓。" },
    ],
    decisionSummary:
      "本次调仓后总仓位由 42.00% 变为 53.02%，持仓股票数量由 9 只变为 7 只。操作统计：建仓2只，加仓3只，减仓2只，清仓4只。策略上偏防御，提升黄金、能源与消费龙头配置，减少技术面弱势与基本面瑕疵标的。",
    meta: {
      initialCapital: 876632,
      totalCapital: 866730,
      sourcePortfolioPath: "data/artifacts/decision/202401-202604_7d_for_once_ver1.3/portfolio/20260305/result.json",
      generatedAt: "2026-04-22T13:45:19.627317+08:00",
    },
    },
  },
};

export default function DataPortfolioPage() {
  const availableStrategies = Object.keys(decisionByStrategyAndDate);
  const [selectedStrategy, setSelectedStrategy] = useState(availableStrategies[0] ?? "");
  const availableDates = useMemo(
    () => Object.keys(decisionByStrategyAndDate[selectedStrategy] ?? {}).sort((a, b) => (a > b ? -1 : 1)),
    [selectedStrategy]
  );
  const [selectedDate, setSelectedDate] = useState(availableDates[0] ?? "");
  const currentData = useMemo(
    () => decisionByStrategyAndDate[selectedStrategy]?.[selectedDate],
    [selectedDate, selectedStrategy]
  );

  const activeDate = availableDates.includes(selectedDate) ? selectedDate : availableDates[0] ?? "";
  const activeData = decisionByStrategyAndDate[selectedStrategy]?.[activeDate];

  if (!activeData) return null;

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">组合决策引擎（portfolio_decision）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          对接接口：GET /api/v1/data/portfolio/{`{trade_date}`}，展示组合资产、调仓动作与决策摘要。
        </p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="portfolio-strategy" className="text-sm font-medium text-slate-700">
            策略选择
          </label>
          <select
            id="portfolio-strategy"
            value={selectedStrategy}
            onChange={(event) => setSelectedStrategy(event.target.value)}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            {availableStrategies.map((strategy) => (
              <option key={strategy} value={strategy}>
                {strategy}
              </option>
            ))}
          </select>
          <label htmlFor="portfolio-date" className="text-sm font-medium text-slate-700">
            选择日期
          </label>
          <select
            id="portfolio-date"
            value={activeDate}
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
        <Metric title="上期资金(元)" value={activeData.meta.initialCapital.toLocaleString()} />
        <Metric title="当前总资产(元)" value={activeData.meta.totalCapital.toLocaleString()} />
        <Metric title="持仓资产数" value={String(activeData.portfolioTable.filter((row) => row.assetType === "个股").length)} />
        <Metric title="操作笔数" value={String(activeData.operationReasonTable.length)} />
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">决策摘要</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 pt-3 pb-4 text-sm text-slate-700">
          <p>{activeData.decisionSummary}</p>
          <p>策略：{activeData.strategy}</p>
          <p>来源：{activeData.meta.sourcePortfolioPath}</p>
          <p>生成时间：{activeData.meta.generatedAt}</p>
        </CardContent>
      </Card>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">资产组合表</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pt-3 pb-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">排名</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">资产名称</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">ts_code</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">市值(元)</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">仓位</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">仓位变化</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">总收益</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {activeData.portfolioTable.map((row) => (
                  <tr key={`${row.assetName}-${row.rank}`} className="hover:bg-slate-50/70">
                    <td className="border-b border-slate-100 px-3 py-2">{row.rank}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{row.assetName}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{row.tsCode ?? "-"}</td>
                    <td className="border-b border-slate-100 px-3 py-2 text-right">{row.marketValue.toLocaleString()}</td>
                    <td className="border-b border-slate-100 px-3 py-2 text-right">{row.position}</td>
                    <td className="border-b border-slate-100 px-3 py-2 text-right">{row.positionChange}</td>
                    <td className="border-b border-slate-100 px-3 py-2 text-right">{row.totalReturn}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">操作原因表</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pt-3 pb-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">资产</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">操作</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">仓位变化</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">执行价</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">原因</th>
                </tr>
              </thead>
              <tbody>
                {activeData.operationReasonTable.map((row) => (
                  <tr key={`${row.tsCode}-${row.action}`} className="hover:bg-slate-50/70">
                    <td className="border-b border-slate-100 px-3 py-2">{row.assetName}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{row.action}</td>
                    <td className="border-b border-slate-100 px-3 py-2 text-right">{row.positionChange}</td>
                    <td className="border-b border-slate-100 px-3 py-2 text-right">{row.executionPrice ?? "-"}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{row.reason}</td>
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

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-sm text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-2 pb-4 text-sm font-medium text-slate-700">{value}</CardContent>
    </Card>
  );
}
