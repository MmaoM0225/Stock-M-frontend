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

## 5.2 Stock

- `/stock/{ts_code}/{trade_date}` -> `/data/stock/stock-manager`
- `/fundamental/{ts_code}/{trade_date}` -> `/data/stock/stock-fundamental-analyst`
- `/technical/{ts_code}/{trade_date}` -> `/data/stock/stock-technical-analyst`

## 5.3 Analyst

- `/analyst/sector/trend/{trade_date}` -> `/data/sector/sector-trend-analyst`
- `/analyst/sector/capital-flow/{trade_date}` -> `/data/sector/sector-capital-flow-analyst`
- `/analyst/macro/economist/{trade_date}` -> `/data/macro/macro-economist`
- `/analyst/macro/market-sentiment/{trade_date}` -> `/data/macro/market-sentiment-analyst`
- `/analyst/macro/commodity/{trade_date}` -> `/data/macro/commodity-analyst`

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

前缀：`/api/v1/portfolio`，全部 `GET`。

### 6.1 获取可选持仓日期

- **URL**：`/api/v1/portfolio/dates`

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "dates": ["20260422", "20260415", "20260408"]
  }
}
```

### 6.2 获取某交易日组合快照

- **URL**：`/api/v1/portfolio/{trade_date}`
- **用途**：持仓表、行业分布、关键指标

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

### 6.3 获取历史收益曲线

- **URL**：`/api/v1/portfolio/history?start_date=20260401&end_date=20260422`
- **用途**：收益曲线 + 历史收益表

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

---

## 7. 请求参数校验规则

- `trade_date` 必须为 8 位数字
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

