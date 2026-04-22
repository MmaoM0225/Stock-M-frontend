import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { getCommodityByTradeDate, getCommodityDates, type CommodityData } from "~/lib/macro";

function MiniKLineChart({
  candles,
}: {
  candles: Array<{ open: number; high: number; low: number; close: number }>;
}) {
  const width = 520;
  const height = 220;
  const paddingX = 20;
  const paddingY = 16;
  const max = Math.max(...candles.map((d) => d.high));
  const min = Math.min(...candles.map((d) => d.low));
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
        const openY = scaleY(candle.open);
        const closeY = scaleY(candle.close);
        const highY = scaleY(candle.high);
        const lowY = scaleY(candle.low);
        const up = candle.close >= candle.open;
        return (
          <g key={idx}>
            <line x1={x + candleWidth / 2} x2={x + candleWidth / 2} y1={highY} y2={lowY} stroke={up ? "#16a34a" : "#dc2626"} strokeWidth={1} />
            <rect x={x} y={Math.min(openY, closeY)} width={candleWidth} height={Math.max(Math.abs(closeY - openY), 1)} fill={up ? "#22c55e" : "#ef4444"} opacity={0.9} />
          </g>
        );
      })}
    </svg>
  );
}

export default function CommodityAnalystPage() {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentData, setCurrentData] = useState<CommodityData | null>(null);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");
  const availableDateSet = useMemo(() => new Set(availableDates), [availableDates]);
  const selectedCalendarDate = useMemo(
    () => (selectedDate ? compactDateStringToDate(selectedDate) : undefined),
    [selectedDate]
  );

  useEffect(() => {
    let disposed = false;

    const loadDates = async () => {
      setLoadingDates(true);
      setError("");
      try {
        const response = await getCommodityDates();
        const dates = response.data?.dates ?? [];
        if (disposed) return;
        setAvailableDates(dates);
        setSelectedDate(dates[0] ?? "");
      } catch (err) {
        if (disposed) return;
        setError(err instanceof Error ? err.message : "获取可选日期失败");
      } finally {
        if (!disposed) setLoadingDates(false);
      }
    };

    loadDates();
    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setCurrentData(null);
      return;
    }
    let disposed = false;
    const loadDetail = async () => {
      setLoadingDetail(true);
      setError("");
      try {
        const response = await getCommodityByTradeDate(selectedDate);
        if (disposed) return;
        setCurrentData(response.data ?? null);
      } catch (err) {
        if (disposed) return;
        setCurrentData(null);
        setError(err instanceof Error ? err.message : "获取大宗商品分析数据失败");
      } finally {
        if (!disposed) setLoadingDetail(false);
      }
    };
    loadDetail();
    return () => {
      disposed = true;
    };
  }, [selectedDate]);

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">大宗商品分析师（Commodity Analyst）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          当前覆盖黄金、原油、生猪、螺纹钢、豆粕、焦炭、烧碱、沪铜、沪铝、棉花，K 线与成交量使用接口返回行情序列。
        </p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="commodity-date" className="text-sm font-medium text-slate-700">选择日期</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="commodity-date" variant="outline" className="w-[180px] justify-start text-left">
                {selectedDate}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedCalendarDate}
                onSelect={(date) => {
                  if (!date) return;
                  const normalizedDate = dateToCompactDateString(date);
                  if (availableDateSet.has(normalizedDate)) {
                    setSelectedDate(normalizedDate);
                  }
                }}
                disabled={(date) => !availableDateSet.has(dateToCompactDateString(date))}
              />
            </PopoverContent>
          </Popover>
        </div>
        {loadingDates ? <p className="mt-3 text-sm text-slate-500">日期加载中...</p> : null}
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {!loadingDetail && !currentData ? (
        <Card className="rounded-none py-0">
          <CardContent className="px-4 py-4 text-sm text-slate-500">暂无可展示的数据。</CardContent>
        </Card>
      ) : null}
      {loadingDetail ? (
        <Card className="rounded-none py-0">
          <CardContent className="px-4 py-4 text-sm text-slate-500">数据加载中...</CardContent>
        </Card>
      ) : null}
      {currentData ? (
        <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {currentData.commodity_items.map((item) => (
          <Card key={item.name} className="rounded-none py-0">
            <CardHeader className="px-4 pt-4 pb-0">
              <CardTitle className="flex items-center justify-between text-sm text-slate-900">
                <span>{item.name}</span>
                <span className={item.trend === "up" ? "text-emerald-600" : item.trend === "down" ? "text-rose-600" : "text-slate-500"}>{item.trend}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pt-3 pb-4">
              <MiniKLineChart candles={item.market_series} />
              <p className="text-xs leading-5 text-slate-600">{item.price_summary}</p>
              <p className="text-xs leading-5 text-slate-700">{item.macro_implication}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0"><CardTitle className="text-base text-slate-900">综合输出</CardTitle></CardHeader>
        <CardContent className="space-y-2 px-4 pt-3 pb-4 text-sm text-slate-700">
          <p>数据日期：{selectedDate}</p>
          <p>overall_trend：{currentData.output_summary.overall_trend}</p>
          <p>commodity_market_trend：{currentData.output_summary.commodity_market_trend}</p>
          <p>growth_signal：{currentData.output_summary.macro_signals.growth_signal}</p>
          <p>inflation_signal：{currentData.output_summary.macro_signals.inflation_signal}</p>
          <p>risk_sentiment：{currentData.output_summary.macro_signals.risk_sentiment}</p>
          <p className="font-medium text-slate-900">macro_summary：{currentData.output_summary.macro_summary}</p>
        </CardContent>
      </Card>
        </>
      ) : null}
    </section>
  );
}

function compactDateStringToDate(value: string) {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  return new Date(year, month - 1, day, 12, 0, 0);
}

function dateToCompactDateString(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}${month}${day}`;
}
