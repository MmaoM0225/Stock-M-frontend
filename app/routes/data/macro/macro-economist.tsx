import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import type { MetricChartProps } from "~/types/data/macro";
import { getMacroEconomistByTradeDate, getMacroEconomistDates, type MacroEconomistData } from "~/lib/macro";

export default function MacroEconomistPage() {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentData, setCurrentData] = useState<MacroEconomistData | null>(null);
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
        const response = await getMacroEconomistDates();
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
        const response = await getMacroEconomistByTradeDate(selectedDate);
        if (disposed) return;
        setCurrentData(response.data ?? null);
      } catch (err) {
        if (disposed) return;
        setCurrentData(null);
        setError(err instanceof Error ? err.message : "获取宏观经济分析数据失败");
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
        <h1 className="text-2xl font-bold text-slate-900">
          宏观经济分析师（Macro Economist）
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          基于 LPR、CPI、社融、PMI、M2 与 GDP 的宏观监测结果，输出增长、通胀与流动性信号。
        </p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="macro-date" className="text-sm font-medium text-slate-700">
            选择日期
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="macro-date" variant="outline" className="w-[180px] justify-start text-left">
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-sm text-slate-900">增长信号</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-2 pb-4 text-sm text-emerald-700">
            {currentData.llm_output.growth_signal}
          </CardContent>
        </Card>
        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-sm text-slate-900">通胀信号</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-2 pb-4 text-sm text-blue-700">
            {currentData.llm_output.inflation_signal}
          </CardContent>
        </Card>
        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-sm text-slate-900">流动性信号</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-2 pb-4 text-sm text-violet-700">
            {currentData.llm_output.liquidity_signal}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MetricLineCard title="LPR（%）" data={currentData.lpr_data} dataKey="value" stroke="#0284c7" />
        <MetricLineCard title="CPI（%）" data={currentData.cpi_data} dataKey="value" stroke="#2563eb" />
        <MetricBarCard title="社融（万亿）" data={currentData.sf_data} dataKey="value" fill="#0d9488" />
        <MetricLineCard title="PMI" data={currentData.pmi_data} dataKey="value" stroke="#7c3aed" />
        <MetricLineCard title="M2（%）" data={currentData.m2_data} dataKey="value" stroke="#ca8a04" />
        <MetricBarCard
          title="GDP（季度同比，%）"
          data={currentData.gdp_data}
          dataKey="value"
          xKey="quarter"
          fill="#059669"
        />
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">LLM 综合结论</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pt-3 pb-4 text-sm text-slate-700">
          <p>数据日期：{selectedDate}</p>
          <p>宏观状态：{currentData.llm_output.macro_regime}</p>
          <p>权益偏好：{currentData.llm_output.equity_market_bias}</p>
          <p>债券偏好：{currentData.llm_output.bond_market_bias}</p>
          <p>商品偏好：{currentData.llm_output.commodity_bias}</p>
          <p>流动性摘要：{currentData.llm_output.liquidity_summary}</p>
          <p className="font-medium text-slate-900">结论：{currentData.llm_output.conclusion}</p>
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

function MetricLineCard({ title, data, dataKey, stroke = "#2563eb", xKey = "month" }: MetricChartProps) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-sm text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-56 px-3 pt-3 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis dataKey={xKey} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function MetricBarCard({ title, data, dataKey, fill = "#0ea5e9", xKey = "month" }: MetricChartProps) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-sm text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-56 px-3 pt-3 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis dataKey={xKey} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey={dataKey} fill={fill} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
