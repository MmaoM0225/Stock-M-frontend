import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getPortfolioDecisionVersions,
  getPortfolioHistoryByVersion,
  getPortfolioSnapshotByVersionAndTradeDate,
  getPortfolioSnapshotDatesByVersion,
  type PortfolioHistoryPoint,
  type PortfolioSnapshotData,
  type PortfolioSnapshotPosition,
} from "~/lib/stock";

type OrderedPosition = PortfolioSnapshotPosition & {
  rank: number;
  positionSize: number;
  displayName: string;
};

const chartColors = ["#0f766e", "#0369a1", "#16a34a", "#9333ea", "#f59e0b", "#ef4444", "#334155"];

export default function PortfolioPage() {
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [selectedVersion, setSelectedVersion] = useState("");
  const [availablePositionDates, setAvailablePositionDates] = useState<string[]>([]);
  const [selectedPositionDate, setSelectedPositionDate] = useState("");
  const [snapshot, setSnapshot] = useState<PortfolioSnapshotData | null>(null);
  const [historyReturns, setHistoryReturns] = useState<PortfolioHistoryPoint[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState("");
  const availableDateSet = useMemo(() => new Set(availablePositionDates), [availablePositionDates]);
  const selectedCalendarDate = useMemo(
    () => (selectedPositionDate ? compactDateStringToDate(selectedPositionDate) : undefined),
    [selectedPositionDate]
  );

  useEffect(() => {
    let disposed = false;
    const loadVersions = async () => {
      setLoadingVersions(true);
      setError("");
      try {
        const response = await getPortfolioDecisionVersions();
        if (disposed) return;
        const versions = response.data?.versions ?? [];
        setAvailableVersions(versions);
        setSelectedVersion(versions[0] ?? "");
      } catch (err) {
        if (disposed) return;
        setError(err instanceof Error ? err.message : "获取版本列表失败");
      } finally {
        if (!disposed) setLoadingVersions(false);
      }
    };
    loadVersions();
    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedVersion) {
      setAvailablePositionDates([]);
      setSelectedPositionDate("");
      return;
    }
    let disposed = false;
    const loadDates = async () => {
      setLoadingDates(true);
      setError("");
      try {
        const response = await getPortfolioSnapshotDatesByVersion(selectedVersion);
        if (disposed) return;
        const dates = (response.data?.dates ?? []).map(normalizeCompactDateString);
        setAvailablePositionDates(dates);
        setSelectedPositionDate((prev) => (dates.includes(prev) ? prev : dates[0] ?? ""));
      } catch (err) {
        if (disposed) return;
        setAvailablePositionDates([]);
        setSelectedPositionDate("");
        setError(err instanceof Error ? err.message : "获取持仓日期失败");
      } finally {
        if (!disposed) setLoadingDates(false);
      }
    };
    loadDates();
    return () => {
      disposed = true;
    };
  }, [selectedVersion]);

  useEffect(() => {
    if (!selectedVersion || !selectedPositionDate) {
      setSnapshot(null);
      return;
    }
    let disposed = false;
    const loadSnapshot = async () => {
      setLoadingSnapshot(true);
      setError("");
      try {
        const response = await getPortfolioSnapshotByVersionAndTradeDate(selectedVersion, selectedPositionDate);
        if (disposed) return;
        setSnapshot(response.data ?? null);
      } catch (err) {
        if (disposed) return;
        setSnapshot(null);
        setError(err instanceof Error ? err.message : "获取组合快照失败");
      } finally {
        if (!disposed) setLoadingSnapshot(false);
      }
    };
    loadSnapshot();
    return () => {
      disposed = true;
    };
  }, [selectedVersion, selectedPositionDate]);

  useEffect(() => {
    if (!selectedVersion) {
      setHistoryReturns([]);
      return;
    }
    let disposed = false;
    const loadHistory = async () => {
      setLoadingHistory(true);
      setError("");
      try {
        const response = await getPortfolioHistoryByVersion(selectedVersion);
        if (disposed) return;
        setHistoryReturns(response.data?.series ?? []);
      } catch (err) {
        if (disposed) return;
        setHistoryReturns([]);
        setError(err instanceof Error ? err.message : "获取历史收益失败");
      } finally {
        if (!disposed) setLoadingHistory(false);
      }
    };
    loadHistory();
    return () => {
      disposed = true;
    };
  }, [selectedVersion]);

  const activePositions = snapshot?.positions ?? [];
  const metrics = snapshot?.metrics;
  const sortedPositions = useMemo(
    () =>
      [...activePositions]
        .sort((a, b) => b.weight - a.weight)
        .map((item, index) => ({
          ...item,
          rank: index + 1,
          positionSize: item.shares * item.latest_price,
          displayName: `${index + 1}. ${item.name}`,
        })),
    [activePositions]
  );
  const totalReturnSeries = useMemo(
    () =>
      historyReturns.map((row) => ({
        date: row.date,
        netValue: row.net_value,
        dailyReturnPct: row.daily_return_pct,
        drawdownPct: row.drawdown_pct,
        totalReturnPct: (row.net_value - 1) * 100,
      })),
    [historyReturns]
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-10 pt-0">
      <section className="space-y-6 border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">收益与持仓</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              展示组合当前全部持仓与核心绩效指标，包括历史收益、夏普比率、最大回撤及阶段收益表现。先选版本，再选持仓日期。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="portfolio-version" className="text-sm font-medium text-slate-700">
              版本
            </label>
            <select
              id="portfolio-version"
              value={selectedVersion}
              onChange={(event) => setSelectedVersion(event.target.value)}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              {availableVersions.map((version) => (
                <option key={version} value={version}>
                  {version}
                </option>
              ))}
            </select>
            <label htmlFor="position-date" className="text-sm font-medium text-slate-700">
              持仓日期
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button id="position-date" variant="outline" className="w-[180px] justify-start text-left font-normal">
                  {selectedPositionDate || "请选择"}
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
                      setSelectedPositionDate(normalizedDate);
                    }
                  }}
                  disabled={(date) => !availableDateSet.has(dateToCompactDateString(date))}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {loadingVersions ? <p className="text-sm text-slate-500">版本加载中...</p> : null}
        {loadingDates ? <p className="text-sm text-slate-500">持仓日期加载中...</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {!snapshot && !loadingSnapshot ? <p className="text-sm text-slate-500">暂无可展示的数据。</p> : null}
        {loadingSnapshot ? <p className="text-sm text-slate-500">快照加载中...</p> : null}
        {loadingHistory ? <p className="text-sm text-slate-500">历史收益加载中...</p> : null}

        <div className="grid gap-4 md:grid-cols-5">
          <Metric title="历史收益(年化)" value={`${(metrics?.annualized_return_pct ?? 0).toFixed(2)}%`} valueClassName="text-emerald-600" />
          <Metric title="夏普比率" value={(metrics?.sharpe_ratio ?? 0).toFixed(2)} />
          <Metric title="最大回撤" value={`${(metrics?.max_drawdown_pct ?? 0).toFixed(2)}%`} valueClassName="text-rose-600" />
          <Metric title="近一周收益" value={`${(metrics?.one_week_return_pct ?? 0).toFixed(2)}%`} valueClassName="text-emerald-600" />
          <Metric title="近一月收益" value={`${(metrics?.one_month_return_pct ?? 0).toFixed(2)}%`} valueClassName="text-emerald-600" />
        </div>

        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">总收益率</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px] px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={totalReturnSeries} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, "总收益率"]} />
                <Line type="monotone" dataKey="totalReturnPct" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-none py-0">
            <CardHeader className="px-4 pt-4 pb-0">
              <CardTitle className="text-base text-slate-900">持仓占比柱状图</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px] px-2 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedPositions} layout="vertical" margin={{ top: 8, right: 12, left: 30, bottom: 10 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `${value}%`} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis type="category" dataKey="displayName" width={110} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                  <Bar dataKey="weight" radius={[0, 2, 2, 0]}>
                    {sortedPositions.map((item, index) => (
                      <Cell key={item.ts_code} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">全部持仓</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pt-3 pb-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">排名</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">代码</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">名称</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">行业</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">持仓占比</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">持仓股数</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">成本价</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">最新价</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">浮动收益</th>
                </tr>
              </thead>
              <tbody>
                {sortedPositions.map((item) => {
                  const costPrice = toNullableNumber(item.cost_price);
                  const latestPrice = toNullableNumber(item.latest_price);
                  const pnlPct = costPrice && latestPrice ? ((latestPrice - costPrice) / costPrice) * 100 : null;
                  return (
                    <tr key={item.ts_code} className="hover:bg-slate-50/70">
                      <td className="border-b border-slate-100 px-3 py-2">{item.rank}</td>
                      <td className="border-b border-slate-100 px-3 py-2">{item.ts_code}</td>
                      <td className="border-b border-slate-100 px-3 py-2">{item.name}</td>
                      <td className="border-b border-slate-100 px-3 py-2">{item.industry}</td>
                      <td className="border-b border-slate-100 px-3 py-2 text-right">{formatPercent(item.weight)}</td>
                      <td className="border-b border-slate-100 px-3 py-2 text-right">
                        {typeof item.shares === "number" ? item.shares.toLocaleString() : "-"}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2 text-right">{formatNumber(item.cost_price)}</td>
                      <td className="border-b border-slate-100 px-3 py-2 text-right">{formatNumber(item.latest_price)}</td>
                      <td
                        className={`border-b border-slate-100 px-3 py-2 text-right font-medium ${
                          pnlPct === null ? "text-slate-400" : pnlPct >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {pnlPct === null ? "-" : `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
        </Card>

        <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">历史收益</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pt-3 pb-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">日期</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">净值</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">单日收益</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">回撤</th>
                </tr>
              </thead>
              <tbody>
                {historyReturns.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-50/70">
                    <td className="border-b border-slate-100 px-3 py-2">{row.date}</td>
                    <td className="border-b border-slate-100 px-3 py-2 text-right">{formatNumber(row.net_value, 3)}</td>
                    <td
                      className={`border-b border-slate-100 px-3 py-2 text-right font-medium ${
                        toNullableNumber(row.daily_return_pct) === null
                          ? "text-slate-400"
                          : (row.daily_return_pct ?? 0) >= 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                      }`}
                    >
                      {formatSignedPercent(row.daily_return_pct)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-right text-rose-600">{formatPercent(row.drawdown_pct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        </Card>
      </section>
    </main>
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

function toNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatNumber(value: unknown, digits = 2) {
  const numericValue = toNullableNumber(value);
  return numericValue === null ? "-" : numericValue.toFixed(digits);
}

function formatPercent(value: unknown, digits = 2) {
  const numericValue = toNullableNumber(value);
  return numericValue === null ? "-" : `${numericValue.toFixed(digits)}%`;
}

function formatSignedPercent(value: unknown, digits = 2) {
  const numericValue = toNullableNumber(value);
  if (numericValue === null) return "-";
  return `${numericValue >= 0 ? "+" : ""}${numericValue.toFixed(digits)}%`;
}

function compactDateStringToDate(value: string) {
  const normalizedValue = normalizeCompactDateString(value);
  const year = Number(normalizedValue.slice(0, 4));
  const month = Number(normalizedValue.slice(4, 6));
  const day = Number(normalizedValue.slice(6, 8));
  return new Date(year, month - 1, day, 12, 0, 0);
}

function dateToCompactDateString(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}${month}${day}`;
}

function normalizeCompactDateString(value: string) {
  return value.replaceAll("-", "");
}
