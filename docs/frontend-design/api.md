# 前端 API 详细文档（联调版）

本文档按当前前端页面结构定义接口，目标是让后端可直接按字段实现并联调。  
适用页面：`/`、`/agents`、`/data/**`、`/portfolio`。

## 1. 基础约定

### 1.1 地址与环境

- API 前缀：`/api/v1`
- 前端通过 `VITE_API_BASE_URL` 配置根地址：
  - `.env.development`：`http://127.0.0.1:8000`
  - `.env.production`：`https://api.example.com`

### 1.2 协议规范

- Content-Type：`application/json`
- 时间统一使用北京时间字符串（如 `2026-04-22 09:05:00`）
- 交易日字段统一：`trade_date = YYYYMMDD`

### 1.3 统一响应结构

```json
{
  "success": true,
  "message": "ok",
  "data": {},
  "trace_id": "f2ac7f41f28c4f2e"
}
```

### 1.4 通用错误码建议

- `40001` 参数错误（如 trade_date 格式错误）
- `40004` 资源不存在（如指定交易日无数据）
- `50001` 服务内部错误
- `50002` 上游依赖失败（数据源/任务执行失败）

---

## 2. 类型定义（建议）

```ts
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  trace_id?: string;
  error_code?: string;
};
```

```ts
export type PageResult<T> = {
  page: number;
  page_size: number;
  total: number;
  items: T[];
};
```

---

## 3. 首页接口（`/`）

首页 `Agents` 分组与卡片信息使用前端静态配置 `agentList`（写死），当前阶段不需要后端接口。  
前缀：`/api/v1/home`，全部 `GET`。

### 3.1 获取 Agents 输出预览（分页）

- **URL**：`/api/v1/home/agent-outputs?page=1&page_size=4`
- **用途**：首页 “Agents 输出预览”
- **请求参数**：
  - `page`：页码，默认 `1`，最小值 `1`
  - `page_size`：每页数量，默认 `4`，范围 `1~200`

`data` 结构：

```json
{
  "page": 1,
  "page_size": 4,
  "total": 9,
  "items": [
    {
      "agent": "宏观经理（Macro Manager）",
      "output": "经济动能温和修复......",
      "signal": "中性偏多",
      "updated_at": "2026-04-21 09:05:00",
      "to": "/data/macro"
    }
  ]
}
```

### 3.2 获取首页组合摘要

- **URL**：`/api/v1/home/portfolio/summary`
- **用途**：首页 “当前组合前五大持仓 + 近 5 次收益率 + 指标卡”
- **请求参数**：无

`data` 结构：

```json
{
  "top_positions": [
    {
      "name": "中际旭创",
      "cost_price": 129.4,
      "weight": 12.6
    }
  ],
  "monthly_returns": [
    { "month": "03-05", "value": 0.0 },
    { "month": "03-14", "value": -1.46 },
    { "month": "03-25", "value": -3.29 },
    { "month": "04-03", "value": -4.02 },
    { "month": "04-16", "value": -6.0 }
  ],
  "metrics": {
    "max_drawdown_pct": -6.0,
    "total_return_pct": 0.38
  }
}
```

字段说明：

- `top_positions`：最新一期组合前五大持仓（不含现金）
  - `name`：资产名称
  - `cost_price`：成本价
  - `weight`：仓位百分比（来自仓位，去掉 `%`）
- `monthly_returns`：近 5 次收益率序列
  - `month`：日期标签，格式 `MM-DD`
  - `value`：收益率（百分比，保留 2 位小数）
- `metrics`：指标卡
  - `max_drawdown_pct`：最大回撤（百分比）
  - `total_return_pct`：总收益率（百分比）

---

## 4. Agent 运行接口（`/agents` 页面）

前缀：`/api/v1/agents`，全部 `POST`。

### 4.1 通用请求体

```json
{
  "trade_date": "20260422",
  "force": false
}
```

补充字段：

- `ts_code`：个股分析相关接口需要
- `initial_capital`：组合决策、full pipeline 需要
- `skip_existing`：full pipeline 可用

### 4.2 接口清单

- `/macro/run`
- `/sector/run`
- `/screener/run`
- `/stock-pool/run`
- `/portfolio/decision`
- `/stock/{ts_code}/analyze`
- `/full-pipeline`
- `/analyst/stock/fundamental/run`
- `/analyst/stock/technical/run`
- `/analyst/sector/trend/run`
- `/analyst/sector/capital-flow/run`
- `/analyst/macro/economist/run`
- `/analyst/macro/news/run`
- `/analyst/macro/market-sentiment/run`
- `/analyst/macro/commodity/run`

### 4.3 统一返回（建议）

```json
{
  "success": true,
  "message": "run completed",
  "data": {
    "trade_date": "20260422",
    "artifact_path": "artifacts/macro/20260422/result.json",
    "artifact_paths": [],
    "steps": ["load cache", "run analyst", "save output"]
  }
}
```

---

## 5. 数据中心查询接口（`/data/**`）

前缀：`/api/v1/data`，全部 `GET`。

## 5.1 Manager / Decision

- `/macro/{trade_date}` -> `/data/macro`
- `/sector/{trade_date}` -> `/data/sector`
- `/screener/{trade_date}` -> `/data/stock/stock-screener`
- `/stock-pool/{trade_date}` -> `/data/stock/stock-pool-manager`
- `/portfolio/{trade_date}` -> `/data/decision/portfolio-decision`

### 5.1.1 宏观经理（Macro Manager）

#### 5.1.1.1 获取可选日期

- **URL**：`/api/v1/data/macro/dates`
- **用途**：`/data/macro` 页面日期选择
- **请求参数**：无
- **请求示例**：`GET /api/v1/data/macro/dates`

`data` 结构：

```json
{
  "dates": ["20260422", "20260421", "20260420"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）

数据来源与规则：

- 数据目录：`data/artifacts/manager/macro_manager`
- 仅返回包含 `result.json` 的日期目录
- 日期格式：`YYYYMMDD`

#### 5.1.1.2 获取指定日期宏观经理结果

- **URL**：`/api/v1/data/macro/{trade_date}`
- **用途**：渲染市场方向、仓位建议、重点方向、风险因子与宏观摘要

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

`data` 结构：

```json
{
  "trade_date": "20260422",
  "market_regime": "流动性偏宽松，增长弱修复，市场情绪偏悲观。",
  "market_direction": "neutral-bearish",
  "target_position": "30%-45%",
  "focus_industry_sectors": ["贵金属", "有色金属"],
  "focus_concept_sectors": ["避险资产", "资源品"],
  "avoid_sectors": ["地产链", "可选消费"],
  "macro_themes": ["风险偏好回落", "防御配置优先"],
  "risk_factors": ["制造业景气偏弱", "需求修复不及预期"],
  "confidence": 0.55,
  "macro_summary": "市场延续弱势震荡，策略以防御与结构性机会为主。"
}
```

字段说明：

- `market_regime`：市场状态描述
- `market_direction`：市场方向判断
- `target_position`：建议仓位区间
- `focus_industry_sectors`：重点行业列表
- `focus_concept_sectors`：重点概念列表
- `avoid_sectors`：规避方向列表
- `macro_themes`：宏观主题列表
- `risk_factors`：风险因子列表
- `confidence`：置信度（`0~1`）
- `macro_summary`：宏观摘要

### 5.1.2 行业经理（Sector Manager）

#### 5.1.2.1 获取可选日期

- **URL**：`/api/v1/data/sector/dates`
- **用途**：`/data/sector` 页面日期选择
- **请求参数**：无
- **请求示例**：`GET /api/v1/data/sector/dates`

`data` 结构：

```json
{
  "dates": ["20250320", "20250319", "20250318"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）

数据来源与规则：

- 数据目录：`data/artifacts/manager/sector_manager`
- 仅返回包含 `result.json` 的日期目录
- 日期格式：`YYYYMMDD`

#### 5.1.2.2 获取指定日期行业经理结果

- **URL**：`/api/v1/data/sector/{trade_date}`
- **用途**：渲染市场状态、市场偏向、执行偏向、优选/观察/风险板块、核心信号与行业经理总结

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

`data` 结构：

```json
{
  "trade_date": "20250320",
  "market_regime": "mixed",
  "market_bias": "bearish",
  "action_bias": "defense",
  "favored_sectors": ["黄金", "贵金属", "贵金属Ⅲ"],
  "watchlist_sectors": ["冰雪产业", "火电", "公路铁路运输"],
  "risk_sectors": ["房地产开发", "汽车整车", "证券"],
  "core_signals": [
    "宏观避险情绪升温，明确聚焦黄金等贵金属板块。",
    "行业趋势显示电信、医疗、生物科技等主线持续走强。"
  ],
  "confidence": 0.5,
  "sector_summary": "当日行业结构呈现分化，趋势主线与宏观避险主线并存..."
}
```

字段说明：

- `trade_date`：当前数据交易日
- `market_regime`：行业层市场状态（如 `mixed`、`trend`、`risk-off` 等，由后端约定枚举或自由字符串）
- `market_bias`：市场偏向（如 `bullish`、`bearish`、`neutral`）
- `action_bias`：执行偏向（如 `defense`、`neutral`、`offense`，由后端约定）
- `favored_sectors`：优选板块名称列表
- `watchlist_sectors`：观察板块名称列表
- `risk_sectors`：风险规避板块名称列表
- `core_signals`：核心信号要点列表
- `confidence`：置信度（`0~1`）
- `sector_summary`：行业经理综合总结

### 5.1.3 股票筛选分析师（Stock Screener）

#### 5.1.3.1 获取可选日期

- **URL**：`/api/v1/data/screener/dates`
- **用途**：`/data/stock/stock-screener` 页面日期选择
- **请求参数**：无
- **请求示例**：`GET /api/v1/data/screener/dates`

`data` 结构：

```json
{
  "dates": ["20250320", "20250319", "20250318"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）

数据来源与规则：

- 数据目录：`data/artifacts/analyst/stock_analyst/stock_screener`
- 仅返回包含 `result.json` 的日期目录
- 日期格式：`YYYYMMDD`

#### 5.1.3.2 获取指定交易日筛选结果

- **URL**：`/api/v1/data/screener/{trade_date}`
- **用途**：渲染筛选摘要、已应用条件、板块分布、板块模板映射、各板块入选数量与入选股票清单

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

`data` 结构：

```json
{
  "trade_date": "20250320",
  "total_count": 12,
  "filter_summary": "从 5152 只股票中筛选出 12 只",
  "applied_filters": [
    "板块:黄金,贵金属,...",
    "剔除ST",
    "市值:80亿-",
    "最多12只",
    "排序:total_mv(倒序)"
  ],
  "sector_distribution": {
    "小金属": 1,
    "火力发电": 4,
    "路桥": 2
  },
  "sector_template_applied": {
    "黄金": "value_defensive",
    "火电": "value_defensive"
  },
  "sector_pick_counts": {
    "冰雪产业": 4,
    "火电": 4
  },
  "sector_template_plan": {
    "黄金": {
      "template_id": "value_defensive",
      "overrides": {},
      "confidence": 0.7
    },
    "家庭装潢零售": {
      "template_id": "fallback_balanced",
      "overrides": { "min_market_cap": 5000000000 },
      "confidence": 0.55
    }
  },
  "filtered_stocks": [
    {
      "ts_code": "600459.SH",
      "name": "贵研铂业",
      "industry": "小金属",
      "close": 13.98,
      "pe": 26.1396,
      "pe_ttm": 22.0192,
      "pb": 1.6869,
      "total_mv": 1063852.246,
      "circ_mv": 1045295.25,
      "turnover_rate": 0.4974,
      "volume_ratio": 1.01,
      "dv_ratio": 1.1804,
      "ps_ttm": 0.2261
    }
  ]
}
```

字段说明：

- `trade_date`：当前结果对应交易日
- `total_count`：入选股票只数
- `filter_summary`：一句话筛选摘要（给人读）
- `applied_filters`：已应用筛选条件说明列表（与页面「已应用筛选条件」一致）
- `sector_distribution`：入选结果按**申万/业务行业等口径的行业名称**聚合后的数量（对象：行业名 → 只数）
- `sector_template_applied`：各关注板块选用的筛选模板 ID（对象：板块名 → 模板 ID，如 `value_defensive`）
- `sector_pick_counts`：各关注板块在最终结果中的入选只数（对象：板块名 → 只数）
- `sector_template_plan`：**可选**。若存在，用于展示「模板 + 覆盖参数 + 置信度」；其中 `overrides` 为对该模板默认规则的字段级覆盖（键名建议与模板参数一致并使用 snake_case，如 `min_market_cap`）
- `filtered_stocks`：入选股票明细列表
  - `ts_code`：证券代码（带交易所后缀）
  - `name`：股票简称
  - `industry`：行业名称
  - `close`：收盘价
  - `pe` / `pe_ttm` / `pb` / `ps_ttm`：估值与市销率（含义与行情/基本面数据源一致）
  - `total_mv` / `circ_mv`：总市值、流通市值（与数据源单位一致，通常为万元）
  - `turnover_rate`：换手率
  - `volume_ratio`：量比
  - `dv_ratio`：股息率相关指标（与数据源字段一致）

说明：

- 筛选模板库（各 `template_id` 对应的 `min_market_cap`、`max_pe` 等默认规则）可由**前端静态配置**展示，不要求本接口返回；若后端希望在接口中一并下发模板定义，可扩展字段并由前后端另行约定。
- 若某交易日无 `result.json`，不应出现在 `GET .../screener/dates` 的列表中；详情接口对该日应返回业务错误或空数据（由后端统一约定）。

## 5.2 Stock

- `/stock/{ts_code}/{trade_date}` -> `/data/stock/stock-manager`
- `/fundamental/{ts_code}/{trade_date}` -> `/data/stock/stock-fundamental-analyst`
- `/technical/{ts_code}/{trade_date}` -> `/data/stock/stock-technical-analyst`

### 5.2.1 个股基本面分析师（Stock Fundamental Analyst）

页面路由：`/data/stock/stock-fundamental-analyst`。交互顺序为：**先选 `ts_code`，再选该股票下有报告的 `trade_date`**，最后拉取详情（同一股票在不同交易日可有多份报告）。

#### 5.2.1.1 获取存在基本面报告的股票代码列表

- **URL**：`/api/v1/data/fundamental/ts_codes`
- **用途**：页面「选择股票」；列出在产物目录下至少存在一份 `result.json` 的证券代码
- **请求参数**：无
- **请求示例**：`GET /api/v1/data/fundamental/ts_codes`

`data` 结构：

```json
{
  "ts_codes": ["000027.SZ", "600900.SH"]
}
```

字段说明：

- `ts_codes`：可选股票代码列表（顺序由后端约定，建议按代码字典序）

数据来源与规则：

- 数据目录：`data/artifacts/analyst/stock_analyst/stock_fundamental_analyst`
- 目录结构：`{ts_code}/{trade_date}/result.json`；凡某 `ts_code` 下任意交易日存在该文件，则该 `ts_code` 进入列表
- 路径段 `ts_codes` 为保留字，与 `{ts_code}` 路径通过全路径匹配区分

#### 5.2.1.2 获取指定股票下有报告的交易日列表

- **URL**：`/api/v1/data/fundamental/{ts_code}/dates`
- **用途**：页面「选择日期」；在已选股票下列出可查看的交易日
- **请求示例**：`GET /api/v1/data/fundamental/000027.SZ/dates`

路径参数：

- `ts_code`：证券代码（如 `000027.SZ`）

`data` 结构：

```json
{
  "ts_code": "000027.SZ",
  "dates": ["20240228", "20240117"]
}
```

字段说明：

- `dates`：该股票已生成基本面报告的交易日列表（降序，最新日期在前）
- 日期格式：`YYYYMMDD`

数据来源与规则：

- 扫描 `data/artifacts/analyst/stock_analyst/stock_fundamental_analyst/{ts_code}/*/result.json` 得到该股票下所有 `trade_date`

#### 5.2.1.3 获取指定股票、指定交易日的基本面分析详情

- **URL**：`/api/v1/data/fundamental/{ts_code}/{trade_date}`
- **用途**：渲染公司画像、抓取状态、综合评分与结论、估值/利润/现金流/负债/分红等序列图表数据

路径参数：

- `ts_code`：证券代码（如 `000027.SZ`）
- `trade_date`：交易日，格式 `YYYYMMDD`

`data` 结构：

```json
{
  "ts_code": "000027.SZ",
  "trade_date": "20240117",
  "company": {
    "name": "深圳能源集团股份有限公司",
    "exchange": "SZSE",
    "chairman": "李英峰",
    "manager": "欧阳绘宇",
    "secretary": "李倬舸",
    "province": "广东",
    "city": "深圳市",
    "employees": 12527,
    "website": "www.sec.com.cn",
    "email": "ir@sec.com.cn",
    "main_business": "各种常规能源和新能源的开发、生产、购销..."
  },
  "fetch_status": {
    "company_info": 1,
    "valuation": 20,
    "income": 12,
    "cashflow": 12,
    "balancesheet": 12,
    "dividend": 20,
    "complete_success": true
  },
  "reduce_result": {
    "overall_score": 65,
    "rating_label": "一般",
    "confidence": "低",
    "valuation_view": "低估但市场关注度低，存在价值陷阱风险。",
    "summary": "深圳能源呈现“低估值、高现金流、高杠杆、盈利增长乏力”特征。",
    "key_conclusions": [
      "经营现金流强，但净利润增速明显落后于收入增速，增收不增利。"
    ],
    "major_risks": ["低估值长期不修复，存在价值陷阱。"]
  },
  "valuation_trend": [
    { "date": "12-20", "close": 6.08, "pe_ttm": 8.38, "pb": 0.95 }
  ],
  "income_trend": [
    {
      "period": "2024Q1",
      "revenue": 96.1,
      "net_profit": 11.05,
      "op_margin": 15.8,
      "net_margin": 12.5
    }
  ],
  "cashflow_trend": [
    { "period": "2024Q1", "cfo": 21.8, "cfi": -44.63, "cff": 58.51, "fcf": -56.56 }
  ],
  "liability_trend": [
    { "period": "2024Q1", "assets": 1621.36, "liab": 1048.75, "debt_to_assets": 64.7 }
  ],
  "dividend_trend": [{ "year": "2021", "cash_div_tax": 0.26 }]
}
```

字段说明：

- `company`：公司静态画像（与数据源/工商披露字段对齐即可）
- `fetch_status`：各模块数据抓取或合并情况；数值含义由后端定义（如成功拉取的记录条数、质量分等），`complete_success` 表示是否可视为全流程成功
- `reduce_result`：Agent 归约后的结论与评分
  - `overall_score`：综合评分（整数或小数，范围由后端约定）
  - `rating_label`：评级标签（如「一般」「良好」）
  - `confidence`：置信度（可为等级文案或枚举）
  - `valuation_view`：估值维度观点摘要
  - `summary`：基本面综合摘要
  - `key_conclusions`：核心结论要点
  - `major_risks`：主要风险要点
- `valuation_trend`：估值与价格序列，供「股价 vs PE / PB」图使用；`date` 为横轴展示用标签（如 `MM-DD` 或交易日简写）
- `income_trend`：利润表相关序列（金额单位与页面一致时建议统一为**亿元**，利润率为**百分比数值**）
- `cashflow_trend`：现金流量表核心项（单位建议**亿元**）
- `liability_trend`：资产、负债与资产负债率（资产/负债建议**亿元**，`debt_to_assets` 为**百分比**）
- `dividend_trend`：分红历史；`cash_div_tax` 为税后每股现金分红等（单位与数据源一致）

说明：

- 路由注册时须保证 `GET .../fundamental/ts_codes`（全量列表）、`GET .../fundamental/{ts_code}/dates`（第二段为保留字 `dates`）与 `GET .../fundamental/{ts_code}/{trade_date}`（第二段为 8 位交易日）互不冲突。

### 5.2.2 个股技术面分析师（Stock Technical Analyst）

页面路由：`/data/stock/stock-technical-analyst`。交互顺序为：**先选 `ts_code`，再选该股票下有报告的 `trade_date`**，最后拉取详情。

#### 5.2.2.1 获取存在技术面报告的股票代码列表

- **URL**：`/api/v1/data/technical/ts_codes`
- **用途**：页面「选择股票」下拉框
- **请求参数**：无
- **请求示例**：`GET /api/v1/data/technical/ts_codes`

`data` 结构：

```json
{
  "ts_codes": ["000060.SZ", "000027.SZ"]
}
```

#### 5.2.2.2 获取指定股票下有报告的交易日列表

- **URL**：`/api/v1/data/technical/{ts_code}/dates`
- **用途**：页面「选择日期」下拉框
- **请求示例**：`GET /api/v1/data/technical/000060.SZ/dates`

路径参数：

- `ts_code`：证券代码（如 `000060.SZ`）

`data` 结构：

```json
{
  "ts_code": "000060.SZ",
  "dates": ["20241104", "20241031"]
}
```

字段说明：

- `dates`：该股票可选交易日列表（降序，最新日期在前）
- 日期格式：`YYYYMMDD`

#### 5.2.2.3 获取指定股票、指定交易日的技术面分析详情

- **URL**：`/api/v1/data/technical/{ts_code}/{trade_date}`
- **用途**：渲染技术评分、趋势信号、支撑/压力位、K 线与成交量、指标文字解读、技术结论与风险提示

路径参数：

- `ts_code`：证券代码（如 `000060.SZ`）
- `trade_date`：交易日，格式 `YYYYMMDD`

`data` 结构：

```json
{
  "ts_code": "000060.SZ",
  "trade_date": "20241104",
  "start_date": "20240329",
  "latest_price": 5.05,
  "latest_pct_chg": 0.7984,
  "support_levels": [4.85, 4.6],
  "resistance_levels": [5.1, 5.11],
  "technical_score": 65,
  "trend_signal": "uptrend",
  "trend_strength": "medium",
  "short_term_outlook": "短期价格可能面临回调压力...",
  "risk_reminder": "关注超买后回撤、放量冲高回落...",
  "summary": "股票整体仍处上升结构，短中期均线维持多头排列...",
  "indicators": {
    "ma": "多头排列，短期MA（5/10/20）高于MA60。",
    "macd": "DIF与DEA仍在零轴上方，但柱体较短，动能趋缓。",
    "rsi": "RSI14=74.29，位于超买区。",
    "kdj": "KDJ高位，J值偏高，短线震荡概率提升。",
    "boll": "价格接近布林上轨，存在上方压力。"
  },
  "stock_kline_data": [
    {
      "trade_date": "20241104",
      "open": 5.08,
      "high": 5.1,
      "low": 4.96,
      "close": 5.05,
      "pct_chg": 0.7984,
      "vol": 900503.43
    }
  ],
  "recent_bars": [
    {
      "trade_date": "20241104",
      "close": 5.05,
      "pct_chg": 0.7984,
      "ma5": 4.934,
      "ma10": 4.884,
      "ma20": 4.8545,
      "ma60": 4.383,
      "rsi14": 74.29,
      "macd_dif": 0.1459,
      "macd_dea": 0.1445,
      "macd_hist": 0.0028,
      "k": 72.61,
      "d": 68.39,
      "j": 81.05,
      "boll_upper": 5.1117,
      "boll_mid": 4.8545,
      "boll_lower": 4.5973
    }
  ]
}
```

字段说明：

- `support_levels` / `resistance_levels`：用于主图叠加支撑/压力位横线
- `stock_kline_data`：K 线 + 成交量原始序列（页面主图数据源）
- `recent_bars`：最近若干交易日技术指标快照（供文字解读/扩展图表）
- `indicators`：指标结论文案对象，前端按 key 遍历展示（如 MA/MACD/RSI/KDJ/BOLL）

说明：

- 路由注册时须保证 `GET .../technical/ts_codes`、`GET .../technical/{ts_code}/dates` 与 `GET .../technical/{ts_code}/{trade_date}` 互不冲突。

### 5.2.3 个股综合经理（Stock Manager）

页面路由：`/data/stock/stock-manager`。交互顺序为：**先选 `ts_code`，再选该股票下有报告的 `trade_date`**，最后拉取综合结论。

#### 5.2.3.1 获取存在个股综合报告的股票代码列表

- **URL**：`/api/v1/data/stock/ts_codes`
- **用途**：页面「选择股票」下拉框
- **请求参数**：无
- **请求示例**：`GET /api/v1/data/stock/ts_codes`

`data` 结构：

```json
{
  "ts_codes": ["000519.SZ", "000027.SZ"]
}
```

字段说明：

- `ts_codes`：存在至少一份 `stock_manager` 报告的证券代码列表

#### 5.2.3.2 获取指定股票下有综合报告的交易日列表

- **URL**：`/api/v1/data/stock/{ts_code}/dates`
- **用途**：页面「选择日期」下拉框
- **请求示例**：`GET /api/v1/data/stock/000519.SZ/dates`

路径参数：

- `ts_code`：证券代码（如 `000519.SZ`）

`data` 结构：

```json
{
  "ts_code": "000519.SZ",
  "dates": ["20250410", "20250409"]
}
```

字段说明：

- `dates`：该股票可选交易日列表（降序，最新日期在前）
- 日期格式：`YYYYMMDD`

#### 5.2.3.3 获取指定股票、指定交易日的个股综合分析结果

- **URL**：`/api/v1/data/stock/{ts_code}/{trade_date}`
- **用途**：渲染综合评分、组件评分、动作信号、关键结论、主要风险与总结

路径参数：

- `ts_code`：证券代码（如 `000519.SZ`）
- `trade_date`：交易日，格式 `YYYYMMDD`

`data` 结构：

```json
{
  "ts_code": "000519.SZ",
  "trade_date": "20250410",
  "success": true,
  "overall_score": 48,
  "confidence": "中",
  "selection_reason": "基本面偏弱与技术面震荡的综合评估结果。",
  "risk_level": "高",
  "component_scores": {
    "fundamental": 45,
    "technical": 55
  },
  "action_signal": "watch",
  "signal_reason": "基本面存在显著盈利与现金流风险，技术面方向不明...",
  "key_points": [
    "基本面核心矛盾突出...",
    "技术面呈区间震荡格局..."
  ],
  "risks": [
    "盈利与增长质量风险...",
    "现金流断裂风险..."
  ],
  "summary": "中兵红箭呈现显著的财务结构性矛盾..."
}
```

字段说明：

- `overall_score`：综合评分
- `component_scores`：子模块评分对象
  - `fundamental`：基本面分
  - `technical`：技术面分
- `action_signal`：动作信号（如 `buy` / `watch` / `sell`）
- `selection_reason`：动作信号的简要原因
- `signal_reason`：更详细的信号解释
- `key_points`：关键结论列表
- `risks`：主要风险列表
- `summary`：综合摘要

说明：

- 路由注册时须保证 `GET .../stock/ts_codes`、`GET .../stock/{ts_code}/dates` 与 `GET .../stock/{ts_code}/{trade_date}` 互不冲突。

### 5.2.4 股票池经理（Stock Pool Manager）

页面路由：`/data/stock/stock-pool-manager`。交互顺序为：**先选 `trade_date`，再拉取该日股票池批量分析结果**。

#### 5.2.4.1 获取可选交易日

- **URL**：`/api/v1/data/stock-pool/dates`
- **用途**：页面「选择日期」下拉框
- **请求参数**：无
- **请求示例**：`GET /api/v1/data/stock-pool/dates`

`data` 结构：

```json
{
  "dates": ["20240729", "20240726", "20240725"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）
- 日期格式：`YYYYMMDD`

#### 5.2.4.2 获取指定交易日股票池批量分析结果

- **URL**：`/api/v1/data/stock-pool/{trade_date}`
- **用途**：渲染池子规模、成功/失败统计、候选股列表、Top 列表与逐票分析摘要

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

`data` 结构：

```json
{
  "trade_date": "20240729",
  "pool_size": 12,
  "analyzed_count": 12,
  "analyze_success_count": 10,
  "analyze_error_count": 2,
  "summary_text": "交易日 20240729，自筛选池共 12 只...",
  "candidate_stocks": [
    {
      "ts_code": "000550.SZ",
      "name": "江铃汽车",
      "industry": "汽车整车",
      "overall_score": 73,
      "action_signal": "hold",
      "risk_level": "中",
      "selection_reason": "基本面稳健增长且估值合理...",
      "analyze_error": null
    }
  ],
  "top_stocks": [
    {
      "ts_code": "000550.SZ",
      "name": "江铃汽车",
      "industry": "汽车整车",
      "overall_score": 73,
      "action_signal": "hold",
      "risk_level": "中",
      "selection_reason": "基本面稳健增长且估值合理...",
      "analyze_error": null
    }
  ],
  "per_stock": [
    {
      "ts_code": "000550.SZ",
      "name": "江铃汽车",
      "industry": "汽车整车",
      "stock_manager_summary": {
        "overall_score": 73,
        "confidence": "中",
        "action_signal": "hold",
        "risk_level": "中",
        "key_points": ["2025年营收与净利润增速超40%，增长韧性较强。"],
        "risks": ["盈利能力仍偏薄，成本波动敏感。"],
        "summary": "基本面与技术面共振偏强，建议持有并观察阻力位突破有效性。"
      },
      "error": null
    }
  ]
}
```

字段说明：

- `pool_size`：池中股票数
- `analyzed_count` / `analyze_success_count` / `analyze_error_count`：批量分析数量统计
- `candidate_stocks`：候选股列表（完整池）
- `top_stocks`：按综合分排序后的重点关注列表（通常为 Top N）
- `per_stock`：逐票明细结果（含 `stock_manager_summary`）
- `analyze_error` / `error`：单票分析异常信息，`null` 表示无异常

### 5.1.4 组合决策引擎（Portfolio Decision）

页面路由：`/data/decision/portfolio-decision`。交互顺序为：**先选 `version`，再选 `trade_date`，最后拉取组合决策结果**。

#### 5.1.4.1 获取可选版本

- **URL**：`/api/v1/data/portfolio/versions`
- **用途**：页面「选择版本」下拉框
- **请求参数**：无
- **请求示例**：`GET /api/v1/data/portfolio/versions`

`data` 结构：

```json
{
  "versions": ["202401-202604_7d_for_once_ver1.3", "202401-202604_14d_for_once_ver1.2"]
}
```

字段说明：

- `versions`：可选策略版本列表

#### 5.1.4.2 获取指定版本下可选交易日

- **URL**：`/api/v1/data/portfolio/{version}/dates`
- **用途**：页面「选择日期」下拉框
- **请求示例**：`GET /api/v1/data/portfolio/202401-202604_7d_for_once_ver1.3/dates`

路径参数：

- `version`：策略版本标识

`data` 结构：

```json
{
  "dates": ["20260316", "20260309", "20260302"]
}
```

字段说明：

- `dates`：该版本下可选交易日列表（降序，最新日期在前）
- 日期格式：`YYYYMMDD`

#### 5.1.4.3 获取指定版本、指定交易日组合决策结果

- **URL**：`/api/v1/data/portfolio/{version}/{trade_date}`
- **用途**：渲染组合资产表、调仓原因表、资金统计与决策摘要

路径参数：

- `version`：策略版本标识
- `trade_date`：交易日，格式 `YYYYMMDD`

`data` 结构：

```json
{
  "strategy": "202401-202604_7d_for_once_ver1.3",
  "trade_date": "20260316",
  "portfolio_table": [
    {
      "rank": "1",
      "asset_name": "赤峰黄金",
      "ts_code": "600988.SH",
      "market_value": 64480,
      "position": "7.44%",
      "position_change": "3.14%",
      "total_return": "12.66%",
      "total_pnl": 7247.97,
      "asset_type": "个股",
      "shares": 1600,
      "cost_price": 35.77,
      "action": "加仓",
      "open_price": 40.3
    }
  ],
  "operation_reason_table": [
    {
      "asset_name": "紫金矿业",
      "ts_code": "601899.SH",
      "action": "清仓",
      "old_position": "2.19%",
      "new_position": "0.00%",
      "position_change": "-2.19%",
      "execution_price": 35.04,
      "target_amount": 0,
      "actual_amount": 0,
      "shares": 0,
      "cost_price": null,
      "reason": "基本面增长遇阻且技术面处于强下跌趋势，同时属于规避板块，执行清仓。"
    }
  ],
  "decision_summary": "本次调仓后总仓位由 42.00% 变为 53.02%...",
  "meta": {
    "initial_capital": 876632,
    "total_capital": 866730,
    "source_portfolio_path": "data/artifacts/decision/202401-202604_7d_for_once_ver1.3/portfolio/20260305/result.json",
    "generated_at": "2026-04-22T13:45:19.627317+08:00"
  }
}
```

字段说明：

- `portfolio_table`：组合资产快照（含仓位、市值、收益、操作）
- `operation_reason_table`：调仓动作及其原因
- `decision_summary`：组合层文字总结
- `meta.initial_capital` / `meta.total_capital`：资金统计
- `meta.source_portfolio_path`：来源快照路径
- `meta.generated_at`：结果生成时间
- `strategy`：策略标识（可选；若后端不返回，前端展示为 `-`）

## 5.3 Analyst

- `/analyst/sector/trend/{trade_date}` -> `/data/sector/sector-trend-analyst`
- `/analyst/sector/capital-flow/{trade_date}` -> `/data/sector/sector-capital-flow-analyst`
- `/analyst/macro/economist/{trade_date}` -> `/data/macro/macro-economist`
- `/analyst/macro/market-sentiment/{trade_date}` -> `/data/macro/market-sentiment-analyst`
- `/analyst/macro/commodity/{trade_date}` -> `/data/macro/commodity-analyst`

### 5.3.1 行业趋势分析师（Sector Trend Analyst）

#### 5.3.1.1 获取可选日期

- **URL**：`/api/v1/data/analyst/sector/trend/dates`
- **用途**：`/data/sector/sector-trend-analyst` 页面日期选择
- **请求参数**：无
- **请求示例**：`GET /api/v1/data/analyst/sector/trend/dates`

`data` 结构：

```json
{
  "dates": ["20250320", "20250319", "20250318"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）

数据来源与规则：

- 数据目录：`data/artifacts/analyst/sector_analyst/sector_trend_analyst`
- 仅返回包含 `result.json` 的日期目录
- 日期格式：`YYYYMMDD`

#### 5.3.1.2 获取指定日期行业趋势分析摘要

- **URL**：`/api/v1/data/analyst/sector/trend/{trade_date}`
- **用途**：渲染趋势主线、修复机会、风险板块与结论摘要（不含 K 线明细）

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

`data` 结构：

```json
{
  "trade_date": "20250320",
  "summary": "市场呈现明显的结构性分化...",
  "conclusion": "建议继续跟踪强势主线，同时关注底部修复机会。",
  "leading_themes": ["无线电信业务Ⅲ", "保健护理机构"],
  "reversal_opportunities": ["冰雪产业", "火电"],
  "top_risk_sectors": ["多种化学制品", "商品化工"],
  "highlights": ["趋势主线呈现多周期动量共振。"],
  "market_regime": "mixed",
  "series_list": [
    {
      "ts_code": "865001.TI",
      "name": "无线电信业务Ⅲ"
    }
  ]
}
```

字段说明：

- `summary`：趋势分析摘要
- `conclusion`：最终结论
- `leading_themes`：趋势主线
- `reversal_opportunities`：修复机会
- `top_risk_sectors`：高位风险板块
- `highlights`：重点观察点
- `market_regime`：市场状态（如 `mixed`）
- `series_list`：板块列表（仅用于前端选择板块）
  - `ts_code`：板块代码
  - `name`：板块名称

#### 5.3.1.3 获取板块行情序列（按 code）

- **URL**：`/api/v1/data/analyst/sector/trend/series/{code}`
- **用途**：点击板块后按需拉取 K 线与成交量序列，降低主接口返回体积

路径参数：

- `code`：板块代码（如 `865001.TI`）

`data` 结构：

```json
{
  "ts_code": "865001.TI",
  "name": "无线电信业务Ⅲ",
  "rows": [
    {
      "trade_date": "20250320",
      "open": 1660.706,
      "high": 1671.229,
      "low": 1649.42,
      "close": 1664.753,
      "pct_change": 0.5646,
      "vol": 13224.26
    }
  ]
}
```

字段说明：

- `rows`：时间序列数据（用于 K 线）
  - `trade_date`：交易日（`YYYYMMDD`）
  - `open/high/low/close`：OHLC
  - `pct_change`：当日涨跌幅（%）
  - `vol`：成交量

### 5.3.2 板块资金流分析师（Sector Capital Flow Analyst）

#### 5.3.2.1 获取可选日期

- **URL**：`/api/v1/data/analyst/sector/capital-flow/dates`
- **用途**：`/data/sector/sector-capital-flow-analyst` 页面日期选择
- **请求参数**：无
- **请求示例**：`GET /api/v1/data/analyst/sector/capital-flow/dates`

`data` 结构：

```json
{
  "dates": ["20250320", "20250319", "20250318"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）

数据来源与规则：

- 数据目录：`data/artifacts/analyst/sector_analyst/sector_capital_flow_analyst`
- 仅返回包含 `result.json` 的日期目录
- 日期格式：`YYYYMMDD`

#### 5.3.2.2 获取指定日期板块资金流分析结果

- **URL**：`/api/v1/data/analyst/sector/capital-flow/{trade_date}`
- **用途**：渲染资金净额图、热点/风险板块、样本表与结论摘要

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

`data` 结构：

```json
{
  "trade_date": "20250320",
  "summary": "整体市场资金呈净流出状态...",
  "conclusion": "市场资金面偏空，建议谨慎操作。",
  "highlights": ["1日窗口净流出约-882万元。"],
  "market_bias": "bearish",
  "one_day_net_amount": -882,
  "five_day_net_amount": -2529,
  "twenty_day_net_amount": -9564,
  "hot_sectors": ["共封装光学(CPO)", "光纤概念"],
  "risk_sectors": ["融资融券", "深股通"],
  "one_day_sector_flow": [
    { "name": "融资融券", "net_amount": -472 },
    { "name": "共封装光学(CPO)", "net_amount": 186 }
  ],
  "one_day_rows": [
    {
      "trade_date": "20250320",
      "ts_code": "885748.TI",
      "name": "可燃冰",
      "lead_stock": "海默科技",
      "pct_change": 4.76,
      "net_amount": 1
    }
  ]
}
```

字段说明：

- `market_bias`：市场偏向
- `one_day_net_amount/five_day_net_amount/twenty_day_net_amount`：多窗口资金净额（万元）
- `hot_sectors`：热点板块列表
- `risk_sectors`：风险板块列表
- `one_day_sector_flow`：1日窗口板块净额分布
  - `name`：板块名称
  - `net_amount`：净额（万元）
- `one_day_rows`：最近一天样本数据
  - `trade_date`：交易日（`YYYYMMDD`）
  - `ts_code`：板块代码
  - `name`：板块名称
  - `lead_stock`：龙头股
  - `pct_change`：涨跌幅（%）
  - `net_amount`：净额（万元）

### 5.4 宏观经济分析师（Macro Economist）

#### 5.4.1 获取可选日期

- **URL**：`/api/v1/data/analyst/macro/economist/dates`
- **用途**：`/data/macro/macro-economist` 页面日期下拉框
- **请求参数**：无
- **请求示例**：`GET /api/v1/data/analyst/macro/economist/dates`

`data` 结构：

```json
{
  "dates": ["20260421", "20260420", "20260419"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）

数据来源与规则：

- 数据目录：`data/artifacts/analyst/macro_analyst/macro_economist`
- 仅返回包含 `result.json` 的日期目录
- 日期格式：`YYYYMMDD`

#### 5.4.2 获取指定日期宏观经济分析结果

- **URL**：`/api/v1/data/analyst/macro/economist/{trade_date}`
- **用途**：渲染信号卡、六个指标图、LLM 综合结论

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

`data` 结构：

```json
{
  "trade_date": "20260421",
  "lpr_data": [
    { "month": "11月", "value": 3.55 },
    { "month": "12月", "value": 3.5 }
  ],
  "cpi_data": [
    { "month": "11月", "value": 0.6 },
    { "month": "12月", "value": 0.4 }
  ],
  "sf_data": [
    { "month": "11月", "value": 1.8 },
    { "month": "12月", "value": 2.1 }
  ],
  "pmi_data": [
    { "month": "11月", "value": 49.8 },
    { "month": "12月", "value": 49.5 }
  ],
  "m2_data": [
    { "month": "11月", "value": 9.8 },
    { "month": "12月", "value": 9.5 }
  ],
  "gdp_data": [
    { "quarter": "Q2", "value": 5.1 },
    { "quarter": "Q3", "value": 5.0 }
  ],
  "llm_output": {
    "growth_signal": "strong",
    "inflation_signal": "falling",
    "liquidity_signal": "loose",
    "macro_regime": "growth",
    "equity_market_bias": "bullish",
    "bond_market_bias": "bullish",
    "commodity_bias": "neutral",
    "liquidity_summary": "货币政策宽松，LPR下调，但M2增速有所放缓。",
    "conclusion": "经济保持稳健增长，通胀压力较低，流动性环境总体宽松。"
  }
}
```

字段说明：

- `trade_date`：当前数据交易日
- `lpr_data/cpi_data/sf_data/pmi_data/m2_data`：月度序列
  - `month`：月份标签（建议固定格式，例如 `11月`）
  - `value`：指标值（`number`）
- `gdp_data`：季度同比序列
  - `quarter`：季度标签（如 `Q1`）
  - `value`：指标值（`number`）
- `llm_output`：模型结论输出
  - `growth_signal`：增长信号
  - `inflation_signal`：通胀信号
  - `liquidity_signal`：流动性信号
  - `macro_regime`：宏观状态
  - `equity_market_bias`：权益偏好
  - `bond_market_bias`：债券偏好
  - `commodity_bias`：商品偏好
  - `liquidity_summary`：流动性摘要
  - `conclusion`：综合结论

### 5.5 市场情绪分析师（Market Sentiment Analyst）

#### 5.5.1 获取可选日期

- **URL**：`/api/v1/data/analyst/macro/market-sentiment/dates`
- **用途**：`/data/macro/market-sentiment-analyst` 页面日期选择
- **请求参数**：无
- **请求示例**：`GET /api/v1/data/analyst/macro/market-sentiment/dates`

`data` 结构：

```json
{
  "dates": ["20260421", "20260420", "20260419"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）

数据来源与规则：

- 数据目录：`data/artifacts/analyst/macro_analyst/market_sentiment_analyst`
- 仅返回包含 `result.json` 的日期目录
- 日期格式：`YYYYMMDD`

#### 5.5.2 获取指定日期市场情绪分析结果

- **URL**：`/api/v1/data/analyst/macro/market-sentiment/{trade_date}`
- **用途**：渲染信号卡、指数列表与综合情绪摘要

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

`data` 结构：

```json
{
  "trade_date": "20260421",
  "index_items": [
    {
      "code": "000001.SH",
      "name": "上证综指",
      "index_trend": "down",
      "turnover_summary": "近期成交量整体平稳...",
      "volatility_summary": "近期波动率有所放大...",
      "market_conclusion": "市场情绪偏空且脆弱...",
      "start_price": 3030,
      "end_price": 2878,
      "start_volume": 255,
      "end_volume": 270,
      "market_series": [
        {
          "date": "2026-02-01",
          "open": 3021.3,
          "high": 3040.5,
          "low": 3002.1,
          "close": 3033.7,
          "volume": 268.5
        }
      ]
    }
  ],
  "sentiment_output": {
    "index_trend": "down",
    "market_sentiment": "bearish",
    "volume_signal": "contracting",
    "volatility_signal": "high",
    "sentiment_summary": "市场整体情绪极度悲观..."
  }
}
```

字段说明：

- `trade_date`：当前数据交易日
- `index_items`：指数维度分析列表
  - `code`：指数代码
  - `name`：指数名称
  - `index_trend`：指数趋势（`up/down/neutral`）
  - `turnover_summary`：成交量解读
  - `volatility_summary`：波动率解读
  - `market_conclusion`：该指数市场结论
  - `start_price/end_price`：窗口起止价格
  - `start_volume/end_volume`：窗口起止成交量
  - `market_series`：行情序列（用于 K 线与成交量图）
    - `date`：交易日，格式 `YYYY-MM-DD`
    - `open/high/low/close`：当日 OHLC
    - `volume`：当日成交量
- `sentiment_output`：综合情绪输出
  - `index_trend`：指数总体趋势
  - `market_sentiment`：市场情绪
  - `volume_signal`：成交量信号
  - `volatility_signal`：波动率信号
  - `sentiment_summary`：综合情绪摘要

补充约定：

- `market_series` 建议默认返回最近 `60` 个交易日（与页面默认窗口一致）
- `volume` 请固定单位（建议 `亿`），避免前后端展示口径不一致

### 5.6 宏观新闻分析师（News Analyst）

#### 5.6.1 获取可选日期

- **URL**：`/api/v1/data/analyst/macro/news/dates`
- **用途**：`/data/macro/news-analyst` 页面日期选择
- **请求参数**：无
- **请求示例**：`GET /api/v1/data/analyst/macro/news/dates`

`data` 结构：

```json
{
  "dates": ["20260422", "20260421", "20260420"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）

数据来源与规则：

- 数据目录：`data/artifacts/analyst/macro_analyst/news_analyst`
- 仅返回包含 `result.json` 的日期目录
- 日期格式：`YYYYMMDD`

#### 5.6.2 获取指定日期新闻分析结果

- **URL**：`/api/v1/data/analyst/macro/news/{trade_date}`
- **用途**：渲染宏观环境信号卡、新闻事件列表、行业影响分析

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

`data` 结构：

```json
{
  "date": "20260422",
  "events": [
    {
      "source": "Bloomberg",
      "type": "company",
      "summary": "宁德时代发布6分钟快充电池新技术。",
      "industry": ["电池", "汽车零部件"],
      "sentiment": "positive",
      "impact_level": 4
    }
  ],
  "sector_impacts": {
    "电池": {
      "sentiment": "bullish",
      "confidence": 0.85,
      "reason": ["技术创新强化行业景气预期。"]
    }
  },
  "macro_environment": {
    "liquidity": "neutral",
    "policy_bias": "neutral",
    "global_risk": "high",
    "market_sentiment": "neutral"
  }
}
```

字段说明：

- `date`：当前数据交易日（`YYYYMMDD`）
- `events`：新闻事件列表
  - `source`：新闻来源
  - `type`：事件类型（如 `company/geopolitics/industry/market/other`）
  - `summary`：事件摘要
  - `industry`：影响行业列表
  - `sentiment`：事件情绪（`positive/neutral/negative`）
  - `impact_level`：影响等级（建议 `1~5`）
- `sector_impacts`：行业影响映射（key 为行业名）
  - `sentiment`：行业情绪（`bullish/neutral/bearish`）
  - `confidence`：置信度（`0~1`）
  - `reason`：判断理由列表
- `macro_environment`：宏观环境快照
  - `liquidity`：流动性
  - `policy_bias`：政策倾向
  - `global_risk`：全球风险
  - `market_sentiment`：市场情绪

### 5.7 大宗商品分析师（Commodity Analyst）

#### 5.7.1 获取可选日期

- **URL**：`/api/v1/data/analyst/macro/commodity/dates`
- **用途**：`/data/macro/commodity-analyst` 页面日期选择
- **请求参数**：无
- **请求示例**：`GET /api/v1/data/analyst/macro/commodity/dates`

`data` 结构：

```json
{
  "dates": ["20260421", "20260420", "20260419"]
}
```

字段说明：

- `dates`：可选交易日列表（降序，最新日期在前）

数据来源与规则：

- 数据目录：`data/artifacts/analyst/macro_analyst/commodity_analyst`
- 仅返回包含 `result.json` 的日期目录
- 日期格式：`YYYYMMDD`

#### 5.7.2 获取指定日期大宗商品分析结果

- **URL**：`/api/v1/data/analyst/macro/commodity/{trade_date}`
- **用途**：渲染商品卡片、K 线/成交量与综合输出

路径参数：

- `trade_date`：交易日，格式 `YYYYMMDD`

`data` 结构：

```json
{
  "trade_date": "20260421",
  "commodity_items": [
    {
      "name": "黄金",
      "trend": "up",
      "start": 467.73,
      "end": 479.0,
      "price_summary": "价格从...整体涨幅约2.4%",
      "macro_implication": "黄金作为避险资产...",
      "market_series": [
        {
          "date": "2026-02-01",
          "open": 466.2,
          "high": 469.3,
          "low": 464.8,
          "close": 468.9,
          "volume": 32.4
        }
      ]
    }
  ],
  "output_summary": {
    "overall_trend": "down",
    "commodity_market_trend": "mixed",
    "macro_signals": {
      "growth_signal": "weakening",
      "inflation_signal": "falling",
      "risk_sentiment": "risk_off"
    },
    "macro_summary": "经济增长动能减弱，通胀压力下降，市场避险情绪上升。"
  }
}
```

字段说明：

- `trade_date`：当前数据交易日
- `commodity_items`：商品分析列表
  - `name`：商品名称
  - `trend`：趋势（`up/down/neutral`）
  - `start/end`：窗口起止价格
  - `price_summary`：价格行为解读
  - `macro_implication`：宏观含义解读
  - `market_series`：行情序列（用于 K 线与成交量图）
    - `date`：交易日，格式 `YYYY-MM-DD`
    - `open/high/low/close`：当日 OHLC
    - `volume`：当日成交量
- `output_summary`：综合输出
  - `overall_trend`：总体趋势
  - `commodity_market_trend`：商品市场趋势
  - `macro_signals`：宏观信号汇总
    - `growth_signal`：增长信号
    - `inflation_signal`：通胀信号
    - `risk_sentiment`：风险偏好
  - `macro_summary`：综合摘要

补充约定：

- `market_series` 建议默认返回最近 `60` 个交易日
- `volume` 请固定单位（建议 `亿`）

### 5.8 示例：股票池查询

- **URL**：`GET /api/v1/data/stock-pool/20260422`

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "trade_date": "20260422",
    "summary": "候选池 42 只，Top10 集中在算力链与高分红。",
    "candidates": [
      {
        "ts_code": "600519.SH",
        "name": "贵州茅台",
        "score": 91.5,
        "action": "buy",
        "reason": "基本面稳健+技术趋势向上"
      }
    ]
  }
}
```

---

## 6. 组合页接口（`/portfolio`）

交互顺序：先选 `version`，再选 `trade_date`，最后拉取组合快照与历史收益。  
其中版本与可选日期直接复用数据中心已有接口。

### 6.1 获取可选版本（复用已有接口）

- **URL**：`/api/v1/data/portfolio/versions`
- **用途**：`/portfolio` 页面「选择版本」下拉选择
- **请求参数**：无
- **请求示例**：`GET /api/v1/data/portfolio/versions`

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "versions": ["202401-202604_7d_for_once_ver1.3", "202401-202604_14d_for_once_ver1.2"]
  }
}
```

字段说明：

- `versions`：可选策略版本列表

### 6.2 获取指定版本下可选持仓日期（复用已有接口）

- **URL**：`/api/v1/data/portfolio/{version}/dates`
- **用途**：`/portfolio` 页面「持仓日期」下拉选择
- **请求示例**：`GET /api/v1/data/portfolio/202401-202604_7d_for_once_ver1.3/dates`

路径参数：

- `version`：策略版本标识

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "dates": ["20260422", "20260415", "20260408"]
  }
}
```

字段说明：

- `dates`：该版本下可选持仓日期列表（降序，最新在前）
- 日期格式：`YYYYMMDD`

### 6.3 获取某版本某交易日组合快照

- **URL**：`/api/v1/portfolio/{version}/{trade_date}`
- **用途**：渲染关键指标卡、持仓占比图、行业分布图、全部持仓表

路径参数：

- `version`：策略版本标识
- `trade_date`：持仓日期，格式 `YYYYMMDD`

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "trade_date": "20260422",
    "metrics": {
      "annualized_return_pct": 15.6,
      "sharpe_ratio": 1.42,
      "max_drawdown_pct": -4.93,
      "one_week_return_pct": 2.87,
      "one_month_return_pct": 7.64
    },
    "positions": [
      {
        "ts_code": "600519.SH",
        "name": "贵州茅台",
        "industry": "白酒",
        "weight": 16.2,
        "shares": 100,
        "cost_price": 1420.0,
        "latest_price": 1498.5
      }
    ]
  }
}
```

字段说明：

- `metrics`：顶部指标卡
  - `annualized_return_pct`：历史收益（年化，%）
  - `sharpe_ratio`：夏普比率
  - `max_drawdown_pct`：最大回撤（%）
  - `one_week_return_pct`：近一周收益（%）
  - `one_month_return_pct`：近一月收益（%）
- `positions`：当期全部持仓（用于柱状图、饼图和表格）
  - `ts_code`：股票代码
  - `name`：股票名称
  - `industry`：行业名称
  - `weight`：持仓权重（% 数值，不带 `%`）
  - `shares`：持仓股数
  - `cost_price`：成本价
  - `latest_price`：最新价

### 6.4 获取某版本历史收益曲线

- **URL**：`/api/v1/portfolio/{version}/history?start_date=20260401&end_date=20260422`
- **用途**：渲染总收益率折线与历史收益表

路径参数：

- `version`：策略版本标识

查询参数：

- `start_date`：开始日期，格式 `YYYYMMDD`（可选）
- `end_date`：结束日期，格式 `YYYYMMDD`（可选）
- 未传参数时，后端可返回默认最近区间（建议最近 60 个交易日）

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "series": [
      {
        "date": "2026-04-14",
        "net_value": 1.017,
        "daily_return_pct": 0.52,
        "drawdown_pct": -0.72
      }
    ]
  }
}
```

字段说明：

- `series`：历史收益时间序列（按日期升序）
  - `date`：日期（`YYYY-MM-DD`）
  - `net_value`：净值
  - `daily_return_pct`：单日收益率（%）
  - `drawdown_pct`：当日回撤（%）

---

## 7. 请求参数校验规则

- `trade_date` 必须为 8 位数字
- `version` 不能为空，且需命中 `/api/v1/data/portfolio/versions` 返回集合
- `portfolio` 模块的 `trade_date/start_date/end_date` 使用 `YYYYMMDD`
- `ts_code` 必须符合 `000001.SZ` / `600519.SH` 格式
- `page >= 1`
- `1 <= page_size <= 200`
- `start_date <= end_date`

---

## 8. 非必需接口（可后置）

当前页面未直接消费，后端可延后：
- `/api/v1/portfolio/compare`
- `/api/v1/portfolio/performance`

---

## 9. 联调验收清单

- 所有接口返回结构是否统一
- 错误场景是否稳定返回 `message` 与 `error_code`
- 空数据时是否返回空数组而非 `null`
- 分页接口是否返回 `page/page_size/total/items`
- 数值字段类型是否稳定（不要字符串数字混用）

