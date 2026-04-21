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

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stock-M" },
    { name: "description", content: "Stock-M" },
  ];
}

export default function Home() {
  const agentList = [
    {
      name: "宏观层分析师",
      desc: "宏观分析层负责把分散的经济与市场信息转化为可执行的投资背景判断。它围绕增长、通胀、流动性与政策四大主线，持续跟踪关键指标和事件变化，识别市场所处阶段与潜在风险偏好切换，为行业轮动、个股筛选和仓位管理提供统一的上层框架。通过多 Agent 协同解读与历史结论沉淀，宏观判断不再停留在“观点”，而是形成可追踪、可复盘、可迭代的策略输入。",
      to: "/agents",
      cards: [
        {
          title: "宏观经济分析师（Macro Economist）",
          desc: "聚焦增长、通胀、就业与政策周期，构建宏观状态判断框架，输出当前经济阶段、核心矛盾与大类资产影响路径，为后续行业与组合决策提供顶层基准。",
          to: "/agents/macro/macro-economist",
        },
        {
          title: "流动性分析师（Liquidity Analyst）",
          desc: "追踪货币投放、利率中枢、信用扩张与市场资金面变化，识别“宽松/收紧”切换信号，评估风险偏好和估值弹性，为仓位节奏与风格选择提供依据。",
          to: "/agents/macro/liquidity-analyst",
        },
        {
          title: "大宗商品分析师（Commodity Analyst）",
          desc: "覆盖能源、金属与农产品等关键品类，结合供需结构、库存周期与价格传导，判断上游成本与通胀压力方向，辅助行业景气与盈利预期修正。",
          to: "/agents/macro/commodity-analyst",
        },
        {
          title: "市场情绪分析师（Market Sentiment Analyst）",
          desc: "从波动、成交、资金行为与情绪指标中提炼市场温度，识别过热、恐慌与修复阶段，帮助策略在“进攻/防守”之间动态切换，降低情绪化交易噪音。",
          to: "/agents/macro/market-sentiment-analyst",
        },
        {
          title: "宏观新闻分析师（News Analyst）",
          desc: "对政策发布、国际事件与高影响新闻进行结构化解读，快速提炼事件级别、影响时长与受益/受损方向，把信息冲击转化为可跟踪的策略信号。",
          to: "/agents/macro/news-analyst",
        },
        {
          title: "宏观经理（Macro Manager）",
          desc: "Macro Manager（宏观经理）是宏观分析层的“总控中枢”。它先汇总新闻、市场情绪、流动性、大宗商品、宏观经济五类分析师结果，再基于当日数据生成结构化宏观结论，包括市场状态、方向判断、建议仓位、重点行业/概念、风险因子与置信度。系统会优先复用已产出的历史结果，仅补跑缺失分析师，并将最终结论持久化留痕，实现“可追踪、可复盘、可迭代”的宏观决策闭环。",
          to: "/agents/macro",
        },
      ],
    },
    {
      name: "Sector Analyst（行业分析层）",
      desc: "行业分析层负责把“市场主线”和“资金选择”做成可量化、可追踪的中间决策层。它一方面评估板块趋势强弱与轮动阶段，另一方面跟踪行业/概念资金净流入与持续性，输出趋势主线、修复机会与风险预警，承接宏观判断并为个股筛选和组合调仓提供方向锚点。",
      to: "/agents",
      cards: [
        {
          title: "行业趋势分析师（Sector Trend Analyst）",
          desc: "基于行业/概念板块的价格、动量、均线、成交与技术指标，识别长中短趋势状态，构建趋势强度榜、修复反转榜和高位转弱预警榜，帮助你快速判断“该追哪些主线、该防哪些风险”。",
          to: "/agents/sector/sector-trend-analyst",
        },
        {
          title: "板块资金流分析师（Sector Capital Flow Analyst）",
          desc: "聚焦同花顺行业/概念资金流，在 1/5/10/20 日多窗口统计净流入净流出、持续性与异动特征，识别资金正在强化的热点板块和持续承压的风险板块，为行业轮动与仓位切换提供资金面依据。",
          to: "/agents/sector/sector-capital-flow-analyst",
        },
        {
          title: "行业经理（Sector Manager）",
          desc: "Sector Manager（行业经理）是行业层的“决策整合中台”。它并行汇总行业趋势分析与板块资金流分析，并联动宏观管理层结论，对当日行业结构做统一判断，输出市场风格、执行偏好、优选方向、观察清单与风险板块。系统支持优先复用本地历史产物、缺失部分自动补跑，并将最终结论按交易日持久化留痕，形成从“趋势+资金+宏观”到行业执行建议的可追踪闭环。",
          to: "/agents/sector",
        },
      ],
    },
    {
      name: "个股分析层（Stock Layer）",
      desc: "个股层承接宏观与行业方向，把“板块机会”进一步落实到“具体标的选择”。这一层通过筛选、单票研究与批量排序三步，将基本面质量、技术面节奏和风险约束统一到同一套评分与信号体系，最终输出可执行的候选清单与优先级。",
      to: "/agents/stock",
      cards: [
        {
          title: "stock_analyst（个股分析师层）",
          desc: "个股分析师层由股票筛选、基本面分析与技术面分析三个模块组成：先从全市场筛出符合条件的股票池，再对单只股票进行基本面与技术面拆解，形成结构化中间结果，为后续经理层汇总提供可信输入。",
          to: "/agents/stock/stock-analyst",
        },
        {
          title: "stock_screener（股票筛选分析师）",
          desc: "股票筛选分析师负责从全市场按规则过滤出候选标的，输出结构化筛选池，解决“先看哪些股票”的问题，为后续深度分析建立高质量输入。",
          to: "/agents/stock/stock-screener",
        },
        {
          title: "stock_fundamental_analyst（个股基本面分析师）",
          desc: "个股基本面分析师聚焦财务质量、估值水平与经营稳健性，对单只股票给出基本面评价与核心结论，帮助判断公司质量与中长期配置价值。",
          to: "/agents/stock/stock-fundamental-analyst",
        },
        {
          title: "stock_technical_analyst（个股技术面分析师）",
          desc: "个股技术面分析师基于趋势、动量与风险信号评估交易节奏，输出技术评分与时点判断，帮助识别更合适的介入、持有或观察时机。",
          to: "/agents/stock/stock-technical-analyst",
        },
        {
          title: "stock_manager（个股研究经理）",
          desc: "个股研究经理负责对单只股票进行最终决策整合：并行汇总基本面与技术面结果，给出综合评分、动作信号（buy/hold/sell/watch）、风险等级与核心理由；同时支持缓存命中与结果持久化，保证单票结论可复盘、可追踪。",
          to: "/agents/stock/stock-manager",
        },
        {
          title: "stock_pool_manager（批量个股池经理）",
          desc: "批量个股池经理面向“组合候选生成”场景：读取筛选池后并行调用 stock_manager 完成逐票分析，再按综合分排序生成候选列表与 Top 关注名单，并记录分析成功率与异常情况，输出可直接用于选股与调仓的批量结果。",
          to: "/agents/stock/stock-pool-manager",
        },
      ],
    },
    {
      name: "决策层（Decision Layer）",
      desc: "决策层负责把宏观、行业与个股研究结果转化为可执行的组合动作。它以“上期持仓 + 当日候选 + 市场约束”为输入，统一输出建仓、加仓、减仓、清仓与持有决策，并生成可追踪的组合账本与调仓原因，打通从研究结论到策略执行的最后一环。",
      to: "/agents/decision",
      cards: [
        {
          title: "portfolio_decision（组合决策引擎）",
          desc: "portfolio_decision 是决策层核心模块：先读取上期组合与当日上游产物（macro/sector/stock_pool），复用已有个股分析并补齐缺失结果，再结合仓位区间、单票上限、分散化等约束生成调仓操作；随后按当日开盘价计算目标仓位、持仓股数与资金分配，最终输出“资产组合表 + 操作原因表 + 决策摘要”，并按交易日持久化留痕，确保每次调仓都可复盘、可审计。",
          to: "/agents/decision/portfolio-decision",
        },
      ],
    },
  ];

  const agentOutputPreview = [
    {
      agent: "宏观经理（Macro Manager）",
      output: "经济动能温和修复，流动性中性偏松，建议仓位 65%-75%。",
      signal: "中性偏多",
      updatedAt: "2026-04-21 09:05",
    },
    {
      agent: "行业经理（Sector Manager）",
      output: "资金延续向 AI 应用与高股息切换，关注景气修复与防御平衡。",
      signal: "结构轮动",
      updatedAt: "2026-04-21 09:08",
    },
    {
      agent: "stock_pool_manager（批量个股池经理）",
      output: "候选池 42 只，Top10 综合分集中在算力链与现金流稳健龙头。",
      signal: "优选清单已更新",
      updatedAt: "2026-04-21 09:12",
    },
    {
      agent: "portfolio_decision（组合决策引擎）",
      output: "建议加仓 3 只、减仓 2 只，组合集中度维持在风控阈值内。",
      signal: "可执行",
      updatedAt: "2026-04-21 09:15",
    },
    {
      agent: "宏观经济分析师（Macro Economist）",
      output: "增长修复延续但斜率放缓，通胀温和，政策维持稳增长取向。",
      signal: "温和复苏",
      updatedAt: "2026-04-21 09:18",
    },
    {
      agent: "流动性分析师（Liquidity Analyst）",
      output: "短端利率稳定，信用扩张边际改善，权益估值压制缓解。",
      signal: "中性偏松",
      updatedAt: "2026-04-21 09:20",
    },
    {
      agent: "行业趋势分析师（Sector Trend Analyst）",
      output: "算力基础设施与高分红延续强趋势，消费修复处在早期阶段。",
      signal: "主线清晰",
      updatedAt: "2026-04-21 09:22",
    },
    {
      agent: "板块资金流分析师（Sector Capital Flow Analyst）",
      output: "近 5 日资金净流入集中在 AI 应用链，医药出现边际回流信号。",
      signal: "资金聚焦",
      updatedAt: "2026-04-21 09:24",
    },
    {
      agent: "stock_manager（个股研究经理）",
      output: "单票研究完成率 96%，高分标的集中于盈利确定性与现金流改善方向。",
      signal: "研究完成",
      updatedAt: "2026-04-21 09:26",
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
                        <Link to={card.to} className="block">
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
                  to={agent.to}
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
              <Card key={item.agent} className="rounded-none py-0">
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
