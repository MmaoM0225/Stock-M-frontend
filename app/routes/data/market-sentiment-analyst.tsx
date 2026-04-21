import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { KLineVolumeChart, type KLinePoint } from "~/components/charts/kline-volume-chart";
import type { UTCTimestamp } from "lightweight-charts";

const MACRO_DAILY_LOOKBACK = 60;

type IndexCode = "000001.SH" | "000016.SH" | "000905.SH" | "399005.SZ" | "399006.SZ";

type IndexMeta = {
  code: IndexCode;
  name: string;
  indexTrend: "up" | "down" | "neutral";
  turnoverSummary: string;
  volatilitySummary: string;
  marketConclusion: string;
  startPrice: number;
  endPrice: number;
  startVolume: number;
  endVolume: number;
};

const indexItems20260421: IndexMeta[] = [
  {
    code: "000001.SH",
    name: "上证综指",
    indexTrend: "down",
    turnoverSummary:
      "近期成交量整体平稳，但1月8日大跌日成交量并未显著放大，显示下跌过程中抛压相对温和。",
    volatilitySummary:
      "近期波动率有所放大，连续出现较大跌幅，指数跌破布林带下轨，短期波动加剧。",
    marketConclusion:
      "市场情绪偏空且脆弱，指标整体走弱并进入超卖区，短期存在技术性反弹可能但趋势仍偏下行。",
    startPrice: 3030,
    endPrice: 2878,
    startVolume: 255,
    endVolume: 270,
  },
  {
    code: "000016.SH",
    name: "上证50",
    indexTrend: "down",
    turnoverSummary: "近期成交量平稳偏弱，下跌日有放量，显示抛压增加。",
    volatilitySummary: "近期波动率上升，布林带开口扩大，价格运行在中下轨。",
    marketConclusion:
      "市场情绪偏弱，均线空头排列且超卖明显，短期可能出现反弹但整体仍谨慎偏空。",
    startPrice: 2480,
    endPrice: 2366,
    startVolume: 68,
    endVolume: 79,
  },
  {
    code: "000905.SH",
    name: "中证500",
    indexTrend: "down",
    turnoverSummary: "近期成交量整体萎缩，下跌过程中未见明显恐慌放量。",
    volatilitySummary: "近期波动率显著上升，单日跌幅扩大，短期波动明显。",
    marketConclusion:
      "市场情绪极度悲观，趋势明确下行且技术指标恶化，短期超卖或有反弹但需谨慎。",
    startPrice: 5880,
    endPrice: 5480,
    startVolume: 112,
    endVolume: 98,
  },
  {
    code: "399005.SZ",
    name: "中小板指",
    indexTrend: "down",
    turnoverSummary: "成交量中等偏弱，下跌日未显著放量，情绪偏谨慎。",
    volatilitySummary: "波动率较高，布林带宽度扩大，市场焦虑升温。",
    marketConclusion:
      "技术面走弱且超卖，市场情绪悲观，需警惕继续探底但也关注短反机会。",
    startPrice: 7090,
    endPrice: 6730,
    startVolume: 54,
    endVolume: 51,
  },
  {
    code: "399006.SZ",
    name: "创业板指",
    indexTrend: "down",
    turnoverSummary: "成交量持续萎缩，资金观望情绪浓厚。",
    volatilitySummary: "高波动下行通道明显，布林带开口向下并贴近下轨。",
    marketConclusion:
      "市场情绪极度悲观，动能指标持续走弱且均线空头排列，下行压力依然显著。",
    startPrice: 2035,
    endPrice: 1822,
    startVolume: 150,
    endVolume: 102,
  },
];

const sentimentOutput20260421 = {
  indexTrend: "down",
  marketSentiment: "bearish",
  volumeSignal: "contracting",
  volatilitySignal: "high",
  sentimentSummary:
    "市场整体情绪极度悲观，各指数全面下跌且技术指标恶化，成交量萎缩显示资金观望，波动率上升反映市场焦虑情绪加剧。",
};

const indexItems20260420: IndexMeta[] = [
  {
    code: "000001.SH",
    name: "上证综指",
    indexTrend: "down",
    turnoverSummary: "成交量平稳偏弱，下跌时未出现极端放量，显示抛压持续但恐慌有限。",
    volatilitySummary: "波动率上行，短期跌幅扩大，市场风险偏好继续收缩。",
    marketConclusion: "情绪偏空，弱势下行结构未改，超卖信号增强但反弹可信度有限。",
    startPrice: 3062,
    endPrice: 2910,
    startVolume: 248,
    endVolume: 258,
  },
  {
    code: "000016.SH",
    name: "上证50",
    indexTrend: "down",
    turnoverSummary: "成交量边际放大，权重板块抛压提升。",
    volatilitySummary: "波动率中高，价格重心下移并反复测试下沿。",
    marketConclusion: "偏空，防御风格未能扭转趋势，技术面仍弱。",
    startPrice: 2518,
    endPrice: 2398,
    startVolume: 66,
    endVolume: 73,
  },
  {
    code: "000905.SH",
    name: "中证500",
    indexTrend: "down",
    turnoverSummary: "成交量萎缩明显，资金观望，主动买盘不足。",
    volatilitySummary: "波动率显著抬升，日内振幅扩大，风险偏好明显下降。",
    marketConclusion: "极度悲观，中小盘承压突出，趋势仍以下行为主。",
    startPrice: 5950,
    endPrice: 5540,
    startVolume: 118,
    endVolume: 101,
  },
  {
    code: "399005.SZ",
    name: "中小板指",
    indexTrend: "down",
    turnoverSummary: "成交量中枢小幅回落，抛压延续但无恐慌踩踏。",
    volatilitySummary: "高波动延续，短期趋势向下。",
    marketConclusion: "情绪悲观，存在超卖反弹可能，但右侧信号不足。",
    startPrice: 7160,
    endPrice: 6790,
    startVolume: 56,
    endVolume: 50,
  },
  {
    code: "399006.SZ",
    name: "创业板指",
    indexTrend: "down",
    turnoverSummary: "量能持续下行，市场参与度不足。",
    volatilitySummary: "高波动下行，弱势通道明显。",
    marketConclusion: "极度悲观，成长板块承压明显，短线继续探底风险高。",
    startPrice: 2088,
    endPrice: 1860,
    startVolume: 154,
    endVolume: 108,
  },
];

const sentimentOutput20260420 = {
  indexTrend: "down",
  marketSentiment: "bearish",
  volumeSignal: "contracting",
  volatilitySignal: "high",
  sentimentSummary:
    "市场风险偏好继续下降，量能收缩与波动上升并存，整体处于弱势下行与超卖并存阶段。",
};

const sentimentDataByDate = {
  "2026-04-21": {
    indexItems: indexItems20260421,
    sentimentOutput: sentimentOutput20260421,
  },
  "2026-04-20": {
    indexItems: indexItems20260420,
    sentimentOutput: sentimentOutput20260420,
  },
};

function buildSeries(item: IndexMeta) {
  let prevClose = item.startPrice;
  return Array.from({ length: MACRO_DAILY_LOOKBACK }, (_, idx) => {
    const progress = idx / (MACRO_DAILY_LOOKBACK - 1);
    const baselinePrice = item.startPrice + (item.endPrice - item.startPrice) * progress;
    const baselineVolume = item.startVolume + (item.endVolume - item.startVolume) * progress;
    const priceNoise = Math.sin(idx * 1.3) * item.startPrice * 0.008;
    const volumeNoise = Math.cos(idx * 0.9) * item.startVolume * 0.06;
    const close = Number((baselinePrice + priceNoise).toFixed(2));
    const open = idx === 0 ? item.startPrice : prevClose;
    const spread = Math.max(Math.abs(close) * 0.004, 4);
    const high = Number((Math.max(open, close) + spread).toFixed(2));
    const low = Number((Math.min(open, close) - spread).toFixed(2));
    prevClose = close;
    return {
      day: `D${idx + 1}`,
      time: ((Date.now() / 1000 - (MACRO_DAILY_LOOKBACK - idx) * 24 * 3600) | 0) as UTCTimestamp,
      open: Number(open.toFixed(2)),
      high,
      low,
      close,
      up: close >= open,
      volume: Number((baselineVolume + volumeNoise).toFixed(2)),
    };
  });
}

export default function MarketSentimentAnalystPage() {
  const availableDates = Object.keys(sentimentDataByDate).sort((a, b) =>
    a > b ? -1 : 1
  );
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  const currentData = useMemo(
    () => sentimentDataByDate[selectedDate as keyof typeof sentimentDataByDate],
    [selectedDate]
  );

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">市场情绪分析师（Market Sentiment Analyst）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          默认指数池为 000001.SH、000016.SH、000905.SH、399005.SZ、399006.SZ，默认回溯窗口为
          {` ${MACRO_DAILY_LOOKBACK} `}
          天。
        </p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="sentiment-date" className="text-sm font-medium text-slate-700">
            选择日期
          </label>
          <select
            id="sentiment-date"
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
        <SignalCard title="指数总体趋势" value={currentData.sentimentOutput.indexTrend} />
        <SignalCard title="市场情绪" value={currentData.sentimentOutput.marketSentiment} />
        <SignalCard title="成交量信号" value={currentData.sentimentOutput.volumeSignal} />
        <SignalCard title="波动率信号" value={currentData.sentimentOutput.volatilitySignal} />
      </div>

      <div className="grid gap-4">
        {currentData.indexItems.map((item) => {
          const data = buildSeries(item);
          return (
            <Card key={item.code} className="rounded-none py-0">
              <CardHeader className="px-4 pt-4 pb-0">
                <CardTitle className="flex items-center justify-between text-base text-slate-900">
                  <span>
                    {item.name}（{item.code}）
                  </span>
                  <span className={item.indexTrend === "down" ? "text-rose-600 text-sm" : "text-emerald-600 text-sm"}>
                    {item.indexTrend}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pt-3 pb-4">
                <KlineVolumePanel data={data} />
                <p className="text-sm leading-6 text-slate-600">
                  <span className="font-medium text-slate-900">成交量解读：</span>
                  {item.turnoverSummary}
                </p>
                <p className="text-sm leading-6 text-slate-600">
                  <span className="font-medium text-slate-900">波动率解读：</span>
                  {item.volatilitySummary}
                </p>
                <p className="text-sm leading-6 text-slate-700">
                  <span className="font-medium text-slate-900">市场结论：</span>
                  {item.marketConclusion}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">综合情绪摘要</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-3 pb-4 text-sm leading-6 text-slate-700">
          {currentData.sentimentOutput.sentimentSummary}
        </CardContent>
      </Card>
    </section>
  );
}

function SignalCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-sm text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-2 pb-4 text-sm text-slate-700">{value}</CardContent>
    </Card>
  );
}

type CandlePoint = {
  day: string;
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  up: boolean;
  volume: number;
};

function KlineVolumePanel({ data }: { data: CandlePoint[] }) {
  const chartData: KLinePoint[] = data.map((item) => ({
    time: item.time,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    volume: item.volume,
  }));

  return (
    <div className="border border-slate-200 p-2">
      <p className="mb-2 text-xs text-slate-500">K线与成交量（上下对应，60天）</p>
      <KLineVolumeChart data={chartData} />
    </div>
  );
}
