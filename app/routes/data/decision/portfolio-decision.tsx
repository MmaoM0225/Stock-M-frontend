import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import {
  getPortfolioDecisionByVersionAndTradeDate,
  getPortfolioDecisionDatesByVersion,
  getPortfolioDecisionVersions,
  type PortfolioDecisionAssetRow,
  type PortfolioDecisionData,
  type PortfolioDecisionOperationRow,
} from "~/lib/stock";

export default function DataPortfolioPage() {
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [selectedVersion, setSelectedVersion] = useState("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [activeData, setActiveData] = useState<PortfolioDecisionData | null>(null);
  const [loadingVersions, setLoadingVersions] = useState(false);
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
        setError(err instanceof Error ? err.message : "获取可选版本失败");
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
      setAvailableDates([]);
      setSelectedDate("");
      return;
    }

    let disposed = false;
    const loadDates = async () => {
      setLoadingDates(true);
      setError("");
      try {
        const response = await getPortfolioDecisionDatesByVersion(selectedVersion);
        if (disposed) return;
        const dates = response.data?.dates ?? [];
        setAvailableDates(dates);
        setSelectedDate((prev) => (dates.includes(prev) ? prev : dates[0] ?? ""));
      } catch (err) {
        if (disposed) return;
        setAvailableDates([]);
        setSelectedDate("");
        setError(err instanceof Error ? err.message : "获取可选日期失败");
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
    if (!selectedVersion || !selectedDate) {
      setActiveData(null);
      return;
    }

    let disposed = false;
    const loadDetail = async () => {
      setLoadingDetail(true);
      setError("");
      try {
        const response = await getPortfolioDecisionByVersionAndTradeDate(selectedVersion, selectedDate);
        if (disposed) return;
        setActiveData(response.data ?? null);
      } catch (err) {
        if (disposed) return;
        setActiveData(null);
        setError(err instanceof Error ? err.message : "获取组合决策结果失败");
      } finally {
        if (!disposed) setLoadingDetail(false);
      }
    };

    loadDetail();
    return () => {
      disposed = true;
    };
  }, [selectedDate, selectedVersion]);

  const holdingStockCount = useMemo(
    () => (activeData?.portfolio_table ?? []).filter((row) => row.asset_type === "个股").length,
    [activeData?.portfolio_table]
  );
  const operationCount = (activeData?.operation_reason_table ?? []).length;

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">组合决策引擎（portfolio_decision）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          对接接口：先获取版本与日期，再拉组合决策详情，展示组合资产、调仓动作与决策摘要。
        </p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="portfolio-version" className="text-sm font-medium text-slate-700">
            选择版本
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
          <label htmlFor="portfolio-date" className="text-sm font-medium text-slate-700">
            选择日期
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="portfolio-date" variant="outline" className="w-[180px] justify-start text-left font-normal">
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
        {loadingVersions ? <p className="mt-3 text-sm text-slate-500">版本加载中...</p> : null}
        {loadingDates ? <p className="mt-3 text-sm text-slate-500">日期加载中...</p> : null}
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {!loadingDetail && !activeData ? (
        <Card className="rounded-none py-0">
          <CardContent className="px-4 py-4 text-sm text-slate-500">暂无可展示的数据。</CardContent>
        </Card>
      ) : null}
      {loadingDetail ? (
        <Card className="rounded-none py-0">
          <CardContent className="px-4 py-4 text-sm text-slate-500">数据加载中...</CardContent>
        </Card>
      ) : null}

      {activeData ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Metric title="上期资金(元)" value={activeData.meta.initial_capital.toLocaleString()} />
            <Metric title="当前总资产(元)" value={activeData.meta.total_capital.toLocaleString()} />
            <Metric title="持仓资产数" value={String(holdingStockCount)} />
            <Metric title="操作笔数" value={String(operationCount)} />
          </div>

          <Card className="rounded-none py-0">
            <CardHeader className="px-4 pt-4 pb-0">
              <CardTitle className="text-base text-slate-900">决策摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pt-3 pb-4 text-sm text-slate-700">
              <p>{activeData.decision_summary}</p>
              <p>策略：{activeData.strategy ?? "-"}</p>
              <p>来源：{activeData.meta.source_portfolio_path}</p>
              <p>生成时间：{activeData.meta.generated_at}</p>
            </CardContent>
          </Card>

          <PortfolioTableCard rows={activeData.portfolio_table} />
          <OperationReasonTableCard rows={activeData.operation_reason_table} />
        </>
      ) : null}
    </section>
  );
}

function PortfolioTableCard({ rows }: { rows: PortfolioDecisionAssetRow[] }) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-base text-slate-900">资产组合表</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pt-3 pb-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">排名</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">资产名称</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">ts_code</th>
                <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">市值(元)</th>
                <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">仓位</th>
                <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">仓位变化</th>
                <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">总收益</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.asset_name}-${row.rank}`} className="hover:bg-slate-50/70">
                  <td className="border-b border-slate-100 px-3 py-2">{row.rank}</td>
                  <td className="border-b border-slate-100 px-3 py-2">{row.asset_name}</td>
                  <td className="border-b border-slate-100 px-3 py-2">{row.ts_code ?? "-"}</td>
                  <td className="border-b border-slate-100 px-3 py-2 text-right">{row.market_value.toLocaleString()}</td>
                  <td className="border-b border-slate-100 px-3 py-2 text-right">{row.position}</td>
                  <td className="border-b border-slate-100 px-3 py-2 text-right">{row.position_change}</td>
                  <td className="border-b border-slate-100 px-3 py-2 text-right">{row.total_return}</td>
                  <td className="border-b border-slate-100 px-3 py-2">{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function OperationReasonTableCard({ rows }: { rows: PortfolioDecisionOperationRow[] }) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-base text-slate-900">操作原因表</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pt-3 pb-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">资产</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">操作</th>
                <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">仓位变化</th>
                <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">执行价</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">原因</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.ts_code ?? row.asset_name}-${row.action}-${index}`} className="hover:bg-slate-50/70">
                  <td className="border-b border-slate-100 px-3 py-2">{row.asset_name}</td>
                  <td className="border-b border-slate-100 px-3 py-2">{row.action}</td>
                  <td className="border-b border-slate-100 px-3 py-2 text-right">{row.position_change}</td>
                  <td className="border-b border-slate-100 px-3 py-2 text-right">{row.execution_price ?? "-"}</td>
                  <td className="border-b border-slate-100 px-3 py-2">{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card className="rounded-none py-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-sm text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-2 pb-4 text-sm font-medium text-slate-700">{value}</CardContent>
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
