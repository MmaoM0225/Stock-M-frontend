import type { Route } from "./+types/home";
import { Link } from "react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { agentList } from "~/data/agent-list";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stock-M" },
    { name: "description", content: "Stock-M" },
  ];
}

export default function Home() {
  const agentOutputPreview = [
    {
      agent: "宏观经理（Macro Manager）",
      output: "经济动能温和修复，流动性中性偏松，建议仓位 65%-75%。",
      signal: "中性偏多",
      updatedAt: "2026-04-21 09:05",
      to: "/data/macro",
    },
    {
      agent: "行业经理（Sector Manager）",
      output: "资金延续向 AI 应用与高股息切换，关注景气修复与防御平衡。",
      signal: "结构轮动",
      updatedAt: "2026-04-21 09:08",
      to: "/data/sector",
    },
    {
      agent: "stock_pool_manager（批量个股池经理）",
      output: "候选池 42 只，Top10 综合分集中在算力链与现金流稳健龙头。",
      signal: "优选清单已更新",
      updatedAt: "2026-04-21 09:12",
      to: "/data/stock/stock-pool-manager",
    },
    {
      agent: "portfolio_decision（组合决策引擎）",
      output: "建议加仓 3 只、减仓 2 只，组合集中度维持在风控阈值内。",
      signal: "可执行",
      updatedAt: "2026-04-21 09:15",
      to: "/data/decision/portfolio-decision",
    },
    {
      agent: "宏观经济分析师（Macro Economist）",
      output: "增长修复延续但斜率放缓，通胀温和，政策维持稳增长取向。",
      signal: "温和复苏",
      updatedAt: "2026-04-21 09:18",
      to: "/data/macro/macro-economist",
    },
    {
      agent: "流动性分析师（Liquidity Analyst）",
      output: "短端利率稳定，信用扩张边际改善，权益估值压制缓解。",
      signal: "中性偏松",
      updatedAt: "2026-04-21 09:20",
      to: "/data/macro/liquidity-analyst",
    },
    {
      agent: "行业趋势分析师（Sector Trend Analyst）",
      output: "算力基础设施与高分红延续强趋势，消费修复处在早期阶段。",
      signal: "主线清晰",
      updatedAt: "2026-04-21 09:22",
      to: "/data/sector/sector-trend-analyst",
    },
    {
      agent: "板块资金流分析师（Sector Capital Flow Analyst）",
      output: "近 5 日资金净流入集中在 AI 应用链，医药出现边际回流信号。",
      signal: "资金聚焦",
      updatedAt: "2026-04-21 09:24",
      to: "/data/sector/sector-capital-flow-analyst",
    },
    {
      agent: "stock_manager（个股研究经理）",
      output: "单票研究完成率 96%，高分标的集中于盈利确定性与现金流改善方向。",
      signal: "研究完成",
      updatedAt: "2026-04-21 09:26",
      to: "/data/stock/stock-manager",
    },
  ];
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const totalPages = Math.ceil(agentOutputPreview.length / pageSize);
  const monthlyReturnData = [
    { month: "2月", value: 1.2 },
    { month: "3月", value: 4.9 },
    { month: "4月", value: 8.37 },
  ];
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return agentOutputPreview.slice(start, start + pageSize);
  }, [agentOutputPreview, currentPage]);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-10 pt-0">
      <div className="border border-slate-200 bg-white">
        <section className="flex items-center bg-gradient-to-br from-slate-900 to-slate-700 p-8 text-white md:min-h-[360px]">
          <div className="grid w-full gap-8 md:grid-cols-[280px_1fr] md:items-center">
            <div>
              <h1 className="logo-font text-3xl font-normal tracking-wide sm:text-4xl">
                Stock-M
              </h1>
            </div>
            <div className="space-y-4">
              <p className="max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
                多 Agent 协同 + 数据驱动，一站式打通宏观、行业、个股到组合管理。
              </p>
              <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                沉淀观点、回看历史、跟踪收益，让每次决策都有依据、可复盘、可迭代。
              </p>
              <div className="grid gap-4 pt-2 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    覆盖维度
                  </p>
                  <p className="mt-1 text-lg font-semibold">宏观 / 行业 / 个股 / 组合</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    协同方式
                  </p>
                  <p className="mt-1 text-lg font-semibold">多 Agent 流程化分析</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    结果交付
                  </p>
                  <p className="mt-1 text-lg font-semibold">可追踪结论 + 可执行策略</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Agents
              </h2>
            </div>
            <Link
              to="/agents"
              className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
            >
              查看全部
            </Link>
          </div>
          <div className="mt-5 divide-y divide-slate-200">
            {agentList.map((agent) =>
              agent.cards ? (
                <div key={agent.name} className="py-4 first:pt-0 last:pb-0">
                  <h3 className="text-base font-semibold text-slate-900">{agent.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{agent.desc}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {agent.cards.map((card) => (
                      <Card key={card.title} className="rounded-none py-0 transition-colors hover:bg-slate-50">
                        <Link to="/agents" className="block">
                          <CardHeader className="px-4 pt-4 pb-0">
                            <CardTitle className="text-sm text-slate-900">{card.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="px-4 pt-2 pb-4">
                            <p className="text-sm leading-6 text-slate-600">{card.desc}</p>
                          </CardContent>
                        </Link>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={agent.name}
                  to="/agents"
                  className="block py-4 first:pt-0 last:pb-0"
                >
                  <h3 className="text-base font-semibold text-slate-900">{agent.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{agent.desc}</p>
                </Link>
              )
            )}
          </div>
        </section>

        <section className="border-t border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Agents 输出预览
              </h2>
            </div>
            <Link
              to="/data"
              className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
            >
              前往数据中心
            </Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {currentItems.map((item) => (
              <Card key={item.agent} className="rounded-none py-0 transition-colors hover:bg-slate-50">
                <Link to={item.to} className="block">
                  <CardHeader className="px-4 pt-4 pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-sm text-slate-900">{item.agent}</CardTitle>
                      <span className="shrink-0 text-xs text-emerald-700">{item.signal}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pt-2 pb-4">
                    <p className="text-sm leading-6 text-slate-600">{item.output}</p>
                    <p className="mt-3 text-xs text-slate-400">更新时间：{item.updatedAt}</p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
          <Pagination className="mt-4 justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  text="上一页"
                  className={currentPage === 1 ? "pointer-events-none opacity-40" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.max(1, p - 1));
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === page}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  text="下一页"
                  className={currentPage === totalPages ? "pointer-events-none opacity-40" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </section>

        <section className="border-t border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">组合与收益</h2>
            </div>
            <Link
              to="/portfolio"
              className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
            >
              进入组合中心
            </Link>
          </div>
          <div className="mt-5 grid items-stretch gap-6 lg:grid-cols-2">
            <div className="flex h-full flex-col">
              <h3 className="text-base font-semibold text-slate-900">当前组合前五大持仓</h3>
              <div className="mt-3 flex-1 divide-y divide-slate-200 border border-slate-200">
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="text-sm text-slate-700">中际旭创</span>
                    <p className="mt-1 text-xs text-slate-500">成本价：129.40</p>
                  </div>
                  <span className="text-sm font-medium text-slate-900">12.6%</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="text-sm text-slate-700">中国移动</span>
                    <p className="mt-1 text-xs text-slate-500">成本价：104.20</p>
                  </div>
                  <span className="text-sm font-medium text-slate-900">10.4%</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="text-sm text-slate-700">紫金矿业</span>
                    <p className="mt-1 text-xs text-slate-500">成本价：17.65</p>
                  </div>
                  <span className="text-sm font-medium text-slate-900">9.8%</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="text-sm text-slate-700">工商银行</span>
                    <p className="mt-1 text-xs text-slate-500">成本价：6.28</p>
                  </div>
                  <span className="text-sm font-medium text-slate-900">8.9%</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="text-sm text-slate-700">宁德时代</span>
                    <p className="mt-1 text-xs text-slate-500">成本价：186.50</p>
                  </div>
                  <span className="text-sm font-medium text-slate-900">8.3%</span>
                </div>
              </div>
            </div>

            <div className="flex h-full min-h-[380px] flex-col">
              <div className="flex items-end justify-between">
                <h3 className="text-base font-semibold text-slate-900">近 3 个月收益率</h3>
                <span className="text-sm font-medium text-emerald-600">+8.37%</span>
              </div>
              <div className="mt-3 flex-1 border border-slate-200 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyReturnData}
                    margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis
                      unit="%"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip formatter={(value) => [`${value ?? 0}%`, "收益率"]} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#16a34a"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <Card className="mt-3 rounded-none py-0">
                <CardContent className="grid grid-cols-2 gap-4 px-4 py-4">
                  <div>
                    <p className="text-xs text-slate-500">最大回撤</p>
                    <p className="mt-1 text-lg font-semibold text-rose-600">-2.18%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">总收益</p>
                    <p className="mt-1 text-lg font-semibold text-emerald-600">+18.42%</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
