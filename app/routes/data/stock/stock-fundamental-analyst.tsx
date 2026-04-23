import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getFundamentalByCodeAndDate,
  getFundamentalDatesByCode,
  getFundamentalTsCodes,
  type FundamentalData,
} from "~/lib/stock";

export default function StockFundamentalAnalystPage() {
  const [stockOptions, setStockOptions] = useState<string[]>([]);
  const [dateOptions, setDateOptions] = useState<string[]>([]);
  const [selectedStock, setSelectedStock] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentData, setCurrentData] = useState<FundamentalData | null>(null);
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
        const response = await getFundamentalTsCodes();
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
        const response = await getFundamentalDatesByCode(selectedStock);
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
      setCurrentData(null);
      return;
    }

    let disposed = false;
    const loadDetail = async () => {
      setLoadingDetail(true);
      setError("");
      try {
        const response = await getFundamentalByCodeAndDate(selectedStock, selectedDate);
        if (disposed) return;
        setCurrentData(response.data ?? null);
      } catch (err) {
        if (disposed) return;
        setCurrentData(null);
        setError(err instanceof Error ? err.message : "获取基本面详情失败");
      } finally {
        if (!disposed) setLoadingDetail(false);
      }
    };

    loadDetail();
    return () => {
      disposed = true;
    };
  }, [selectedDate, selectedStock]);

  const chartData = useMemo(
    () => ({
      valuation: currentData?.valuation_trend ?? [],
      income: currentData?.income_trend ?? [],
      cashflow: currentData?.cashflow_trend ?? [],
      liability: currentData?.liability_trend ?? [],
      dividendYield: currentData?.dividend_yield_trend ?? [],
    }),
    [currentData]
  );
  const keyConclusions = Array.isArray(currentData?.reduce_result?.key_conclusions)
    ? currentData.reduce_result.key_conclusions
    : [];
  const majorRisks = Array.isArray(currentData?.reduce_result?.major_risks)
    ? currentData.reduce_result.major_risks
    : [];

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">个股基本面分析师（stock_fundamental_analyst）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          先选股票、再选该股票下有报告的日期。当前：{currentData?.ts_code ?? "-"}，数据日期：{currentData?.trade_date ?? "-"}
          。页面聚合公司画像、估值快照、三大财务报表核心指标与综合评级结果。
        </p>
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
        <Metric title="综合评分" value={String(currentData.reduce_result.overall_score)} />
        <Metric title="评级" value={currentData.reduce_result.rating_label} />
        <Metric title="置信度" value={currentData.reduce_result.confidence} />
        <Metric title="抓取状态" value={currentData.fetch_status.complete_success ? "complete_success" : "partial"} />
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">公司画像</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 pt-3 pb-4 text-sm text-slate-700">
          <p>{currentData.company.name}（{currentData.ts_code}）</p>
          <p>交易所：{currentData.company.exchange}，地区：{currentData.company.province}{currentData.company.city}，员工：{currentData.company.employees}</p>
          <p>管理层：董事长 {currentData.company.chairman} / 总经理 {currentData.company.manager} / 董秘 {currentData.company.secretary}</p>
          <p>主营：{currentData.company.main_business}</p>
          <p>官网：{currentData.company.website}，邮箱：{currentData.company.email}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">股价 vs PE</CardTitle>
          </CardHeader>
          <CardContent className="h-72 px-2 pt-3 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.valuation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="close" name="收盘价" stroke="#2563eb" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="pe_ttm" name="PE_TTM" stroke="#16a34a" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">股价 vs PB</CardTitle>
          </CardHeader>
          <CardContent className="h-72 px-2 pt-3 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.valuation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="close" name="收盘价" stroke="#2563eb" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="pb" name="PB" stroke="#7c3aed" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">利润表（亿元/%）</CardTitle>
          </CardHeader>
          <CardContent className="h-72 px-2 pt-3 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.income}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="amount" />
                <YAxis yAxisId="ratio" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="amount" dataKey="revenue" name="营收" fill="#0284c7" />
                <Bar yAxisId="amount" dataKey="net_profit" name="归母净利" fill="#16a34a" />
                <Line yAxisId="ratio" type="monotone" dataKey="op_margin" name="营业利润率%" stroke="#ca8a04" dot={false} />
                <Line yAxisId="ratio" type="monotone" dataKey="net_margin" name="净利率%" stroke="#dc2626" dot={false} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">现金流（亿元）</CardTitle>
          </CardHeader>
          <CardContent className="h-72 px-2 pt-3 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.cashflow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cfo" name="经营现金流" fill="#16a34a" />
                <Bar dataKey="cfi" name="投资现金流" fill="#64748b" />
                <Bar dataKey="cff" name="筹资现金流" fill="#0ea5e9" />
                <Line type="monotone" dataKey="fcf" name="自由现金流" stroke="#dc2626" dot={false} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">负债与资产结构（亿元/%）</CardTitle>
          </CardHeader>
          <CardContent className="h-72 px-2 pt-3 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.liability}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="amount" />
                <YAxis yAxisId="ratio" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="amount" dataKey="assets" name="总资产" fill="#2563eb" />
                <Bar yAxisId="amount" dataKey="liab" name="总负债" fill="#f97316" />
                <Line yAxisId="ratio" type="monotone" dataKey="debt_to_assets" name="负债率%" stroke="#dc2626" dot={false} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">股息率趋势</CardTitle>
          </CardHeader>
          <CardContent className="h-64 px-2 pt-3 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.dividendYield}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Line type="monotone" dataKey="dv_ratio" name="dv_ratio(%)" stroke="#7c3aed" strokeWidth={2} />
                <Line type="monotone" dataKey="dv_ttm" name="dv_ttm(%)" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">综合结论与风险</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pt-3 pb-4 text-sm text-slate-700">
          <p>{currentData.reduce_result?.summary ?? "-"}</p>
          <p>估值观点：{currentData.reduce_result?.valuation_view ?? "-"}</p>
          <ul className="space-y-1">
            {keyConclusions.map((item, index) => (
              <li key={`${index}-${item}`}>- {item}</li>
            ))}
          </ul>
          <ul className="space-y-1">
            {majorRisks.map((item, index) => (
              <li key={`${index}-${item}`}>- 风险：{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
        </>
      ) : null}
    </section>
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
