import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Badge } from "~/components/ui/badge";
import {
  getSectorManagerByTradeDate,
  getSectorManagerDates,
  type SectorManagerData,
} from "~/lib/sector";

export default function DataSectorPage() {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentOutput, setCurrentOutput] = useState<SectorManagerData | null>(null);
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
        const response = await getSectorManagerDates();
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
      setCurrentOutput(null);
      return;
    }

    let disposed = false;
    const loadDetail = async () => {
      setLoadingDetail(true);
      setError("");
      try {
        const response = await getSectorManagerByTradeDate(selectedDate);
        if (disposed) return;
        setCurrentOutput(response.data ?? null);
      } catch (err) {
        if (disposed) return;
        setCurrentOutput(null);
        setError(err instanceof Error ? err.message : "获取行业经理数据失败");
      } finally {
        if (!disposed) setLoadingDetail(false);
      }
    };

    loadDetail();
    return () => {
      disposed = true;
    };
  }, [selectedDate]);

  const marketBiasTone = useMemo(() => {
    const bias = currentOutput?.market_bias?.toLowerCase() ?? "";
    if (bias.includes("bear")) return "down" as const;
    return "neutral" as const;
  }, [currentOutput?.market_bias]);

  const favored = currentOutput?.favored_sectors ?? [];
  const watchlist = currentOutput?.watchlist_sectors ?? [];
  const risk = currentOutput?.risk_sectors ?? [];
  const coreSignals = currentOutput?.core_signals ?? [];

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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="sector-manager-date"
                variant="outline"
                className="w-[180px] justify-start text-left"
              >
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
      {!loadingDetail && !currentOutput ? (
        <Card className="rounded-none py-0">
          <CardContent className="px-4 py-4 text-sm text-slate-500">暂无可展示的数据。</CardContent>
        </Card>
      ) : null}
      {loadingDetail ? (
        <Card className="rounded-none py-0">
          <CardContent className="px-4 py-4 text-sm text-slate-500">数据加载中...</CardContent>
        </Card>
      ) : null}
      {currentOutput ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard title="市场状态" value={currentOutput.market_regime} />
            <MetricCard title="市场偏向" value={currentOutput.market_bias} tone={marketBiasTone} />
            <MetricCard title="执行偏向" value={currentOutput.action_bias} />
            <MetricCard title="置信度" value={String(currentOutput.confidence)} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <TagListCard title="优选板块（Favored）" items={favored} variant="secondary" />
            <TagListCard title="观察板块（Watchlist）" items={watchlist} variant="outline" />
            <TagListCard title="风险板块（Risk）" items={risk} variant="destructive" />
          </div>

          <Card className="rounded-none py-0">
            <CardHeader className="px-4 pt-4 pb-0">
              <CardTitle className="text-base text-slate-900">核心信号</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pt-3 pb-4 text-sm leading-6 text-slate-700">
              {coreSignals.length ? (
                <ul className="space-y-1">
                  {coreSignals.map((item, index) => (
                    <li key={`${index}-${item}`}>- {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500">暂无</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-none py-0">
            <CardHeader className="px-4 pt-4 pb-0">
              <CardTitle className="text-base text-slate-900">行业经理总结</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pt-3 pb-4 text-sm leading-6 text-slate-700">
              <p>{currentOutput.sector_summary}</p>
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
        {items.length ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <Badge key={`${index}-${item}`} variant={variant}>
                {item}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">暂无</p>
        )}
      </CardContent>
    </Card>
  );
}
