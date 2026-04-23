import type { Route } from "./+types/home";
import { Link } from "react-router";
import { useEffect, useState } from "react";
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
import {
  getHomeAgentOutputs,
  getHomePortfolioSummary,
  type HomeAgentOutputItem,
  type HomePortfolioMetrics,
  type HomePortfolioReturnPoint,
  type HomePortfolioTopPosition,
} from "~/lib/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stock-M" },
    { name: "description", content: "Stock-M" },
  ];
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const [agentOutputPreview, setAgentOutputPreview] = useState<HomeAgentOutputItem[]>([]);
  const [previewTotal, setPreviewTotal] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const totalPages = Math.max(1, Math.ceil(previewTotal / pageSize));
  const [topPositions, setTopPositions] = useState<HomePortfolioTopPosition[]>([]);
  const [monthlyReturnData, setMonthlyReturnData] = useState<HomePortfolioReturnPoint[]>([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState<HomePortfolioMetrics>({
    max_drawdown_pct: 0,
    total_return_pct: 0,
  });
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState("");

  const formatPercentage = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  const formatWeightPercentage = (value: number) => `${value.toFixed(2)}%`;
  useEffect(() => {
    let disposed = false;

    const loadAgentOutputPreview = async () => {
      setPreviewLoading(true);
      setPreviewError("");

      try {
        const response = await getHomeAgentOutputs({
          page: currentPage,
          page_size: pageSize,
        });
        const pageData = response.data;

        if (disposed) return;

        setAgentOutputPreview(pageData?.items ?? []);
        setPreviewTotal(pageData?.total ?? 0);
      } catch (error) {
        if (disposed) return;
        setAgentOutputPreview([]);
        setPreviewTotal(0);
        setPreviewError(error instanceof Error ? error.message : "获取 Agents 输出预览失败");
      } finally {
        if (!disposed) {
          setPreviewLoading(false);
        }
      }
    };

    loadAgentOutputPreview();

    return () => {
      disposed = true;
    };
  }, [currentPage]);

  useEffect(() => {
    let disposed = false;

    const loadPortfolioSummary = async () => {
      setPortfolioLoading(true);
      setPortfolioError("");

      try {
        const response = await getHomePortfolioSummary();
        const data = response.data;
        const topFivePositions = [...(data?.top_positions ?? [])]
          .sort((a, b) => b.weight - a.weight)
          .slice(0, 5);

        if (disposed) return;

        setTopPositions(topFivePositions);
        setMonthlyReturnData(data?.monthly_returns ?? []);
        setPortfolioMetrics(
          data?.metrics ?? {
            max_drawdown_pct: 0,
            total_return_pct: 0,
          }
        );
      } catch (error) {
        if (disposed) return;
        setTopPositions([]);
        setMonthlyReturnData([]);
        setPortfolioMetrics({
          max_drawdown_pct: 0,
          total_return_pct: 0,
        });
        setPortfolioError(error instanceof Error ? error.message : "获取首页组合摘要失败");
      } finally {
        if (!disposed) {
          setPortfolioLoading(false);
        }
      }
    };

    loadPortfolioSummary();

    return () => {
      disposed = true;
    };
  }, []);

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
                {topPositions.map((position) => (
                  <div key={position.name} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <span className="text-sm text-slate-700">{position.name}</span>
                      <p className="mt-1 text-xs text-slate-500">
                        成本价：{position.cost_price.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {formatWeightPercentage(position.weight)}
                    </span>
                  </div>
                ))}
              </div>
              {!portfolioLoading && !portfolioError && topPositions.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">暂无持仓数据。</p>
              ) : null}
            </div>

            <div className="flex h-full min-h-[380px] flex-col">
              <div className="flex items-end justify-between">
                <h3 className="text-base font-semibold text-slate-900">收益率</h3>
                <span className="text-sm font-medium text-emerald-600">
                  {formatPercentage(portfolioMetrics.total_return_pct)}
                </span>
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
                    <p className="mt-1 text-lg font-semibold text-rose-600">
                      {formatPercentage(portfolioMetrics.max_drawdown_pct)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">总收益</p>
                    <p className="mt-1 text-lg font-semibold text-emerald-600">
                      {formatPercentage(portfolioMetrics.total_return_pct)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          {portfolioLoading ? <p className="mt-4 text-sm text-slate-500">加载中...</p> : null}
          {!portfolioLoading && portfolioError ? (
            <p className="mt-4 text-sm text-rose-600">{portfolioError}</p>
          ) : null}
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
            {agentOutputPreview.map((item) => (
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
                    <p className="mt-3 text-xs text-slate-400">更新时间：{item.updated_at}</p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
          {previewLoading ? (
            <p className="mt-4 text-sm text-slate-500">加载中...</p>
          ) : null}
          {!previewLoading && previewError ? (
            <p className="mt-4 text-sm text-rose-600">{previewError}</p>
          ) : null}
          {!previewLoading && !previewError && agentOutputPreview.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">暂无可展示的 Agents 输出。</p>
          ) : null}
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
      </div>
    </main>
  );
}
