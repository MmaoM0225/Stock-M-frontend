import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

const MACRO_DAILY_LOOKBACK = 60;

type CommodityItem = {
  name: string;
  trend: "up" | "down" | "neutral";
  start: number;
  end: number;
  priceSummary: string;
  macroImplication: string;
};

const commodityItems20260421: CommodityItem[] = [
  {
    name: "黄金",
    trend: "up",
    start: 467.73,
    end: 479.0,
    priceSummary:
      "价格从2023年11月9日的467.73元上涨至2024年1月8日的479.0元，整体涨幅约2.4%，期间最高达487.0元，最低465.0元，波动较大。",
    macroImplication:
      "黄金作为避险资产和通胀预期指标，价格上涨可能反映市场对经济不确定性的避险需求增强，或通胀预期上升。",
  },
  {
    name: "原油连续",
    trend: "down",
    start: 594.6,
    end: 550.2,
    priceSummary:
      "INE原油期货价格从2023年11月9日收盘594.6元下跌至2024年1月8日收盘550.2元，跌幅约7.5%，整体呈波动下跌趋势。",
    macroImplication:
      "原油价格下跌反映全球需求偏弱或供应宽松，可能缓解输入性通胀，但也提示增长动能放缓风险。",
  },
  {
    name: "生猪连续",
    trend: "down",
    start: 14000,
    end: 13195,
    priceSummary:
      "从2023年11月9日收盘价14000元/吨，震荡下跌至2024年1月8日收盘价13195元/吨，累计跌幅约5.8%。",
    macroImplication:
      "猪价走低有助于缓解CPI食品项压力，但也可能压缩养殖利润，影响后续供给节奏。",
  },
  {
    name: "螺纹钢连续",
    trend: "up",
    start: 3795,
    end: 3958,
    priceSummary:
      "螺纹钢价格从2023年11月9日的3795点上涨至2024年1月8日的3958点，涨幅约4.3%，近期高位回调。",
    macroImplication:
      "钢价偏强通常反映基建与制造链条需求改善，但回调提示复苏斜率仍需验证。",
  },
  {
    name: "豆粕连续",
    trend: "down",
    start: 4340,
    end: 3650,
    priceSummary:
      "豆粕连续合约价格从2023年11月初的4340元/吨下跌至2024年1月8日的3650元/吨，累计跌幅约15.9%。",
    macroImplication:
      "豆粕下行反映饲料需求偏弱，可能对应畜牧链景气走弱，整体通胀压力有所回落。",
  },
  {
    name: "焦炭连续",
    trend: "down",
    start: 2444.5,
    end: 2330.0,
    priceSummary:
      "焦炭连续合约价格从2023年11月9日收盘2444.5元/吨下跌至2024年1月8日收盘2330.0元/吨，跌幅4.7%。",
    macroImplication:
      "焦炭作为钢铁上游原料，价格走弱通常对应工业活动偏弱与地产链需求不足。",
  },
  {
    name: "烧碱连续",
    trend: "up",
    start: 2631,
    end: 2692,
    priceSummary:
      "烧碱期货价格从2023年11月9日收盘2631点波动至2024年1月8日收盘2692点，整体上涨约2.3%。",
    macroImplication:
      "烧碱价格稳中有升，显示部分制造业需求保持韧性，但波动也提示工业预期分化。",
  },
  {
    name: "沪铜连续",
    trend: "neutral",
    start: 67440,
    end: 68360,
    priceSummary:
      "沪铜连续合约近期在67340-69870元/吨区间震荡，整体窄幅波动，小幅上涨约1.4%。",
    macroImplication:
      "铜价震荡说明市场对复苏与风险因素均有定价，宏观情绪偏中性观察。",
  },
  {
    name: "沪铝连续",
    trend: "down",
    start: 19220,
    end: 19185,
    priceSummary:
      "沪铝连续合约从2023年11月9日的19220元/吨回落至2024年1月8日的19185元/吨，整体震荡偏弱。",
    macroImplication:
      "铝价偏弱反映地产链需求不足，虽有新能源需求支撑，但总需求恢复仍不均衡。",
  },
  {
    name: "棉花连续",
    trend: "down",
    start: 15610,
    end: 15435,
    priceSummary:
      "棉花连续合约收盘价从2023年11月9日的15610点下跌至2024年1月8日的15435点，整体呈下跌趋势。",
    macroImplication:
      "棉价走弱常对应纺织服装链需求偏弱，反映消费与出口恢复仍承压。",
  },
];

const outputSummary20260421 = {
  overallTrend: "down",
  commodityMarketTrend: "mixed",
  macroSignals: {
    growthSignal: "weakening",
    inflationSignal: "falling",
    riskSentiment: "risk_off",
  },
  macroSummary: "经济增长动能减弱，通胀压力下降，市场避险情绪上升。",
};

const commodityItems20260420: CommodityItem[] = [
  {
    name: "黄金",
    trend: "up",
    start: 462.1,
    end: 473.5,
    priceSummary: "黄金在窗口期内震荡上行，风险偏好回落时走强，整体维持偏多结构。",
    macroImplication: "反映避险需求和政策宽松预期并存，市场对增长不确定性仍有定价。",
  },
  {
    name: "原油连续",
    trend: "down",
    start: 602.0,
    end: 557.6,
    priceSummary: "原油价格整体走弱，需求端预期偏弱，供给弹性对价格形成压制。",
    macroImplication: "能源成本回落对通胀形成缓冲，但也提示全球增长动能偏弱。",
  },
  {
    name: "生猪连续",
    trend: "down",
    start: 14150,
    end: 13360,
    priceSummary: "生猪价格震荡下行，阶段性反弹后再度回落，供需结构偏宽松。",
    macroImplication: "食品项通胀压力减轻，但养殖盈利承压可能影响后续产能节奏。",
  },
  {
    name: "螺纹钢连续",
    trend: "up",
    start: 3760,
    end: 3922,
    priceSummary: "螺纹钢价格温和上行，后段高位震荡，需求恢复强度仍在观察期。",
    macroImplication: "反映基建与制造链条有边际修复，但地产链拖累尚未完全消退。",
  },
  {
    name: "豆粕连续",
    trend: "down",
    start: 4280,
    end: 3710,
    priceSummary: "豆粕呈连续下探走势，局部反弹持续性不足，整体空头主导。",
    macroImplication: "畜牧链需求预期走弱，通胀压力边际回落。",
  },
  {
    name: "焦炭连续",
    trend: "down",
    start: 2470,
    end: 2368,
    priceSummary: "焦炭价格重心下移，后半程下跌斜率扩大，工业链条偏弱。",
    macroImplication: "上游原料弱势通常对应工业景气偏弱与需求不充分。",
  },
  {
    name: "烧碱连续",
    trend: "neutral",
    start: 2650,
    end: 2678,
    priceSummary: "烧碱价格高位震荡，趋势不明显，供需两端均无单边驱动。",
    macroImplication: "制造业需求总体平稳但弹性不足，宏观信号偏中性。",
  },
  {
    name: "沪铜连续",
    trend: "neutral",
    start: 67120,
    end: 67940,
    priceSummary: "沪铜维持区间波动，未形成明确趋势，波动率低于黑色链。",
    macroImplication: "市场对复苏与风险并行定价，工业需求预期尚未达成一致。",
  },
  {
    name: "沪铝连续",
    trend: "down",
    start: 19310,
    end: 19220,
    priceSummary: "沪铝缓慢下行，价格重心小幅回落，下游补库节奏偏慢。",
    macroImplication: "地产链需求偏弱仍压制铝价，新能源支撑未能形成趋势性突破。",
  },
  {
    name: "棉花连续",
    trend: "down",
    start: 15720,
    end: 15510,
    priceSummary: "棉花价格在区间内震荡偏弱，出口与内需表现均偏谨慎。",
    macroImplication: "纺织链需求偏弱，消费和外需修复强度不足。",
  },
];

const outputSummary20260420 = {
  overallTrend: "down",
  commodityMarketTrend: "mixed",
  macroSignals: {
    growthSignal: "weakening",
    inflationSignal: "falling",
    riskSentiment: "risk_off",
  },
  macroSummary: "增长修复斜率放缓，通胀回落延续，商品市场以防御与分化为主。",
};

const commodityDataByDate = {
  "2026-04-21": {
    commodityItems: commodityItems20260421,
    outputSummary: outputSummary20260421,
  },
  "2026-04-20": {
    commodityItems: commodityItems20260420,
    outputSummary: outputSummary20260420,
  },
};

type Candle = { o: number; h: number; l: number; c: number };

function buildSeries(start: number, end: number, trend: CommodityItem["trend"]): Candle[] {
  const candles: Candle[] = [];
  let prevClose = start;
  for (let i = 0; i < MACRO_DAILY_LOOKBACK; i += 1) {
    const progress = i / (MACRO_DAILY_LOOKBACK - 1);
    const baseline = start + (end - start) * progress;
    const directionBias = trend === "up" ? 1 : trend === "down" ? -1 : 0;
    const noise = Math.sin(i * 1.7) * 0.01 * start;
    const close = baseline + noise * (0.5 + Math.abs(directionBias));
    const open = i === 0 ? start : prevClose;
    const spread = Math.max(Math.abs(close) * 0.004, 0.6);
    const high = Math.max(open, close) + spread;
    const low = Math.min(open, close) - spread;
    candles.push({ o: open, h: high, l: low, c: close });
    prevClose = close;
  }
  return candles;
}

function MiniKLineChart({ candles }: { candles: Candle[] }) {
  const width = 520;
  const height = 220;
  const paddingX = 20;
  const paddingY = 16;
  const max = Math.max(...candles.map((d) => d.h));
  const min = Math.min(...candles.map((d) => d.l));
  const scaleY = (value: number) => {
    const ratio = (value - min) / (max - min || 1);
    return height - paddingY - ratio * (height - paddingY * 2);
  };
  const step = (width - paddingX * 2) / candles.length;
  const candleWidth = Math.max(step * 0.55, 2);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full bg-slate-50">
      {candles.map((candle, idx) => {
        const x = paddingX + idx * step + (step - candleWidth) / 2;
        const openY = scaleY(candle.o);
        const closeY = scaleY(candle.c);
        const highY = scaleY(candle.h);
        const lowY = scaleY(candle.l);
        const up = candle.c >= candle.o;
        return (
          <g key={idx}>
            <line
              x1={x + candleWidth / 2}
              x2={x + candleWidth / 2}
              y1={highY}
              y2={lowY}
              stroke={up ? "#16a34a" : "#dc2626"}
              strokeWidth={1}
            />
            <rect
              x={x}
              y={Math.min(openY, closeY)}
              width={candleWidth}
              height={Math.max(Math.abs(closeY - openY), 1)}
              fill={up ? "#22c55e" : "#ef4444"}
              opacity={0.9}
            />
          </g>
        );
      })}
    </svg>
  );
}

export default function CommodityAnalystPage() {
  const availableDates = Object.keys(commodityDataByDate).sort((a, b) =>
    a > b ? -1 : 1
  );
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  const currentData = useMemo(
    () => commodityDataByDate[selectedDate as keyof typeof commodityDataByDate],
    [selectedDate]
  );

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">
          大宗商品分析师（Commodity Analyst）
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          当前覆盖黄金、原油、生猪、螺纹钢、豆粕、焦炭、烧碱、沪铜、沪铝、棉花，默认回溯窗口为
          {` ${MACRO_DAILY_LOOKBACK} `}
          天，并使用 K 线方式展示价格行为。
        </p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="commodity-date" className="text-sm font-medium text-slate-700">
            选择日期
          </label>
          <select
            id="commodity-date"
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {currentData.commodityItems.map((item) => (
          <Card key={item.name} className="rounded-none py-0">
            <CardHeader className="px-4 pt-4 pb-0">
              <CardTitle className="flex items-center justify-between text-sm text-slate-900">
                <span>{item.name}</span>
                <span
                  className={
                    item.trend === "up"
                      ? "text-emerald-600"
                      : item.trend === "down"
                        ? "text-rose-600"
                        : "text-slate-500"
                  }
                >
                  {item.trend}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pt-3 pb-4">
              <MiniKLineChart candles={buildSeries(item.start, item.end, item.trend)} />
              <p className="text-xs leading-5 text-slate-600">{item.priceSummary}</p>
              <p className="text-xs leading-5 text-slate-700">{item.macroImplication}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">综合输出</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 pt-3 pb-4 text-sm text-slate-700">
          <p>数据日期：{selectedDate}</p>
          <p>overall_trend：{currentData.outputSummary.overallTrend}</p>
          <p>commodity_market_trend：{currentData.outputSummary.commodityMarketTrend}</p>
          <p>growth_signal：{currentData.outputSummary.macroSignals.growthSignal}</p>
          <p>inflation_signal：{currentData.outputSummary.macroSignals.inflationSignal}</p>
          <p>risk_sentiment：{currentData.outputSummary.macroSignals.riskSentiment}</p>
          <p className="font-medium text-slate-900">
            macro_summary：{currentData.outputSummary.macroSummary}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
