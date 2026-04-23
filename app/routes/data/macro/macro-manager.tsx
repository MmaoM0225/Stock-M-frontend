import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { getMacroManagerByTradeDate, getMacroManagerDates, type MacroManagerData } from "~/lib/macro";

export default function DataMacroPage() {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentOutput, setCurrentOutput] = useState<MacroManagerData | null>(null);
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
        const response = await getMacroManagerDates();
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
        const response = await getMacroManagerByTradeDate(selectedDate);
        if (disposed) return;
        setCurrentOutput(response.data ?? null);
      } catch (err) {
        if (disposed) return;
        setCurrentOutput(null);
        setError(err instanceof Error ? err.message : "获取宏观经理数据失败");
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
        <h1 className="text-2xl font-bold text-slate-900">宏观经理（Macro Manager）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          展示 Macro Manager 的结构化输出（无图表版本），用于快速查看市场状态、仓位建议、重点方向与风险因子。
        </p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="macro-manager-date" className="text-sm font-medium text-slate-700">
            选择日期
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="macro-manager-date"
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
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard title="市场方向" value={currentOutput.market_direction} />
            <InfoCard title="目标仓位" value={currentOutput.target_position} />
            <InfoCard title="置信度" value={String(currentOutput.confidence)} />
          </div>

          <Card className="rounded-none py-0">
            <CardHeader className="px-4 pt-4 pb-0">
              <CardTitle className="text-base text-slate-900">市场状态</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-3 pb-4 text-sm leading-6 text-slate-700">{currentOutput.market_regime}</CardContent>
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
            <CardContent className="px-4 pt-3 pb-4 text-sm leading-6 text-slate-700">{currentOutput.macro_summary}</CardContent>
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

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-sm text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-2 pb-4 text-sm font-medium text-slate-700">{value}</CardContent>
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
