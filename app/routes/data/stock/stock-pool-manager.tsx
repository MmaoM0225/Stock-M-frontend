import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { PoolCandidate, PoolManagerResult } from "~/types/data/stock";

const poolManagerByDate: Record<string, PoolManagerResult> = {
  "2024-07-29": {
    tradeDate: "20240729",
    poolSize: 12,
    analyzedCount: 12,
    analyzeSuccessCount: 10,
    analyzeErrorCount: 2,
    summaryText: "交易日 20240729，自筛选池共 12 只，完成分析 10 只，失败 2 只；已按综合分排序并给出前十关注列表。",
    candidateStocks: [
      { tsCode: "000550.SZ", name: "江铃汽车", industry: "汽车整车", overallScore: 73, actionSignal: "hold", riskLevel: "中", selectionReason: "基本面稳健增长且估值合理，技术面处于强势上升趋势，两者形成共振。", analyzeError: null },
      { tsCode: "688187.SH", name: "时代电气", industry: "运输设备", overallScore: 72, actionSignal: "hold", riskLevel: "中", selectionReason: "基本面稳健且增长强劲，但技术面显示上行空间受限且面临阻力，综合评分反映其良好质地与短期技术压力的平衡。", analyzeError: null },
      { tsCode: "600028.SH", name: "中国石化", industry: "石油加工", overallScore: 65, actionSignal: "hold", riskLevel: "中", selectionReason: "基本面与技术面评分均为65分，显示公司处于中性偏弱但短期趋势向上的状态。", analyzeError: null },
      { tsCode: "600166.SH", name: "福田汽车", industry: "汽车整车", overallScore: 60, actionSignal: "watch", riskLevel: "高", selectionReason: "技术面强劲的上升趋势与基本面“增收不增利”的薄弱盈利质量形成显著背离，综合评分反映短期动能与长期基本面风险并存。", analyzeError: null },
      { tsCode: "000625.SZ", name: "长安汽车", industry: "汽车整车", overallScore: 59, actionSignal: "hold", riskLevel: "中", selectionReason: "基本面盈利质量与现金流偏弱，技术面处于震荡格局且短期承压，综合评分略低于中性。", analyzeError: null },
      { tsCode: "601633.SH", name: "长城汽车", industry: "汽车整车", overallScore: 55, actionSignal: "watch", riskLevel: "中", selectionReason: "基本面稳健但技术面疲弱，综合评分反映当前股价与内在价值的背离。", analyzeError: null },
      { tsCode: "600871.SH", name: "石化油服", industry: "石油开采", overallScore: 51.5, actionSignal: "watch", riskLevel: "高", selectionReason: "基本面偏弱（评分45）但技术面短期反弹（评分58），综合评分51.5，反映高财务风险与短期技术修复的平衡。", analyzeError: null },
      { tsCode: "600098.SH", name: "广州发展", industry: "火力发电", overallScore: 50, actionSignal: "watch", riskLevel: "高", selectionReason: "基本面呈现深度价值特征但增长乏力，技术面处于下跌趋势中，综合评分反映其矛盾现状。", analyzeError: null },
      { tsCode: "601238.SH", name: "广汽集团", industry: "汽车整车", overallScore: 45, actionSignal: "sell", riskLevel: "高", selectionReason: "基本面严重恶化与技术面短期反弹形成强烈背离，综合评分偏向基本面主导的谨慎判断。", analyzeError: null },
      { tsCode: "600282.SH", name: "南钢股份", industry: "普钢", overallScore: 43, actionSignal: "watch", riskLevel: "高", selectionReason: "基本面经营表现强劲但财务结构脆弱，技术面处于强烈下跌趋势，两者形成显著背离，综合评分偏低。", analyzeError: null },
      { tsCode: "600104.SH", name: "上汽集团", industry: "汽车整车", overallScore: 40, actionSignal: "watch", riskLevel: "高", selectionReason: "技术面评分72显示上升趋势，但基本面数据完全缺失导致整体评分大幅下调。", analyzeError: null },
      { tsCode: "601808.SH", name: "中海油服", industry: "石油开采", overallScore: 16, actionSignal: "watch", riskLevel: "高", selectionReason: "基本面数据完全缺失，技术面显示中期下跌趋势且评分极低，综合判断风险极高、投资依据严重不足。", analyzeError: null },
    ],
    topStocks: [
      { tsCode: "000550.SZ", name: "江铃汽车", industry: "汽车整车", overallScore: 73, actionSignal: "hold", riskLevel: "中", selectionReason: "基本面稳健增长且估值合理，技术面处于强势上升趋势，两者形成共振。", analyzeError: null },
      { tsCode: "688187.SH", name: "时代电气", industry: "运输设备", overallScore: 72, actionSignal: "hold", riskLevel: "中", selectionReason: "基本面稳健且增长强劲，但技术面显示上行空间受限且面临阻力，综合评分反映其良好质地与短期技术压力的平衡。", analyzeError: null },
      { tsCode: "600028.SH", name: "中国石化", industry: "石油加工", overallScore: 65, actionSignal: "hold", riskLevel: "中", selectionReason: "基本面与技术面评分均为65分，显示公司处于中性偏弱但短期趋势向上的状态。", analyzeError: null },
      { tsCode: "600166.SH", name: "福田汽车", industry: "汽车整车", overallScore: 60, actionSignal: "watch", riskLevel: "高", selectionReason: "技术面强劲的上升趋势与基本面“增收不增利”的薄弱盈利质量形成显著背离，综合评分反映短期动能与长期基本面风险并存。", analyzeError: null },
      { tsCode: "000625.SZ", name: "长安汽车", industry: "汽车整车", overallScore: 59, actionSignal: "hold", riskLevel: "中", selectionReason: "基本面盈利质量与现金流偏弱，技术面处于震荡格局且短期承压，综合评分略低于中性。", analyzeError: null },
      { tsCode: "601633.SH", name: "长城汽车", industry: "汽车整车", overallScore: 55, actionSignal: "watch", riskLevel: "中", selectionReason: "基本面稳健但技术面疲弱，综合评分反映当前股价与内在价值的背离。", analyzeError: null },
      { tsCode: "600871.SH", name: "石化油服", industry: "石油开采", overallScore: 51.5, actionSignal: "watch", riskLevel: "高", selectionReason: "基本面偏弱（评分45）但技术面短期反弹（评分58），综合评分51.5，反映高财务风险与短期技术修复的平衡。", analyzeError: null },
      { tsCode: "600098.SH", name: "广州发展", industry: "火力发电", overallScore: 50, actionSignal: "watch", riskLevel: "高", selectionReason: "基本面呈现深度价值特征但增长乏力，技术面处于下跌趋势中，综合评分反映其矛盾现状。", analyzeError: null },
      { tsCode: "601238.SH", name: "广汽集团", industry: "汽车整车", overallScore: 45, actionSignal: "sell", riskLevel: "高", selectionReason: "基本面严重恶化与技术面短期反弹形成强烈背离，综合评分偏向基本面主导的谨慎判断。", analyzeError: null },
      { tsCode: "600282.SH", name: "南钢股份", industry: "普钢", overallScore: 43, actionSignal: "watch", riskLevel: "高", selectionReason: "基本面经营表现强劲但财务结构脆弱，技术面处于强烈下跌趋势，两者形成显著背离，综合评分偏低。", analyzeError: null },
    ],
    perStock: [
      {
        tsCode: "000550.SZ",
        name: "江铃汽车",
        industry: "汽车整车",
        stockManagerSummary: {
          overallScore: 73,
          confidence: "中",
          actionSignal: "hold",
          riskLevel: "中",
          keyPoints: ["2025年营收与净利润增速超40%，增长韧性较强。", "经营现金流与自由现金流表现良好。", "技术面多头趋势明显，但接近短期阻力位。"],
          risks: ["盈利能力仍偏薄，成本波动敏感。", "应收账款占比较高。", "短期技术面存在超买回调风险。"],
          summary: "基本面与技术面共振偏强，建议持有并观察阻力位突破有效性。",
        },
        error: null,
      },
      {
        tsCode: "688187.SH",
        name: "时代电气",
        industry: "运输设备",
        stockManagerSummary: {
          overallScore: 72,
          confidence: "中",
          actionSignal: "hold",
          riskLevel: "中",
          keyPoints: ["基本面增长与财务稳健性较好。", "技术面上行但临近布林上轨阻力。", "分红与现金流可持续性仍需跟踪。"],
          risks: ["行业周期性波动风险。", "现金流承压风险。", "短线冲高回落风险。"],
          summary: "中期偏积极，短期以持有观察为主。",
        },
        error: null,
      },
      {
        tsCode: "600028.SH",
        name: "中国石化",
        industry: "石油加工",
        stockManagerSummary: {
          overallScore: 65,
          confidence: "低",
          actionSignal: "hold",
          riskLevel: "中",
          keyPoints: ["经营现金流与股息回报具备吸引力。", "估值处于中低位。", "短期趋势向上但超买风险抬头。"],
          risks: ["石化行业周期波动风险。", "资本开支与融资依赖风险。", "技术性回调风险。"],
          summary: "适合稳健持有，关注行业景气与价格波动。",
        },
        error: null,
      },
      {
        tsCode: "600166.SH",
        name: "福田汽车",
        industry: "汽车整车",
        stockManagerSummary: {
          overallScore: 60,
          confidence: "中",
          actionSignal: "watch",
          riskLevel: "高",
          keyPoints: ["技术趋势较强但基本面盈利薄弱。", "短期偿债能力偏弱。", "融资依赖度较高。"],
          risks: ["技术超买后回调风险。", "盈利能力下滑风险。", "流动性管理风险。"],
          summary: "短线强势但基本面支撑不足，建议观望。",
        },
        error: null,
      },
      {
        tsCode: "000625.SZ",
        name: "长安汽车",
        industry: "汽车整车",
        stockManagerSummary: {
          overallScore: 59,
          confidence: "低",
          actionSignal: "hold",
          riskLevel: "中",
          keyPoints: ["收入增长较快但利润质量一般。", "现金流偏紧且融资依赖偏高。", "技术面震荡承压。"],
          risks: ["盈利转化不足风险。", "融资环境变化风险。", "关键支撑位失守风险。"],
          summary: "中性略偏弱，持有并持续观察基本面修复。",
        },
        error: null,
      },
      {
        tsCode: "601633.SH",
        name: "长城汽车",
        industry: "汽车整车",
        stockManagerSummary: {
          overallScore: 55,
          confidence: "低",
          actionSignal: "watch",
          riskLevel: "中",
          keyPoints: ["基本面较稳健，但技术面中期偏弱。", "估值合理，市场情绪偏冷。", "关键位附近波动加大。"],
          risks: ["技术破位下行风险。", "成本率高压缩利润风险。", "短期流动性风险。"],
          summary: "建议观望等待技术面止跌再评估。",
        },
        error: null,
      },
      {
        tsCode: "600104.SH",
        name: "上汽集团",
        industry: "汽车整车",
        stockManagerSummary: {
          overallScore: 40,
          confidence: "低",
          actionSignal: "watch",
          riskLevel: "高",
          keyPoints: ["基本面核心数据缺失，分析完整性不足。", "技术面短期仍有上行动量。", "超买后存在调整压力。"],
          risks: ["数据缺失风险。", "技术回调风险。", "决策依据不足风险。"],
          summary: "数据质量不完整，建议仅观察。",
        },
        error: null,
      },
      {
        tsCode: "601808.SH",
        name: "中海油服",
        industry: "石油开采",
        stockManagerSummary: {
          overallScore: 16,
          confidence: "低",
          actionSignal: "watch",
          riskLevel: "高",
          keyPoints: ["基本面数据缺失。", "技术面弱势下行。", "虽超卖但未见明确反转。"],
          risks: ["信息透明度风险。", "趋势延续下行风险。", "反弹失败风险。"],
          summary: "高风险观察标的，不建议主动配置。",
        },
        error: null,
      },
      {
        tsCode: "601238.SH",
        name: "广汽集团",
        industry: "汽车整车",
        stockManagerSummary: {
          overallScore: 45,
          confidence: "低",
          actionSignal: "sell",
          riskLevel: "高",
          keyPoints: ["基本面恶化明显，经营亏损压力大。", "技术面短反弹与基本面背离。", "现金流与融资压力较大。"],
          risks: ["持续亏损风险。", "现金流断裂风险。", "反弹结束后回落风险。"],
          summary: "风险偏高，建议以回避为主。",
        },
        error: null,
      },
    ],
  },
};

export default function DataStockPoolPage() {
  const availableDates = Object.keys(poolManagerByDate).sort((a, b) => (a > b ? -1 : 1));
  const [selectedDate, setSelectedDate] = useState(availableDates[0] ?? "");
  const currentData = useMemo(() => poolManagerByDate[selectedDate], [selectedDate]);

  if (!currentData) return null;

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">股票池经理（stock_pool_manager）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">对接接口：GET /api/v1/data/stock-pool/{`{trade_date}`}，展示股票池分析汇总、候选股与单票经理结论。</p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="stock-pool-manager-date" className="text-sm font-medium text-slate-700">
            选择日期
          </label>
          <select
            id="stock-pool-manager-date"
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

      <div className="grid gap-4 md:grid-cols-5">
        <Metric title="池子数量" value={String(currentData.poolSize)} />
        <Metric title="分析数量" value={String(currentData.analyzedCount)} />
        <Metric title="成功数量" value={String(currentData.analyzeSuccessCount)} valueClassName="text-emerald-600" />
        <Metric title="失败数量" value={String(currentData.analyzeErrorCount)} valueClassName="text-rose-600" />
        <Metric title="交易日" value={currentData.tradeDate} />
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">汇总说明</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-3 pb-4 text-sm text-slate-700">{currentData.summaryText}</CardContent>
      </Card>

      <StockListCard title="候选股票列表" rows={currentData.candidateStocks} />
    </section>
  );
}

function StockListCard({ title, rows }: { title: string; rows: PoolCandidate[] }) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-base text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pt-3 pb-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">ts_code</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">名称</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">行业</th>
                <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">评分</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">信号</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">风险</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${title}-${row.tsCode}`} className="hover:bg-slate-50/70">
                  <td className="border-b border-slate-100 px-3 py-2">{row.tsCode}</td>
                  <td className="border-b border-slate-100 px-3 py-2">{row.name}</td>
                  <td className="border-b border-slate-100 px-3 py-2">{row.industry}</td>
                  <td className="border-b border-slate-100 px-3 py-2 text-right font-medium">{row.overallScore.toFixed(1)}</td>
                  <td className="border-b border-slate-100 px-3 py-2">{row.actionSignal}</td>
                  <td className="border-b border-slate-100 px-3 py-2">{row.riskLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
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
