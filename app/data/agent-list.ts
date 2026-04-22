export type AgentCardItem = {
  title: string;
  desc: string;
  to: string;
};

export type AgentGroupItem = {
  name: string;
  desc: string;
  to: string;
  cards: AgentCardItem[];
};

export const agentList: AgentGroupItem[] = [
  {
    name: "宏观分析层（Macro Layer）",
    desc: "宏观分析层负责把分散的经济与市场信息转化为可执行的投资背景判断。它围绕增长、通胀、流动性与政策四大主线，持续跟踪关键指标和事件变化，识别市场所处阶段与潜在风险偏好切换，为行业轮动、个股筛选和仓位管理提供统一的上层框架。通过多 Agent 协同解读与历史结论沉淀，宏观判断不再停留在“观点”，而是形成可追踪、可复盘、可迭代的策略输入。",
    to: "/agents",
    cards: [
      {
        title: "宏观经济分析师（Macro Economist）",
        desc: "聚焦增长、通胀、就业与政策周期，构建宏观状态判断框架，输出当前经济阶段、核心矛盾与大类资产影响路径，为后续行业与组合决策提供顶层基准。",
        to: "/agents/macro/macro-economist",
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
    name: "行业分析层（Sector Analyst）",
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
        title: "股票筛选分析师（stock_screener）",
        desc: "股票筛选分析师负责从全市场按规则过滤出候选标的，输出结构化筛选池，解决“先看哪些股票”的问题，为后续深度分析建立高质量输入。",
        to: "/agents/stock/stock-screener",
      },
      {
        title: "个股基本面分析师（stock_fundamental_analyst）",
        desc: "个股基本面分析师聚焦财务质量、估值水平与经营稳健性，对单只股票给出基本面评价与核心结论，帮助判断公司质量与中长期配置价值。",
        to: "/agents/stock/stock-fundamental-analyst",
      },
      {
        title: "个股技术面分析师（stock_technical_analyst）",
        desc: "个股技术面分析师基于趋势、动量与风险信号评估交易节奏，输出技术评分与时点判断，帮助识别更合适的介入、持有或观察时机。",
        to: "/agents/stock/stock-technical-analyst",
      },
      {
        title: "个股研究经理（stock_manager）",
        desc: "个股研究经理负责对单只股票进行最终决策整合：并行汇总基本面与技术面结果，给出综合评分、动作信号（buy/hold/sell/watch）、风险等级与核心理由；同时支持缓存命中与结果持久化，保证单票结论可复盘、可追踪。",
        to: "/agents/stock/stock-manager",
      },
      {
        title: "批量个股池经理（stock_pool_manager）",
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
