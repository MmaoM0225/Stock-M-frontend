import { useEffect, useMemo, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import {
  getStockManagerByCodeAndDate,
  getStockManagerDatesByCode,
  getStockManagerTsCodes,
  type StockManagerData,
} from "~/lib/stock";

export default function StockManagerPage() {
  const [stockOptions, setStockOptions] = useState<string[]>([]);
  const [dateOptions, setDateOptions] = useState<string[]>([]);
  const [selectedStock, setSelectedStock] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [summary, setSummary] = useState<StockManagerData | null>(null);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");
  const availableDateSet = useMemo(() => new Set(dateOptions), [dateOptions]);
  const selectedCalendarDate = useMemo(
    () => (selectedDate ? compactDateStringToDate(selectedDate) : undefined),
    [selectedDate]
  );

  useEffect(() => {
    let disposed = false;
    const loadStocks = async () => {
      setLoadingStocks(true);
      setError("");
      try {
        const response = await getStockManagerTsCodes();
        if (disposed) return;
        const codes = response.data?.ts_codes ?? [];
        setStockOptions(codes);
        setSelectedStock(codes[0] ?? "");
      } catch (err) {
        if (disposed) return;
        setError(err instanceof Error ? err.message : "获取股票列表失败");
      } finally {
        if (!disposed) setLoadingStocks(false);
      }
    };

    loadStocks();
    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedStock) {
      setDateOptions([]);
      setSelectedDate("");
      return;
    }

    let disposed = false;
    const loadDates = async () => {
      setLoadingDates(true);
      setError("");
      try {
        const response = await getStockManagerDatesByCode(selectedStock);
        if (disposed) return;
        const dates = response.data?.dates ?? [];
        setDateOptions(dates);
        setSelectedDate((prev) => (dates.includes(prev) ? prev : dates[0] ?? ""));
      } catch (err) {
        if (disposed) return;
        setDateOptions([]);
        setSelectedDate("");
        setError(err instanceof Error ? err.message : "获取日期列表失败");
      } finally {
        if (!disposed) setLoadingDates(false);
      }
    };

    loadDates();
    return () => {
      disposed = true;
    };
  }, [selectedStock]);

  useEffect(() => {
    if (!selectedStock || !selectedDate) {
      setSummary(null);
      return;
    }

    let disposed = false;
    const loadDetail = async () => {
      setLoadingDetail(true);
      setError("");
      try {
        const response = await getStockManagerByCodeAndDate(selectedStock, selectedDate);
        if (disposed) return;
        setSummary(response.data ?? null);
      } catch (err) {
        if (disposed) return;
        setSummary(null);
        setError(err instanceof Error ? err.message : "获取个股综合结果失败");
      } finally {
        if (!disposed) setLoadingDetail(false);
      }
    };

    loadDetail();
    return () => {
      disposed = true;
    };
  }, [selectedDate, selectedStock]);

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">个股综合经理（stock_manager）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">聚合基本面与技术面评分，输出交易信号、关键观点与风险提示。</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs text-slate-500">选择股票</span>
            <select
              value={selectedStock}
              onChange={(event) => setSelectedStock(event.target.value)}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              {stockOptions.map((stock) => (
                <option key={stock} value={stock}>
                  {stock}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs text-slate-500">选择日期</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 w-full justify-start text-left font-normal">
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
          </label>
        </div>
        {loadingStocks ? <p className="mt-3 text-sm text-slate-500">股票列表加载中...</p> : null}
        {loadingDates ? <p className="mt-1 text-sm text-slate-500">日期列表加载中...</p> : null}
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {!loadingDetail && !summary ? (
        <Card className="rounded-none py-0">
          <CardContent className="px-4 py-4 text-sm text-slate-500">暂无可展示的数据。</CardContent>
        </Card>
      ) : null}
      {loadingDetail ? (
        <Card className="rounded-none py-0">
          <CardContent className="px-4 py-4 text-sm text-slate-500">数据加载中...</CardContent>
        </Card>
      ) : null}

      {summary ? (
        <>
      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="综合评分" value={String(summary.overall_score)} />
        <Metric title="置信度" value={summary.confidence} />
        <Metric title="动作信号" value={summary.action_signal} valueClassName="text-amber-600" />
        <Metric title="风险等级" value={summary.risk_level} valueClassName="text-rose-600" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">组件评分</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pt-3 pb-4 text-sm text-slate-700">
            <ScoreBar label="基本面" value={summary.component_scores.fundamental} colorClassName="bg-blue-500" />
            <ScoreBar label="技术面" value={summary.component_scores.technical} colorClassName="bg-violet-500" />
            <p>动作信号原因：{summary.selection_reason}</p>
            <p>信号解释：{summary.signal_reason}</p>
          </CardContent>
        </Card>

        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">关键标签</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pt-3 pb-4 text-sm text-slate-700">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">ts_code: {summary.ts_code}</Badge>
              <Badge variant="outline">success: {String(summary.success)}</Badge>
              <Badge variant="outline">action: {summary.action_signal}</Badge>
              <Badge variant="outline">risk: {summary.risk_level}</Badge>
            </div>
            <p>{summary.summary}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">关键结论</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-3 pb-4 text-sm text-slate-700">
            <ul className="space-y-1">
              {summary.key_points.map((item, index) => (
                <li key={`${index}-${item}`}>- {item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">主要风险</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-3 pb-4 text-sm text-slate-700">
            <ul className="space-y-1">
              {summary.risks.map((item, index) => (
                <li key={`${index}-${item}`}>- {item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
        </>
      ) : null}
    </section>
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

function ScoreBar({ label, value, colorClassName }: { label: string; value: number; colorClassName: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className="font-medium">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 w-full bg-slate-100">
        <div className={`h-2 ${colorClassName}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
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
