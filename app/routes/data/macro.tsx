import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

const managerOutputByDate = {
  "2026-04-21": {
    market_regime:
      "流动性宽松但市场情绪极度悲观，经济数据分化（PMI收缩，但增长信号强），商品市场信号混乱，整体处于增长与情绪背离的震荡下行阶段",
    market_direction: "bearish",
    target_position: "20%-40%",
    focus_industry_sectors: [
      "黄金",
      "贵金属",
      "贵金属Ⅲ",
      "贵重金属与矿石",
      "贵重金属与矿石(A股)",
    ],
    focus_concept_sectors: ["黄金概念", "小金属概念", "稀土永磁"],
    avoid_sectors: [
      "房地产开发",
      "房地产服务",
      "房地产投资信托",
      "乘用车",
      "汽车整车",
      "汽车零部件",
      "证券",
      "证券Ⅲ",
    ],
    macro_themes: ["避险情绪升温", "流动性宽松下的结构性机会", "工业需求分化"],
    risk_factors: [
      "市场情绪极度悲观，各指数技术指标全面恶化，存在继续探底风险",
      "PMI处于收缩区间，反映制造业活动疲软",
      "商品价格普遍下跌（原油、生猪、豆粕、焦炭、铝、棉花），暗示经济增长动能减弱和需求不足",
    ],
    confidence: 0.6,
    macro_summary:
      "当日市场情绪极度悲观，各主要指数全面下跌且技术指标恶化至超卖区域，成交量萎缩显示资金观望。流动性环境维持宽松（LPR下调，社融增量强劲），但宏观经济信号分化，PMI处于收缩区间，而商品市场整体下行（原油、生猪、豆粕等下跌）暗示增长动能减弱和通胀压力下降，黄金价格上涨则反映避险需求上升。",
  },
  "2026-04-20": {
    market_regime:
      "流动性偏宽松，增长弱修复，市场情绪偏悲观，处于震荡偏弱区间。",
    market_direction: "neutral-bearish",
    target_position: "30%-45%",
    focus_industry_sectors: ["贵金属", "有色金属", "公用事业", "高股息央国企"],
    focus_concept_sectors: ["避险资产", "资源品", "红利策略"],
    avoid_sectors: ["地产链", "可选消费", "高估值题材股", "券商"],
    macro_themes: ["风险偏好回落", "防御配置优先", "需求复苏偏慢"],
    risk_factors: [
      "风险偏好不足导致反弹持续性弱",
      "制造业景气偏弱，需求端修复不及预期",
      "商品分化明显，工业链价格中枢下移",
    ],
    confidence: 0.55,
    macro_summary:
      "市场延续弱势震荡，量能不足制约反弹。流动性环境尚可，但基本面修复不均衡，策略上以防御与结构性机会为主。",
  },
};

type ManagerOutput = (typeof managerOutputByDate)[keyof typeof managerOutputByDate];

const managerOutput = {
  market_regime:
    "流动性宽松但市场情绪极度悲观，经济数据分化（PMI收缩，但增长信号强），商品市场信号混乱，整体处于增长与情绪背离的震荡下行阶段",
  market_direction: "bearish",
  target_position: "20%-40%",
  focus_industry_sectors: [
    "黄金",
    "贵金属",
    "贵金属Ⅲ",
    "贵重金属与矿石",
    "贵重金属与矿石(A股)",
  ],
  focus_concept_sectors: ["黄金概念", "小金属概念", "稀土永磁"],
  avoid_sectors: [
    "房地产开发",
    "房地产服务",
    "房地产投资信托",
    "乘用车",
    "汽车整车",
    "汽车零部件",
    "证券",
    "证券Ⅲ",
  ],
  macro_themes: ["避险情绪升温", "流动性宽松下的结构性机会", "工业需求分化"],
  risk_factors: [
    "市场情绪极度悲观，各指数技术指标全面恶化，存在继续探底风险",
    "PMI处于收缩区间，反映制造业活动疲软",
    "商品价格普遍下跌（原油、生猪、豆粕、焦炭、铝、棉花），暗示经济增长动能减弱和需求不足",
  ],
  confidence: 0.6,
  macro_summary:
    "当日市场情绪极度悲观，各主要指数全面下跌且技术指标恶化至超卖区域，成交量萎缩显示资金观望。流动性环境维持宽松（LPR下调，社融增量强劲），但宏观经济信号分化，PMI处于收缩区间，而商品市场整体下行（原油、生猪、豆粕等下跌）暗示增长动能减弱和通胀压力下降，黄金价格上涨则反映避险需求上升。",
};

export default function DataMacroPage() {
  const availableDates = Object.keys(managerOutputByDate).sort((a, b) =>
    a > b ? -1 : 1
  );
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  const currentOutput = useMemo<ManagerOutput>(
    () => managerOutputByDate[selectedDate as keyof typeof managerOutputByDate],
    [selectedDate]
  );

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">宏观经理（Macro Manager）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          展示 Macro Manager 的结构化输出（无图表版本），用于快速查看市场状态、仓位建议、重点方向与风险因子。
        </p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="macro-manager-date" className="text-sm font-medium text-slate-700">
            选择日期
          </label>
          <select
            id="macro-manager-date"
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
        <InfoCard title="市场方向" value={currentOutput.market_direction} />
        <InfoCard title="目标仓位" value={currentOutput.target_position} />
        <InfoCard title="置信度" value={String(currentOutput.confidence)} />
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">市场状态</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-3 pb-4 text-sm leading-6 text-slate-700">
          {currentOutput.market_regime}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <ListCard title="重点行业" items={currentOutput.focus_industry_sectors} />
        <ListCard title="重点概念" items={currentOutput.focus_concept_sectors} />
        <ListCard title="规避方向" items={currentOutput.avoid_sectors} />
        <ListCard title="宏观主题" items={currentOutput.macro_themes} />
      </div>

      <ListCard title="风险因子" items={currentOutput.risk_factors} />

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">宏观摘要</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-3 pb-4 text-sm leading-6 text-slate-700">
          {currentOutput.macro_summary}
        </CardContent>
      </Card>
    </section>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-sm text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-2 pb-4 text-sm font-medium text-slate-700">
        {value}
      </CardContent>
    </Card>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-base text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-3 pb-4">
        <ul className="space-y-1 text-sm leading-6 text-slate-700">
          {items.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
