import { useEffect, useMemo, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { getScreenerByTradeDate, getScreenerDates, type ScreenerData, type ScreenerFilteredStock } from "~/lib/stock";
import type { TemplateRule } from "~/types/data/stock";

const templateLibrary: Record<string, TemplateRule> = {
  value_defensive: { minMarketCap: 150e8, maxPe: 18, maxPb: 2.5, sortBy: "dv_ratio", sortOrder: "desc" },
  quality_growth: { minMarketCap: 80e8, maxPe: 45, maxPb: 8, sortBy: "pe", sortOrder: "asc" },
  cyclical_rebound: { minMarketCap: 60e8, maxPe: 30, maxPb: 3.5, sortBy: "pb", sortOrder: "asc" },
  theme_momentum: { minMarketCap: 40e8, maxPe: 100, maxPb: 15, sortBy: "volume_ratio", sortOrder: "desc" },
  fallback_balanced: { minMarketCap: 70e8, maxPe: 60, maxPb: 10, sortBy: "total_mv", sortOrder: "desc" },
};

export default function DataScreenerPage() {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentData, setCurrentData] = useState<ScreenerData | null>(null);
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
        const response = await getScreenerDates();
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
        const response = await getScreenerByTradeDate(selectedDate);
        if (disposed) return;
        setCurrentData(response.data ?? null);
      } catch (err) {
        if (disposed) return;
        setCurrentData(null);
        setError(err instanceof Error ? err.message : "获取筛选结果失败");
      } finally {
        if (!disposed) setLoadingDetail(false);
      }
    };

    loadDetail();
    return () => {
      disposed = true;
    };
  }, [selectedDate]);

  const appliedFilters = currentData?.applied_filters ?? [];
  const sectorDistribution = currentData?.sector_distribution ?? {};
  const sectorPickCounts = currentData?.sector_pick_counts ?? {};
  const sectorTemplateApplied = currentData?.sector_template_applied ?? {};
  const filteredStocks = currentData?.filtered_stocks ?? [];

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">股票筛选分析师（stock_screener）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          对接接口：<code className="text-xs">GET /api/v1/data/screener/dates</code>、
          <code className="text-xs">GET /api/v1/data/screener/{`{trade_date}`}</code>
          ，展示筛选结果、板块模板映射和入选股票列表。
        </p>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="screener-date" className="text-sm font-medium text-slate-700">
            选择日期
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="screener-date" variant="outline" className="w-[180px] justify-start text-left">
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
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard title="筛选数量" value={`${currentData.total_count} 只`} />
            <InfoCard title="筛选摘要" value={currentData.filter_summary} />
          </div>

          <Card className="rounded-none py-0">
            <CardHeader className="px-4 pt-4 pb-0">
              <CardTitle className="text-base text-slate-900">模板库（5套）</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-3 pb-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {Object.entries(templateLibrary).map(([templateId, rule]) => (
                  <div key={templateId} className="border border-slate-200 p-3 text-sm text-slate-700">
                    <p className="font-medium text-slate-900">{templateId}</p>
                    <p className="mt-1">min_market_cap: {formatYi(rule.minMarketCap)}</p>
                    <p>max_pe: {rule.maxPe}</p>
                    <p>max_pb: {rule.maxPb}</p>
                    <p>
                      sort: {rule.sortBy} {rule.sortOrder}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none py-0">
            <CardHeader className="px-4 pt-4 pb-0">
              <CardTitle className="text-base text-slate-900">已应用筛选条件</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-3 pb-4">
              {appliedFilters.length ? (
                <ul className="space-y-1 text-sm leading-6 text-slate-700">
                  {appliedFilters.map((item, index) => (
                    <li key={`${index}-${item}`}>- {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">暂无</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-none py-0">
            <CardHeader className="px-4 pt-4 pb-0">
              <CardTitle className="text-base text-slate-900">板块分布与入选数量</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-3 pb-4">
              {Object.keys(sectorDistribution).length ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(sectorDistribution).map(([sector, count]) => (
                    <Badge key={sector} variant="outline">
                      {sector}: {count}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">暂无</p>
              )}
              {Object.keys(sectorPickCounts).length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(sectorPickCounts).map(([sector, count]) => (
                    <Badge key={`pick-${sector}`} variant="secondary">
                      入选 {sector}: {count}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-none py-0">
            <CardHeader className="px-4 pt-4 pb-0">
              <CardTitle className="text-base text-slate-900">模板映射与参数（含 Override）</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-3 pb-4">
              {Object.keys(sectorTemplateApplied).length ? (
                <div className="overflow-x-auto border border-slate-200">
                  <table className="w-full min-w-[900px] border-collapse text-sm">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">板块</th>
                        <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">模板</th>
                        <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">min_market_cap</th>
                        <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">max_pe</th>
                        <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">max_pb</th>
                        <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">sort</th>
                        <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">overrides</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(sectorTemplateApplied).map(([sector, templateId]) => {
                        const plan = currentData.sector_template_plan?.[sector];
                        const baseRule = templateLibrary[templateId];
                        const overrideSource = plan?.overrides && Object.keys(plan.overrides).length ? plan.overrides : undefined;
                        const overrideText = overrideSource ? JSON.stringify(overrideSource) : "-";
                        return (
                          <tr key={`${sector}-${templateId}`} className="text-slate-700">
                            <td className="border-b border-slate-100 px-3 py-2">{sector}</td>
                            <td className="border-b border-slate-100 px-3 py-2">{templateId}</td>
                            <td className="border-b border-slate-100 px-3 py-2 text-right">
                              {baseRule ? formatYi(baseRule.minMarketCap) : "-"}
                            </td>
                            <td className="border-b border-slate-100 px-3 py-2 text-right">{baseRule ? baseRule.maxPe : "-"}</td>
                            <td className="border-b border-slate-100 px-3 py-2 text-right">{baseRule ? baseRule.maxPb : "-"}</td>
                            <td className="border-b border-slate-100 px-3 py-2">
                              {baseRule ? `${baseRule.sortBy} ${baseRule.sortOrder}` : "-"}
                            </td>
                            <td className="border-b border-slate-100 px-3 py-2">{overrideText}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500">暂无</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-none py-0">
            <CardHeader className="px-4 pt-4 pb-0">
              <CardTitle className="text-base text-slate-900">入选股票清单</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-3 pb-4">
              {filteredStocks.length ? (
                <div className="overflow-x-auto border border-slate-200">
                  <table className="w-full min-w-[1280px] border-collapse text-sm">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">ts_code</th>
                        <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">name</th>
                        <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">industry</th>
                        <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">close</th>
                        <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">pe</th>
                        <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">pe_ttm</th>
                        <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">pb</th>
                        <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">total_mv</th>
                        <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">circ_mv</th>
                        <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">turnover_rate</th>
                        <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">volume_ratio</th>
                        <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">dv_ratio</th>
                        <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">ps_ttm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStocks.map((stock, index) => (
                        <ScreenerStockRow key={`${stock.ts_code}-${index}`} stock={stock} />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500">暂无入选股票</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </section>
  );
}

function ScreenerStockRow({ stock }: { stock: ScreenerFilteredStock }) {
  return (
    <tr className="text-slate-700">
      <td className="border-b border-slate-100 px-3 py-2">{stock.ts_code}</td>
      <td className="border-b border-slate-100 px-3 py-2">{stock.name}</td>
      <td className="border-b border-slate-100 px-3 py-2">{stock.industry}</td>
      <td className="border-b border-slate-100 px-3 py-2 text-right">{formatFixed(stock.close, 2)}</td>
      <td className="border-b border-slate-100 px-3 py-2 text-right">{formatFixed(stock.pe, 2)}</td>
      <td className="border-b border-slate-100 px-3 py-2 text-right">{formatFixed(stock.pe_ttm, 2)}</td>
      <td className="border-b border-slate-100 px-3 py-2 text-right">{formatFixed(stock.pb, 2)}</td>
      <td className="border-b border-slate-100 px-3 py-2 text-right">{formatLocale(stock.total_mv)}</td>
      <td className="border-b border-slate-100 px-3 py-2 text-right">{formatLocale(stock.circ_mv)}</td>
      <td className="border-b border-slate-100 px-3 py-2 text-right">{formatFixed(stock.turnover_rate, 2)}</td>
      <td className="border-b border-slate-100 px-3 py-2 text-right">{formatFixed(stock.volume_ratio, 2)}</td>
      <td className="border-b border-slate-100 px-3 py-2 text-right">{formatFixed(stock.dv_ratio, 2)}</td>
      <td className="border-b border-slate-100 px-3 py-2 text-right">{formatFixed(stock.ps_ttm, 2)}</td>
    </tr>
  );
}

function formatFixed(value: number | null | undefined, digits: number) {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return Number(value).toFixed(digits);
}

function formatLocale(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return Number(value).toLocaleString();
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

function formatYi(value: number) {
  return `${(value / 1e8).toFixed(0)}亿`;
}
