import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getSectorCapitalFlowByTradeDate, getSectorCapitalFlowDates, type SectorCapitalFlowData } from "~/lib/sector";

export default function SectorCapitalFlowAnalystPage() {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [sectorAgentOutput, setSectorAgentOutput] = useState<SectorCapitalFlowData | null>(null);
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
        const response = await getSectorCapitalFlowDates();
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
      setSectorAgentOutput(null);
      return;
    }
    let disposed = false;
    const loadDetail = async () => {
      setLoadingDetail(true);
      setError("");
      try {
        const response = await getSectorCapitalFlowByTradeDate(selectedDate);
        if (disposed) return;
        setSectorAgentOutput(response.data ?? null);
      } catch (err) {
        if (disposed) return;
        setSectorAgentOutput(null);
        setError(err instanceof Error ? err.message : "获取板块资金流分析数据失败");
      } finally {
        if (!disposed) setLoadingDetail(false);
      }
    };
    loadDetail();
    return () => {
      disposed = true;
    };
  }, [selectedDate]);

  const sortedFlow = useMemo(
    () =>
      [...(sectorAgentOutput?.one_day_sector_flow ?? [])]
        .map((item) => ({ name: item.name, netAmount: item.net_amount }))
        .sort((a, b) => b.netAmount - a.netAmount),
    [sectorAgentOutput?.one_day_sector_flow]
  );

  const oneDayRows = useMemo(
    () =>
      (sectorAgentOutput?.one_day_rows ?? []).map((row) => ({
        tradeDate: row.trade_date,
        tsCode: row.ts_code,
        name: row.name,
        leadStock: row.lead_stock,
        pctChange: row.pct_change,
        netAmount: row.net_amount,
      })),
    [sectorAgentOutput?.one_day_rows]
  );

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">板块资金流分析师（Sector Capital Flow Analyst）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          对接接口：GET /api/v1/data/sector/{`{trade_date}`}，当前页面展示最近一天的资金净额可视化与策略摘要。
        </p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="sector-capital-date" className="text-sm font-medium text-slate-700">
            选择日期
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="sector-capital-date" variant="outline" className="w-[180px] justify-start text-left">
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
      {!loadingDetail && !sectorAgentOutput ? (
        <Card className="rounded-none py-0">
          <CardContent className="px-4 py-4 text-sm text-slate-500">暂无可展示的数据。</CardContent>
        </Card>
      ) : null}
      {loadingDetail ? (
        <Card className="rounded-none py-0">
          <CardContent className="px-4 py-4 text-sm text-slate-500">数据加载中...</CardContent>
        </Card>
      ) : null}
      {sectorAgentOutput ? (
        <>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="市场偏向" value={sectorAgentOutput.market_bias} tone="bearish" />
        <MetricCard title="1日净额" value={`${sectorAgentOutput.one_day_net_amount ?? 0} 万元`} />
        <MetricCard title="5日净额" value={`${sectorAgentOutput.five_day_net_amount ?? 0} 万元`} />
        <MetricCard title="20日净额" value={`${sectorAgentOutput.twenty_day_net_amount ?? 0} 万元`} />
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">1日窗口资金净额分布（万元）</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-3 pb-4">
          <div className="h-[460px] border border-slate-200 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedFlow} layout="vertical" margin={{ top: 4, right: 16, left: 24, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                <ReferenceLine x={0} stroke="#94a3b8" />
                <Tooltip
                  formatter={(value: unknown) => {
                    const raw = Array.isArray(value) ? value[0] : value;
                    return [`${Number(raw ?? 0).toLocaleString()} 万元`, "净额"];
                  }}
                  contentStyle={{ borderRadius: 0, borderColor: "#cbd5e1" }}
                />
                <Bar dataKey="netAmount" radius={[0, 0, 0, 0]}>
                  {sortedFlow.map((item) => (
                    <Cell key={item.name} fill={item.netAmount >= 0 ? "#16a34a" : "#dc2626"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            红色表示净流出，绿色表示净流入。可见融资融券、深股通、沪股通等权重方向拖累明显，而 CPO、光纤、F5G、光刻机等科技方向承接增量资金。
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <TagListCard title="热点板块（可跟踪）" items={sectorAgentOutput.hot_sectors} variant="secondary" />
        <TagListCard title="风险板块（建议规避）" items={sectorAgentOutput.risk_sectors} variant="destructive" />
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">最近一天样本数据（节选）</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-3 pb-4">
          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">trade_date</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">ts_code</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">板块</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">龙头</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">涨跌幅(%)</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">净额(万元)</th>
                </tr>
              </thead>
              <tbody>
                {oneDayRows.map((row) => (
                  <tr key={`${row.tsCode}-${row.name}`} className="text-slate-700">
                    <td className="border-b border-slate-100 px-3 py-2">{row.tradeDate}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{row.tsCode}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{row.name}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{row.leadStock}</td>
                    <td
                      className={`border-b border-slate-100 px-3 py-2 text-right ${row.pctChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {row.pctChange.toFixed(2)}
                    </td>
                    <td
                      className={`border-b border-slate-100 px-3 py-2 text-right font-medium ${row.netAmount >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {row.netAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">LLM 结论摘要</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pt-3 pb-4 text-sm leading-6 text-slate-700">
          <p>{sectorAgentOutput.summary}</p>
          <p>{sectorAgentOutput.conclusion}</p>
          <ul className="space-y-1">
            {sectorAgentOutput.highlights.map((item) => (
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

function MetricCard({
  title,
  value,
  tone = "neutral",
}: {
  title: string;
  value: string;
  tone?: "neutral" | "bearish";
}) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-sm text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className={`px-4 pt-2 pb-4 text-sm font-medium ${tone === "bearish" ? "text-rose-600" : "text-slate-700"}`}>
        {value}
      </CardContent>
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
  variant: "secondary" | "destructive";
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
