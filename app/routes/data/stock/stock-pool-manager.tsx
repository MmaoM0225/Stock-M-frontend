import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import {
  getStockPoolByTradeDate,
  getStockPoolDates,
  type StockPoolCandidate,
  type StockPoolData,
} from "~/lib/stock";

export default function DataStockPoolPage() {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentData, setCurrentData] = useState<StockPoolData | null>(null);
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
        const response = await getStockPoolDates();
        if (disposed) return;
        const dates = response.data?.dates ?? [];
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
        const response = await getStockPoolByTradeDate(selectedDate);
        if (disposed) return;
        setCurrentData(response.data ?? null);
      } catch (err) {
        if (disposed) return;
        setCurrentData(null);
        setError(err instanceof Error ? err.message : "获取股票池结果失败");
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
        <h1 className="text-2xl font-bold text-slate-900">股票池经理（stock_pool_manager）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">对接接口：GET /api/v1/data/stock-pool/{`{trade_date}`}，展示股票池分析汇总、候选股与单票经理结论。</p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="stock-pool-manager-date" className="text-sm font-medium text-slate-700">
            选择日期
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="stock-pool-manager-date" variant="outline" className="w-[180px] justify-start text-left font-normal">
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
          <div className="grid gap-4 md:grid-cols-5">
            <Metric title="池子数量" value={String(currentData.pool_size)} />
            <Metric title="分析数量" value={String(currentData.analyzed_count)} />
            <Metric title="成功数量" value={String(currentData.analyze_success_count)} valueClassName="text-emerald-600" />
            <Metric title="失败数量" value={String(currentData.analyze_error_count)} valueClassName="text-rose-600" />
            <Metric title="交易日" value={currentData.trade_date} />
          </div>

          <Card className="rounded-none py-0">
            <CardHeader className="px-4 pt-4 pb-0">
              <CardTitle className="text-base text-slate-900">汇总说明</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-3 pb-4 text-sm text-slate-700">{currentData.summary_text}</CardContent>
          </Card>

          <StockListCard title="候选股票列表" rows={currentData.candidate_stocks} />
          <StockListCard title="重点关注列表（Top）" rows={currentData.top_stocks} />
        </>
      ) : null}
    </section>
  );
}

function StockListCard({ title, rows }: { title: string; rows: StockPoolCandidate[] }) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-base text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pt-3 pb-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">ts_code</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">名称</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">行业</th>
                <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">评分</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">信号</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">风险</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${title}-${row.ts_code}`} className="hover:bg-slate-50/70">
                  <td className="border-b border-slate-100 px-3 py-2">{row.ts_code}</td>
                  <td className="border-b border-slate-100 px-3 py-2">{row.name}</td>
                  <td className="border-b border-slate-100 px-3 py-2">{row.industry}</td>
                  <td className="border-b border-slate-100 px-3 py-2 text-right font-medium">{row.overall_score.toFixed(1)}</td>
                  <td className="border-b border-slate-100 px-3 py-2">{row.action_signal}</td>
                  <td className="border-b border-slate-100 px-3 py-2">{row.risk_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  title,
  value,
  valueClassName = "text-slate-700",
}: {
  title: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-sm text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className={`px-4 pt-2 pb-4 text-sm font-medium ${valueClassName}`}>{value}</CardContent>
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
