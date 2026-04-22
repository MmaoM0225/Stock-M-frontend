import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { getNewsAnalystByTradeDate, getNewsAnalystDates, type NewsAnalystData } from "~/lib/macro";

export default function NewsAnalystPage() {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentData, setCurrentData] = useState<NewsAnalystData | null>(null);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");
  const availableDateSet = useMemo(() => new Set(availableDates), [availableDates]);
  const selectedCalendarDate = useMemo(
    () => (selectedDate ? compactDateStringToDate(selectedDate) : undefined),
    [selectedDate]
  );
  const sectorEntries = useMemo(
    () => Object.entries(currentData?.sector_impacts ?? {}),
    [currentData?.sector_impacts]
  );

  useEffect(() => {
    let disposed = false;

    const loadDates = async () => {
      setLoadingDates(true);
      setError("");
      try {
        const response = await getNewsAnalystDates();
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
        const response = await getNewsAnalystByTradeDate(selectedDate);
        if (disposed) return;
        setCurrentData(response.data ?? null);
      } catch (err) {
        if (disposed) return;
        setCurrentData(null);
        setError(err instanceof Error ? err.message : "获取新闻分析数据失败");
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
        <h1 className="text-2xl font-bold text-slate-900">宏观新闻分析师（News Analyst）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          对高影响新闻做结构化归档，并输出行业冲击与宏观环境快照。
        </p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="news-date" className="text-sm font-medium text-slate-700">
            选择日期
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="news-date" variant="outline" className="w-[180px] justify-start text-left">
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
        <SignalCard title="流动性" value={currentData.macro_environment.liquidity} />
        <SignalCard title="政策倾向" value={currentData.macro_environment.policy_bias} />
        <SignalCard title="全球风险" value={currentData.macro_environment.global_risk} />
        <SignalCard title="市场情绪" value={currentData.macro_environment.market_sentiment} />
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">新闻事件（{currentData.events.length}）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pt-3 pb-4">
          {currentData.events.map((event, index) => (
            <div key={`${event.source}-${index}`} className="border border-slate-200 p-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{event.source}</span>
                <span>·</span>
                <span>{event.type}</span>
                <span>·</span>
                <span>impact {event.impact_level}</span>
                <span>·</span>
                <span>{event.sentiment}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{event.summary}</p>
              <p className="mt-2 text-xs text-slate-500">行业：{event.industry.join(" / ")}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">行业影响</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pt-3 pb-4">
          {sectorEntries.map(([sector, impact]) => (
            <div key={sector} className="border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">{sector}</p>
                <p className="text-xs text-slate-500">
                  {impact.sentiment} · confidence {impact.confidence}
                </p>
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                {impact.reason.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
        </>
      ) : null}
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
