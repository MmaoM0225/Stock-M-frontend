import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

const sectorManagerByDate = {
  "2025-03-20": {
  marketRegime: "mixed",
  marketBias: "bearish",
  actionBias: "defense",
  favoredSectors: ["黄金", "贵金属", "贵金属Ⅲ", "贵重金属与矿石", "贵重金属与矿石(A股)"],
  watchlistSectors: ["冰雪产业", "火电", "公路铁路运输"],
  riskSectors: [
    "房地产开发",
    "房地产服务",
    "房地产投资信托",
    "乘用车",
    "汽车整车",
    "汽车零部件",
    "证券",
    "证券Ⅲ",
    "多种化学制品",
    "商品化工",
    "通信设备",
    "化学制品",
    "铝",
  ],
  coreSignals: [
    "宏观避险情绪升温，明确聚焦黄金等贵金属板块。",
    "行业趋势显示电信、医疗、生物科技等主线持续走强，但资金流数据缺失无法验证共振。",
    "宏观与行业趋势共同指向房地产、汽车、证券及部分高位化工、金属板块为风险方向。",
    "市场处于情绪悲观、结构分化的混合状态，宏观仓位建议低仓位防御。",
  ],
  confidence: 0.5,
  sectorSummary:
    "当日行业结构呈现分化，趋势主线（电信、医疗、生物科技）与宏观避险主线（贵金属）并存，但缺乏资金流验证。宏观风险规避方向（房地产、汽车、证券）与行业高位转弱板块（化工、铝）高度重叠，构成明确的负面清单。执行上应遵循宏观防御建议，优先配置宏观聚焦的贵金属板块，并观察冰雪产业、火电等修复机会，对风险板块保持规避。",
  },
  "2025-03-19": {
    marketRegime: "mixed",
    marketBias: "bearish",
    actionBias: "defense",
    favoredSectors: ["黄金", "贵金属", "贵重金属与矿石", "公用事业"],
    watchlistSectors: ["冰雪产业", "火电", "公路铁路运输", "焦炭加工"],
    riskSectors: ["房地产开发", "乘用车", "汽车零部件", "证券Ⅲ", "商品化工", "通信设备", "铝"],
    coreSignals: [
      "宏观防御信号延续，贵金属仍是优选方向。",
      "行业主线强势但分化加剧，轮动速度提升。",
      "地产、汽车、券商等高弹性方向持续承压。",
      "建议控制仓位，偏防御配置并保留修复观察仓。",
    ],
    confidence: 0.46,
    sectorSummary:
      "市场仍以结构分化为主，防御资产优先级较高。执行层面继续规避地产链与高位转弱板块，观察修复线索是否具备持续性。",
  },
};

export default function DataSectorPage() {
  const availableDates = Object.keys(sectorManagerByDate).sort((a, b) => (a > b ? -1 : 1));
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  const sectorManagerOutput = useMemo(
    () => sectorManagerByDate[selectedDate as keyof typeof sectorManagerByDate],
    [selectedDate]
  );

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">行业经理（Sector Manager）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          汇总宏观与行业子分析师信号，输出行业层执行偏好、优选方向、观察清单和风险规避列表。
        </p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="sector-manager-date" className="text-sm font-medium text-slate-700">
            选择日期
          </label>
          <select
            id="sector-manager-date"
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
        <MetricCard title="市场状态" value={sectorManagerOutput.marketRegime} />
        <MetricCard title="市场偏向" value={sectorManagerOutput.marketBias} tone="down" />
        <MetricCard title="执行偏向" value={sectorManagerOutput.actionBias} />
        <MetricCard title="置信度" value={String(sectorManagerOutput.confidence)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TagListCard title="优选板块（Favored）" items={sectorManagerOutput.favoredSectors} variant="secondary" />
        <TagListCard title="观察板块（Watchlist）" items={sectorManagerOutput.watchlistSectors} variant="outline" />
        <TagListCard title="风险板块（Risk）" items={sectorManagerOutput.riskSectors} variant="destructive" />
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">核心信号</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 pt-3 pb-4 text-sm leading-6 text-slate-700">
          <ul className="space-y-1">
            {sectorManagerOutput.coreSignals.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">行业经理总结</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 pt-3 pb-4 text-sm leading-6 text-slate-700">
          <p>{sectorManagerOutput.sectorSummary}</p>
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
  tone?: "neutral" | "down";
}) {
  const textColor = tone === "down" ? "text-rose-600" : "text-slate-700";
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
