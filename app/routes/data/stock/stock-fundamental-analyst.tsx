import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from "recharts";

const report = {
  tsCode: "000027.SZ",
  tradeDate: "20240117",
  company: {
    name: "深圳能源集团股份有限公司",
    exchange: "SZSE",
    chairman: "李英峰",
    manager: "欧阳绘宇",
    secretary: "李倬舸",
    province: "广东",
    city: "深圳市",
    employees: 12527,
    website: "www.sec.com.cn",
    email: "ir@sec.com.cn",
    mainBusiness:
      "各种常规能源和新能源的开发、生产、购销，以及城市固体废物处理、城市燃气供应和废水处理等。",
  },
  fetchStatus: {
    companyInfo: 1,
    valuation: 20,
    income: 12,
    cashflow: 12,
    balancesheet: 12,
    dividend: 20,
    completeSuccess: true,
  },
  reduceResult: {
    overallScore: 65,
    ratingLabel: "一般",
    confidence: "低",
    valuationView: "低估但市场关注度低，存在价值陷阱风险。",
    summary:
      "深圳能源呈现“低估值、高现金流、高杠杆、盈利增长乏力”特征。经营造血能力强，但资本开支导致自由现金流持续承压，且对融资依赖较高。",
    keyConclusions: [
      "经营现金流强，但净利润增速明显落后于收入增速，增收不增利。",
      "自由现金流为负，资本开支强度高，对外部融资依赖明显。",
      "估值指标偏低（PE/PB/PS），市场情绪偏冷、交易活跃度偏低。",
    ],
    majorRisks: [
      "低估值长期不修复，存在价值陷阱。",
      "高杠杆与财务费用压力在利率上行环境中放大。",
      "自由现金流承压时，扩张与偿债节奏可能受融资环境影响。",
    ],
  },
};

const valuationTrend = [
  { date: "12-20", close: 6.08, peTtm: 8.38, pb: 0.95 },
  { date: "12-27", close: 6.13, peTtm: 8.45, pb: 0.96 },
  { date: "12-29", close: 6.45, peTtm: 8.89, pb: 1.01 },
  { date: "01-02", close: 6.31, peTtm: 8.7, pb: 0.98 },
  { date: "01-08", close: 6.2, peTtm: 8.55, pb: 0.97 },
  { date: "01-12", close: 6.27, peTtm: 8.65, pb: 0.98 },
  { date: "01-17", close: 6.15, peTtm: 8.48, pb: 0.96 },
];

const incomeTrend = [
  { period: "2024Q1", revenue: 96.1, netProfit: 11.05, opMargin: 15.8, netMargin: 12.5 },
  { period: "2024Q2", revenue: 197.99, netProfit: 17.54, opMargin: 13.1, netMargin: 8.9 },
  { period: "2024Q3", revenue: 304.15, netProfit: 21.25, opMargin: 11.7, netMargin: 7.0 },
  { period: "2024Y", revenue: 412.14, netProfit: 20.05, opMargin: 9.2, netMargin: 4.9 },
  { period: "2025Q1", revenue: 97.8, netProfit: 13.52, opMargin: 18.8, netMargin: 13.8 },
  { period: "2025Q2", revenue: 211.39, netProfit: 17.05, opMargin: 13.6, netMargin: 8.1 },
  { period: "2025Q3", revenue: 324.4, netProfit: 19.64, opMargin: 11.3, netMargin: 6.1 },
  { period: "2025Y", revenue: 434.3, netProfit: 21.03, opMargin: 8.9, netMargin: 4.8 },
];

const cashflowTrend = [
  { period: "2024Q1", cfo: 21.8, cfi: -44.63, cff: 58.51, fcf: -56.56 },
  { period: "2024Q2", cfo: 63.87, cfi: -80.56, cff: 27.33, fcf: -56.26 },
  { period: "2024Q3", cfo: 74.52, cfi: -76.86, cff: 18.34, fcf: -78.47 },
  { period: "2024Y", cfo: 96.12, cfi: -117.15, cff: -20.27, fcf: -49.31 },
  { period: "2025Q1", cfo: 33.88, cfi: -15.7, cff: 80.89, fcf: -20.93 },
  { period: "2025Q2", cfo: 38.8, cfi: -32.02, cff: 33.44, fcf: -1.13 },
  { period: "2025Q3", cfo: 95.08, cfi: -76.8, cff: 38.7, fcf: -66.17 },
  { period: "2025Y", cfo: 118.17, cfi: -99.03, cff: 54.73, fcf: -72.19 },
];

const liabilityTrend = [
  { period: "2024Q1", assets: 1621.36, liab: 1048.75, debtToAssets: 64.7 },
  { period: "2024Q2", assets: 1624.65, liab: 1053.78, debtToAssets: 64.9 },
  { period: "2024Q3", assets: 1635.67, liab: 1059.13, debtToAssets: 64.8 },
  { period: "2024Y", assets: 1613.71, liab: 1031.66, debtToAssets: 63.9 },
  { period: "2025Q1", assets: 1724.35, liab: 1078.05, debtToAssets: 62.5 },
  { period: "2025Q2", assets: 1697.25, liab: 1049.97, debtToAssets: 61.9 },
  { period: "2025Q3", assets: 1709.82, liab: 1057.58, debtToAssets: 61.9 },
  { period: "2025Y", assets: 1719.46, liab: 1065.93, debtToAssets: 62.0 },
];

const dividendTrend = [
  { year: "2021", cashDivTax: 0.26 },
  { year: "2022", cashDivTax: 0.175 },
  { year: "2023", cashDivTax: 0.14 },
  { year: "2024", cashDivTax: 0.15 },
  { year: "2025E", cashDivTax: 0.16 },
];

const reportByDateAndStock = {
  "20240117": {
    "000027.SZ": {
      report,
      valuationTrend,
      incomeTrend,
      cashflowTrend,
      liabilityTrend,
      dividendTrend,
    },
  },
  "20240228": {
    "600900.SH": {
      report: {
        ...report,
        tsCode: "600900.SH",
        tradeDate: "20240228",
        company: {
          ...report.company,
          name: "长江电力股份有限公司",
          exchange: "SSE",
          province: "湖北",
          city: "宜昌市",
        },
        reduceResult: {
          ...report.reduceResult,
          overallScore: 78,
          ratingLabel: "良好",
          confidence: "中",
          valuationView: "估值中性偏低，现金流质量较高，具备防御属性。",
          summary: "水电龙头呈现“现金流稳健、分红能力较强、盈利波动相对温和”的特征。",
        },
      },
      valuationTrend: valuationTrend.map((item, index) => ({
        ...item,
        close: Number((item.close * 4.5 + index * 0.08).toFixed(2)),
        peTtm: Number((item.peTtm * 1.1).toFixed(2)),
        pb: Number((item.pb * 1.25).toFixed(2)),
      })),
      incomeTrend: incomeTrend.map((item) => ({
        ...item,
        revenue: Number((item.revenue * 1.6).toFixed(2)),
        netProfit: Number((item.netProfit * 1.7).toFixed(2)),
        opMargin: Number((item.opMargin * 1.05).toFixed(2)),
        netMargin: Number((item.netMargin * 1.08).toFixed(2)),
      })),
      cashflowTrend: cashflowTrend.map((item) => ({
        ...item,
        cfo: Number((item.cfo * 1.5).toFixed(2)),
        cfi: Number((item.cfi * 0.9).toFixed(2)),
        cff: Number((item.cff * 0.75).toFixed(2)),
        fcf: Number((item.fcf * 0.7).toFixed(2)),
      })),
      liabilityTrend: liabilityTrend.map((item) => ({
        ...item,
        assets: Number((item.assets * 2.1).toFixed(2)),
        liab: Number((item.liab * 1.75).toFixed(2)),
        debtToAssets: Number((item.debtToAssets - 7.5).toFixed(2)),
      })),
      dividendTrend: dividendTrend.map((item, index) => ({
        ...item,
        cashDivTax: Number((item.cashDivTax * (1.5 + index * 0.02)).toFixed(3)),
      })),
    },
    "000027.SZ": {
      report: { ...report, tradeDate: "20240228" },
      valuationTrend: valuationTrend.map((item) => ({ ...item, close: Number((item.close * 1.02).toFixed(2)) })),
      incomeTrend,
      cashflowTrend,
      liabilityTrend,
      dividendTrend,
    },
  },
} as const;

export default function StockFundamentalAnalystPage() {
  const dateOptions = Object.keys(reportByDateAndStock);
  const [selectedDate, setSelectedDate] = useState(dateOptions[0] ?? "");

  const stockOptions = useMemo(() => {
    const dailyData = reportByDateAndStock[selectedDate as keyof typeof reportByDateAndStock];
    return dailyData ? Object.keys(dailyData) : [];
  }, [selectedDate]);
  const [selectedStock, setSelectedStock] = useState(stockOptions[0] ?? "");

  useEffect(() => {
    if (!stockOptions.includes(selectedStock)) {
      setSelectedStock(stockOptions[0] ?? "");
    }
  }, [selectedDate, selectedStock, stockOptions]);

  const fallbackDate = selectedDate || dateOptions[0];
  const dateData = reportByDateAndStock[fallbackDate as keyof typeof reportByDateAndStock];
  const fallbackStock = selectedStock || stockOptions[0] || Object.keys(dateData ?? {})[0];
  const currentData =
    dateData?.[fallbackStock as keyof typeof dateData] ?? reportByDateAndStock["20240117"]["000027.SZ"];
  const currentReport = currentData.report;

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">个股基本面分析师（stock_fundamental_analyst）</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          标的：{currentReport.tsCode}，数据日期：{currentReport.tradeDate}。页面聚合公司画像、估值快照、三大财务报表核心指标与综合评级结果。
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs text-slate-500">选择日期</span>
            <select
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              {dateOptions.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </label>
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
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="综合评分" value={String(currentReport.reduceResult.overallScore)} />
        <Metric title="评级" value={currentReport.reduceResult.ratingLabel} />
        <Metric title="置信度" value={currentReport.reduceResult.confidence} />
        <Metric title="抓取状态" value={currentReport.fetchStatus.completeSuccess ? "complete_success" : "partial"} />
      </div>

      <Card className="rounded-none py-0">
        <CardHeader className="px-4 pt-4 pb-0">
          <CardTitle className="text-base text-slate-900">公司画像</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 pt-3 pb-4 text-sm text-slate-700">
          <p>{currentReport.company.name}（{currentReport.tsCode}）</p>
          <p>交易所：{currentReport.company.exchange}，地区：{currentReport.company.province}{currentReport.company.city}，员工：{currentReport.company.employees}</p>
          <p>管理层：董事长 {currentReport.company.chairman} / 总经理 {currentReport.company.manager} / 董秘 {currentReport.company.secretary}</p>
          <p>主营：{currentReport.company.mainBusiness}</p>
          <p>官网：{currentReport.company.website}，邮箱：{currentReport.company.email}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">股价 vs PE</CardTitle>
          </CardHeader>
          <CardContent className="h-72 px-2 pt-3 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData.valuationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="close" name="收盘价" stroke="#2563eb" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="peTtm" name="PE_TTM" stroke="#16a34a" dot={false} />
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
              <LineChart data={currentData.valuationTrend}>
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
              <BarChart data={currentData.incomeTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="amount" />
                <YAxis yAxisId="ratio" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="amount" dataKey="revenue" name="营收" fill="#0284c7" />
                <Bar yAxisId="amount" dataKey="netProfit" name="归母净利" fill="#16a34a" />
                <Line yAxisId="ratio" type="monotone" dataKey="opMargin" name="营业利润率%" stroke="#ca8a04" dot={false} />
                <Line yAxisId="ratio" type="monotone" dataKey="netMargin" name="净利率%" stroke="#dc2626" dot={false} />
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
              <BarChart data={currentData.cashflowTrend}>
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
              <BarChart data={currentData.liabilityTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="amount" />
                <YAxis yAxisId="ratio" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="amount" dataKey="assets" name="总资产" fill="#2563eb" />
                <Bar yAxisId="amount" dataKey="liab" name="总负债" fill="#f97316" />
                <Line yAxisId="ratio" type="monotone" dataKey="debtToAssets" name="负债率%" stroke="#dc2626" dot={false} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-none py-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle className="text-base text-slate-900">分红（税后每股分红）</CardTitle>
          </CardHeader>
          <CardContent className="h-64 px-2 pt-3 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData.dividendTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cashDivTax" name="cash_div_tax" stroke="#7c3aed" strokeWidth={2} />
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
          <p>{currentReport.reduceResult.summary}</p>
          <p>估值观点：{currentReport.reduceResult.valuationView}</p>
          <ul className="space-y-1">
            {currentReport.reduceResult.keyConclusions.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
          <ul className="space-y-1">
            {currentReport.reduceResult.majorRisks.map((item) => (
              <li key={item}>- 风险：{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
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
