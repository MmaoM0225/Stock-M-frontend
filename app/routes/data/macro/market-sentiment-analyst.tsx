import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { KLineVolumeChart, type KLinePoint } from "~/components/charts/kline-volume-chart";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import type { UTCTimestamp } from "lightweight-charts";
import { getMarketSentimentByTradeDate, getMarketSentimentDates, type MarketSentimentData } from "~/lib/macro";

export default function MarketSentimentAnalystPage() {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentData, setCurrentData] = useState<MarketSentimentData | null>(null);
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
        const response = await getMarketSentimentDates();
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
        const response = await getMarketSentimentByTradeDate(selectedDate);
        if (disposed) return;
        setCurrentData(response.data ?? null);
      } catch (err) {
        if (disposed) return;
        setCurrentData(null);
        setError(err instanceof Error ? err.message : "获取市场情绪分析数据失败");
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
        <h1 className="text-2xl font-bold text-slate-900">市场情绪分析师（Market Sentiment Analyst）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">默认指数池为 000001.SH、000016.SH、000905.SH、399005.SZ、399006.SZ，K 线与成交量使用接口返回行情序列。</p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="sentiment-date" className="text-sm font-medium text-slate-700">选择日期</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="sentiment-date" variant="outline" className="w-[180px] justify-start text-left">
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
      <div className="grid gap-4 md:grid-cols-4">
        <SignalCard title="指数总体趋势" value={currentData.sentiment_output.index_trend} />
        <SignalCard title="市场情绪" value={currentData.sentiment_output.market_sentiment} />
        <SignalCard title="成交量信号" value={currentData.sentiment_output.volume_signal} />
        <SignalCard title="波动率信号" value={currentData.sentiment_output.volatility_signal} />
      </div>

      <div className="grid gap-4">
        {currentData.index_items.map((item) => {
          return (
            <Card key={item.code} className="rounded-none py-0">
              <CardHeader className="px-4 pt-4 pb-0">
                <CardTitle className="flex items-center justify-between text-base text-slate-900">
                  <span>{item.name}（{item.code}）</span>
                  <span className={item.index_trend === "down" ? "text-rose-600 text-sm" : "text-emerald-600 text-sm"}>{item.index_trend}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pt-3 pb-4">
                <KlineVolumePanel data={item.market_series} />
                <p className="text-sm leading-6 text-slate-600"><span className="font-medium text-slate-900">成交量解读：</span>{item.turnover_summary}</p>
                <p className="text-sm leading-6 text-slate-600"><span className="font-medium text-slate-900">波动率解读：</span>{item.volatility_summary}</p>
                <p className="text-sm leading-6 text-slate-700"><span className="font-medium text-slate-900">市场结论：</span>{item.market_conclusion}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0"><CardTitle className="text-base text-slate-900">综合情绪摘要</CardTitle></CardHeader>
        <CardContent className="px-4 pt-3 pb-4 text-sm leading-6 text-slate-700">{currentData.sentiment_output.sentiment_summary}</CardContent>
      </Card>
        </>
      ) : null}
    </section>
  );
}

function dateStringToDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

function dateToDateString(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function SignalCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0"><CardTitle className="text-sm text-slate-900">{title}</CardTitle></CardHeader>
      <CardContent className="px-4 pt-2 pb-4 text-sm text-slate-700">{value}</CardContent>
    </Card>
  );
}


function KlineVolumePanel({
  data,
}: {
  data: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}) {
  const chartData: KLinePoint[] = data.map((item) => ({
    time: toUtcTimestamp(item.date),
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    volume: item.volume,
  }));
  return <div className="border border-slate-200 p-2"><p className="mb-2 text-xs text-slate-500">K线与成交量（上下对应，60天）</p><KLineVolumeChart data={chartData} /></div>;
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

function toUtcTimestamp(date: string): UTCTimestamp {
  const time = new Date(`${date}T00:00:00`).getTime();
  return Math.floor(time / 1000) as UTCTimestamp;
}
