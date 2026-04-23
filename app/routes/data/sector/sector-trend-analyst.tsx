import { useEffect, useMemo, useState } from "react";
import type { UTCTimestamp } from "lightweight-charts";
import { KLineVolumeChart, type KLinePoint } from "~/components/charts/kline-volume-chart";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import {
  getSectorTrendByTradeDate,
  getSectorTrendDates,
  getSectorTrendSeriesByCode,
  type SectorTrendData,
  type SectorTrendSeriesDetail,
} from "~/lib/sector";

export default function SectorTrendAnalystPage() {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [trendOutput, setTrendOutput] = useState<SectorTrendData | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<SectorTrendSeriesDetail | null>(null);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingSeries, setLoadingSeries] = useState(false);
  const [error, setError] = useState("");
  const availableDateSet = useMemo(() => new Set(availableDates), [availableDates]);
  const selectedCalendarDate = useMemo(
    () => (selectedDate ? compactDateStringToDate(selectedDate) : undefined),
    [selectedDate]
  );
  const [selectedCode, setSelectedCode] = useState("");
  const sectorSeriesList = trendOutput?.series_list ?? [];

  useEffect(() => {
    let disposed = false;
    const loadDates = async () => {
      setLoadingDates(true);
      setError("");
      try {
        const response = await getSectorTrendDates();
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
      setTrendOutput(null);
      return;
    }
    let disposed = false;
    const loadDetail = async () => {
      setLoadingDetail(true);
      setError("");
      try {
        const response = await getSectorTrendByTradeDate(selectedDate);
        const data = response.data ?? null;
        if (disposed) return;
        setTrendOutput(data);
        setSelectedCode(data?.series_list?.[0]?.ts_code ?? "");
        setSelectedSeries(null);
      } catch (err) {
        if (disposed) return;
        setTrendOutput(null);
        setSelectedCode("");
        setError(err instanceof Error ? err.message : "获取行业趋势分析数据失败");
      } finally {
        if (!disposed) setLoadingDetail(false);
      }
    };

    loadDetail();
    return () => {
      disposed = true;
    };
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedCode) {
      setSelectedSeries(null);
      return;
    }

    let disposed = false;
    const loadSeries = async () => {
      setLoadingSeries(true);
      setError("");
      try {
        const response = await getSectorTrendSeriesByCode(selectedCode);
        if (disposed) return;
        setSelectedSeries(response.data ?? null);
      } catch (err) {
        if (disposed) return;
        setSelectedSeries(null);
        setError(err instanceof Error ? err.message : "获取板块行情数据失败");
      } finally {
        if (!disposed) setLoadingSeries(false);
      }
    };

    loadSeries();
    return () => {
      disposed = true;
    };
  }, [selectedCode]);

  const klineData: KLinePoint[] = useMemo(
    () =>
      [...(selectedSeries?.rows ?? [])]
        .sort((a, b) => Number(a.trade_date) - Number(b.trade_date))
        .map((row) => {
          const time = toUtcTimestamp(row.trade_date);
          if (time === null) return null;
          return {
            time,
            open: row.open,
            high: row.high,
            low: row.low,
            close: row.close,
            volume: row.vol,
          };
        })
        .filter((item): item is KLinePoint => item !== null)
        .sort((a, b) => Number(a.time) - Number(b.time)),
    [selectedSeries?.rows]
  );

  const latest = useMemo(
    () =>
      [...(selectedSeries?.rows ?? [])]
        .sort((a, b) => Number(a.trade_date) - Number(b.trade_date))
        .at(-1),
    [selectedSeries?.rows]
  );

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">行业趋势分析师（Sector Trend Analyst）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          结合行业趋势判断与板块日线数据，展示主线、修复机会、风险板块及每个板块的 K 线与成交量变化。
        </p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="sector-trend-date" className="text-sm font-medium text-slate-700">
            选择日期
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="sector-trend-date" variant="outline" className="w-[180px] justify-start text-left">
                {selectedDate || "请选择"}
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
      {!loadingDetail && !trendOutput ? (
        <Card className="rounded-none py-0">
          <CardContent className="px-4 py-4 text-sm text-slate-500">暂无可展示的数据。</CardContent>
        </Card>
      ) : null}
      {loadingDetail ? (
        <Card className="rounded-none py-0">
          <CardContent className="px-4 py-4 text-sm text-slate-500">数据加载中...</CardContent>
        </Card>
      ) : null}
      {trendOutput ? (
        <>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="市场状态" value={trendOutput.market_regime} />
        <MetricCard title="当前板块" value={selectedSeries?.name ?? "-"} />
        <MetricCard
          title="最近涨跌幅"
          value={latest ? `${latest.pct_change.toFixed(2)}%` : "-"}
          tone={latest ? (latest.pct_change >= 0 ? "up" : "down") : "neutral"}
        />
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">结论摘要</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 pt-3 pb-4 text-sm leading-6 text-slate-700">
          <p>{trendOutput.summary}</p>
          <p>{trendOutput.conclusion}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <TagListCard title="趋势主线" items={trendOutput.leading_themes} variant="secondary" />
        <TagListCard title="修复机会" items={trendOutput.reversal_opportunities} variant="outline" />
        <TagListCard title="风险板块" items={trendOutput.top_risk_sectors} variant="destructive" />
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">板块走势可视化</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pt-3 pb-4">
          <div className="flex items-center gap-3">
            <label htmlFor="sector-trend-select" className="text-sm font-medium text-slate-700">
              选择板块
            </label>
            <select
              id="sector-trend-select"
              value={selectedCode}
              onChange={(event) => setSelectedCode(event.target.value)}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              {sectorSeriesList.map((item) => (
                <option key={item.ts_code} value={item.ts_code}>
                  {item.name}（{item.ts_code}）
                </option>
              ))}
            </select>
          </div>
          {loadingSeries ? <p className="text-sm text-slate-500">板块行情加载中...</p> : null}
          <div className="border border-slate-200 p-2">
            <p className="mb-2 text-xs text-slate-500">K线与成交量（按时间升序）</p>
            <KLineVolumeChart data={klineData} height={380} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">重点观察</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-3 pb-4">
          <ul className="space-y-1 text-sm leading-6 text-slate-700">
            {trendOutput.highlights.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
        </>
      ) : null}
    </section>
  );
}

function toUtcTimestamp(dateText: string): UTCTimestamp | null {
  const normalized = dateText.replace(/-/g, "");
  if (!/^\d{8}$/.test(normalized)) return null;

  const year = Number(normalized.slice(0, 4));
  const month = Number(normalized.slice(4, 6)) - 1;
  const day = Number(normalized.slice(6, 8));
  const timeMs = Date.UTC(year, month, day);
  if (!Number.isFinite(timeMs)) return null;

  return (timeMs / 1000) as UTCTimestamp;
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

function MetricCard({
  title,
  value,
  tone = "neutral",
}: {
  title: string;
  value: string;
  tone?: "neutral" | "up" | "down";
}) {
  const textColor = tone === "up" ? "text-emerald-600" : tone === "down" ? "text-rose-600" : "text-slate-700";
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
